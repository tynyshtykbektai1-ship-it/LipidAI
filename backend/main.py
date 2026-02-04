from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import pandas as pd
import joblib


model = joblib.load("final_lipid_model.pkl")

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class feature_request(BaseModel):
    TC: float
    HDL_C: float
    TG: float

@app.get("/")
def root():
    return {"message": "API is working"}

@app.post("/predict")
async def predict(features: feature_request):
    data = {
        "TC": [features.TC],
        "HDL-C": [features.HDL_C],
        "TG": [features.TG]
    }
    df = pd.DataFrame(data)
    prediction = model.predict(df)
    return {"LDL-C": prediction[0]}