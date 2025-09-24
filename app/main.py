# File: app/main.py
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routers import machines, stats

app = FastAPI(title="Machine Monitoring API")

# Enable CORS for frontend apps (adjust origins as needed)
origins = [
    "http://localhost",
    "http://localhost:3000",
    # Add more frontend URLs if needed
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Routers
app.include_router(machines.router, prefix="/machines", tags=["Machines"])
app.include_router(stats.router, prefix="/stats", tags=["Stats"])

# Home endpoint
@app.get("/")
def home():
    return {"message": "Welcome to Machine Monitoring API"}

# Optional metadata endpoint
@app.get("/metadata")
def metadata():
    return {
        "machines_endpoint": "/machines",
        "stats_endpoint": "/stats",
        "features": [
            "Filtering by status, customerId, areaId, machineType",
            "Date range filtering",
            "Pagination and sorting",
            "Pie and stacked bar chart data",
            "Daily, weekly, monthly aggregation"
        ]
    }
