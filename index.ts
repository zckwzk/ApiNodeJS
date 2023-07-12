import express, { Express, Request, Response } from "express";
import dotenv from "dotenv";
import routes from "./src/api/routes";
import cron from "node-cron";
import moment from "moment-timezone";
import User from "./src/api/models/User";
import sequelize, { Sequelize, DataTypes, QueryTypes, Op } from "sequelize";
import database from "./src/config/database";

import Bull from "bull";
import Job from "./src/api/models/Job";

// Initialize job queue
const jobQueue = new Bull("birthday-messages");

dotenv.config();

const app: Express = express();
const port = process.env.PORT;

database
  .sync({ alter: true })
  .then(() => {
    console.log("Database synchronized");
    // populateTimezones();
  })
  .catch((error) => {
    console.error("Failed to synchronize database:", error);
  });

routes(app);

const handleSendMessage = async () => {
  console.log("cron show");
  const currentDate = moment().format("MM-DD");
  const currentTime = moment().format("HH:mm");
  // const query = `
  //   SELECT *
  //   FROM Users
  //   WHERE DATE_FORMAT(CONVERT_TZ(birthdate, 'UTC', location), '%m-%d') = :currentDate
  //     AND DATE_FORMAT(CONVERT_TZ(NOW(), 'UTC', location), '%H:%i') = '09:00'
  // `;
  const query = `
    SELECT *, Timezones.name as name_timezone 
    FROM Users
    left join Timezones on Users.TimezoneId = Timezones.id
    WHERE DATE_FORMAT(CONVERT_TZ(birthdate, '+00:00', Timezones.offsite), '%m-%d') = :currentDate
  `;
  try {
    const users = await database.query(query, {
      replacements: { currentDate },
      type: QueryTypes.SELECT,
    });
    users.forEach(async (user: any) => {
      const findJob = `
      SELECT *
      FROM Jobs
      WHERE scheduled_at = :sendate
      AND type = 'birthday'
    `;
      let arrayDateTime = user.birthdate.split("-");
      arrayDateTime[0] = moment().format("YYYY");
      user.birthdate = arrayDateTime.join("-");
      // Convert the user's birthdate to UTC
      const localUserBirthdate = moment
        .tz(user.birthdate + " 09:00:00", user.name_timezone)
        .utcOffset("+00:00")
        .format("YYYY-MM-DD HH:mm:ss");
      // const birthdateUTC = moment(localUserBirthdate)
      //   .utc()
      //   .format("YYYY-MM-DD HH:mm:ss");
      console.log(localUserBirthdate);
      const jobs = await database.query(findJob, {
        replacements: {
          sendate: localUserBirthdate,
        },
        type: QueryTypes.SELECT,
      });

      // console.log(jobs);

      if (jobs.length == 0) {
        await Job.create({
          type: "birthday",
          status: "pending",
          scheduled_at: localUserBirthdate,
        });
      }
      // console.log(job);
    });
  } catch (error) {}
};

cron.schedule("* * * * * *", handleSendMessage);

app.use(function (error: any, req: Request, res: Response, next: any) {
  console.error(error.stack);
  res.status(400).send(error.message);
});

app.listen(port, () => {
  console.log(`[server]: Server is running at http://localhost:${port}`);
});
