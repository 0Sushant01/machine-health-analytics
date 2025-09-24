# Script to insert a test document into the 'data' collection for FFT chart testing
from pymongo import MongoClient
from datetime import datetime

# Update with your MongoDB connection string if needed
client = MongoClient('mongodb://localhost:27017/')
db = client['factory_db']
data_col = db['data']

test_doc = {
    "_id": "test_fft_bearing_data",
    "Axis_Id": "A-Axis",
    "bearingId": "689b0614107d011a57a7cf2c",
    "machineId": "test_machine_id",
    "SR": "20000",
    "analyticsType": "MF",
    "cutoff": "10",
    "fMax": "800",
    "floorNoiseAttenuationFactor": "4",
    "floorNoiseThresholdPercentage": "0.4",
    "noOfLines": "1600",
    "nos": "64000",
    "rpm": 1500.0,
    "timestamp": int(datetime.now().timestamp()),
    "rowdata": [float(i % 100) for i in range(64000)]  # Example FFT data
}

result = data_col.replace_one({"_id": test_doc["_id"]}, test_doc, upsert=True)
print("Inserted/Updated test FFT data for bearingId 689b0614107d011a57a7cf2c in factory_db.")
