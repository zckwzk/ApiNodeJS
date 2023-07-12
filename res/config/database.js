"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const sequelize_1 = require("sequelize");
const sequelize = new sequelize_1.Sequelize("challenge", "root", "admin", {
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
exports.default = sequelize;
