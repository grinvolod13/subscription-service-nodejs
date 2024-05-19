import { AppDataSource } from "./data-source"
import { User } from "./entity/User"
import { getUSDtoUAH } from "./rate";
import cron from "node-cron";

async function getUsers() {
    let users: Array<User> = await AppDataSource.getRepository(User).find();
    return users;
}


async function send_email(user: User, html: string) {
     // TODO: send email to 1 user   
}


async function send_emails_to_users() {
    const [current_rate, err]: Array<[number,Error]> = await getUSDtoUAH();
    if (err!=null) return;
    const html: string = `<h3>Current USD to UAH rate: ${current_rate}<h3>`;
    
    let users: Array<User> = await getUsers();

    let results = await Promise.allSettled(users.map((user)=> send_email(user, html)));
}

const sending_task = cron.schedule("*/1 * * * * *", async function () {
    console.log("ГООООЛ!");
}, {
    scheduled: true,
    timezone: "Europe/Kyiv"
});

sending_task.start()
