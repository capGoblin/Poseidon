"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const dotenv_1 = __importDefault(require("dotenv"));
const express_1 = __importDefault(require("express"));
const bot_1 = require("./bot");
const chatbot_1 = require("./langchain/chatbot");
// Load environment variables
dotenv_1.default.config();
const app = (0, express_1.default)();
const port = process.env.PORT || 3000;
// Setup middleware
app.use(express_1.default.json());
let bot;
async function main() {
    try {
        // Initialize LangChain agent
        const agent = await (0, chatbot_1.setupLangChainAgent)();
        // Start Telegram bot with LangChain integration
        bot = await (0, bot_1.startBot)(agent);
        // Handle webhook endpoint
        app.post(`/webhook/${process.env.TELEGRAM_TOKEN}`, async (req, res) => {
            if (req.body.message) {
                await bot.handleMessage(req.body.message);
            }
            res.sendStatus(200);
        });
        // Start Express server
        app.listen(port, () => {
            console.log(`Server is running on port ${port}`);
        });
    }
    catch (error) {
        console.error("Error starting the application:", error);
        process.exit(1);
    }
}
main();
