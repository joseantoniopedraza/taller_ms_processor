import { AxiosInstance } from "axios";
import { User } from "../../domain/users";

export type dependencies = {
  restClient: AxiosInstance;
  state: {
    users: Array<User>;
    lastUpdate: Date | null;
  }
};

export interface Service {
  d: dependencies;
  getUsers: (this: Service) => () => Promise<Array<User>>;
}
