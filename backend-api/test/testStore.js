require("dotenv").config();
const { storeRecipe } = require("../db/recipeStore");

async function test() {
  const sampleRecipe = {
    userID: "testUser",
    recipeID: "testRecipe123",
    ingredients: ["carrot", "cauliflower"],
    recipeText: "Test recipe details",
    createdAt: new Date().toISOString(),
  };
  try {
    await storeRecipe(sampleRecipe);
    console.log("Test recipe stored successfully.");
  } catch (error) {
    console.error("Error storing test recipe:", error);
  }
}

test();
