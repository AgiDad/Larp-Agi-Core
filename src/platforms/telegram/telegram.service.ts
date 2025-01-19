import TelegramBot from "node-telegram-bot-api";
import { IPlatform } from "../../core/types/platform.interface";
import { CONFIG } from "../../core/config";
import { AgiService } from "../../services/AGI/agi.service";
import express, { Request, Response, NextFunction } from "express";
import bodyParser from "body-parser";

export class TelegramService implements IPlatform {
  private bot: TelegramBot | null = null;
  private botUsername: string = "";
  private app: express.Application;
  private server: any;

  constructor(private agiService: AgiService) {
    this.app = express();
    this.app.use(bodyParser.json());
  }

  async initialize(): Promise<void> {
    this.bot = new TelegramBot(CONFIG.telegram.token);
    const webhookPath = `/bot${CONFIG.telegram.token}`;

    this.app.use(
      webhookPath,
      (req: Request, res: Response, next: NextFunction) => {
        this.validateWebhookRequest(req, res, next);
      },
    );

    this.app.post(webhookPath, async (req: any, res: any) => {
      try {
        const update = req.body;

        if (update.message?.chat?.id !== CONFIG.telegram.allowedChatId) {
          console.log(
            `Rejected message from unauthorized chat: ${update.message?.chat?.id}`,
          );
          return res.sendStatus(200);
        }

        await this.bot?.processUpdate(update);
        res.sendStatus(200);
      } catch (error) {
        console.error("Error processing webhook:", error);
        res.sendStatus(200);
      }
    });

    this.server = this.app.listen(CONFIG.telegram.webhookPort, () => {
      console.log(
        `Express server is listening on port ${CONFIG.telegram.webhookPort}`,
      );
    });

    const webhookUrl = `${CONFIG.telegram.webhookUrl}${webhookPath}`;
    await this.bot.setWebHook(webhookUrl, {
      allowed_updates: ["message"],
      max_connections: 40,
      secret_token: CONFIG.telegram.webhookSecret,
    });

    const botInfo = await this.bot.getMe();
    this.botUsername = botInfo.username || "";
    console.log(`🤖 Telegram bot initialized as @${this.botUsername}`);

    const webhookInfo = await this.bot.getWebHookInfo();
    console.log("Webhook Info:", webhookInfo);
  }

  private async sendMessage(text: string, id: number) {
    const response = this.agiService.getAgiResponse(text);
    await this.bot!.sendMessage(id, response);
  }

  private validateWebhookRequest(
    req: Request,
    res: Response,
    next: NextFunction,
  ) {
    const secretToken = req.headers["x-telegram-bot-api-secret-token"];
    if (secretToken !== CONFIG.telegram.webhookSecret) {
      console.error("Invalid webhook secret token");
      return res.sendStatus(403);
    }
    next();
  }

  async start(): Promise<void> {
    if (!this.bot) throw new Error("Bot not initialized");

    this.bot.on("message", async (msg) => {
      //   console.log("📨 Received message:", {
      //     chatId: msg.chat.id,
      //     chatType: msg.chat.type,
      //     messageText: msg.text,
      //     from: msg.from?.username || "unknown",
      //   });

      if (
        msg.chat.id !== CONFIG.telegram.allowedChatId ||
        (msg.chat.type !== "group" && msg.chat.type !== "supergroup") ||
        !msg.text
      ) {
        return;
      }

      if (this.botUsername) {
        // Random chance (1%) to respond even when not mentioned
        const shouldRespond = Math.random() < 0.01;
        if (!shouldRespond && !msg.text?.includes(`@${this.botUsername}`)) {
          console.log("⏭️ Message skipped: Bot not mentioned");
          return;
        }
      }
      await this.sendMessage(msg.text, msg.chat.id);
    });

    this.bot.on("error", (error) => {
      console.error("🚨 Bot error:", error.message);
    });

    console.log("🚀 Telegram platform ready!");
  }

  async stop(): Promise<void> {
    if (this.bot) {
      await this.bot.deleteWebHook();
      this.bot = null;
    }
    if (this.server) {
      this.server.close();
    }
  }
}
