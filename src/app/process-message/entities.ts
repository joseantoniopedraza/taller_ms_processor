import { GenerativeModel } from "@google/generative-ai";
import { Message } from "../../domain/message-model";
import { User } from "../../domain/users";

export type dependencies = {
  model: GenerativeModel;
};

export interface Service {
  d: dependencies;
  processMessage: (this: Service) => (users: Array<User>, message: Message) => Promise<Message>;
}
