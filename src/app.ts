import express, { Express, Request, Response } from "express";

import axios from 'axios';
import swaggerUi from 'swagger-ui-express';
const swaggerDocument = require('./swagger.json');
import bodyParser from 'body-parser';
import "reflect-metadata" // for typeorm
import { AppDataSource } from "./data-source"
import { User } from "./entity/User"
import { getUSDtoUAH } from "./rate";
require('dotenv').config()

AppDataSource
    .initialize()
    .catch((err) => {
        console.error("Error during Data Source initialization:", err)
    })


const app: Express = express();
const port = 3000;

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));
app.use( bodyParser.json() );       // to support JSON-encoded bodies
app.use(bodyParser.urlencoded({     // to support URL-encoded bodies
  extended: true
}));






app.get("/api/rate", async function (req: Request, res: Response) {
    res.setHeader('Content-Type', 'application/json');
    let [err, rate] = await getUSDtoUAH();
    // TODO: deside what error code to return
    res.status(200).json(rate);
    
});

app.post("/api/subscribe", async function (req: Request, res: Response) {
    res.setHeader('Content-Type', 'application/json');
    
    let email: string = req.body.email;
    const userExists = await AppDataSource.getRepository(User).exists({where: {email: email}});
    if (userExists){
        res.sendStatus(409);
    }else{
        let user = new User();
        user.email = email;
        await AppDataSource.getRepository(User).save(user)
        res.sendStatus(200);
    }
});

app.listen(port, function () {
  console.log(`App listening on port ${port}!`);
});
