from fastapi import FastAPI
from app.routes import ai_routes

app = FastAPI(title="AI Recipe Generation Service")


@app.get("/")
def read_root():
    return {"message": "Welcome to the AI Recipe Generation Service. Visit /docs for the interactive API."}


app.include_router(ai_routes.router, prefix="/api")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app.main:app", host="0.0.0.0", port=8000, reload=True)
