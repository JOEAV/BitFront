/* Amplify Params - DO NOT EDIT
	API_BTCAPI_APIID
	API_BTCAPI_APINAME
	ENV
	REGION
	STORAGE_DAILYPRICES_ARN
	STORAGE_DAILYPRICES_NAME
	STORAGE_DAILYPRICES_STREAMARN
Amplify Params - DO NOT EDIT */

/**
 * @type {import('@types/aws-lambda').APIGatewayProxyHandler}
 */
 const https = require('https');
 const AWS = require("aws-sdk");
 AWS.config.update({ region: process.env.TABLE_REGION || 'us-east-1' });
 let tableName = "dailyPrices";

 const dynamodb = new AWS.DynamoDB.DocumentClient();
 debugger;
 if (process.env.ENV && process.env.ENV !== "NONE") {
    tableName = tableName + "-" + process.env.ENV;
  }else{
      tableName = tableName+ "-dev" 
  }

 const PRICES_DATA_PATH = "Time Series (Digital Currency Daily)"
function extractRelevantPriceData(rawData){
const relevantPriceDataKeys = ['1a. open (ILS)','2a. high (ILS)','3a. low (ILS)','4a. close (ILS)']
const transformedKeyNames = {
    '1a. open (ILS)':'open',
    '2a. high (ILS)':'high',
    '3a. low (ILS)':'low',
    '4a. close (ILS)':'close'
}
const rawPricesObj = rawData[PRICES_DATA_PATH]
let transformedPricesObj = {}
for (const dailyDate in rawPricesObj){

    //assuing the api returns consecutive ils-usd values 
    //for the same price e.g 1a.open(ils) 1b.open(usd)
    const [openIls,openUsd] = Object.values(rawPricesObj[dailyDate])
    const dailyUsdIlsRatio = parseFloat(
        parseFloat(openIls)/
        parseFloat(openUsd)
    )
    const filteredDailyPrice ={
        [dailyDate]:{
            // date:dailyDate.split('-').reverse().join('-'),
            date:dailyDate,
            fav:false,
            ilsUsdRatio:dailyUsdIlsRatio,
            ...Object.fromEntries(relevantPriceDataKeys.map(k => [transformedKeyNames[k], parseFloat(rawPricesObj[dailyDate][k])]))
        }
    }
    transformedPricesObj ={...transformedPricesObj,...filteredDailyPrice}
}
return transformedPricesObj
}
  
//origin can be 'db'(dynamo) or 'marketAPI'(external api)
 function getBTCPrices({origin}) {
    const MARKET_API_ENDPOINT = 'https://www.alphavantage.co/query?function=DIGITAL_CURRENCY_DAILY&symbol=BTC&market=ILS&apikey=41IHE0QC9OSZCI36';
    const API_GATEWAY_ENDPOINT =  'https://ab17h4imt5.execute-api.us-east-1.amazonaws.com/dev/dailyPrices';
   const url = origin==='marketAPI' ? MARKET_API_ENDPOINT : API_GATEWAY_ENDPOINT

   return new Promise((resolve, reject) => {
     const req = https.get(url, res => {
       let rawData = '';
 
       res.on('data', chunk => {
         rawData += chunk;
       });
 
       res.on('end', () => {
         try {
           resolve(JSON.parse(rawData));
         } catch (err) {
           reject(new Error(err));
         }
       });
     });
 
     req.on('error', err => {
       reject(new Error(err));
     });
   });
 }
 const batchWriteManyItems = async (tableName, itemObjs, chunkSize = 25) => {

    const buildParams = (table) => JSON.parse(`{"RequestItems": {"${table}": []}}`)

    const queryChunk = (arr, size) => {
        const tempArr = []
        for (let i = 0, len = arr.length; i < len; i += size) {
            tempArr.push(arr.slice(i, i + size));
        }

        return tempArr
    }

    await Promise.all(queryChunk(itemObjs, chunkSize).map(async chunk => {
        let itemParams = buildParams(tableName);
        itemParams.RequestItems[tableName] = chunk
        await dynamodb.batchWrite(itemParams).promise()
    }))
}
 exports.handler = async event => {
    try {
      const rawData = await getBTCPrices({origin:'marketAPI'});
      const filteredData = extractRelevantPriceData(rawData)
      console.log('filtered',filteredData)
      console.log('result is: 👉️', rawData);
      const currentDbState = await getBTCPrices({origin:'db'}) 
      //finding the differnce between db and marketAPI result
      const currentDbDaysKeys = currentDbState.map((val,index)=>currentDbState[index].date)
      let missingDbItems = []
      for (const dateKey in filteredData){
          if(!currentDbDaysKeys.includes(dateKey)){
             missingDbItems.push(filteredData[dateKey]) 
          }
      }
      console.log(`Going to write new ${missingDbItems.length} dailyPrices to DB`)
      //writing the delta of today to db
      const batchedWriteItemsRequests = missingDbItems.map(item=>({PutRequest:{Item:item}}))
        await batchWriteManyItems(tableName,batchedWriteItemsRequests)
      console.log(`Write new dailyPrices succeed`)
      // 👇️️ response structure assume you use proxy integration with API gateway
      return {
        statusCode: 200,
        headers: {'Content-Type': 'application/json',        
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Headers": "*"},
        body: JSON.stringify('Daily price update has been succeed.'),
      };
    } catch (error) {
      console.log('Error is: 👉️', error);
      return {
        statusCode: 400,
        body: error.message,
      };
    }
  };