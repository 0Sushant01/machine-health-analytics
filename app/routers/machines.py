from fastapi import APIRouter, Query, HTTPException, Body
from typing import Optional
import requests
import json

router = APIRouter()

@router.post("/external-ai-data/")
async def fetch_external_ai_data(
    machineId: str = Body(...),
    bearingLocationId: str = Body(...),
    Axis_Id: str = Body("H-Axis"),
    Analytics_Types: str = Body("MF"),
):
    """
    Calls the external AI Data API, tries OFFLINE first, then ONLINE if needed.
    """
    url = "https://srcapiv2.aams.io/AAMS/AI/Data"
    headers = {"Content-Type": "application/json"}
    payload_offline = json.dumps({
        "machineId": machineId,
        "bearingLocationId": bearingLocationId,
        "Axis_Id": Axis_Id,
        "type": "OFFLINE",
        "Analytics_Types": Analytics_Types
    })
    payload_online = json.dumps({
        "machineId": machineId,
        "bearingLocationId": bearingLocationId,
        "Axis_Id": Axis_Id,
        "type": "ONLINE",
        "Analytics_Types": Analytics_Types
    })
    try:
        resp = requests.post(url, headers=headers, data=payload_offline, timeout=10)
        resp.raise_for_status()
        data = resp.json()
        data["mode"] = "OFFLINE"
        return data
    except Exception as e:
        # Try ONLINE if OFFLINE fails
        try:
            resp = requests.post(url, headers=headers, data=payload_online, timeout=10)
            resp.raise_for_status()
            data = resp.json()
            data["mode"] = "ONLINE"
            return data
        except Exception as e2:
            raise HTTPException(status_code=500, detail=f"Both OFFLINE and ONLINE failed: {str(e2)}")
from app.db import db
from bson import ObjectId
router = APIRouter()

@router.get("/data/{machine_id}/{bearing_id}")
async def get_machine_bearing_data(machine_id: str, bearing_id: str):
    """
    Returns the latest data document for a given machine_id and bearing_id from the 'data' collection.
    """
    try:
        # Always use string comparison for machineId and bearingId
        query = {"machineId": machine_id, "bearingId": bearing_id}
        doc = await db["data"].find_one(query, sort=[("timestamp", -1)])
        if not doc:
            raise HTTPException(status_code=404, detail="No data found for this machine and bearing")
        # Convert ObjectId fields to strings
        for k, v in doc.items():
            if isinstance(v, ObjectId):
                doc[k] = str(v)
        # For frontend compatibility, return rawData as rowdata if present
        if "rawData" in doc:
            doc["rowdata"] = doc["rawData"]
        return doc
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
@router.get("/bearing-data/{bearing_id}")
async def get_bearing_data(bearing_id: str):
    """
    Returns the latest rowdata array for a given bearingId from the 'data' collection.
    """
    try:
        # Try ObjectId, fallback to string
        try:
            query = {"bearingId": ObjectId(bearing_id)}
        except Exception:
            query = {"bearingId": bearing_id}
        # Find the latest document for this bearingId (by timestamp desc)
        doc = await db["data"].find_one(query, sort=[("timestamp", -1)])
        if not doc or "rowdata" not in doc:
            raise HTTPException(status_code=404, detail="No rowdata found for this bearing")
        return {"bearingId": bearing_id, "rowdata": doc["rowdata"]}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# Get a single machine with bearings and FFT data

@router.get("/{machine_id}")
async def get_machine_detail(machine_id: str):
    # Try ObjectId, fallback to string
    match = None
    try:
        match = {"_id": ObjectId(machine_id)}
        result = await db.machines.aggregate([
            {"$match": match},
            {
                "$lookup": {
                    "from": "bearings",
                    "localField": "_id",
                    "foreignField": "machineId",
                    "as": "bearings"
                }
            }
        ]).to_list(length=1)
        if result:
            machine = result[0]
            for bearing in machine.get("bearings", []):
                if "fftData" not in bearing:
                    bearing["fftData"] = [{"frequency": f, "amplitude": 1.0} for f in range(1, 11)]
            return {"machine": machine}
    except Exception:
        pass
    # Try as string
    match = {"_id": machine_id}
    result = await db.machines.aggregate([
        {"$match": match},
        {
            "$lookup": {
                "from": "bearings",
                "localField": "_id",
                "foreignField": "machineId",
                "as": "bearings"
            }
        }
    ]).to_list(length=1)
    if not result:
        raise HTTPException(status_code=404, detail="Machine not found")
    machine = result[0]
    for bearing in machine.get("bearings", []):
        if "fftData" not in bearing:
            bearing["fftData"] = [{"frequency": f, "amplitude": 1.0} for f in range(1, 11)]
    return {"machine": machine}

@router.get("/")
async def get_machines(
    status: Optional[str] = Query(None),
    customerId: Optional[str] = Query(None),
    areaId: Optional[str] = Query(None),
    machineType: Optional[str] = Query(None),
    date_from: Optional[str] = Query(None),
    date_to: Optional[str] = Query(None),
    sort_by: Optional[str] = Query("dataUpdatedTime"),
    sort_order: Optional[str] = Query("desc"),  # "asc" or "desc"
):
    # Build match filters
    match = {}
    if status:
        match["statusName"] = status
    if customerId:
        match["customerId"] = customerId
    if areaId:
        match["areaId"] = areaId
    if machineType:
        match["machineType"] = machineType
    if date_from or date_to:
        match["dataUpdatedTime"] = {}
        if date_from:
            match["dataUpdatedTime"]["$gte"] = f"{date_from}T00:00:00"
        if date_to:
            match["dataUpdatedTime"]["$lte"] = f"{date_to}T23:59:59"

    # Determine sort order
    sort_order_value = -1 if sort_order.lower() == "desc" else 1

    # Aggregation pipeline
    pipeline = [
        {"$match": match},
        {
            "$lookup": {
                "from": "bearings",
                "localField": "_id",
                "foreignField": "machineId",
                "as": "bearings"
            }
        },
        {"$sort": {sort_by: sort_order_value}}
    ]

    machines = await db.machines.aggregate(pipeline).to_list(length=None)
    total_count = len(machines)

    return {"machines": machines, "totalCount": total_count}
