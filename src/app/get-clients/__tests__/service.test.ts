import { newService, getClients } from "../service";
import { Service } from "../entities";
import { Client } from "../../../domain/clients";
import axios from "axios";

// Mock axios
jest.mock("axios");
const mockedAxios = axios as jest.Mocked<typeof axios>;

describe("newService", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Mock axios.create
    mockedAxios.create.mockReturnValue({
      get: jest.fn(),
      post: jest.fn(),
      put: jest.fn(),
      delete: jest.fn(),
      patch: jest.fn(),
      request: jest.fn(),
      interceptors: {
        request: { use: jest.fn(), eject: jest.fn() },
        response: { use: jest.fn(), eject: jest.fn() },
      },
      defaults: {},
    } as any);
  });

  it("should create a new service instance with dependencies", () => {
    const service = newService();

    expect(service).toBeDefined();
    expect(service.d).toBeDefined();
    expect(service.d.restClient).toBeDefined();
    expect(service.d.state).toBeDefined();
    expect(service.d.state.clients).toEqual([]);
    expect(service.d.state.lastUpdate).toBeNull();
    expect(typeof service.getClients).toBe("function");
  });

  it("should create axios instance with correct configuration", () => {
    newService();

    expect(mockedAxios.create).toHaveBeenCalledWith({
      baseURL: "http://taller-ms-persistence:3001",
      timeout: 10000,
    });
  });
});

describe("getClients", () => {
  let mockService: Service;
  let mockRestClient: any;

  beforeEach(() => {
    jest.clearAllMocks();

    // Create mock rest client
    mockRestClient = {
      get: jest.fn(),
    };

    // Create service with mock dependencies
    mockService = {
      d: { 
        restClient: mockRestClient, 
        state: { clients: [], lastUpdate: null } 
      },
      getClients,
    };
  });

  it("should return cached clients if within refresh time", async () => {
    const cachedClients: Client[] = [
      {
        id: "1",
        name: "John Doe",
        email: "john@example.com",
        interests: ["javascript", "react"],
      },
    ];

    // Set up cached state
    mockService.d.state.clients = cachedClients;
    mockService.d.state.lastUpdate = new Date(Date.now() - 5000); // 5 seconds ago

    const result = await mockService.getClients()();

    expect(result).toEqual(cachedClients);
    expect(mockRestClient.get).not.toHaveBeenCalled();
  });

  it("should fetch clients from API when cache is expired", async () => {
    const apiResponse = [
      {
        id: 1,
        name: "John Doe",
        email: "john@example.com",
        interests: ["javascript", "react"],
      },
      {
        id: 2,
        name: "Jane Smith",
        email: "jane@example.com",
        interests: ["python", "django"],
      },
    ];

    const expectedClients: Client[] = [
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

    // Mock API response
    mockRestClient.get.mockResolvedValue({ data: apiResponse });

    const result = await mockService.getClients()();

    expect(mockRestClient.get).toHaveBeenCalledWith("/clients/");
    expect(result).toEqual(expectedClients);
    expect(mockService.d.state.clients).toEqual(expectedClients);
    expect(mockService.d.state.lastUpdate).toBeInstanceOf(Date);
  });

  it("should handle clients without interests", async () => {
    const apiResponse = [
      {
        id: 1,
        name: "John Doe",
        email: "john@example.com",
        // interests field is missing
      },
    ];

    const expectedClients: Client[] = [
      {
        id: "1",
        name: "John Doe",
        email: "john@example.com",
        interests: [], // Should default to empty array
      },
    ];

    mockRestClient.get.mockResolvedValue({ data: apiResponse });

    const result = await mockService.getClients()();

    expect(result).toEqual(expectedClients);
  });

  it("should handle clients with null interests", async () => {
    const apiResponse = [
      {
        id: 1,
        name: "John Doe",
        email: "john@example.com",
        interests: null,
      },
    ];

    const expectedClients: Client[] = [
      {
        id: "1",
        name: "John Doe",
        email: "john@example.com",
        interests: [], // Should default to empty array
      },
    ];

    mockRestClient.get.mockResolvedValue({ data: apiResponse });

    const result = await mockService.getClients()();

    expect(result).toEqual(expectedClients);
  });

  it("should handle API errors gracefully", async () => {
    const consoleSpy = jest.spyOn(console, "log").mockImplementation();

    mockRestClient.get.mockRejectedValue(new Error("API Error"));

    const result = await mockService.getClients()();

    expect(result).toEqual([]);
    expect(consoleSpy).toHaveBeenCalledWith("Error fetching clients", expect.any(Error));
    expect(mockService.d.state.clients).toEqual([]);
    expect(mockService.d.state.lastUpdate).toBeNull();

    consoleSpy.mockRestore();
  });

  it("should handle network timeout errors", async () => {
    const consoleSpy = jest.spyOn(console, "log").mockImplementation();

    mockRestClient.get.mockRejectedValue(new Error("timeout of 10000ms exceeded"));

    const result = await mockService.getClients()();

    expect(result).toEqual([]);
    expect(consoleSpy).toHaveBeenCalledWith("Error fetching clients", expect.any(Error));

    consoleSpy.mockRestore();
  });

  it("should log when fetching clients", async () => {
    const consoleSpy = jest.spyOn(console, "log").mockImplementation();

    const apiResponse = [
      {
        id: 1,
        name: "John Doe",
        email: "john@example.com",
        interests: ["javascript"],
      },
    ];

    mockRestClient.get.mockResolvedValue({ data: apiResponse });

    await mockService.getClients()();

    expect(consoleSpy).toHaveBeenCalledWith("Getting clients");
    expect(consoleSpy).toHaveBeenCalledWith("Clients fetched", expect.any(Array));

    consoleSpy.mockRestore();
  });

  it("should convert numeric IDs to strings", async () => {
    const apiResponse = [
      {
        id: 123,
        name: "John Doe",
        email: "john@example.com",
        interests: ["javascript"],
      },
    ];

    const expectedClients: Client[] = [
      {
        id: "123", // Should be converted to string
        name: "John Doe",
        email: "john@example.com",
        interests: ["javascript"],
      },
    ];

    mockRestClient.get.mockResolvedValue({ data: apiResponse });

    const result = await mockService.getClients()();

    expect(result).toEqual(expectedClients);
  });

  it("should handle empty API response", async () => {
    mockRestClient.get.mockResolvedValue({ data: [] });

    const result = await mockService.getClients()();

    expect(result).toEqual([]);
    expect(mockService.d.state.clients).toEqual([]);
  });

  it("should refresh cache when lastUpdate is null", async () => {
    const apiResponse = [
      {
        id: 1,
        name: "John Doe",
        email: "john@example.com",
        interests: ["javascript"],
      },
    ];

    mockRestClient.get.mockResolvedValue({ data: apiResponse });

    const result = await mockService.getClients()();

    expect(mockRestClient.get).toHaveBeenCalled();
    expect(result).toHaveLength(1);
  });
}); 