import { TelegramBot } from "./lib/Telegram";

export async function startBot(agentData: { agent: any; config: any }) {
  const bot = new TelegramBot();
  bot.setAgent(agentData.agent, agentData.config);
  await bot.start();
  return bot;
}
