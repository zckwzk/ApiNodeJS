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
import { it } from "node:test";
import axios from "axios";
import { populateTimezones } from "./src/api/models/TimeZone";
import { DATE } from "sequelize";
import { error } from "node:console";

dotenv.config();

const app: Express = express();
const port = process.env.PORT;

routes(app);

export default app;

const addJobBirthday = async () => {
  const query = `
    SELECT *,Users.id as user_id, Timezones.name as name_timezone 
    FROM Users
    left join Timezones on Users.TimezoneId = Timezones.id
    WHERE MONTH(CONVERT_TZ(birthdate, '+00:00', Timezones.offsite)) > MONTH(CURRENT_DATE())
    OR (MONTH(CONVERT_TZ(birthdate, '+00:00', Timezones.offsite)) = MONTH(CURRENT_DATE()) AND DAY(CONVERT_TZ(birthdate, '+00:00', Timezones.offsite)) >= DAY(CURRENT_DATE()))
  `;
  try {
    const users = await database.query(query, {
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
          [Op.or]: ["pending", "failed"],
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
        apiSendEmailHappy(
          {
            email: item.dataValues.User.email,
            message: `hey ${item.dataValues.User.firstname} ${item.dataValues.User.lastname}, it's your birthday`,
          },
          item
        );
      }
    });
  } catch (error) {
    console.error("Failed to retrieve scheduled jobs:", error);
  }
};

const apiSendEmailHappy = async (
  body: { email: string; message: string },
  item: any
) => {
  const MAX_RETRIES_PER_DAY = 3; // Maximum number of retries allowed in one day

  let retries = item.dataValues.retries || 0; // Get the current number of retries
  try {
    //check retry date
    const retryDate = item.dataValues.retryDate; // Retrieve the stored retry date from the database or assign it to null initially
    const currentDate = new Date();

    //set 0 to retrie count in different day
    if (
      retryDate &&
      currentDate.getFullYear() !== retryDate.getFullYear() &&
      currentDate.getMonth() !== retryDate.getMonth() &&
      currentDate.getDate() !== retryDate.getDate()
    ) {
      await item.update({
        status: "ongoing",
        retries: 0,
        retryDate: new Date(),
      });
      await item.save();
    }

    //check maksimum retry
    if (retries >= MAX_RETRIES_PER_DAY) {
      await item.update({
        status: "pending",
        retries: 0,
        // retryDate: new Date(),
      });
      await item.save();
      console.log("Exceeded maximum retries for the day");
      return;
    }

    // throw error;

    //pause 1 minute when it retries
    if (retries > 0) {
      await new Promise((resolve) => setTimeout(resolve, 60 * 1000));
    }

    //send email to api
    let url = "https://email-service.digitalenvision.com.au/send-email";
    await axios.post(url, body);

    //update as complete
    await item.update({ status: "complete" });
    await item.save();
  } catch (error) {
    console.log(error);

    //if there is an error set it as failed and increment the retries count.
    await item.update({
      status: "failed",
      retries: retries + 1,
      retryDate: new Date(),
    });
    await item.save();
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
