import { Message } from "../domain/message-model";
import Redis from "ioredis";
import { newService as processMessageNewService } from "../app/process-message";
import { newService as clientsNewService } from "../app/get-clients";

const processMessageService = processMessageNewService();
const clientsService = clientsNewService();

export const processMessage = (redis: Redis) => (sendMessage: (message: Message) => void) => {
  redis.on("message", async (_, message) => {
    const data = JSON.parse(message) as Message;

    if (data.status !== "pre-processed") return;

    const clients = await clientsService.getClients()();
    const response = await processMessageService.processMessage()(clients, data);

    sendMessage(response);
  });
};
