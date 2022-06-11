/*
Copyright 2017 - 2017 Amazon.com, Inc. or its affiliates. All Rights Reserved.
Licensed under the Apache License, Version 2.0 (the "License"). You may not use this file except in compliance with the License. A copy of the License is located at
    http://aws.amazon.com/apache2.0/
or in the "license" file accompanying this file. This file is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and limitations under the License.
*/

const AWS = require("aws-sdk");
const awsServerlessExpressMiddleware = require("aws-serverless-express/middleware");
const bodyParser = require("body-parser");
const express = require("express");

AWS.config.update({ region: process.env.TABLE_REGION });

const dynamodb = new AWS.DynamoDB.DocumentClient();

let tableName = "dailyPrices";
if (process.env.ENV && process.env.ENV !== "NONE") {
  tableName = tableName + "-" + process.env.ENV;
}

const userIdPresent = false; // TODO: update in case is required to use that definition
const partitionKeyName = "date";
const partitionKeyType = "S";
const path = "/dailyPrices";
const UNAUTH = "UNAUTH";

// declare a new express app
const app = express();
app.use(bodyParser.json());
app.use(awsServerlessExpressMiddleware.eventContext());

// Enable CORS for all methods
app.use(function (req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "*");
  next();
});

// convert url string param to expected Type
const convertUrlType = (param, type) => {
  switch (type) {
    case "N":
      return Number.parseInt(param);
    default:
      return param;
  }
};

/********************************
 * HTTP Get method for list objects *
 * option A -> no query param -> retrieve all items
 * option B -> query param date=X -> retrieve one item with date X
 * option C -> query param date=fav -> retrieve all favorites dates
 ********************************/

app.get(path, function (req, res) {
  const WILDCARD = "*";
  const buildDynamoDBQueryParams = (requestQueryParamsObj) => {
    let queryParamsObj = { TableName: tableName };

    let requestType = "";
    if (
      requestQueryParamsObj[partitionKeyName] &&
      requestQueryParamsObj[partitionKeyName] === "fav"
    ) {
      requestType = "fav";
    } else if (requestQueryParamsObj[partitionKeyName]) {
      requestType = "date";
    } else {
      requestType = WILDCARD;
    }
    switch (requestType) {
      case "date":
        queryParamsObj = {
          ...queryParamsObj,
          Key: { [partitionKeyName]: convertUrlType(requestQueryParamsObj[partitionKeyName],partitionKeyType)},
        };
        break;
      case WILDCARD:
        break;
      case "fav":
        queryParamsObj = {
          ...queryParamsObj,
          FilterExpression: "fav = :fav",
          ExpressionAttributeValues: {
            ":fav": true,
          },
        };
        break;
      default:
        break;
    }
    return queryParamsObj;
  };

  const shouldQueryAllItems =
    req.query[partitionKeyName] === undefined ||
    req.query[partitionKeyName] === "fav";
  const queryParams = buildDynamoDBQueryParams(req.query);
  if (shouldQueryAllItems) {
    dynamodb.scan(queryParams, (err, data) => {
      if (err) {
        res.statusCode = 500;
        res.json({ error: "Could not load items: " + err });
      } else {
        res.json(data.Items);
      }
    });
  } else {
    dynamodb.get(queryParams, (err, data) => {
      if (err) {
        res.statusCode = 500;
        res.json({ error: "Could not load items: " + err.message });
      } else {
        if (data.Item) {
          res.json(data.Item);
        } else {
          res.json(data);
        }
      }
    });
  }
});

/************************************
 * HTTP put method for insert object *
 *************************************/

app.put(path, function (req, res) {
  if (userIdPresent) {
    req.body["userId"] =
      req.apiGateway.event.requestContext.identity.cognitoIdentityId || UNAUTH;
  }

  let putItemParams = {
    TableName: tableName,
    Item: req.body,
  };
  dynamodb.put(putItemParams, (err, data) => {
    if (err) {
      res.statusCode = 500;
      res.json({ error: err, url: req.url, body: req.body });
    } else {
      res.json({ success: "put call succeed!", url: req.url, data: data });
    }
  });
});

/************************************
 * HTTP post method for insert object *
 *************************************/

app.post(path, function (req, res) {
  if (userIdPresent) {
    req.body["userId"] =
      req.apiGateway.event.requestContext.identity.cognitoIdentityId || UNAUTH;
  }

  let putItemParams = {
    TableName: tableName,
    Item: req.body,
  };
  dynamodb.put(putItemParams, (err, data) => {
    if (err) {
      res.statusCode = 500;
      res.json({ error: err, url: req.url, body: req.body });
    } else {
      res.json({ success: "post call succeed!", url: req.url, data: data });
    }
  });
});

app.listen(3000, function () {
  console.log("App started");
});

// Export the app object. When executing the application local this does nothing. However,
// to port it to AWS Lambda we will create a wrapper around that will load the app from
// this file
module.exports = app;
