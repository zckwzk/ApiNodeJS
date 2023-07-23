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
    console.log(error);
    // throw new Error("some unexpected error job");
    console.log("Error for running birthday job");
    await jobItem?.update({
      status: "failed",
      retries: jobItem.dataValues.retries + 1,
    });
    await jobItem?.save();
  }
});

const addToBirthdayQueue = async (id: string) => {
  const jobId = `job:${id}`;

  try {
    const existingJob = await birthdayQueque.getJob(jobId);

    if (existingJob) {
      console.log(`Skipping job for user. Job already exists in the queue.`);
    } else {
      // Enqueue a new job
      await birthdayQueque.add({ jobId: id, type: "birthday" }, { jobId });
      console.log(`Job enqueued for user ${id}`);
    }
  } catch (error) {
    console.log("failed add to the queue");
  }
};

export { birthdayQueque, addToBirthdayQueue };
