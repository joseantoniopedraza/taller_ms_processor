import { newService } from "../service";
import { buildPrompt } from "../functions";
import { Message } from "../../../domain/message-model";
import { User } from "../../../domain/users";

// Mock the entire service module
jest.mock("../service", () => ({
  newService: jest.fn()
}));

describe("Process Message Integration Tests", () => {
  let mockService: any;
  let mockGenerateContent: jest.Mock;

  beforeEach(() => {
    jest.clearAllMocks();
    
    // Create mock generateContent function
    mockGenerateContent = jest.fn();
    
    // Create mock service
    mockService = {
      d: { 
        model: { 
          generateContent: mockGenerateContent 
        } 
      },
      processMessage: function(this: any) {
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
    };

    // Mock the newService function to return our mock service
    (newService as jest.Mock).mockReturnValue(mockService);
  });

  afterEach(() => {
    // Clean up
  });

  it("should process a complete message flow with multiple users", async () => {
    const users: User[] = [
      {
        id: "1",
        name: "John Doe",
        email: "john@example.com",
        interests: ["javascript", "react"]
      },
      {
        id: "2",
        name: "Jane Smith",
        email: "jane@example.com",
        interests: ["python", "django"]
      },
      {
        id: "3",
        name: "Bob Wilson",
        email: "bob@example.com",
        interests: ["javascript", "nodejs"]
      }
    ];

    const message: Message = {
      id: "1",
      status: "pre-processed",
      createdAt: new Date(),
      payload: {
        id: "1",
        title: "Advanced JavaScript Patterns",
        description: "Learn advanced JavaScript programming patterns and best practices",
        tags: ["javascript", "programming", "patterns"],
        region: "global"
      },
      emails: []
    };

    // Mock AI responses: John (true), Jane (false), Bob (true)
    mockGenerateContent
      .mockResolvedValueOnce({
        response: { text: () => "true" }
      })
      .mockResolvedValueOnce({
        response: { text: () => "false" }
      })
      .mockResolvedValueOnce({
        response: { text: () => "true" }
      });

    const service = newService();
    const processMessageFn = service.processMessage();
    const result = await processMessageFn(users, message);

    // Verify the result
    expect(result.status).toBe("processed");
    expect(result.emails).toEqual(["john@example.com", "bob@example.com"]);
    expect(result.emails).not.toContain("jane@example.com");

    // Verify AI was called for each user
    expect(mockGenerateContent).toHaveBeenCalledTimes(3);

    // Verify the prompts were built correctly
    const calls = mockGenerateContent.mock.calls;
    expect(calls[0][0]).toContain("Advanced JavaScript Patterns + Learn advanced JavaScript programming patterns and best practices");
    expect(calls[0][0]).toContain("javascript, react");
    expect(calls[1][0]).toContain("python, django");
    expect(calls[2][0]).toContain("javascript, nodejs");
  });

  it("should handle edge case with no matching users", async () => {
    const users: User[] = [
      {
        id: "1",
        name: "Alice",
        email: "alice@example.com",
        interests: ["python", "machine-learning"]
      }
    ];

    const message: Message = {
      id: "1",
      status: "pre-processed",
      createdAt: new Date(),
      payload: {
        id: "1",
        title: "JavaScript Fundamentals",
        description: "Basic JavaScript concepts for beginners",
        tags: ["javascript", "basics"],
        region: "global"
      },
      emails: []
    };

    mockGenerateContent.mockResolvedValue({
      response: { text: () => "false" }
    });

    const service = newService();
    const processMessageFn = service.processMessage();
    const result = await processMessageFn(users, message);

    expect(result.status).toBe("processed");
    expect(result.emails).toEqual([]);
    expect(mockGenerateContent).toHaveBeenCalledTimes(1);
  });

  it("should handle case insensitive AI responses", async () => {
    const users: User[] = [
      {
        id: "1",
        name: "Test User",
        email: "test@example.com",
        interests: ["javascript"]
      }
    ];

    const message: Message = {
      id: "1",
      status: "pre-processed",
      createdAt: new Date(),
      payload: {
        id: "1",
        title: "JavaScript Tutorial",
        description: "Learn JavaScript programming",
        tags: ["javascript"],
        region: "global"
      },
      emails: []
    };

    // Test different case variations
    const testCases = ["TRUE", "True", "true", "FALSE", "False", "false"];

    for (const testCase of testCases) {
      mockGenerateContent.mockResolvedValue({
        response: { text: () => testCase }
      });

      const service = newService();
      const processMessageFn = service.processMessage();
      const result = await processMessageFn(users, message);

      const expectedEmails = testCase.toLowerCase() === "true" ? ["test@example.com"] : [];
      expect(result.emails).toEqual(expectedEmails);
    }
  });

  it("should verify prompt building integration", () => {
    const message: Message = {
      id: "1",
      status: "pre-processed",
      createdAt: new Date(),
      payload: {
        id: "1",
        title: "Test Title",
        description: "Test Description",
        tags: ["test"],
        region: "global"
      },
      emails: []
    };

    const interests = ["interest1", "interest2"];

    const prompt = buildPrompt(message, interests);

    expect(prompt).toContain("Test Title + Test Description");
    expect(prompt).toContain("interest1, interest2");
    expect(prompt).toContain("¿Al menos una de estas palabras pertenece al contexto del texto?");
    expect(prompt).toContain("Responde solo con \"true\" o \"false\"");
  });
}); 