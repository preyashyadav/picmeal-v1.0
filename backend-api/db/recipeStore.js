const { DynamoDBClient } = require("@aws-sdk/client-dynamodb");
const {
  DynamoDBDocumentClient,
  PutCommand,
  QueryCommand,
} = require("@aws-sdk/lib-dynamodb");

const client = new DynamoDBClient({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
});

const ddbDocClient = DynamoDBDocumentClient.from(client);

async function storeRecipe(recipeData) {
  const params = {
    TableName: process.env.DYNAMODB_TABLE || "picmeal-recipes",
    Item: recipeData,
  };

  try {
    await ddbDocClient.send(new PutCommand(params));
    console.log("Recipe stored successfully.");
  } catch (error) {
    console.error("Error storing recipe:", error);
    throw error;
  }
}

async function getRecipesByUser(userID) {
  const params = {
    TableName: process.env.DYNAMODB_TABLE || "Recipes",
    KeyConditionExpression: "userID = :uid",
    ExpressionAttributeValues: {
      ":uid": userID,
    },
  };

  try {
    const data = await ddbDocClient.send(new QueryCommand(params));
    return data.Items;
  } catch (error) {
    console.error("Error getting recipes:", error);
    throw error;
  }
}

module.exports = { storeRecipe, getRecipesByUser };
