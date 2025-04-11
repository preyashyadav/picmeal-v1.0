"use client";

import React, { useState, useEffect, ChangeEvent } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../hooks/useAuth";
import Navbar from "../components/Navbar";
import Loader from "../components/Loader";
import RecipeSidebar, { Recipe } from "../components/RecipeSidebar";
import RecipeCard from "../components/RecipeCard";
import { auth } from "../firebase/firebaseConfig";

interface Result {
  ingredients?: string[];
  recipe?: {
    recipe_text?: string;
  };
}

function parseDishes(recipeText: string): string[] {
  const regex = /(Dish\s+\d+:\s*[\s\S]*?)(?=Dish\s+\d+:|$)/gi;
  const dishes = recipeText.match(regex) || [];
  return dishes.map((dish) => dish.trim());
}

function parseRecipeDish(dish: string): {
  dishName: string;
  cuisine: string;
  equipmentNeeded: string;
  prePreparation: string;
  servings: string;
  ingredientQuantities: { item: string; details: string }[];
  cookingTime: string;
  possibleAllergens: string;
  cookingSteps: string[];
} {
  const lines = dish
    .split("\n")
    .map((line) => line.trim())
    .filter((line) => line !== "");
  let dishName = "";
  let cuisine = "";
  let equipmentNeededLines: string[] = [];
  let prePreparationLines: string[] = [];
  let servings = "";
  let ingredientQuantities: { item: string; details: string }[] = [];
  let cookingTime = "";
  let possibleAllergens = "";
  let cookingSteps: string[] = [];
  let currentSection = "";

  for (let line of lines) {
    if (/^Dish\s+\d+:\s*/i.test(line)) {
      dishName = line.trim();
      currentSection = "";
    } else if (/^Cuisine:\s*/i.test(line)) {
      cuisine = line.replace(/^Cuisine:\s*/i, "").trim();
      currentSection = "";
    } else if (/^Equipment Needed:\s*/i.test(line)) {
      currentSection = "equipment";
      const afterHeader = line.replace(/^Equipment Needed:\s*/i, "").trim();
      if (afterHeader) {
        equipmentNeededLines.push(afterHeader);
      }
    } else if (/^Pre-preparation(?:\s*steps)?:\s*/i.test(line)) {
      currentSection = "prep";
      const afterHeader = line
        .replace(/^Pre-preparation(?:\s*steps)?:\s*/i, "")
        .trim();
      if (afterHeader) {
        prePreparationLines.push(afterHeader);
      }
    } else if (/^Servings:\s*/i.test(line)) {
      servings = line.replace(/^Servings:\s*/i, "").trim();
      currentSection = "";
    } else if (/^Ingredient Quantities:\s*/i.test(line)) {
      currentSection = "ingredients";
    } else if (/^Cooking Time:\s*/i.test(line)) {
      cookingTime = line.replace(/^Cooking Time:\s*/i, "").trim();
      currentSection = "";
    } else if (/^Possible Allergens:\s*/i.test(line)) {
      possibleAllergens = line.replace(/^Possible Allergens:\s*/i, "").trim();
      currentSection = "";
    } else if (/^Cooking Steps:\s*/i.test(line)) {
      currentSection = "steps";
    } else {
      if (currentSection === "ingredients") {
        const match = line.match(/^-\s*(.+)$/i);
        if (match && match[1]) {
          const ingParts = match[1].split(/:\s*(.*)/);
          if (ingParts.length >= 3) {
            ingredientQuantities.push({
              item: ingParts[0].trim(),
              details: ingParts[1].trim(),
            });
          } else {
            ingredientQuantities.push({ item: match[1].trim(), details: "" });
          }
        } else if (line) {
          const ingParts = line.split(/:\s*(.*)/);
          if (ingParts.length >= 3) {
            ingredientQuantities.push({
              item: ingParts[0].trim(),
              details: ingParts[1].trim(),
            });
          } else {
            ingredientQuantities.push({ item: line, details: "" });
          }
        }
      } else if (currentSection === "steps") {
        const stepMatch = line.match(/^(?:\d+\.\s*|-\s*)(.+)$/i);
        if (stepMatch && stepMatch[1]) {
          cookingSteps.push(stepMatch[1].trim());
        } else if (line && !/^Cooking Steps:/i.test(line)) {
          cookingSteps.push(line);
        }
      } else if (currentSection === "equipment") {
        if (/^-\s*(.+)$/i.test(line)) {
          const equipmentLine = line.replace(/^-\s*/, "").trim();
          if (equipmentLine) equipmentNeededLines.push(equipmentLine);
        } else if (line !== "") {
          equipmentNeededLines.push(line);
        }
      } else if (currentSection === "prep") {
        const prepMatch = line.match(/^(?:\d+\.\s*|-\s*)(.+)$/i);
        if (prepMatch && prepMatch[1]) {
          prePreparationLines.push(prepMatch[1].trim());
        } else if (line !== "") {
          prePreparationLines.push(line);
        }
      }
    }
  }

  return {
    dishName,
    cuisine,
    equipmentNeeded: equipmentNeededLines.join(", "),
    prePreparation: prePreparationLines.join("\n"),
    servings,
    ingredientQuantities,
    cookingTime,
    possibleAllergens,
    cookingSteps,
  };
}

