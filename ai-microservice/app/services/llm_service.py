import openai
from app.config import OPENAI_API_KEY

openai.api_key = OPENAI_API_KEY

def generate_recipe(ingredients: list, context: str) -> dict:
    """
      - Dish Name
      - Cuisine (if not clear, say "Spidey's special")
      - Equipment Needed
      - Pre-preparation steps
      - Servings
      - Ingredient Quantities
      - Cooking Time
      - Possible Allergens
      - Cooking Steps
    """
    prompt = (
        f"Ingredients: {', '.join(ingredients)}.\n\n"
        "Using these ingredients, propose at least two distinct dish suggestions. For each dish, please provide the following details:\n"
        "1. Dish Name: Provide a creative name for the dish.\n"
        "2. Cuisine: Indicate the cuisine type (e.g., Italian, Mexican, Indian, etc.). If the ingredients do not suggest any specific cuisine, simply write \"Spidey Sense\".\n"
        "3. Equipment Needed: Specify the kitchen tools and equipment required (e.g., knife, cutting board, oven, pan, etc.).\n"
        "4. Pre-preparation steps: Describe any necessary pre-preparation steps (e.g., marinating, chopping, etc.).\n"
        "5. Servings: Indicate how many servings the dish makes.\n"
        "6. Ingredient Quantities: Specify the quantity needed for each ingredient (e.g., Tomato: 2 medium, Cheese: 100g, Basil: 10 leaves).\n"
        "7. Cooking Time: Provide the total cooking time (e.g., '30 minutes').\n"
        "8. Possible Allergens: List any potential allergens in the recipe.\n"
        "9. Cooking Steps: List detailed, step-by-step instructions for preparing the dish.\n\n"
        "Return the entire output in a structured format with clear headings for each dish suggestion. Don't Use markdown for formatting. Just give simple text with list wherever necesaary.\n\n"
    )

    messages = [
        {
            "role": "system",
            "content": "You are a professional culinary chef and recipe generator who provides detailed and structured recipes."
        },
        {"role": "user", "content": prompt}
    ]
    
    response = openai.ChatCompletion.create(
        model="gpt-4o-mini",
        messages=messages,
        temperature=0.7,
        max_tokens=2000 
    )
    
    recipe_text = response.choices[0].message.content.strip()
    return {"recipe_text": recipe_text}
