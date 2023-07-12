"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const database_1 = __importDefault(require("../../config/database"));
const sequelize_1 = require("sequelize");
const User_1 = __importDefault(require("./User"));
// Define User model
// Define Job model
const Job = database_1.default.define("Job", {
    jobId: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: false,
    },
    type: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: false,
    },
    status: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: false,
    },
    retried: {
        type: sequelize_1.DataTypes.BOOLEAN,
        defaultValue: false,
    },
});
// Associate Job with User
User_1.default.hasMany(Job);
Job.belongsTo(User_1.default);
exports.default = Job;
