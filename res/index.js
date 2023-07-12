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
const express_1 = __importDefault(require("express"));
const dotenv_1 = __importDefault(require("dotenv"));
const routes_1 = __importDefault(require("./api/routes"));
const node_cron_1 = __importDefault(require("node-cron"));
const moment_timezone_1 = __importDefault(require("moment-timezone"));
const sequelize_1 = require("sequelize");
const database_1 = __importDefault(require("./config/database"));
dotenv_1.default.config();
const app = (0, express_1.default)();
const port = process.env.PORT;
database_1.default
    .sync({ alter: true })
    .then(() => {
    console.log("Database synchronized");
    // populateTimezones();
})
    .catch((error) => {
    console.error("Failed to synchronize database:", error);
});
(0, routes_1.default)(app);
const handleSendMessage = () => __awaiter(void 0, void 0, void 0, function* () {
    console.log("cron show");
    const currentDate = (0, moment_timezone_1.default)().format("MM-DD");
    const currentTime = (0, moment_timezone_1.default)().format("HH:mm");
    // const query = `
    //   SELECT *
    //   FROM Users
    //   WHERE DATE_FORMAT(CONVERT_TZ(birthdate, 'UTC', location), '%m-%d') = :currentDate
    //     AND DATE_FORMAT(CONVERT_TZ(NOW(), 'UTC', location), '%H:%i') = '09:00'
    // `;
    const query = `
    SELECT *
    FROM Users
    left join Timezones on Users.TimezoneId = Timezones.id
    WHERE DATE_FORMAT(CONVERT_TZ(birthdate, '+00:00', Timezones.offsite), '%m-%d') = :currentDate
  `;
    try {
        const users = yield database_1.default.query(query, {
            replacements: { currentDate },
            type: sequelize_1.QueryTypes.SELECT,
        });
        console.log(users);
    }
    catch (error) { }
});
node_cron_1.default.schedule("* * * * * *", handleSendMessage);
app.use(function (error, req, res, next) {
    console.error(error.stack);
    res.status(400).send(error.message);
});
app.listen(port, () => {
    console.log(`[server]: Server is running at http://localhost:${port}`);
});
