import axios from "axios";
import dotenv from "dotenv";

dotenv.config();

const MY_TOKEN = process.env.TELEGRAM_TOKEN;
const SERVER_URL = process.env.SERVER_URL;

if (!MY_TOKEN || !SERVER_URL) {
  throw new Error(
    "TELEGRAM_TOKEN or SERVER_URL is not defined in environment variables"
  );
}

const BASE_URL = `https://api.telegram.org/bot${MY_TOKEN}`;

export async function init(): Promise<void> {
  try {
    const res = await axios.get(`${BASE_URL}/setWebhook`, {
      params: {
        url: `${SERVER_URL}/webhook/${MY_TOKEN}`,
      },
    });
    console.log("Webhook setup response:", res.data);
  } catch (error) {
    console.error("Error setting up webhook:", error);
    throw error;
  }
}

export const axiosInstance = {
  get(method: string, options: { params?: any } = { params: {} }) {
    return axios({
      method: "get",
      url: `${BASE_URL}/${method}`,
      params: options.params,
    });
  },
  post(method: string, data?: any) {
    return axios({
      method: "post",
      url: `${BASE_URL}/${method}`,
      data,
    });
  },
};
