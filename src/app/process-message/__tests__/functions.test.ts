import { buildPrompt } from "../functions";
import { Message } from "../../../domain/message-model";

describe("buildPrompt", () => {
  it("should build a prompt with message content and user interests", () => {
    const message: Message = {
      id: "1",
      status: "pre-processed",
      createdAt: new Date(),
      payload: {
        id: "1",
        title: "JavaScript Tutorial",
        description: "Learn modern JavaScript programming",
        tags: ["javascript", "programming"],
        region: "global"
      },
      emails: []
    };

    const interests = ["javascript", "react", "nodejs"];

    const result = buildPrompt(message, interests);

    expect(result).toContain("JavaScript Tutorial + Learn modern JavaScript programming");
    expect(result).toContain("javascript, react, nodejs");
    expect(result).toContain("¿Al menos una de estas palabras pertenece al contexto del texto?");
    expect(result).toContain("Responde solo con \"true\" o \"false\"");
  });

  it("should handle empty interests array", () => {
    const message: Message = {
      id: "1",
      status: "pre-processed",
      createdAt: new Date(),
      payload: {
        id: "1",
        title: "Test Title",
        description: "Test Description",
        tags: [],
        region: "global"
      },
      emails: []
    };

    const interests: string[] = [];

    const result = buildPrompt(message, interests);

    expect(result).toContain("Test Title + Test Description");
    expect(result).toContain("Y las siguientes palabras: ");
  });

  it("should handle single interest", () => {
    const message: Message = {
      id: "1",
      status: "pre-processed",
      createdAt: new Date(),
      payload: {
        id: "1",
        title: "Python Basics",
        description: "Introduction to Python programming",
        tags: ["python"],
        region: "global"
      },
      emails: []
    };

    const interests = ["python"];

    const result = buildPrompt(message, interests);

    expect(result).toContain("Python Basics + Introduction to Python programming");
    expect(result).toContain("Y las siguientes palabras: python");
  });

  it("should handle special characters in title and description", () => {
    const message: Message = {
      id: "1",
      status: "pre-processed",
      createdAt: new Date(),
      payload: {
        id: "1",
        title: "C++ & OOP",
        description: "Object-Oriented Programming with C++",
        tags: ["cpp", "oop"],
        region: "global"
      },
      emails: []
    };

    const interests = ["cpp", "programming"];

    const result = buildPrompt(message, interests);

    expect(result).toContain("C++ & OOP + Object-Oriented Programming with C++");
    expect(result).toContain("cpp, programming");
  });
}); 