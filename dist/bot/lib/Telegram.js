"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TelegramBot = void 0;
const dotenv_1 = __importDefault(require("dotenv"));
const axios_1 = require("./axios");
const messages_1 = require("@langchain/core/messages");
const axios_2 = require("./axios");
dotenv_1.default.config();
class TelegramBot {
    constructor() {
        this.agent = null;
    }
    setAgent(agent) {
        this.agent = agent;
    }
    async start() {
        try {
            // Set up webhook
            await (0, axios_2.init)();
            console.log("Telegram bot started and webhook set");
        }
        catch (error) {
            console.error("Error setting up webhook:", error);
            throw error;
        }
    }
    async sendMessage(chatId, text) {
        return axios_1.axiosInstance.get("sendMessage", {
            params: {
                chat_id: chatId,
                text,
                parse_mode: "Markdown",
            },
        });
    }
    async handleMessage(message) {
        if (!message.text)
            return;
        if (message.text === "/start") {
            return this.sendMessage(message.chat.id, "🚀 Welcome to the CDP AgentKit Chatbot!");
        }
        if (this.agent) {
            try {
                const response = await this.agent.stream({ messages: [new messages_1.HumanMessage(message.text)] }, { thread_id: message.chat.id.toString() });
                let fullResponse = "";
                for await (const chunk of response) {
                    if ("agent" in chunk) {
                        fullResponse += chunk.agent.messages[0].content;
                    }
                }
                await this.sendMessage(message.chat.id, fullResponse || "No response generated.");
            }
            catch (error) {
                await this.sendMessage(message.chat.id, "Sorry, I encountered an error processing your request.");
            }
        }
    }
}
exports.TelegramBot = TelegramBot;
