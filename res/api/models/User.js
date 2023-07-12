"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const moment_timezone_1 = __importDefault(require("moment-timezone"));
const database_1 = __importDefault(require("../../config/database"));
const sequelize_1 = require("sequelize");
const TimeZone_1 = __importDefault(require("./TimeZone"));
// Define User model
// Define User model
const User = database_1.default.define("User", {
    name: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: false,
    },
    location: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: false,
        validate: {
            isValidLocation(value) {
                if (!moment_timezone_1.default.tz.names().includes(value)) {
                    throw new Error("Invalid location");
                }
            },
        },
    },
    birthdate: {
        type: sequelize_1.DataTypes.DATEONLY,
        allowNull: false,
        validate: {
            isValidBirthdate(value) {
                if (!(0, moment_timezone_1.default)(value, "YYYY-MM-DD", true).isValid()) {
                    throw new Error("Invalid birthdate. Please provide a valid date in the format YYYY-MM-DD");
                }
            },
        },
    },
});
User.belongsTo(TimeZone_1.default);
User.sync({ alter: true })
    .then(() => {
    console.log("Database User synchronized");
})
    .catch((error) => {
    console.error("Failed to synchronize database:", error);
});
exports.default = User;
