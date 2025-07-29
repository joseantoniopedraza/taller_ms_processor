import { CONFIGS } from "../configs";
import Redis from "ioredis";

export const suscribe = (redis: Redis) => () => {
  return redis.subscribe(CONFIGS.CHANNEL_NAME, (err, count) => {
    if (err) throw err;
    console.log(`📡 Suscribe to ${count} channel(s)`);
  });
};
