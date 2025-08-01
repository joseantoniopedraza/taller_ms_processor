import axios from "axios";
import { Service } from "./entities";
import { CONFIGS } from "../../configs";

export function newService(): Service {
  const restClient = axios.create({
    baseURL: CONFIGS.DJANGO_API_URL,
    timeout: 10000,
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

    try {      
      console.log("Getting users");
      const { data } = await this.d.restClient.get("/clients/");
      
      const mappedUsers = data.map((client: any) => ({
        id: client.id.toString(),
        name: client.name,
        email: client.email,
        interests: client.interests || [],
      }));

      this.d.state.users = mappedUsers;
      this.d.state.lastUpdate = new Date();
      console.log("Users fetched", mappedUsers);
      return mappedUsers;
    } catch (error: any) {
      console.log("Error fetching users", error);
      return [];
    }
  };
}
