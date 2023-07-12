"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.populateTimezones = void 0;
const moment_timezone_1 = __importDefault(require("moment-timezone"));
const database_1 = __importDefault(require("../../config/database"));
const sequelize_1 = require("sequelize");
// Define Timezone model
const Timezone = database_1.default.define("Timezone", {
    id: {
        type: sequelize_1.DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
    },
    name: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: false,
    },
    offsite: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: false,
    },
});
// Function to populate the Timezone table with data
function populateTimezones() {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const timezones = moment_timezone_1.default.tz.names();
            for (const timezone of timezones) {
                console.log(moment_timezone_1.default.tz(timezone).format("Z"));
                yield Timezone.create({
                    name: timezone,
                    offsite: String(moment_timezone_1.default.tz(timezone).format("Z")),
                });
            }
            console.log("Timezone table populated successfully");
        }
        catch (error) {
            console.error("Failed to populate Timezone table:", error);
        }
    });
}
exports.populateTimezones = populateTimezones;
// Synchronize the Sequelize models with the database
Timezone.sync({ force: true })
    .then(() => {
    console.log("Database synchronized time zoned");
    populateTimezones();
})
    .catch((error) => {
    console.error("Failed to synchronize database:", error);
});
exports.default = Timezone;
