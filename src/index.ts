import Redis from "ioredis";
import { suscribe } from "./interface/suscribe";
import { processMessage } from "./interface/process-message";
import { sendMessage } from "./interface/send-message";

const redisSubscribe = new Redis();
const redisSend = new Redis();

suscribe(redisSubscribe)();
processMessage(redisSubscribe)(sendMessage(redisSend));
