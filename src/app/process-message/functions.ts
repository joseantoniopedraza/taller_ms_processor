import { Message } from "../../domain/message-model";

export const buildPrompt = (message: Message, interests: string[]): string => {
  const text = `${message.payload.title} + ${message.payload.description}`;
  return `
    Dado el siguiente texto: "${text}"  
    Y las siguientes palabras: ${interests.join(", ")}

    ¿Al menos una de estas palabras pertenece al contexto del texto?  
    Responde solo con "true" o "false".
  `;
};
