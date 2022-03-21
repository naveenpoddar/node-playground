import dotenv from "dotenv";
dotenv.config();

export const SERVER_URL = process.env.SERVER_URL || "http://localhost:4000";
export const WS_URI = process.env.WS_URI || "http://localhost:4000";
