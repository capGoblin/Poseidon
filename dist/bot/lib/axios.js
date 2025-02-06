"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.axiosInstance = void 0;
exports.init = init;
const axios_1 = __importDefault(require("axios"));
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const MY_TOKEN = process.env.TELEGRAM_TOKEN;
const SERVER_URL = process.env.SERVER_URL;
if (!MY_TOKEN || !SERVER_URL) {
    throw new Error("TELEGRAM_TOKEN or SERVER_URL is not defined in environment variables");
}
const BASE_URL = `https://api.telegram.org/bot${MY_TOKEN}`;
const WEBHOOK_URL = `${SERVER_URL}/webhook/${MY_TOKEN}`;
function getAxiosInstance() {
    return {
        get(method, { params } = {}) {
            return (0, axios_1.default)({
                method: "get",
                url: `${BASE_URL}/${method}`,
                params,
            });
        },
        post(method, data) {
            return (0, axios_1.default)({
                method: "post",
                url: `${BASE_URL}/${method}`,
                data,
            });
        },
    };
}
async function init() {
    const res = await axios_1.default.get(`${BASE_URL}/setWebhook?url=${WEBHOOK_URL}`);
    console.log(res.data);
}
exports.axiosInstance = getAxiosInstance();
