import dotenv from "dotenv";
dotenv.config();
export const SERVER_PORT = 4000;
export const CORS_ORIGINS = ["http://localhost:3000", "http://3.109.143.126"];

export const EXPOSED_PORT = "5858";
export const CONTAINER_PORT = "7777";
export const MONGO_URI = process.env.MONGO_URI as string;
