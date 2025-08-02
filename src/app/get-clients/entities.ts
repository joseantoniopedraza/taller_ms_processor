import { AxiosInstance } from "axios";
import { Client } from "../../domain/clients";

export type dependencies = {
  restClient: AxiosInstance;
  state: {
    clients: Array<Client>;
    lastUpdate: Date | null;
  }
};

export interface Service {
  d: dependencies;
  getClients: (this: Service) => () => Promise<Array<Client>>;
}
