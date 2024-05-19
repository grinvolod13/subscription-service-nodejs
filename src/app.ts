import express, { Express, Request, Response } from "express";

import axios from 'axios';
import swaggerUi from 'swagger-ui-express';
const swaggerDocument = require('./swagger.json');
import bodyParser from 'body-parser';
import "reflect-metadata" // for typeorm
import { AppDataSource } from "./data-source"
import { User } from "./entity/User"

AppDataSource
    .initialize()
    .catch((err) => {
        console.error("Error during Data Source initialization:", err)
    })


const bank_api_url = "https://bank.gov.ua/NBUStatService/v1/statdirectory/exchange?json"
const app: Express = express();
const port = 3000;

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));
app.use( bodyParser.json() );       // to support JSON-encoded bodies
app.use(bodyParser.urlencoded({     // to support URL-encoded bodies
  extended: true
}));



async function getUSDtoUAH(){ // TODO: cache data
    try {
        let apiResponse = await axios.get(bank_api_url);
        let rate = apiResponse.data.find(
            (item: any)=>(item.r030 == 840) // r030 - digital currency code, for USD is 840 
        ).rate;
        return [null, rate];
    } catch (error){
        console.log(error);
        return [error, null];
    }
}


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
