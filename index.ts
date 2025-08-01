import "./src";

import { newService as usersNewService } from "./src/app/get-users";

const usersService = usersNewService();

usersService.getUsers()();








