import dotenv from "dotenv";
import { axiosInstance, init } from "./axios";
import { HumanMessage } from "@langchain/core/messages";
import { runChatMode, runAutonomousMode } from "../../langchain/chatbot";
import { Markup } from "telegraf";

dotenv.config();

interface TelegramMessage {
  chat: {
    id: number;
  };
  text?: string;
}

interface PoolData {
  symbol: string;
  tradingFee: string;
  tvl: string;
  apr: string;
  address: string;
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

  private async sendMessage(chatId: number, text: string, extra?: any) {
    try {
      const params: any = {
        chat_id: chatId,
        text,
        parse_mode: "HTML",
      };

      if (extra) {
        params.reply_markup = JSON.stringify(extra.reply_markup);
      }

      const response = await axiosInstance.get("sendMessage", { params });
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

      if (message.text === "/flow") {
        // fetch and show tokens the user has
        const keyboard = Markup.inlineKeyboard([
          [
            Markup.button.callback("WETH", "token_weth"),
            Markup.button.callback("USDC", "token_usdc"),
          ],
          [
            Markup.button.callback("DAI", "token_dai"),
            Markup.button.callback("USDT", "token_usdt"),
          ],
          [Markup.button.callback("Check Balance", "check_balance")],
        ]);

        return await this.sendMessage(
          message.chat.id,
          "🔄 Select a token to interact with:",
          keyboard
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

  private async handleTokenSelection(chatId: number, token: string) {
    // Mock pool data - in real implementation, fetch this from your API
    const poolData: PoolData = {
      symbol: `CL1-${token}/WETH`,
      tradingFee: "0.05%",
      tvl: "~$4,782,598.72",
      apr: "12.92%",
      address: "0x47cA96Ea59C13F72745928887f84C9F52C3D7348",
    };

    const message = `
<b>Pool Information</b>
🔄 Symbol: ${poolData.symbol}
💰 Trading Fee: ${poolData.tradingFee}
💎 TVL: ${poolData.tvl}
📈 APR: ${poolData.apr}
🏢 Address: <code>${poolData.address}</code>
`;

    const keyboard = Markup.inlineKeyboard([
      [Markup.button.callback("Add Liquidity", `add_liquidity_${token}`)],
      [Markup.button.callback("« Back to Tokens", "back_to_tokens")],
    ]);

    await this.sendMessage(chatId, message, keyboard);
  }

  async handleCallback(callbackQuery: any) {
    const chatId = callbackQuery.message.chat.id;
    const data = callbackQuery.data;

    if (data.startsWith("token_")) {
      const token = data.split("_")[1].toUpperCase();
      await this.handleTokenSelection(chatId, token);
    } else if (data === "back_to_tokens") {
      // Show token selection again
      const keyboard = Markup.inlineKeyboard([
        [
          Markup.button.callback("WETH", "token_weth"),
          Markup.button.callback("USDC", "token_usdc"),
        ],
        [
          Markup.button.callback("DAI", "token_dai"),
          Markup.button.callback("USDT", "token_usdt"),
        ],
        [Markup.button.callback("Check Balance", "check_balance")],
      ]);

      await this.sendMessage(
        chatId,
        "🔄 Select a token to interact with:",
        keyboard
      );
    } else if (data.startsWith("add_liquidity_")) {
      const token = data.split("_")[2].toUpperCase();
      await this.handleAddLiquidity(chatId, token);
    }
  }

  private async handleAddLiquidity(chatId: number, token: string) {
    // Here you would implement the add liquidity logic
    const messageHandler = {
      sendMessage: async (text: string) => {
        await this.sendMessage(chatId, text);
      },
      getMessage: () => `Add liquidity to ${token} pool`,
    };

    if (this.agent && this.config) {
      await runChatMode(this.agent, this.config, messageHandler);
    }
  }

  async answerCallbackQuery(callbackQueryId: string) {
    try {
      await axiosInstance.get("answerCallbackQuery", {
        params: {
          callback_query_id: callbackQueryId,
        },
      });
    } catch (error) {
      console.error("Error answering callback query:", error);
    }
  }
}
