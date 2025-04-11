from fastapi import APIRouter, File, UploadFile
from app.services import image_service, rag_service, llm_service

router = APIRouter()

@router.post("/process-image")
async def process_image(file: UploadFile = File(...)):

    image_bytes = await file.read()
    
    ingredients = image_service.detect_items(image_bytes)
    
    context = rag_service.retrieve_context(ingredients)
    
    recipe = llm_service.generate_recipe(ingredients, context)
    
    return {"ingredients": ingredients, "recipe": recipe}
