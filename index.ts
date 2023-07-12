import express, { Express, Request, Response } from "express";
import dotenv from "dotenv";
import routes from "./api/routes";
import cron from "node-cron";
import moment from "moment-timezone";
import User from "./api/models/User";
import sequelize, { Sequelize, DataTypes, QueryTypes } from "sequelize";
import database from "./config/database";

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
    SELECT *
    FROM Users
    left join Timezones on Users.TimezoneId = Timezones.id
    WHERE DATE_FORMAT(CONVERT_TZ(birthdate, '+00:00', Timezones.offsite), '%m-%d') = :currentDate
  `;
  try {
    const users = await database.query(query, {
      replacements: { currentDate },
      type: QueryTypes.SELECT,
    });
    console.log(users);
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
