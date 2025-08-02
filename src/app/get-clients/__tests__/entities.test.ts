import { dependencies, Service } from "../entities";
import { Client } from "../../../domain/clients";
import { AxiosInstance } from "axios";

describe("get-clients Entities", () => {
  describe("dependencies type", () => {
    it("should have correct structure", () => {
      const mockRestClient = {} as AxiosInstance;
      const mockState = {
        clients: [] as Client[],
        lastUpdate: null as Date | null,
      };

      const deps: dependencies = {
        restClient: mockRestClient,
        state: mockState,
      };

      expect(deps).toBeDefined();
      expect(deps.restClient).toBe(mockRestClient);
      expect(deps.state).toBe(mockState);
      expect(deps.state.clients).toEqual([]);
      expect(deps.state.lastUpdate).toBeNull();
    });

    it("should allow populated state", () => {
      const mockRestClient = {} as AxiosInstance;
      const mockClients: Client[] = [
        {
          id: "1",
          name: "Test User",
          email: "test@example.com",
          interests: ["testing"],
        },
      ];
      const mockDate = new Date();

      const deps: dependencies = {
        restClient: mockRestClient,
        state: {
          clients: mockClients,
          lastUpdate: mockDate,
        },
      };

      expect(deps.state.clients).toEqual(mockClients);
      expect(deps.state.lastUpdate).toBe(mockDate);
    });
  });

  describe("Service interface", () => {
    it("should have correct structure", () => {
      const mockRestClient = {} as AxiosInstance;
      const mockGetClients = jest.fn();

      const service: Service = {
        d: {
          restClient: mockRestClient,
          state: {
            clients: [],
            lastUpdate: null,
          },
        },
        getClients: mockGetClients,
      };

      expect(service).toBeDefined();
      expect(service.d).toBeDefined();
      expect(service.d.restClient).toBe(mockRestClient);
      expect(service.getClients).toBe(mockGetClients);
    });

    it("should allow getClients to be called with correct context", () => {
      const mockRestClient = {} as AxiosInstance;
      const mockGetClients = jest.fn().mockReturnValue(() => Promise.resolve([]));

      const service: Service = {
        d: {
          restClient: mockRestClient,
          state: {
            clients: [],
            lastUpdate: null,
          },
        },
        getClients: mockGetClients,
      };

      // Test that getClients can be called with service as context
      const result = service.getClients.call(service);
      expect(result).toBeDefined();
      expect(typeof result).toBe("function");
    });
  });

  describe("Type compatibility", () => {
    it("should be compatible with Client type", () => {
      const client: Client = {
        id: "1",
        name: "Test User",
        email: "test@example.com",
        interests: ["testing"],
      };

      const deps: dependencies = {
        restClient: {} as AxiosInstance,
        state: {
          clients: [client],
          lastUpdate: new Date(),
        },
      };

      expect(deps.state.clients[0]).toEqual(client);
      expect(deps.state.clients[0].id).toBe("1");
      expect(deps.state.clients[0].name).toBe("Test User");
      expect(deps.state.clients[0].email).toBe("test@example.com");
      expect(deps.state.clients[0].interests).toEqual(["testing"]);
    });

    it("should handle empty clients array", () => {
      const deps: dependencies = {
        restClient: {} as AxiosInstance,
        state: {
          clients: [],
          lastUpdate: null,
        },
      };

      expect(deps.state.clients).toEqual([]);
      expect(deps.state.clients.length).toBe(0);
    });

    it("should handle multiple clients", () => {
      const clients: Client[] = [
        {
          id: "1",
          name: "User 1",
          email: "user1@example.com",
          interests: ["javascript"],
        },
        {
          id: "2",
          name: "User 2",
          email: "user2@example.com",
          interests: ["python"],
        },
      ];

      const deps: dependencies = {
        restClient: {} as AxiosInstance,
        state: {
          clients,
          lastUpdate: new Date(),
        },
      };

      expect(deps.state.clients).toEqual(clients);
      expect(deps.state.clients.length).toBe(2);
    });
  });

  describe("Date handling", () => {
    it("should handle null lastUpdate", () => {
      const deps: dependencies = {
        restClient: {} as AxiosInstance,
        state: {
          clients: [],
          lastUpdate: null,
        },
      };

      expect(deps.state.lastUpdate).toBeNull();
    });

    it("should handle Date lastUpdate", () => {
      const testDate = new Date("2023-01-01T00:00:00Z");
      const deps: dependencies = {
        restClient: {} as AxiosInstance,
        state: {
          clients: [],
          lastUpdate: testDate,
        },
      };

      expect(deps.state.lastUpdate).toBe(testDate);
      expect(deps.state.lastUpdate instanceof Date).toBe(true);
    });
  });
}); 