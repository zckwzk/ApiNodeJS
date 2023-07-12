import express, { Express, Request, Response } from "express";

import User from "./models/User";

import moment from "moment-timezone";
import Timezone from "./models/TimeZone";

type ReqQuery = {
  search: string;
};

const routes = (app: Express) => {
  // Middleware to parse JSON request body
  app.use(express.json());

  // Default test
  app.get("/test", (req: Request, res: Response) => {
    const timeZone = Timezone.length;
    res.send("Express + TypeScript Server");
  });

  // Default test
  app.get("/timezones", (req: Request<ReqQuery>, res: Response) => {
    const searchParam = req.query.search as string;
    let timezones = moment.tz.names();
    let offsite = moment.tz.length;
    console.log(offsite);

    if (searchParam) {
      const queryLowerCase = searchParam.toLowerCase();
      timezones = timezones.filter((timezone) =>
        timezone.toLowerCase().includes(queryLowerCase)
      );
    }
    const timezonesWithOffset = timezones.map((timezone) => {
      const offset = moment.tz(timezone).utcOffset();
      const formattedOffset =
        offset >= 0 ? `UTC+${offset / 60}` : `UTC${offset / 60}`;
      const newFormat = moment.tz(timezone).format("Z");
      return { name: timezone, offset: newFormat };
    });

    return res.json({ timezones: timezonesWithOffset });
  });

  // Route to add a new user
  app.post("/users", async (req, res) => {
    const { name, location, birthdate, timezoneId } = req.body;

    try {
      const user = await User.create({
        name,
        location,
        birthdate,
        TimezoneId: timezoneId,
      });
      res.status(201).json({ message: "User created successfully", user });
    } catch (error) {
      console.error("Failed to create user:", error);
      res.status(500).json({ error: "Failed to create user" });
    }
  });
};

export default routes;
