"use client";
import React from "react";
import "../app/globals.css";

interface Ingredient {
  item: string;
  details: string;
}

interface RecipeCardProps {
  dishName: string;
  cuisine: string;
  equipmentNeeded: string;
  prePreparation: string;
  servings: string;
  ingredientQuantities: Ingredient[];
  cookingTime: string;
  possibleAllergens: string;
  cookingSteps: string[];
}

const RecipeCard: React.FC<RecipeCardProps> = ({
  dishName,
  cuisine,
  equipmentNeeded,
  prePreparation,
  servings,
  ingredientQuantities,
  cookingTime,
  possibleAllergens,
  cookingSteps,
}) => {
  return (
    <div className="dish-card">
      <h2 className="dish-header">{dishName}</h2>

      <div className="section">
        <h3 className="section-title">Cuisine</h3>
        <p className="section-content">{cuisine}</p>
      </div>

      <div className="section">
        <h3 className="section-title">Equipments Needed</h3>
        <p className="section-content">{equipmentNeeded}</p>
      </div>

      <div className="section">
        <h3 className="section-title">Pre-preparation</h3>
        <p className="section-content">{prePreparation}</p>
      </div>

      <div className="section">
        <h3 className="section-title">Servings</h3>
        <p className="section-content">{servings}</p>
      </div>

      <div className="section">
        <h3 className="section-title">Ingredient Quantities</h3>
        <ul className="ingredient-list">
          {ingredientQuantities.map((ing, i) => (
            <li key={i}>
              <label>
                <input type="checkbox" />
                <span>
                  {ing.item}: {ing.details}
                </span>
              </label>
            </li>
          ))}
        </ul>
      </div>

      <div className="section">
        <h3 className="section-title">Cooking Time</h3>
        <p className="section-content">{cookingTime}</p>
      </div>

      <div className="section">
        <h3 className="section-title">Possible Allergens</h3>
        <p className="section-content">{possibleAllergens}</p>
      </div>

      <div className="section">
        <h3 className="section-title">Cooking Steps</h3>
        <ol className="cooking-steps">
          {cookingSteps.map((step, i) => (
            <li key={i}>
              <label>
                <input type="checkbox" />
                <span>{step}</span>
              </label>
            </li>
          ))}
        </ol>
      </div>
    </div>
  );
};

export default RecipeCard;
