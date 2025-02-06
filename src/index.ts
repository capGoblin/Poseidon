import dotenv from "dotenv";
import express from "express";
import { startBot } from "./bot";
import { setupLangChainAgent } from "./langchain/chatbot";

// Load environment variables
dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

// Setup middleware
app.use(express.json());

let bot: any;

async function main() {
  try {
    // Initialize LangChain agent and get both agent and config
    const agentData = await setupLangChainAgent();

    // Start Telegram bot with LangChain integration
    bot = await startBot(agentData);

    // Handle webhook endpoint
    app.post(`/webhook/${process.env.TELEGRAM_TOKEN}`, async (req, res) => {
      console.log("Received webhook:", req.body);

      // Handle callback queries (button clicks)
      if (req.body.callback_query) {
        await bot.handleCallback(req.body.callback_query);
        // Answer callback query to remove loading state
        await bot.answerCallbackQuery(req.body.callback_query.id);
      }
      // Handle regular messages
      else if (req.body.message) {
        await bot.handleMessage(req.body.message);
      }

      res.sendStatus(200);
    });

    // Start Express server
    app.listen(port, () => {
      console.log(`Server is running on port ${port}`);
    });
  } catch (error) {
    console.error("Error starting the application:", error);
    process.exit(1);
  }
}

main();
