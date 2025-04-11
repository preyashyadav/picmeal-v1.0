const axios = require("axios");

async function getRecipeEmbedding(text) {
  const data = {
    input: text,
    model: "text-embedding-3-large",
  };

  const headers = {
    "Content-Type": "application/json",
    Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
  };

  try {
    const response = await axios.post(
      "https://api.openai.com/v1/embeddings",
      data,
      { headers }
    );
    return response.data.data[0].embedding;
  } catch (error) {
    console.error(
      "Error fetching embedding:",
      error.response ? error.response.data : error.message
    );
    throw error;
  }
}

module.exports = { getRecipeEmbedding };
