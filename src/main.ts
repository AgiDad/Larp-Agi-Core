import { LarpAGIBot } from "./core/bot";
import { TelegramService } from "./platforms/telegram/telegram.service";
import { AgiService } from "./services/AGI/agi.service";

async function bootstrap() {
  const agiService = new AgiService();
  const telegramPlatform = new TelegramService(agiService);

  const bot = new LarpAGIBot();
  bot.registerPlatform(telegramPlatform);

  await bot.start();
}

bootstrap().catch(console.error);
