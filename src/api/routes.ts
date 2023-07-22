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

  //
  app.use("/user", userRoute);
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
    const { email, firstname, lastname, location, birthdate } = req.body;

    if (!email || !firstname || !lastname || !location || !birthdate) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    // Retrieve timezoneId based on location name
    const timezone = await Timezone.findOne({ where: { name: location } });

    const timezoneId = timezone ? timezone.dataValues?.id : null;
    try {
      const user = await User.create({
        email,
        firstname,
        lastname,
        location,
        birthdate,
        TimezoneId: timezoneId,
      });
      res.status(201).json({ message: "User created successfully", user });
    } catch (error) {
      // console.error("Failed to create user:", error);
      res.status(500).json({ error: "Failed to create user" });
    }
  });

  app.delete("/users/:userId", async (req, res) => {
    const userId = req.params.userId;

    try {
      // Find the user by ID
      const user = await User.findByPk(userId);

      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }

      // Delete the user and unsent jobs associated with the user
      await Job.destroy({
        where: {
          userId,
          status: "pending",
        },
      });

      await user.destroy();

      res.json({ message: "User and unsent jobs deleted successfully" });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Route to update a user
  app.put("/users/:id", async (req, res) => {
    const { id } = req.params;
    const { email, firstname, lastname, location, birthdate } = req.body;

    try {
      const user = await User.findByPk(id);

      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }

      // Update the user's properties
      let tempEmail = email || user.dataValues.email;
      let tempFirstname = firstname || user.dataValues.firstname;
      let tempLastname = lastname || user.dataValues.lastname;
      let tempLocation = location || user.dataValues.location;
      let tempBirthdate = birthdate || user.dataValues.birthdate;

      user.update({
        email: tempEmail,
        firstname: tempFirstname,
        lastname: tempLastname,
        location: tempLocation,
        birthdate: tempBirthdate,
      });

      await user.save();

      // Delete the user and unsent jobs associated with the user, it will generate automatically
      await Job.destroy({
        where: {
          userId: id,
          status: "pending",
        },
      });

      res.status(200).json({ message: "User updated successfully", user });
    } catch (error) {
      console.error("Failed to update user:", error);
      res.status(500).json({ error: "Failed to update user" });
    }
  });
};

export default routes;
