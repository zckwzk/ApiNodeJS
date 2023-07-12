import moment from "moment-timezone";
import database from "../../config/database";
import { DataTypes } from "sequelize";
import Timezone from "./TimeZone";
// Define User model
// Define User model
const User = database.define("User", {
  name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  location: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: {
      isValidLocation(value: string) {
        if (!moment.tz.names().includes(value)) {
          throw new Error("Invalid location");
        }
      },
    },
  },
  birthdate: {
    type: DataTypes.DATEONLY,
    allowNull: false,
    validate: {
      isValidBirthdate(value: string) {
        if (!moment(value, "YYYY-MM-DD", true).isValid()) {
          throw new Error(
            "Invalid birthdate. Please provide a valid date in the format YYYY-MM-DD"
          );
        }
      },
    },
  },
});

User.belongsTo(Timezone);
User.sync({ alter: true })
  .then(() => {
    console.log("Database User synchronized");
  })
  .catch((error: any) => {
    console.error("Failed to synchronize database:", error);
  });

export default User;
