import json
import os

with open(r'd:\Gas Analzyer\frontend\src\data\scrubber_data.json', 'r') as f:
    data = json.load(f)

scrubbers = data.get('scrubbers', [])

new_sensors = []
for i, scb in enumerate(scrubbers):
    sensor = {
        'sensor_id': scb['id'],
        'device_name': scb['name'],
        'gas_type': 'pH',
        'currentValue': scb.get('currentPh', 0.0),
        'avgValue': scb.get('avgPh', 0.0),
        'minValue': scb.get('minPh', 0.0),
        'maxValue': scb.get('maxPh', 0.0),
        'unit': 'pH',
        'status': 'ONLINE' if scb.get('sensor', {}).get('status') == 'Active' else 'OFFLINE',
        'lastUpdated': 'Just now',
        'location': scb.get('location', 'Unknown'),
        'aiObservations': f"{scb.get('finding', '')}. {scb.get('recommendation', '')}",
        'maintenanceHistory': []
    }
    new_sensors.append(sensor)

print(json.dumps(new_sensors, indent=2))
