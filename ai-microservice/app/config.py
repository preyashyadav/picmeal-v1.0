import os
from dotenv import load_dotenv

load_dotenv()

OPENAI_API_KEY = os.getenv("OPENAI_API_KEY", "openai-api-key")

FAISS_INDEX_PATH = os.getenv("FAISS_INDEX_PATH", "faiss_index.index")

