"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.startBot = startBot;
const Telegram_1 = require("./lib/Telegram");
async function startBot(agent) {
    const bot = new Telegram_1.TelegramBot();
    bot.setAgent(agent);
    await bot.start();
    return bot;
}
