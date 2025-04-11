import faiss
import numpy as np
from sentence_transformers import SentenceTransformer


model = SentenceTransformer('all-MiniLM-L6-v2')

corpus = [
    "This recipe uses tomato, cheese, and basil to create a flavorful Italian dish.",
    "A dairy-free pasta dish with fresh tomatoes and basil is perfect for summer.",
    "A vegan recipe utilizing tomato and green vegetables for a healthy meal."
]

corpus_embeddings = model.encode(corpus)

dim = corpus_embeddings.shape[1]
index = faiss.IndexFlatL2(dim)
index.add(corpus_embeddings)

def retrieve_context(ingredients: list, top_k: int = 1) -> str:

    query = " ".join(ingredients)
    query_embedding = model.encode([query])
    

    distances, indices = index.search(np.array(query_embedding), top_k)
    

    retrieved_sentences = [corpus[i] for i in indices[0]]
    context = " ".join(retrieved_sentences)
    return context
