import moment from "moment-timezone";
import database from "../../config/database";
import { DataTypes } from "sequelize";

// Define Timezone model
const Timezone = database.define("Timezone", {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  offsite: {
    type: DataTypes.STRING,
    allowNull: false,
  },
});

// Function to populate the Timezone table with data
async function populateTimezones() {
  try {
    const timezones = moment.tz.names();

    for (const timezone of timezones) {
      console.log(moment.tz(timezone).format("Z"));
      await Timezone.create({
        name: timezone,
        offsite: String(moment.tz(timezone).format("Z")),
      });
    }

    console.log("Timezone table populated successfully");
  } catch (error) {
    console.error("Failed to populate Timezone table:", error);
  }
}

// Synchronize the Sequelize models with the database
Timezone.sync({ alter: true })
  .then(() => {
    console.log("Database synchronized time zoned");
    populateTimezones();
  })
  .catch((error: any) => {
    console.error("Failed to synchronize database:", error);
  });

export { populateTimezones };

export default Timezone;
