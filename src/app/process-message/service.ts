import { Message } from "../../domain/message-model";
import { Service } from "./entities";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { buildPrompt } from "./functions";
import { User } from "../../domain/users";
import { CONFIGS } from "../../configs";

export function newService(): Service {
  const genAI = new GoogleGenerativeAI(CONFIGS.GOOGLE_API_KEY as string);
  const model = genAI.getGenerativeModel({ model: CONFIGS.GOOGLE_MODEL });

  return {
    d: { model },
    processMessage,
  };
}

export function processMessage(this: Service) {
  return async (users: Array<User>, message: Message) => {
    message.status = "processed";

    const promises = users.map(async (user) => {
      const prompt = buildPrompt(message, user.interests);
      const result = await this.d.model.generateContent(prompt);

      return result.response.text().trim().toLowerCase() === "true";
    });

    const results = await Promise.all(promises);

    message.emails = users.filter((_, index) => results[index]).map((user) => user.email);

    return message;
  };
}
