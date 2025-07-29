import { Message } from "../domain/message-model";
import Redis from "ioredis";
import { newService as processMessageNewService } from "../app/process-message";
import { newService as usersNewService } from "../app/get-users";

const processMessageService = processMessageNewService();
const usersService = usersNewService();

export const processMessage = (redis: Redis) => (sendMessage: (message: Message) => void) => {
  redis.on("message", async (_, message) => {
    const data = JSON.parse(message) as Message;

    if (data.status !== "pre-processed") return;

    const users = await usersService.getUsers()();
    const response = await processMessageService.processMessage()(users, data);

    sendMessage(response);
  });
};
