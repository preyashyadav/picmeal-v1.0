import io
from PIL import Image
import numpy as np
import torch
from torchvision import models, transforms
import clip


detection_model = models.detection.fasterrcnn_resnet50_fpn(pretrained=True)
detection_model.eval()

device = "cuda" if torch.cuda.is_available() else "cpu"
detection_model.to(device)


detection_transform = transforms.Compose([
    transforms.ToTensor(),
])


clip_model, clip_preprocess = clip.load("ViT-B/32", device=device)


candidate_labels = [
    "onion", "garlic", "leek", "scallion", "shallot", "chive",
    "carrot", "beet", "radish", "turnip", "parsnip", "sweet potato", "potato",
    "cauliflower", "broccoli", "cabbage", "brussels sprout", "bok choy",
    "kale", "spinach", "lettuce", "arugula", "watercress",
    "zucchini", "cucumber", "pumpkin", "butternut squash", "acorn squash",
    "tomato", "red bell pepper", "green bell pepper", "chili pepper", "jalapeno", "eggplant",
    "celery", "asparagus", "artichoke", "corn", "green bean", "pea", "mushroom", "okra", "fennel",
    "basil", "parsley", "cilantro", "mint", "rosemary", "thyme", "oregano", "sage", "dill", "tarragon", "apple", 
    "egg", "eggs"
]


def detect_items(image_bytes: bytes, detection_threshold: float = 0.1, clip_threshold: float = 0.1) -> list:


    image = Image.open(io.BytesIO(image_bytes)).convert("RGB")
    image_tensor = detection_transform(image).to(device)
    
    with torch.no_grad():
        predictions = detection_model([image_tensor])[0]
    
    detected_labels = []
    
    for i in range(len(predictions["boxes"])):
        score = predictions["scores"][i].item()
        if score >= detection_threshold:
            box = predictions["boxes"][i]
            box = box.cpu().numpy().astype(int)
            crop = image.crop((box[0], box[1], box[2], box[3]))
            
            crop_input = clip_preprocess(crop).unsqueeze(0).to(device)
            text_inputs = clip.tokenize(candidate_labels).to(device)
            
            with torch.no_grad():
                image_features = clip_model.encode_image(crop_input)
                text_features = clip_model.encode_text(text_inputs)
            
            image_features = image_features / image_features.norm(dim=-1, keepdim=True)
            text_features = text_features / text_features.norm(dim=-1, keepdim=True)
            
            similarity = (image_features @ text_features.T).squeeze(0)
            similarity_scores = similarity.cpu().numpy()
            
            best_idx = similarity_scores.argmax()
            best_score = similarity_scores[best_idx]
            predicted_label = candidate_labels[best_idx]
            
            print(f"Predicted: {predicted_label}, Score: {best_score:.2f}")
            
            if best_score >= clip_threshold:
                detected_labels.append(predicted_label)
    

    if not detected_labels:
        print("No regions passed detection; falling back to global CLIP classification.")
        image_input = clip_preprocess(image).unsqueeze(0).to(device)
        text_inputs = clip.tokenize(candidate_labels).to(device)
        with torch.no_grad():
            image_features = clip_model.encode_image(image_input)
            text_features = clip_model.encode_text(text_inputs)
        image_features = image_features / image_features.norm(dim=-1, keepdim=True)
        text_features = text_features / text_features.norm(dim=-1, keepdim=True)
        similarity = (image_features @ text_features.T).squeeze(0)
        similarity_scores = similarity.cpu().numpy()
        
        for idx, score in enumerate(similarity_scores):
            if score >= clip_threshold:
                detected_labels.append(candidate_labels[idx])
    
    if not detected_labels:
        print("Global classification failed; using default fallback.")
        detected_labels = ["mango", "banana", "apple", "orange"]
    
    print("Detected Labels:", detected_labels)
    return list(set(detected_labels))
