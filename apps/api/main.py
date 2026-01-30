from datetime import datetime
from typing import List, Optional
from uuid import uuid4

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field

app = FastAPI(title="RGB GIS Demo API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


class LoginRequest(BaseModel):
    operator_id: str = Field(..., min_length=3)
    access_key: str = Field(..., min_length=3)


class LoginResponse(BaseModel):
    token: str
    user: dict


class Ground(BaseModel):
    id: str
    name: str
    lat: float
    lon: float
    client_id: str


class AOIRequest(BaseModel):
    ground_id: str
    name: Optional[str] = None
    geometry: dict


class AnalysisRequest(BaseModel):
    ground_id: str
    aoi_id: Optional[str] = None
    indices: List[str]


class AnalysisResponse(BaseModel):
    id: str
    status: str
    results: dict
    created_at: str


DEMO_USER = {
    "id": "user-demo",
    "name": "Demo Analyst",
    "email": "demo@rgb.local",
    "role": "ANALYST",
}

CLIENTS = [
    {"id": "client-01", "name": "AIVA Sports", "code": "AIVA"},
]

GROUNDS = [
    {
        "id": "ground-01",
        "name": "National Sports Arena",
        "lat": 19.076,
        "lon": 72.8777,
        "client_id": "client-01",
    },
    {
        "id": "ground-02",
        "name": "City Football Campus",
        "lat": 28.6139,
        "lon": 77.209,
        "client_id": "client-01",
    },
    {
        "id": "ground-03",
        "name": "Coastal Cricket Oval",
        "lat": 12.9141,
        "lon": 74.856,
        "client_id": "client-01",
    },
]

AOIS: dict[str, dict] = {}
ANALYSES: dict[str, dict] = {}


@app.post("/auth/login", response_model=LoginResponse)
async def login(payload: LoginRequest):
    if payload.operator_id.lower() != "demo" or payload.access_key != "demo":
        raise HTTPException(status_code=401, detail="Invalid credentials")
    token = f"demo-{uuid4()}"
    return {"token": token, "user": DEMO_USER}


@app.get("/me")
async def me():
    return DEMO_USER


@app.get("/clients")
async def list_clients():
    return CLIENTS


@app.get("/clients/{client_id}/grounds")
async def list_grounds(client_id: str):
    return [ground for ground in GROUNDS if ground["client_id"] == client_id]


@app.get("/grounds/{ground_id}")
async def get_ground(ground_id: str):
    for ground in GROUNDS:
        if ground["id"] == ground_id:
            return ground
    raise HTTPException(status_code=404, detail="Ground not found")


@app.post("/grounds/{ground_id}/aois")
async def create_aoi(ground_id: str, payload: AOIRequest):
    aoi_id = f"aoi-{uuid4()}"
    aoi = {
        "id": aoi_id,
        "ground_id": ground_id,
        "name": payload.name or "AOI",
        "geometry": payload.geometry,
        "created_at": datetime.utcnow().isoformat(),
    }
    AOIS[aoi_id] = aoi
    return aoi


@app.get("/grounds/{ground_id}/aois")
async def list_aois(ground_id: str):
    return [aoi for aoi in AOIS.values() if aoi["ground_id"] == ground_id]


@app.post("/grounds/{ground_id}/analyze", response_model=AnalysisResponse)
async def analyze(ground_id: str, payload: AnalysisRequest):
    analysis_id = f"analysis-{uuid4()}"
    results = {
        index: {
            "min": round(0.15, 2),
            "mean": round(0.42, 2),
            "max": round(0.78, 2),
        }
        for index in payload.indices
    }
    analysis = {
        "id": analysis_id,
        "status": "DONE",
        "results": results,
        "created_at": datetime.utcnow().isoformat(),
    }
    ANALYSES[analysis_id] = analysis
    return analysis


@app.get("/analyses/{analysis_id}")
async def get_analysis(analysis_id: str):
    analysis = ANALYSES.get(analysis_id)
    if not analysis:
        raise HTTPException(status_code=404, detail="Analysis not found")
    return analysis
