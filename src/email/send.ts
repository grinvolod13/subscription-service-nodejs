import "reflect-metadata" // for typeorm
import { AppDataSource } from "../data-source";
import { User } from "../entity/User";
import { getUSDtoUAH } from "../rate";
import nodemailer from "nodemailer";
import { configDotenv } from "dotenv";
import { DataSource } from "typeorm";


AppDataSource.initialize()
configDotenv()

async function getUsers() {
    let userRep = AppDataSource.getRepository(User);
    let users = await userRep.find();
    return users;
}


console.log(process.env.EMAIL)

const transport = nodemailer.createTransport({
    host: "smtp.ethereal.email",
    port: 587,
    secure: false, // Use `true` for port 465, `false` for all other ports
    auth: {
      user: process.env.EMAIL,
      pass: process.env.PASS,
    },
});

async function send_email(user: User, html: string) {
    await transport.sendMail({
        from: process.env.EMAIL,
        to: user.email,
        subject: process.env.SUBJECT,
        html: html,
        text: html,
    });
}


export async function send_emails_to_users() {
    const [current_rate, err] = await getUSDtoUAH();
    if (err!=null) return;
    const html: string = `<h3>Current USD to UAH rate: ${current_rate}<h3>`;
    let users: Array<User> = await getUsers(); // TODO: optimize for big db's (set send bulk size)

    console.log(process.env.EMAIL, process.env.PASS, process.env.SUBJECT);
    let results = await Promise.allSettled(users.map((user)=> send_email(user, html)));
}