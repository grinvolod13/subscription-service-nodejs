import axios from "axios";

const bank_api_url = "https://bank.gov.ua/NBUStatService/v1/statdirectory/exchange?json"

export async function getUSDtoUAH(){ // TODO: cache data
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