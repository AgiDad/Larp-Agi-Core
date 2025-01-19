import dotenv from "dotenv";

dotenv.config();

export const CONFIG = {
  telegram: {
    token: process.env.TELEGRAM_BOT_TOKEN || "",
    allowedChatId: Number(process.env.TELEGRAM_ALLOWED_CHAT_ID),
    webhookUrl: process.env.TELEGRAM_WEBHOOK_URL || "https://your-domain.com",
    webhookHost: process.env.TELEGRAM_WEBHOOK_HOST || "localhost",
    webhookPort: Number(process.env.TELEGRAM_WEBHOOK_PORT) || 3000,
    webhookSecret: process.env.TELEGRAM_WEBHOOK_SECRET || "your-secret-token",
  },
  twitter: {},
  github: {},
} as const;

if (!CONFIG.telegram.token) {
  throw new Error("TELEGRAM_BOT_TOKEN is not defined in environment variables");
}

if (!CONFIG.telegram.allowedChatId) {
  throw new Error(
    "TELEGRAM_ALLOWED_CHAT_ID is not defined in environment variables",
  );
}
