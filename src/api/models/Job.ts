import database from "../../config/database";
import { DataTypes } from "sequelize";
import User from "./User";
// Define User model
// Define Job model
const Job = database.define("Job", {
  jobId: {
    type: DataTypes.STRING,
    allowNull: true,
  },
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
  retried: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
});

// Associate Job with User
User.hasMany(Job);
Job.belongsTo(User);

export default Job;
