import express, { Express, Request, Response } from "express";

import User from "./models/User";

import moment from "moment-timezone";
import Timezone from "./models/TimeZone";
import Job from "./models/Job";

import { userRoute } from "./routes/index";

type ReqQuery = {
  search: string;
};

const routes = (app: Express) => {
  // Middleware to parse JSON request body
  app.use(express.json());

  // User routes
  app.use("/user", userRoute);
  // Default test
  app.get("/test", (req: Request, res: Response) => {
    const timeZone = Timezone.length;
    res.send("Express + TypeScript Server");
  });

  // timezone
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
};

export default routes;
