import Redis from "ioredis";
import { suscribe } from "./interface/suscribe";
import { processMessage } from "./interface/process-message";
import { sendMessage } from "./interface/send-message";

const redisSubscribe = new Redis({
  host: process.env.REDIS_HOST,
  port: parseInt(process.env.REDIS_PORT || "6379"),
});
const redisSend = new Redis({
  host: process.env.REDIS_HOST,
  port: parseInt(process.env.REDIS_PORT || "6379"),
});

suscribe(redisSubscribe)();
processMessage(redisSubscribe)(sendMessage(redisSend));
