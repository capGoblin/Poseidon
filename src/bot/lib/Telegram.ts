import dotenv from "dotenv";
import { axiosInstance } from "./axios";
import { HumanMessage } from "@langchain/core/messages";

dotenv.config();

interface TelegramMessage {
  chat: {
    id: number;
  };
  text?: string;
}

export class TelegramBot {
  private agent: any = null;

  setAgent(agent: any) {
    this.agent = agent;
  }

  async start() {
    // Initialize webhook or polling here
    console.log("Telegram bot started");
  }

  private async sendMessage(chatId: number, text: string) {
    return axiosInstance.get("sendMessage", {
      params: {
        chat_id: chatId,
        text,
        parse_mode: "Markdown",
      },
    });
  }

  async handleMessage(message: TelegramMessage) {
    if (!message.text) return;

    if (message.text === "/start") {
      return this.sendMessage(
        message.chat.id,
        "🚀 Welcome to the CDP AgentKit Chatbot!"
      );
    }

    if (this.agent) {
      try {
        const response = await this.agent.stream(
          { messages: [new HumanMessage(message.text)] },
          { thread_id: message.chat.id.toString() }
        );
        let fullResponse = "";
        for await (const chunk of response) {
          if ("agent" in chunk) {
            fullResponse += chunk.agent.messages[0].content;
          }
        }
        await this.sendMessage(
          message.chat.id,
          fullResponse || "No response generated."
        );
      } catch (error) {
        await this.sendMessage(
          message.chat.id,
          "Sorry, I encountered an error processing your request."
        );
      }
    }
  }
}
