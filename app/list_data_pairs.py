# Script to list all unique (machineId, bearingId) pairs in the 'data' collection
from pymongo import MongoClient

client = MongoClient('mongodb://localhost:27017/')
db = client['factory_db']
col = db['data']

pairs = col.aggregate([
    {"$group": {"_id": {"machineId": "$machineId", "bearingId": "$bearingId"}}}
])

print("machineId\tbearingId")
for pair in pairs:
    print(f"{pair['_id']['machineId']}\t{pair['_id']['bearingId']}")
