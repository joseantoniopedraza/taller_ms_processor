import Redis from "ioredis";
import { suscribe } from "./interface/suscribe";
import { processMessage } from "./interface/process-message";
import { sendMessage } from "./interface/send-message";
import { CONFIGS } from "./configs";

const redisSubscribe = new Redis({
  host: CONFIGS.HOST,
  port: CONFIGS.PORT,
});
const redisSend = new Redis({
  host: CONFIGS.HOST,
  port: CONFIGS.PORT,
});

suscribe(redisSubscribe)();
processMessage(redisSubscribe)(sendMessage(redisSend));