export default function Home() {
  const [file, setFile] = useState<File | null>(null);
  const [result, setResult] = useState<Result | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [selectedRecipe, setSelectedRecipe] = useState<Recipe | null>(null);
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();

  const [minLoadComplete, setMinLoadComplete] = useState(false);
  useEffect(() => {
    const timer = setTimeout(() => {
      setMinLoadComplete(true);
    }, 3000);
    return () => clearTimeout(timer);
  }, []);

  const loadingMessages = [
    "Finding recipes..",
    "Thinking...",
    "Asking Chef Gordon..",
    "Gordon's busy...",
    "Finding other chefs",
    "Found one!",
    "Asking Chef Preyash...",
    "Wanna Zomato?",
    "No promotions!!",
    "Just a moment...",
  ];

  const [loadingMessage, setLoadingMessage] = useState("");

  useEffect(() => {
    if (loading) {
      let index = 0;
      setLoadingMessage(loadingMessages[index]);
      const interval = setInterval(() => {
        index = (index + 1) % loadingMessages.length;
        setLoadingMessage(loadingMessages[index]);
      }, 3500);
      return () => clearInterval(interval);
    } else {
      setLoadingMessage("");
    }
  }, [loading]);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/login");
    }
  }, [authLoading, user, router]);

  useEffect(() => {
    if (!authLoading && user) {
      const savedResult = localStorage.getItem("recipeResult");
      if (savedResult) {
        setResult(JSON.parse(savedResult));
      }
    }
  }, [authLoading, user]);

  if (authLoading || !user || !minLoadComplete) {
    return (
      <>
        <div className="loader-container">
          <Loader />
        </div>
      </>
    );
  }

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      setFile(files[0]);
    }
  };

  const handleUpload = async () => {
    if (!file) {
      alert("Please select a file to upload.");
      return;
    }
    setLoading(true);
    setResult(null);
    setSelectedRecipe(null);

    const formData = new FormData();
    formData.append("file", file);

    const token = await auth.currentUser?.getIdToken();

    try {
      const res = await fetch("http://localhost:8080/api/upload", {
        method: "POST",
        body: formData,
        credentials: "include",
        headers: {
          Authorization: token ? `Bearer ${token}` : "",
        },
      });
      const data = await res.json();
      setResult(data);
      localStorage.setItem("recipeResult", JSON.stringify(data));
    } catch (error) {
      console.error("Error uploading file:", error);
    } finally {
      setLoading(false);
    }
  };

  const recipeTextToParse =
    selectedRecipe?.recipeText || result?.recipe?.recipe_text || "";
  const dishTexts = recipeTextToParse ? parseDishes(recipeTextToParse) : [];
  const dishesData = dishTexts.map(parseRecipeDish);

  return (
    <div className="page-container">
      <Navbar user={user} onSelectRecipe={setSelectedRecipe} />
      <div className="content-wrapper">
        <div className="sidebar-wrapper desktop-sidebar">
          <RecipeSidebar
            onSelectRecipe={setSelectedRecipe}
            reloadFlag={recipeTextToParse}
          />
        </div>
        <div className="main-content">
          <section className="card upload-card">
            <h1 className="card-title">PicMeal</h1>
            <p className="card-detail">
              Tired of searching the web for recipes? Just snap a picture of
              your ingredients and let AI cook!
            </p>
            <div className="upload-inputs">
              <input
                type="file"
                accept="image/*"
                capture="environment"
                onChange={handleFileChange}
                className="upload-input"
              />
              <button
                onClick={handleUpload}
                disabled={loading}
                className="upload-button"
              >
                {loading ? "Cooking..." : "Upload Image"}
              </button>
            </div>
          </section>
          {recipeTextToParse && dishesData.length > 0 && (
            <section className="card recipe-card">
              <h2 className="card-title">Recipe Suggestions</h2>
              <div className="recipe-content">
                {dishesData.map((dish, idx) => (
                  <RecipeCard key={idx} {...dish} />
                ))}
              </div>
            </section>
          )}
        </div>
      </div>
      <footer className="footer">
        <p>
          Developed by -{" "}
          <a href="https://preyashyadav.com" className="footer-link">
            Preyash Yadav
          </a>
        </p>
      </footer>
      {loading && (
        <div className="loading-modal-overlay">
          <div className="loading-modal">
            <div className="loading-message">
              <Loader />
              <div className="loading-messages">
              {loadingMessage}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
