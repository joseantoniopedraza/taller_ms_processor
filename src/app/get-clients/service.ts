import axios from "axios";
import { Service } from "./entities";
import { CONFIGS } from "../../configs";

export function newService(): Service {
  const restClient = axios.create({
    baseURL: CONFIGS.DJANGO_API_URL,
    timeout: 10000,
  });

  return {
    d: { restClient, state: { clients: [], lastUpdate: null } },
    getClients,
  };
}


export function getClients(this: Service) {
  return async () => {
    if (
      this.d.state.lastUpdate &&
      this.d.state.lastUpdate >
        new Date(Date.now() - CONFIGS.CLIENTS_REFRESH_TIME)
    ) {
      return this.d.state.clients;
    }

    try {      
      console.log("Getting clients");
      const { data } = await this.d.restClient.get("/clients/");
      
      const mappedClients = data.map((client: any) => ({
        id: client.id.toString(),
        name: client.name,
        email: client.email,
        interests: client.interests || [],
      }));

      this.d.state.clients = mappedClients;
      this.d.state.lastUpdate = new Date();
      console.log("Clients fetched", mappedClients);
      return mappedClients;
    } catch (error: any) {
      console.log("Error fetching clients", error);
      return [];
    }
  };
}
