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

async function main() {
  try {
    // Initialize LangChain agent
    const agent = await setupLangChainAgent();

    // Start Telegram bot with LangChain integration
    const bot = await startBot(agent);

    // Handle webhook endpoint
    app.post(`/webhook/${process.env.TELEGRAM_TOKEN}`, async (req, res) => {
      console.log("Received webhook:", req.body); // Add logging
      if (req.body.message) {
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
