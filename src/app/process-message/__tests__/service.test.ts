import { newService, processMessage } from "../service";
import { Message } from "../../../domain/message-model";
import { Client } from "../../../domain/clients";
import { Service } from "../entities";

// Mock the GoogleGenerativeAI
jest.mock("@google/generative-ai", () => ({
  GoogleGenerativeAI: jest.fn().mockImplementation(() => ({
    getGenerativeModel: jest.fn().mockReturnValue({
      generateContent: jest.fn(),
    }),
  })),
}));

describe("newService", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Set up environment variable for testing
    process.env.GOOGLE_API_KEY = "test-api-key";
  });

  afterEach(() => {
    delete process.env.GOOGLE_API_KEY;
  });

  it("should create a new service instance with dependencies", () => {
    const service = newService();

    expect(service).toBeDefined();
    expect(service.d).toBeDefined();
    expect(service.d.model).toBeDefined();
    expect(typeof service.processMessage).toBe("function");
  });

  it("should create service when GOOGLE_API_KEY is set", () => {
    // Since .env file exists, the service should be created successfully
    const service = newService();
    expect(service).toBeDefined();
    expect(service.d).toBeDefined();
    expect(service.d.model).toBeDefined();
  });
});

describe("processMessage", () => {
  let mockService: Service;
  let mockModel: any;

  beforeEach(() => {
    jest.clearAllMocks();

    // Create mock model
    mockModel = {
      generateContent: jest.fn(),
    };

    // Create service with mock dependencies
    mockService = {
      d: { model: mockModel },
      processMessage,
    };
  });

  it("should process message and return filtered users based on AI response", async () => {
    const clients: Client[] = [
      {
        id: "1",
        name: "John Doe",
        email: "john@example.com",
        interests: ["javascript", "react"],
      },
      {
        id: "2",
        name: "Jane Smith",
        email: "jane@example.com",
        interests: ["python", "django"],
      },
    ];

    const message: Message = {
      id: "1",
      status: "pre-processed",
      createdAt: new Date(),
      payload: {
        id: "1",
        title: "JavaScript Tutorial",
        description: "Learn modern JavaScript programming",
        tags: ["javascript", "programming"],
        region: "global",
      },
      emails: [],
    };

    // Mock AI responses: first user interested (true), second not interested (false)
    mockModel.generateContent
      .mockResolvedValueOnce({
        response: { text: () => "true" },
      })
      .mockResolvedValueOnce({
        response: { text: () => "false" },
      });

    const processMessageFn = mockService.processMessage();
    const result = await processMessageFn(clients, message);

    expect(result.status).toBe("processed");
    expect(result.emails).toEqual(["john@example.com"]);
    expect(mockModel.generateContent).toHaveBeenCalledTimes(2);
  });

  it("should handle case when no users are interested", async () => {
    const clients: Client[] = [
      {
        id: "1",
        name: "John Doe",
        email: "john@example.com",
        interests: ["python"],
      },
    ];

    const message: Message = {
      id: "1",
      status: "pre-processed",
      createdAt: new Date(),
      payload: {
        id: "1",
        title: "JavaScript Tutorial",
        description: "Learn modern JavaScript programming",
        tags: ["javascript", "programming"],
        region: "global",
      },
      emails: [],
    };

    mockModel.generateContent.mockResolvedValue({
      response: { text: () => "false" },
    });

    const processMessageFn = mockService.processMessage();
    const result = await processMessageFn(clients, message);

    expect(result.status).toBe("processed");
    expect(result.emails).toEqual([]);
  });

  it("should handle case when all users are interested", async () => {
    const clients: Client[] = [
      {
        id: "1",
        name: "John Doe",
        email: "john@example.com",
        interests: ["javascript"],
      },
      {
        id: "2",
        name: "Jane Smith",
        email: "jane@example.com",
        interests: ["programming"],
      },
    ];

    const message: Message = {
      id: "1",
      status: "pre-processed",
      createdAt: new Date(),
      payload: {
        id: "1",
        title: "JavaScript Tutorial",
        description: "Learn modern JavaScript programming",
        tags: ["javascript", "programming"],
        region: "global",
      },
      emails: [],
    };

    mockModel.generateContent
      .mockResolvedValueOnce({
        response: { text: () => "true" },
      })
      .mockResolvedValueOnce({
        response: { text: () => "TRUE" },
      });

    const processMessageFn = mockService.processMessage();
    const result = await processMessageFn(clients, message);

    expect(result.status).toBe("processed");
    expect(result.emails).toEqual(["john@example.com", "jane@example.com"]);
  });

  it("should handle AI response case insensitively", async () => {
    const clients: Client[] = [
      {
        id: "1",
        name: "John Doe",
        email: "john@example.com",
        interests: ["javascript"],
      },
    ];

    const message: Message = {
      id: "1",
      status: "pre-processed",
      createdAt: new Date(),
      payload: {
        id: "1",
        title: "JavaScript Tutorial",
        description: "Learn modern JavaScript programming",
        tags: ["javascript", "programming"],
        region: "global",
      },
      emails: [],
    };

    mockModel.generateContent.mockResolvedValue({
      response: { text: () => "TRUE" },
    });

    const processMessageFn = mockService.processMessage();
    const result = await processMessageFn(clients, message);

    expect(result.status).toBe("processed");
    expect(result.emails).toEqual(["john@example.com"]);
  });

  it("should handle empty users array", async () => {
    const clients: Client[] = [];
    const message: Message = {
      id: "1",
      status: "pre-processed",
      createdAt: new Date(),
      payload: {
        id: "1",
        title: "JavaScript Tutorial",
        description: "Learn modern JavaScript programming",
        tags: ["javascript", "programming"],
        region: "global",
      },
      emails: [],
    };

    const processMessageFn = mockService.processMessage();
    const result = await processMessageFn(clients, message);

    expect(result.status).toBe("processed");
    expect(result.emails).toEqual([]);
    expect(mockModel.generateContent).not.toHaveBeenCalled();
  });

  it("should handle AI service errors gracefully", async () => {
    const clients: Client[] = [
      {
        id: "1",
        name: "John Doe",
        email: "john@example.com",
        interests: ["javascript"],
      },
    ];

    const message: Message = {
      id: "1",
      status: "pre-processed",
      createdAt: new Date(),
      payload: {
        id: "1",
        title: "JavaScript Tutorial",
        description: "Learn modern JavaScript programming",
        tags: ["javascript", "programming"],
        region: "global",
      },
      emails: [],
    };

    mockModel.generateContent.mockRejectedValue(new Error("AI service error"));

    const processMessageFn = mockService.processMessage();

    await expect(processMessageFn(clients, message)).rejects.toThrow( 
      "AI service error"
    );
  });
});
