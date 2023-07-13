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
  const currentDate = moment().format("MM");
  // WHERE DATE_FORMAT(CONVERT_TZ(birthdate, '+00:00', Timezones.offsite), '%m') = :currentDate
  const query = `
    SELECT *,Users.id as user_id, Timezones.name as name_timezone 
    FROM Users
    left join Timezones on Users.TimezoneId = Timezones.id
    WHERE MONTH(CONVERT_TZ(birthdate, '+00:00', Timezones.offsite)) > MONTH(CURRENT_DATE())
    OR (MONTH(CONVERT_TZ(birthdate, '+00:00', Timezones.offsite)) = MONTH(CURRENT_DATE()) AND DAY(CONVERT_TZ(birthdate, '+00:00', Timezones.offsite)) >= DAY(CURRENT_DATE()))
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
      AND UserId = :userid
    `;
      let arrayDateTime = user.birthdate.split("-");
      arrayDateTime[0] = moment().format("YYYY");
      user.birthdate = arrayDateTime.join("-");

      const jobs = await database.query(findJob, {
        replacements: {
          sendate: moment
            .tz(user.birthdate + " 09:00:00", user.name_timezone)
            .utcOffset("+00:00")
            .format("YYYY-MM-DD HH:mm:ss"),
          // sendate: localUserBirthdate,
          userid: user.user_id,
        },
        type: QueryTypes.SELECT,
      });

      // console.log(jobs);

      if (jobs.length == 0) {
        await Job.create({
          type: "birthday",
          status: "pending",
          scheduled_at: moment
            .tz(user.birthdate + " 09:00:00", user.name_timezone)
            .utcOffset("+07:00")
            .format("YYYY-MM-DD HH:mm:ss"),
          UserId: user.user_id,
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
