import { Sequelize, DataTypes } from "sequelize";
import { populateTimezones } from "../api/models/TimeZone";
import Timezone from "../api/models/TimeZone";

const sequelize = new Sequelize("challenge", "root", "admin", {
  host: "127.0.0.1",
  port: 3306,
  dialect: "mysql",
  timezone: "+00:00",
  logging: false,
});

export default sequelize;
