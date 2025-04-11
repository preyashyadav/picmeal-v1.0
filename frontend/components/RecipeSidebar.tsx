"use client";

import React, { useEffect, useState } from "react";
import { auth } from "../firebase/firebaseConfig";

export interface Recipe {
  userID: string;
  recipeID: string;
  ingredients: string[];
  recipeText?: string;
  createdAt: string;
}

interface RecipeSidebarProps {
  onSelectRecipe: (recipe: Recipe) => void;
  reloadFlag?: string;
}

function parseDishes(recipeText: string): string[] {
  const regex = /(Dish\s+\d+:\s*[\s\S]*?)(?=Dish\s+\d+:|$)/gi;
  const dishes = recipeText.match(regex) || [];
  return dishes.map((dish) => dish.trim());
}

function getDishNames(recipeText?: string): string {
  if (!recipeText) return "Unnamed Dish";
  const dishes = parseDishes(recipeText);
  const names = dishes.map((dish) => {
    const parts = dish.split(":", 2);
    return parts.length === 2 ? parts[1].trim() : dish;
  });
  return names.join(", ");
}

const Spinner = () => (
  <div className="spinner">
    <div></div>
    <div></div>
    <div></div>
    <div></div>
    <div></div>
    <style jsx>{`
      .spinner {
        position: relative;
        width: 33.6px;
        height: 33.6px;
        perspective: 67.2px;
        margin: auto;
      }
      .spinner div {
        width: 100%;
        height: 100%;
        background: #c99a00;
        position: absolute;
        left: 50%;
        transform-origin: left;
        animation: spinner-16s03x 2s infinite;
      }
      .spinner div:nth-child(1) {
        animation-delay: 0.15s;
      }
      .spinner div:nth-child(2) {
        animation-delay: 0.3s;
      }
      .spinner div:nth-child(3) {
        animation-delay: 0.45s;
      }
      .spinner div:nth-child(4) {
        animation-delay: 0.6s;
      }
      .spinner div:nth-child(5) {
        animation-delay: 0.75s;
      }
      @keyframes spinner-16s03x {
        0% {
          transform: rotateY(0deg);
        }
        50%,
        80% {
          transform: rotateY(-180deg);
        }
        90%,
        100% {
          opacity: 0;
          transform: rotateY(-180deg);
        }
      }
    `}</style>
  </div>
);

export default function RecipeSidebar({
  onSelectRecipe,
  reloadFlag,
}: RecipeSidebarProps) {
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchRecipes() {
      const startTime = Date.now();
      try {
        const token = await auth.currentUser?.getIdToken();
        const res = await fetch("http://localhost:8080/api/recipes", {
          method: "GET",
          credentials: "include",
          headers: {
            Authorization: token ? `Bearer ${token}` : "",
          },
        });
        const data = await res.json();
        setRecipes(data);
      } catch (error) {
        console.error("Error fetching recipes:", error);
      } finally {
        const elapsed = Date.now() - startTime;
        const minimumTime = 3000;
        if (elapsed < minimumTime) {
          await new Promise((resolve) =>
            setTimeout(resolve, minimumTime - elapsed)
          );
        }
        setLoading(false);
      }
    }
    fetchRecipes();
  }, [reloadFlag]);

  return (
    <aside className="sidebar">
      <h2 className="sidebar-title">My Recipes</h2>
      <hr />
      <br />
      {loading ? (
        <Spinner />
      ) : recipes.length === 0 ? (
        <p className="sidebar-message">No recipes found.</p>
      ) : (
        <ul className="sidebar-list">
          {recipes.map((recipe) => (
            <li
              key={recipe.recipeID}
              className="sidebar-list-item"
              onClick={() => onSelectRecipe(recipe)}
              style={{ cursor: "pointer" }}
            >
              <h3 className="sidebar-recipe-title">
                {getDishNames(recipe.recipeText)}
              </h3>
              <p className="sidebar-recipe-date">
                {new Date(recipe.createdAt).toLocaleString()}
              </p>
              {/* <small className="sidebar-recipe-id">{recipe.recipeID}</small> */}
            </li>
          ))}
        </ul>
      )}
    </aside>
  );
}
