import dotenv from "dotenv";
dotenv.config();

export const SERVER_PORT = 4000;
export const CORS_ORIGINS = [
  "http://localhost:3000",
  "http://3.109.24.74:3000",
  "https://playground.cursor.works",
];

// export const SERVER_URL = `http://3.109.143.126:${SERVER_PORT}`;
export const SERVER_URL = `${process.env.SERVER_HOME}:${SERVER_PORT}`;

export const EXPOSED_PORT = 5858;
export const CONTAINER_PORT = 7777;
export const MONGO_URI = process.env.MONGO_URI as string;

export const EMPTY_PLAYGROUND_TEMPLATE_ID = "node-playground";
