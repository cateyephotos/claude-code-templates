import { cronJobs } from "convex/server";
import { internal } from "./_generated/api";

const crons = cronJobs();

crons.hourly(
  "email-queue-processor",
  { minuteUTC: 0 },
  internal.emailCron.triggerEmailQueue
);

export default crons;
