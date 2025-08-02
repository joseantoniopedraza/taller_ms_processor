import { GenerativeModel } from "@google/generative-ai";
import { Message } from "../../domain/message-model";
import { Client } from "../../domain/clients";    

export type dependencies = {
  model: GenerativeModel;
};

export interface Service {
  d: dependencies;
  processMessage: (this: Service) => (clients: Array<Client>, message: Message) => Promise<Message>;
}
