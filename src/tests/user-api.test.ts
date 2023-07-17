const assert = require("assert");
const request = require("supertest");
const moment = require("moment-timezone");
import { AnySoaRecord } from "dns";
import routes from "../api/routes";

import express, { Express, Request, Response } from "express";

describe("User API Tests", () => {
  let server: any;
  let app: Express;

  before(async () => {
    app = express();
    routes(app);
    server = app.listen(3000);

    //to give time of migration and seeding
    await new Promise((resolve) => setTimeout(resolve, 1 * 1000));
  });

  after(() => {
    server.close();
  });

  describe("POST /users", () => {
    it("should add a new user", (done) => {
      const user = {
        email: "john@mail.coz",
        firstname: "John",
        lastname: "Doe",
        location: "Asia/Jakarta",
        birthdate: "1990-05-15",
      };

      request(app)
        .post("/users")
        .send(user)
        .expect(201)
        .end((err: any, res: any) => {
          if (err) return done(err);

          assert.strictEqual(res.body.message, "User created successfully");
          done();
        });
    });

    it("should return an error if missing required fields", (done) => {
      const user = {
        name: "John Doe",
        location: "New York",
        // Missing birthdate field
      };

      request(app)
        .post("/users")
        .send(user)
        .expect(400)
        .end((err: any, res: any) => {
          if (err) return done(err);

          assert.strictEqual(res.body.error, "Missing required fields");

          done();
        });
    });
  });

  describe("DELETE /users/:id", () => {
    it("should delete a user", (done) => {
      // Create a user
      const user = {
        email: "test@example.com",
        firstname: "John",
        lastname: "Doe",
        location: "Asia/Jakarta",
        birthdate: "1990-05-15",
      };

      request(app)
        .post("/users")
        .send(user)
        .expect(201)
        .end((err: Error, res: any) => {
          if (err) return done(err);

          const createdUser = res.body.user;

          // Delete the user
          request(app)
            .delete(`/users/${createdUser.id}`)
            .expect(200)
            .end((err: Error, res: any) => {
              if (err) return done(err);

              assert.strictEqual(
                res.body.message,
                "User and unsent jobs deleted successfully"
              );

              done();
            });
        });
    });

    it("should return an error if user not found", (done) => {
      const nonExistentUserId = "non-existent-user-id";

      request(app)
        .delete(`/users/${nonExistentUserId}`)
        .expect(404)
        .end((err: Error, res: any) => {
          if (err) return done(err);

          assert.strictEqual(res.body.error, "User not found");

          done();
        });
    });
  });

  describe("Birthday Message Tests", () => {
    let users: any;

    before(() => {
      users = [
        {
          name: "John",
          location: { timezone: "America/New_York" },
          birthdate: moment().format("YYYY-MM-DD"),
        },
        {
          name: "Alice",
          location: { timezone: "Europe/London" },
          birthdate: "1995-08-10",
        },
      ];
    });

    // it("should send birthday messages to users with today's birthday", (done) => {
    //   let sentBirthdayMessages = 0;

    //   // Mock the sendBirthdayMessage function
    //   const sendBirthdayMessage = (user:any) => {
    //     sentBirthdayMessages++;
    //     assert.strictEqual(user.birthdate, moment().format("YYYY-MM-DD"));
    //   };

    //   // Inject the mock function into the users array
    //   users.forEach((user:AnySoaRecord) => {
    //     user.sendBirthdayMessage = sendBirthdayMessage;
    //   });

    //   // Trigger the birthday message job
    //   app.sendBirthdayAndAnniversaryMessages(users);

    //   // Ensure the correct number of birthday messages were sent
    //   assert.strictEqual(sentBirthdayMessages, 1);

    //   done();
    // });

    // it("should send anniversary messages to all users", (done) => {
    //   let sentAnniversaryMessages = 0;

    //   // Mock the sendAnniversaryMessage function
    //   const sendAnniversaryMessage = (user) => {
    //     sentAnniversaryMessages++;
    //   };

    //   // Inject the mock function into the users array
    //   users.forEach((user) => {
    //     user.sendAnniversaryMessage = sendAnniversaryMessage;
    //   });

    //   // Trigger the anniversary message job
    //   app.sendBirthdayAndAnniversaryMessages(users);

    //   // Ensure the correct number of anniversary messages were sent
    //   assert.strictEqual(sentAnniversaryMessages, users.length);

    //   done();
    // });
  });
});
