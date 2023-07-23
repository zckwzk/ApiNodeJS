import Bull from "bull";
import Job from "../models/Job";
import User from "../models/User";
import { apiSendEmail } from "../utils/ApiCall";

const birthdayQueque = new Bull("birthdayjob", "redis://127.0.0.1:6379", {
  defaultJobOptions: {
    attempts: 5,
    backoff: {
      type: "exponential",
      delay: 1000,
    },
  },
  limiter: {
    max: 10000,
    duration: 60000,
  },
});

birthdayQueque.process(async function (job, done) {
  let data = job.data;
  // Retrieve timezoneId based on location name
  const jobItem = await Job.findOne({
    where: { id: data.jobId },
    include: {
      model: User,
      attributes: ["firstname", "lastname", "email"],
      required: true, // Optional, to enforce the existence of a related user
    },
  });

  try {
    let result = await apiSendEmail({
      email: jobItem?.dataValues.User.email,
      message: `hey ${jobItem?.dataValues.User.firstname} ${jobItem?.dataValues.User.lastname}, it's your birthday`,
    });

    await jobItem?.update({ status: "complete" });
    await jobItem?.save();

    done();
  } catch (error) {
    throw new Error("some unexpected error job");
  }
});

export { birthdayQueque };
