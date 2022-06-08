export type AmplifyDependentResourcesAttributes = {
    "storage": {
        "dailyPrices": {
            "Name": "string",
            "Arn": "string",
            "StreamArn": "string",
            "PartitionKeyName": "string",
            "PartitionKeyType": "string",
            "Region": "string"
        }
    },
    "function": {
        "dailyPrices": {
            "Name": "string",
            "Arn": "string",
            "Region": "string",
            "LambdaExecutionRole": "string"
        }
    },
    "api": {
        "prices": {
            "RootUrl": "string",
            "ApiName": "string",
            "ApiId": "string"
        }
    }
}