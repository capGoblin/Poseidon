import { TelegramBot } from "./lib/Telegram";

export async function startBot(agent: any) {
  const bot = new TelegramBot();
  bot.setAgent(agent);
  await bot.start();
  return bot;
}
