import { newService } from "../service";
import { Client } from "../../../domain/clients";
import axios from "axios";

// Mock axios
jest.mock("axios");
const mockedAxios = axios as jest.Mocked<typeof axios>;

describe("get-clients Integration Tests", () => {
  let mockAxiosInstance: any;

  beforeEach(() => {
    jest.clearAllMocks();

    // Create mock axios instance
    mockAxiosInstance = {
      get: jest.fn(),
    };

    // Mock axios.create to return our mock instance
    mockedAxios.create.mockReturnValue(mockAxiosInstance);
  });

  describe("Service Integration", () => {
    it("should integrate with real service creation and client fetching", async () => {
      const mockClientsData = [
        {
          id: 1,
          name: "Alice Johnson",
          email: "alice@example.com",
          interests: ["typescript", "nodejs"],
        },
        {
          id: 2,
          name: "Bob Wilson",
          email: "bob@example.com",
          interests: ["python", "machine-learning"],
        },
      ];

      const expectedClients: Client[] = [
        {
          id: "1",
          name: "Alice Johnson",
          email: "alice@example.com",
          interests: ["typescript", "nodejs"],
        },
        {
          id: "2",
          name: "Bob Wilson",
          email: "bob@example.com",
          interests: ["python", "machine-learning"],
        },
      ];

      // Mock successful API response
      mockAxiosInstance.get.mockResolvedValue({ data: mockClientsData });

      // Create real service
      const service = newService();
      const getClients = service.getClients();

      // Execute the function
      const result = await getClients();

      // Verify axios was called correctly
      expect(mockedAxios.create).toHaveBeenCalledWith({
        baseURL: "http://taller-ms-persistence:3001",
        timeout: 10000,
      });

      expect(mockAxiosInstance.get).toHaveBeenCalledWith("/clients/");
      expect(result).toEqual(expectedClients);
    });

    it("should handle service creation and error scenarios", async () => {
      // Mock API error
      mockAxiosInstance.get.mockRejectedValue(new Error("Network error"));

      // Create real service
      const service = newService();
      const getClients = service.getClients();

      // Execute the function
      const result = await getClients();

      // Should return empty array on error
      expect(result).toEqual([]);
      expect(mockAxiosInstance.get).toHaveBeenCalledWith("/clients/");
    });

    it("should maintain state between calls", async () => {
      const mockClientsData = [
        {
          id: 1,
          name: "Test User",
          email: "test@example.com",
          interests: ["testing"],
        },
      ];

      const expectedClients: Client[] = [
        {
          id: "1",
          name: "Test User",
          email: "test@example.com",
          interests: ["testing"],
        },
      ];

      // Mock successful API response
      mockAxiosInstance.get.mockResolvedValue({ data: mockClientsData });

      // Create real service
      const service = newService();
      const getClients = service.getClients();

      // First call - should fetch from API
      const result1 = await getClients();
      expect(result1).toEqual(expectedClients);
      expect(mockAxiosInstance.get).toHaveBeenCalledTimes(1);

      // Second call - should use cached data
      const result2 = await getClients();
      expect(result2).toEqual(expectedClients);
      expect(mockAxiosInstance.get).toHaveBeenCalledTimes(1); // Should not call again
    });

    it("should handle mixed data scenarios", async () => {
      const mockClientsData = [
        {
          id: 1,
          name: "User with interests",
          email: "user1@example.com",
          interests: ["javascript", "react"],
        },
        {
          id: 2,
          name: "User without interests",
          email: "user2@example.com",
          // interests field missing
        },
        {
          id: 3,
          name: "User with null interests",
          email: "user3@example.com",
          interests: null,
        },
      ];

      const expectedClients: Client[] = [
        {
          id: "1",
          name: "User with interests",
          email: "user1@example.com",
          interests: ["javascript", "react"],
        },
        {
          id: "2",
          name: "User without interests",
          email: "user2@example.com",
          interests: [], // Should default to empty array
        },
        {
          id: "3",
          name: "User with null interests",
          email: "user3@example.com",
          interests: [], // Should default to empty array
        },
      ];

      mockAxiosInstance.get.mockResolvedValue({ data: mockClientsData });

      const service = newService();
      const getClients = service.getClients();

      const result = await getClients();

      expect(result).toEqual(expectedClients);
    });
  });

  describe("Configuration Integration", () => {
    it("should use correct API configuration", () => {
      newService();

      expect(mockedAxios.create).toHaveBeenCalledWith({
        baseURL: "http://taller-ms-persistence:3001",
        timeout: 10000,
      });
    });

    it("should handle different ID types correctly", async () => {
      const mockClientsData = [
        {
          id: 1, // number
          name: "User 1",
          email: "user1@example.com",
          interests: ["test"],
        },
        {
          id: "2", // string
          name: "User 2",
          email: "user2@example.com",
          interests: ["test"],
        },
        {
          id: 3.14, // float
          name: "User 3",
          email: "user3@example.com",
          interests: ["test"],
        },
      ];

      const expectedClients: Client[] = [
        {
          id: "1", // Should be converted to string
          name: "User 1",
          email: "user1@example.com",
          interests: ["test"],
        },
        {
          id: "2", // Already string
          name: "User 2",
          email: "user2@example.com",
          interests: ["test"],
        },
        {
          id: "3.14", // Should be converted to string
          name: "User 3",
          email: "user3@example.com",
          interests: ["test"],
        },
      ];

      mockAxiosInstance.get.mockResolvedValue({ data: mockClientsData });

      const service = newService();
      const getClients = service.getClients();

      const result = await getClients();

      expect(result).toEqual(expectedClients);
    });
  });

  describe("Error Handling Integration", () => {
    it("should handle various error types gracefully", async () => {
      const errorScenarios = [
        new Error("Network error"),
        new Error("timeout of 10000ms exceeded"),
        new Error("ECONNREFUSED"),
        { response: { status: 404, data: "Not found" } },
        { response: { status: 500, data: "Internal server error" } },
      ];

      for (const error of errorScenarios) {
        mockAxiosInstance.get.mockRejectedValue(error);

        const service = newService();
        const getClients = service.getClients();

        const result = await getClients();

        expect(result).toEqual([]);
        expect(mockAxiosInstance.get).toHaveBeenCalledWith("/clients/");

        // Reset for next iteration
        jest.clearAllMocks();
      }
    });

    it("should handle malformed API responses", async () => {
      const malformedResponses = [
        null,
        undefined,
        "invalid json",
        { data: null },
        { data: undefined },
        { data: "not an array" },
      ];

      for (const response of malformedResponses) {
        if (response === null || response === undefined) {
          mockAxiosInstance.get.mockResolvedValue(response);
        } else {
          mockAxiosInstance.get.mockResolvedValue(response);
        }

        const service = newService();
        const getClients = service.getClients();

        const result = await getClients();

        // Should handle gracefully and return empty array or handle appropriately
        expect(Array.isArray(result)).toBe(true);

        // Reset for next iteration
        jest.clearAllMocks();
      }
    });
  });
}); 