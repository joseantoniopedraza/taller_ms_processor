import Redis from "ioredis";
import { CONFIGS } from "../configs";
import { Message } from "../domain/message-model";

export const sendMessage = (redis: Redis) => (message: Message) => {
  redis.publish(CONFIGS.CHANNEL_NAME, JSON.stringify(message));
};
