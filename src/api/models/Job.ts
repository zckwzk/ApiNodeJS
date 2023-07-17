import database from "../../config/database";
import { DataTypes } from "sequelize";
import User from "./User";
// Define User model
// Define Job model
const Job = database.define("Job", {
  type: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  status: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  scheduled_at: {
    type: DataTypes.DATE,
    allowNull: false,
  },
  retries: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
  },
  retryDate: {
    type: DataTypes.DATE,
    allowNull: true,
  },
});

// Associate Job with User
User.hasMany(Job);
Job.belongsTo(User);

Job.sync({ alter: true })
  .then(() => {
    console.log("Table job synchronized");
  })
  .catch((error: any) => {
    console.error("Failed to synchronize job:", error);
  });

export default Job;
