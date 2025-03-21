//
import Path from "path";
//
require("dotenv").config(); // imports .env variables for the entire application
require("dotenv").config({ path: Path.resolve(__dirname, "../.env.local") });
//
const CONFIG_private = require("../config/private");
//
//

//
//
var Server_class = require("./simple"); // -> switch in a more complex server here if needed, or use logic to determine server class from private config
//
const server_01 = new Server_class(); // -> calls .init() and .start() upon construction
// -> Now the server exists and will start running automatically
//
