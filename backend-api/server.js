const express = require("express");
const multer = require("multer");
const axios = require("axios");
const cors = require("cors");
const fs = require("fs");
const FormData = require("form-data");
const { v4: uuidv4 } = require("uuid");
const session = require("express-session");
const passport = require("passport");
const GoogleStrategy = require("passport-google-oauth20").Strategy;
const dotenv = require("dotenv");
const admin = require("./firebaseAdmin");
const { storeRecipe } = require("./db/recipeStore");
const { getRecipeEmbedding } = require("./getRecipeEmbedding");

dotenv.config();
const app = express();

app.use(
  cors({
    origin: "http://localhost:3000",
    credentials: true,
  })
);

app.use(
  session({
    secret: process.env.SESSION_SECRET || "default_secret",
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: false,
      sameSite: "lax",
    },
  })
);

app.use(passport.initialize());
app.use(passport.session());

passport.serializeUser((user, done) => {
  done(null, user);
});
passport.deserializeUser((obj, done) => {
  done(null, obj);
});

const upload = multer({ dest: "uploads/" });
const AI_MICROSERVICE_URL = "http://localhost:8000/api/process-image";

app.post("/api/upload", upload.single("file"), async (req, res) => {
  try {
    let userID = "anonymous";
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith("Bearer ")) {
      const idToken = authHeader.split("Bearer ")[1];
      try {
        const decodedToken = await admin.auth().verifyIdToken(idToken);
        userID = decodedToken.uid;
      } catch (tokenError) {
        console.error("Error verifying Firebase token:", tokenError);
      }
    }

    if (!req.file) {
      return res.status(400).json({ error: "No file uploaded" });
    }
    const filePath = req.file.path;
    const fileData = fs.readFileSync(filePath);
    const form = new FormData();
    form.append("file", fileData, req.file.originalname);

    const response = await axios.post(AI_MICROSERVICE_URL, form, {
      headers: form.getHeaders(),
    });

    fs.unlinkSync(filePath);

    const recipeData = {
      userID,
      recipeID: uuidv4(),
      ingredients: response.data.ingredients,
      recipeText: response.data.recipe
        ? response.data.recipe.recipe_text
        : null,
      createdAt: new Date().toISOString(),
    };

    console.log("Storing recipe data in DynamoDB:", recipeData);
    try {
      await storeRecipe(recipeData);
      console.log("Stored recipe data in DynamoDB.");
    } catch (dbError) {
      console.error("Error storing recipe:", dbError.message);
    }

    if (recipeData.recipeText) {
      try {
        const embedding = await getRecipeEmbedding(recipeData.recipeText);
        console.log("Upserted recipe embedding into Pinecone.");
      } catch (err) {
        console.error("Error upserting vector to Pinecone:", err.message);
      }
    }

    res.json(response.data);
  } catch (error) {
    console.error("Error processing file:", error);
    res.status(500).json({ error: error.message });
  }
});

app.get("/api/recipes", async (req, res) => {
  try {
    let userID = "spidey";
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith("Bearer ")) {
      const idToken = authHeader.split("Bearer ")[1];
      try {
        const decodedToken = await admin.auth().verifyIdToken(idToken);
        userID = decodedToken.uid;
      } catch (tokenError) {
        console.error("Error verifying Firebase token:", tokenError);
      }
    }

    const { getRecipesByUser } = require("./db/recipeStore");
    const recipes = await getRecipesByUser(userID);
    res.json(recipes);
  } catch (error) {
    console.error("Error fetching recipes:", error);
    res.status(500).json({ error: error.message });
  }
});

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
