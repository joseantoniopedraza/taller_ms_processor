import axios from "axios";
import { Service } from "./entities";
import { CONFIGS } from "../../configs";

export function newService(): Service {
  const restClient = axios.create({
    baseURL: "http://localhost:3000",
  });

  return {
    d: { restClient, state: { users: [], lastUpdate: null } },
    getUsers,
  };
}

export function getUsers(this: Service) {
  return async () => {
    if (
      this.d.state.lastUpdate &&
      this.d.state.lastUpdate >
        new Date(Date.now() - CONFIGS.USERS_REFRESH_TIME)
    ) {
      return this.d.state.users;
    }

    return [
      {
        id: "1",
        name: "test",
        email: "smanterola@gmail.com",
        interests: ["vivienda", "naves"],
      },
      {
        id: "2",
        name: "test",
        email: "seba.contador.molina@gmail.com",
        interests: ["seguridad"],
      },
    ];
    const { data } = await this.d.restClient.get("/users");
    return data;
  };
}
