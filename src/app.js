const express = require("express");
const axios = require('axios');
const swaggerUi = require('swagger-ui-express');
const swaggerDocument = require('./swagger.json');
const bodyParser = require('body-parser')

const bank_api_url = "https://bank.gov.ua/NBUStatService/v1/statdirectory/exchange?json"
const app = express();
const port = 3000;

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));
app.use( bodyParser.json() );       // to support JSON-encoded bodies
app.use(bodyParser.urlencoded({     // to support URL-encoded bodies
  extended: true
}));

async function getUSDtoUAH(){
    try {
        let apiResponse = await axios.get(bank_api_url);
        let rate = apiResponse.data.find(
            (item)=>(item.r030 == 840) // r030 - digital currency code, for USD is 840 
        ).rate;
        return [null, rate];
    } catch (error){
        console.log(error);
        return [error, null];
    }
}


app.get("/api/rate", async function (req, res) {
    res.setHeader('Content-Type', 'application/json');
    let [err, rate] = await getUSDtoUAH();
    console.log(err)
    if (err!=null){
        res.status(400).json();
    } else {
        res.status(200).json(rate);
    }
});

app.post("/api/subscribe", function (req, res) {
    res.setHeader('Content-Type', 'application/json');
    if (req.body.email!=null){
        res.status(200).json(req.body.email);
    } else {
        res.status(200).json(null);
    }
});

app.listen(port, function () {
  console.log(`App listening on port ${port}!`);
});
