const { PineconeClient } = require("@pinecone-database/pinecone");

const pinecone = new PineconeClient();

async function initPinecone() {
  if (!pinecone.ready) {
    await pinecone.init({
      environment: process.env.PINECONE_ENVIRONMENT,
      apiKey: process.env.PINECONE_API_KEY,
    });
  }
}

async function upsertRecipeVector(userID, recipeID, vector, metadata = {}) {
  await initPinecone();

  const indexName = process.env.PINECONE_INDEX || "recipes";
  const index = pinecone.Index(indexName);

  const upsertRequest = {
    vectors: [
      {
        id: `${userID}_${recipeID}`,
        values: vector,
        metadata: { userID, recipeID, ...metadata },
      },
    ],
  };

  const upsertResponse = await index.upsert({ upsertRequest });
  return upsertResponse;
}

async function queryRecipes(queryVector, topK = 5) {
  await initPinecone();
  const indexName = process.env.PINECONE_INDEX || "recipes";
  const index = pinecone.Index(indexName);

  const queryRequest = {
    vector: queryVector,
    topK: topK,
    includeMetadata: true,
  };

  const queryResponse = await index.query({ queryRequest });
  return queryResponse;
}

module.exports = { upsertRecipeVector, queryRecipes };
