import cron from "node-cron";
import { configDotenv } from "dotenv";
configDotenv()
import { send_emails_to_users } from "./send";


const sending_task = cron.schedule("*/5 * * * * *", async function () {
    await send_emails_to_users();
    console.log("Sent!");
}, {
    scheduled: true,
    timezone: "Europe/Kyiv"
});

sending_task.start()
