import dotenv from "dotenv";

dotenv.config();

export const CONFIGS = {
  CHANNEL_NAME: "messages",
  GOOGLE_MODEL: "gemini-2.0-flash",
  GOOGLE_API_KEY: process.env.GOOGLE_API_KEY,
  USERS_REFRESH_TIME: 10 * 60 * 1000,
};
