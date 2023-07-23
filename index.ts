import express, { Express, Request, Response } from "express";
import dotenv from "dotenv";
import routes from "./src/api/routes";
import cron from "node-cron";
import moment from "moment-timezone";
import User from "./src/api/models/User";
import sequelize, { Sequelize, DataTypes, QueryTypes, Op } from "sequelize";
import database from "./src/config/database";

import Job from "./src/api/models/Job";

import {
  addToBirthdayQueue,
  birthdayQueque,
} from "./src/api/services/BirthdayJob";

dotenv.config();

const app: Express = express();
const port = process.env.PORT;

routes(app);

export default app;

const addJobBirthday = async () => {
  const query = `   
  INSERT INTO Jobs (type, status, scheduled_at, UserId, createdAt, updatedAt)
  SELECT 'birthday' AS type,
        'pending' AS status,
        CONVERT_TZ(CONCAT(YEAR(CURRENT_DATE()), '-', DATE_FORMAT(CONVERT_TZ(Users.birthdate, '+00:00', Timezones.offsite), '%m-%d 09:00:00')), Timezones.offsite, '+00:00') AS scheduled_at,
        Users.id AS UserId,
        NOW() as createdAt,
        NOW() as updatedAt
  FROM Users
  LEFT JOIN Timezones ON Users.TimezoneId = Timezones.id
  LEFT JOIN Jobs ON Users.id = Jobs.UserId
  WHERE (MONTH(CONVERT_TZ(Users.birthdate, '+00:00', Timezones.offsite)) > MONTH(CURRENT_DATE())
        OR (MONTH(CONVERT_TZ(Users.birthdate, '+00:00', Timezones.offsite)) = MONTH(CURRENT_DATE()) 
        AND DAY(CONVERT_TZ(Users.birthdate, '+00:00', Timezones.offsite)) >= DAY(CURRENT_DATE())))
  AND (Jobs.scheduled_at IS NULL or  YEAR(Jobs.scheduled_at) != YEAR(CURRENT_DATE()));
  `;
  try {
    await database.query(query, {
      type: QueryTypes.INSERT,
    });
  } catch (error) {}
};

const runningJob = async () => {
  const now = new Date();

  try {
    //query all the job that need to be send
    const scheduledJobs = await Job.findAll({
      where: {
        scheduled_at: {
          [Op.lte]: now,
        },
        status: {
          [Op.or]: ["pending"],
        },
      },
      include: {
        model: User,
        attributes: ["firstname", "lastname", "email"],
        required: true, // Optional, to enforce the existence of a related user
      },
    });

    scheduledJobs.map(async (item, index) => {
      await item.update({ status: "ongoing" });
      await item.save();

      //check what type of the job
      if (item.dataValues.type == "birthday") {
        addToBirthdayQueue(item?.dataValues.id);
      }
    });
  } catch (error) {
    console.error("Failed to retrieve scheduled jobs:", error);
  }
};

setTimeout(() => {
  cron.schedule("* * * * * *", addJobBirthday);
  cron.schedule("* * * * * *", runningJob);
}, 2000);

app.use(function (error: any, req: Request, res: Response, next: any) {
  console.error(error.stack);
  res.status(400).send(error.message);
});

app.listen(port, () => {
  console.log(`[server]: Server is running at http://localhost:${port}`);
});
