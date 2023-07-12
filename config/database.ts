import { Sequelize, DataTypes } from "sequelize";
import { populateTimezones } from "../api/models/TimeZone";
import Timezone from "../api/models/TimeZone";

const sequelize = new Sequelize("challenge", "root", "admin", {
  host: "127.0.0.1",
  port: 3306,
  dialect: "mysql",
});

// Synchronize the Sequelize models with the database
sequelize
  .sync({ alter: true })
  .then(() => {
    console.log("Database synchronized");
    // populateTimezones();
  })
  .catch((error) => {
    console.error("Failed to synchronize database:", error);
  });

export default sequelize;
