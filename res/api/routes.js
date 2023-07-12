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
const User_1 = __importDefault(require("./models/User"));
const moment_timezone_1 = __importDefault(require("moment-timezone"));
const TimeZone_1 = __importDefault(require("./models/TimeZone"));
const routes = (app) => {
    // Middleware to parse JSON request body
    app.use(express_1.default.json());
    // Default test
    app.get("/test", (req, res) => {
        const timeZone = TimeZone_1.default.length;
        res.send("Express + TypeScript Server");
    });
    // Default test
    app.get("/timezones", (req, res) => {
        const searchParam = req.query.search;
        let timezones = moment_timezone_1.default.tz.names();
        let offsite = moment_timezone_1.default.tz.length;
        console.log(offsite);
        if (searchParam) {
            const queryLowerCase = searchParam.toLowerCase();
            timezones = timezones.filter((timezone) => timezone.toLowerCase().includes(queryLowerCase));
        }
        const timezonesWithOffset = timezones.map((timezone) => {
            const offset = moment_timezone_1.default.tz(timezone).utcOffset();
            const formattedOffset = offset >= 0 ? `UTC+${offset / 60}` : `UTC${offset / 60}`;
            const newFormat = moment_timezone_1.default.tz(timezone).format("Z");
            return { name: timezone, offset: newFormat };
        });
        return res.json({ timezones: timezonesWithOffset });
    });
    // Route to add a new user
    app.post("/users", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        const { name, location, birthdate, timezoneId } = req.body;
        try {
            const user = yield User_1.default.create({
                name,
                location,
                birthdate,
                TimezoneId: timezoneId,
            });
            res.status(201).json({ message: "User created successfully", user });
        }
        catch (error) {
            console.error("Failed to create user:", error);
            res.status(500).json({ error: "Failed to create user" });
        }
    }));
};
exports.default = routes;
