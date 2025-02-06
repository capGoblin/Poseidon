import dotenv from "dotenv";
import { axiosInstance, init } from "./axios";
import { HumanMessage } from "@langchain/core/messages";
import { runChatMode, runAutonomousMode } from "../../langchain/chatbot";

dotenv.config();

interface TelegramMessage {
  chat: {
    id: number;
  };
  text?: string;
}

export class TelegramBot {
  private agent: any = null;
  private config: any = null;

  setAgent(agent: any, config: any) {
    this.agent = agent;
    this.config = config;
  }

  async start() {
    try {
      // Initialize webhook on every start
      await init(); // This is from axios.ts which sets up the webhook
      console.log("Telegram bot started and webhook initialized");
    } catch (error) {
      console.error("Error starting bot:", error);
      throw error;
    }
  }

  private async sendMessage(chatId: number, text: string) {
    try {
      const response = await axiosInstance.get("sendMessage", {
        params: {
          chat_id: chatId,
          text,
          parse_mode: "HTML",
        },
      });
      console.log("Message sent:", response.data);
      return response;
    } catch (error) {
      console.error("Error sending message:", error);
      throw error;
    }
  }

  async handleMessage(message: TelegramMessage) {
    console.log("Handling message:", message);
    if (!message.text) return;

    try {
      if (message.text === "/start") {
        return await this.sendMessage(
          message.chat.id,
          "🚀 Welcome to the CDP AgentKit Chatbot!"
        );
      }

      if (message.text === "/auto") {
        if (this.agent && this.config) {
          const messageHandler = {
            sendMessage: async (text: string) => {
              if (text && text.trim()) {
                await this.sendMessage(message.chat.id, text);
              }
            },
            getMessage: () => message.text || "",
          };

          await this.sendMessage(
            message.chat.id,
            "🤖 Starting autonomous mode..."
          );

          await runAutonomousMode(this.agent, this.config, messageHandler);
        }
        return;
      }

      if (this.agent && this.config) {
        const messageHandler = {
          sendMessage: async (text: string) => {
            await this.sendMessage(message.chat.id, text);
          },
          getMessage: () => message.text || "",
        };

        // console.log("Agent:", this.agent);
        // console.log("Config:", this.config);

        await runChatMode(this.agent, this.config, messageHandler);
      } else {
        await this.sendMessage(
          message.chat.id,
          "Bot is not properly initialized with an agent and config."
        );
      }
    } catch (error) {
      console.error("Error handling message:", error);
      await this.sendMessage(
        message.chat.id,
        error instanceof Error
          ? `Error: ${error.message}`
          : "An unexpected error occurred"
      );
    }
  }
}
