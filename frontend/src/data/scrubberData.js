// Comprehensive Sensor Telemetry & H2S Gas Monitoring Data

export const ALERTS_RULES = {
  HEALTHY_MAX_PPM: 5.0,
  WARNING_MAX_PPM: 10.0,
  CRITICAL_MAX_PPM: 20.0,
};

export const evaluateStatus = (ppm) => {
  if (ppm < ALERTS_RULES.WARNING_MAX_PPM) return 'Healthy';
  if (ppm < ALERTS_RULES.CRITICAL_MAX_PPM) return 'Warning';
  return 'Critical';
};

export const getStatusColor = (status) => {
  switch (status.toLowerCase()) {
    case 'healthy':
      return { text: '#2E7D32', bg: 'rgba(46, 125, 50, 0.12)', border: 'rgba(46, 125, 50, 0.35)' };
    case 'warning':
      return { text: '#d97706', bg: 'rgba(217, 119, 6, 0.12)', border: 'rgba(217, 119, 6, 0.35)' };
    case 'critical':
      return { text: '#dc2626', bg: 'rgba(220, 38, 38, 0.12)', border: 'rgba(220, 38, 38, 0.35)' };
    default:
      return { text: '#455A64', bg: 'rgba(69, 90, 100, 0.12)', border: 'rgba(69, 90, 100, 0.35)' };
  }
};

export const POSSIBLE_CAUSES = [
  'Sensor calibration issue',
  'High H2S concentration leak',
  'Ventilation malfunction'
];

export const RECOMMENDED_ACTIONS = [
  'Verify H2S sensor calibration',
  'Inspect immediate area for leaks',
  'Schedule preventive maintenance'
];

// Seed sensors list
export const INITIAL_SENSORS = [
  {
    sensor_id: 1,
    device_name: 'CO',
    gas_type: 'CO',
    currentValue: 0.0,
    avgValue: 0.0,
    minValue: 0.0,
    maxValue: 0.0,
    unit: 'PPM',
    status: 'ONLINE',
    lastUpdated: 'Just now',
    location: 'Main Gas Pipeline',
    aiObservations: 'CO levels are maintaining a stable safe range.',
    maintenanceHistory: []
  },
  {
    sensor_id: 2,
    device_name: 'H2S',
    gas_type: 'H2S',
    currentValue: 0.0,
    avgValue: 0.0,
    minValue: 0.0,
    maxValue: 0.0,
    unit: 'PPM',
    status: 'ONLINE',
    lastUpdated: 'Just now',
    location: 'Main Gas Pipeline',
    aiObservations: 'H2S levels are maintaining a stable safe range.',
    maintenanceHistory: []
  },
  {
    "sensor_id": "AMMONIA-SCRUBBER",
    "device_name": "AMMONIA-SCRUBBER",
    "gas_type": "pH",
    "currentValue": 0.0,
    "avgValue": 9.8,
    "minValue": 9.8,
    "maxValue": 9.8,
    "unit": "pH",
    "status": "OFFLINE",
    "lastUpdated": "Just now",
    "location": "Unit 1 - Production Zone SCRUBBER",
    "aiObservations": "Scrubber Telemetry Offline. Inspect Modbus Transmitters and Field PLC Cabinets",
    "maintenanceHistory": []
  },
  {
    "sensor_id": "SCB-604",
    "device_name": "SCB-604",
    "gas_type": "pH",
    "currentValue": 7.21,
    "avgValue": 7.95,
    "minValue": 7.2,
    "maxValue": 11.29,
    "unit": "pH",
    "status": "ONLINE",
    "lastUpdated": "Just now",
    "location": "Unit 1 - Production Zone 604",
    "aiObservations": "Low Alkali Dosing. Increase Caustic Dosing Pump Output",
    "maintenanceHistory": []
  },
  {
    "sensor_id": "FES-101",
    "device_name": "FES-101",
    "gas_type": "pH",
    "currentValue": 9.8,
    "avgValue": 8.99,
    "minValue": 1.36,
    "maxValue": 9.8,
    "unit": "pH",
    "status": "ONLINE",
    "lastUpdated": "Just now",
    "location": "Unit 1 - Production Zone 101",
    "aiObservations": "Healthy. Continue Stream Monitoring",
    "maintenanceHistory": []
  },
  {
    "sensor_id": "SCB-601",
    "device_name": "SCB-601",
    "gas_type": "pH",
    "currentValue": 8.3,
    "avgValue": 8.67,
    "minValue": 7.7,
    "maxValue": 14.0,
    "unit": "pH",
    "status": "ONLINE",
    "lastUpdated": "Just now",
    "location": "Unit 1 - Production Zone 601",
    "aiObservations": "Low Alkali Dosing. Increase Caustic Dosing Pump Output",
    "maintenanceHistory": []
  },
  {
    "sensor_id": "SCB-502",
    "device_name": "SCB-502",
    "gas_type": "pH",
    "currentValue": 9.69,
    "avgValue": 10.6,
    "minValue": 1.37,
    "maxValue": 13.8,
    "unit": "pH",
    "status": "ONLINE",
    "lastUpdated": "Just now",
    "location": "Unit 1 - Production Zone 502",
    "aiObservations": "Healthy. Continue Stream Monitoring",
    "maintenanceHistory": []
  },
  {
    "sensor_id": "SCB-501",
    "device_name": "SCB-501",
    "gas_type": "pH",
    "currentValue": 11.1,
    "avgValue": 10.47,
    "minValue": 1.5,
    "maxValue": 13.89,
    "unit": "pH",
    "status": "ONLINE",
    "lastUpdated": "Just now",
    "location": "Unit 1 - Production Zone 501",
    "aiObservations": "Healthy. Continue Stream Monitoring",
    "maintenanceHistory": []
  },
  {
    "sensor_id": "SCB-701",
    "device_name": "SCB-701",
    "gas_type": "pH",
    "currentValue": 0.0,
    "avgValue": 0.0,
    "minValue": 0.0,
    "maxValue": 0.0,
    "unit": "pH",
    "status": "OFFLINE",
    "lastUpdated": "Just now",
    "location": "Unit 1 - Production Zone 701",
    "aiObservations": "Scrubber Telemetry Offline. Inspect Modbus Transmitters and Field PLC Cabinets",
    "maintenanceHistory": []
  },
  {
    "sensor_id": "FES-102",
    "device_name": "FES-102",
    "gas_type": "pH",
    "currentValue": 9.5,
    "avgValue": 9.5,
    "minValue": 9.5,
    "maxValue": 9.5,
    "unit": "pH",
    "status": "ONLINE",
    "lastUpdated": "Just now",
    "location": "Unit 1 - Production Zone 102",
    "aiObservations": "Healthy. Continue Stream Monitoring",
    "maintenanceHistory": []
  },
  {
    "sensor_id": "SCB-304",
    "device_name": "SCB-304",
    "gas_type": "pH",
    "currentValue": 9.51,
    "avgValue": 8.96,
    "minValue": 0.95,
    "maxValue": 9.51,
    "unit": "pH",
    "status": "ONLINE",
    "lastUpdated": "Just now",
    "location": "Unit 1 - Production Zone 304",
    "aiObservations": "Healthy. Continue Stream Monitoring",
    "maintenanceHistory": []
  },
  {
    "sensor_id": "SCB-605",
    "device_name": "SCB-605",
    "gas_type": "pH",
    "currentValue": 8.27,
    "avgValue": 10.23,
    "minValue": 7.67,
    "maxValue": 11.54,
    "unit": "pH",
    "status": "ONLINE",
    "lastUpdated": "Just now",
    "location": "Unit 1 - Production Zone 605",
    "aiObservations": "Low Alkali Dosing. Increase Caustic Dosing Pump Output",
    "maintenanceHistory": []
  },
  {
    "sensor_id": "SCB-303",
    "device_name": "SCB-303",
    "gas_type": "pH",
    "currentValue": 10.55,
    "avgValue": 11.14,
    "minValue": 7.33,
    "maxValue": 12.89,
    "unit": "pH",
    "status": "ONLINE",
    "lastUpdated": "Just now",
    "location": "Unit 1 - Production Zone 303",
    "aiObservations": "Healthy. Continue Stream Monitoring",
    "maintenanceHistory": []
  },
  {
    "sensor_id": "SCB-301",
    "device_name": "SCB-301",
    "gas_type": "pH",
    "currentValue": 11.5,
    "avgValue": 11.07,
    "minValue": 9.96,
    "maxValue": 12.6,
    "unit": "pH",
    "status": "ONLINE",
    "lastUpdated": "Just now",
    "location": "Unit 1 - Production Zone 301",
    "aiObservations": "Healthy. Continue Stream Monitoring",
    "maintenanceHistory": []
  },
  {
    "sensor_id": "GCB-6-SCRUBBER",
    "device_name": "GCB-6-SCRUBBER",
    "gas_type": "pH",
    "currentValue": 0.0,
    "avgValue": 0.0,
    "minValue": 0.0,
    "maxValue": 0.0,
    "unit": "pH",
    "status": "OFFLINE",
    "lastUpdated": "Just now",
    "location": "Unit 1 - Production Zone SCRUBBER",
    "aiObservations": "Scrubber Telemetry Offline. Inspect Modbus Transmitters and Field PLC Cabinets",
    "maintenanceHistory": []
  },
  {
    "sensor_id": "SCB-107",
    "device_name": "SCB-107",
    "gas_type": "pH",
    "currentValue": 0.0,
    "avgValue": 9.13,
    "minValue": 0.17,
    "maxValue": 9.76,
    "unit": "pH",
    "status": "OFFLINE",
    "lastUpdated": "Just now",
    "location": "Unit 1 - Production Zone 107",
    "aiObservations": "Scrubber Telemetry Offline. Inspect Modbus Transmitters and Field PLC Cabinets",
    "maintenanceHistory": []
  },
  {
    "sensor_id": "SCB-106",
    "device_name": "SCB-106",
    "gas_type": "pH",
    "currentValue": 0.0,
    "avgValue": 8.37,
    "minValue": 0.91,
    "maxValue": 10.64,
    "unit": "pH",
    "status": "OFFLINE",
    "lastUpdated": "Just now",
    "location": "Unit 1 - Production Zone 106",
    "aiObservations": "Scrubber Telemetry Offline. Inspect Modbus Transmitters and Field PLC Cabinets",
    "maintenanceHistory": []
  },
  {
    "sensor_id": "SCB-105",
    "device_name": "SCB-105",
    "gas_type": "pH",
    "currentValue": 10.7,
    "avgValue": 11.23,
    "minValue": 10.54,
    "maxValue": 13.49,
    "unit": "pH",
    "status": "ONLINE",
    "lastUpdated": "Just now",
    "location": "Unit 1 - Production Zone 105",
    "aiObservations": "Healthy. Continue Stream Monitoring",
    "maintenanceHistory": []
  },
  {
    "sensor_id": "SCB-901",
    "device_name": "SCB-901",
    "gas_type": "pH",
    "currentValue": 11.68,
    "avgValue": 11.49,
    "minValue": 11.28,
    "maxValue": 11.7,
    "unit": "pH",
    "status": "ONLINE",
    "lastUpdated": "Just now",
    "location": "Unit 1 - Production Zone 901",
    "aiObservations": "Excessive Caustic Feed. Calibrate Caustic Dosing Pump Feedback Controller",
    "maintenanceHistory": []
  },
  {
    "sensor_id": "SCB-102",
    "device_name": "SCB-102",
    "gas_type": "pH",
    "currentValue": 7.52,
    "avgValue": 8.59,
    "minValue": 0.95,
    "maxValue": 13.9,
    "unit": "pH",
    "status": "ONLINE",
    "lastUpdated": "Just now",
    "location": "Unit 1 - Production Zone 102",
    "aiObservations": "Low Alkali Dosing. Increase Caustic Dosing Pump Output",
    "maintenanceHistory": []
  },
  {
    "sensor_id": "SCB-104",
    "device_name": "SCB-104",
    "gas_type": "pH",
    "currentValue": 12.5,
    "avgValue": 11.34,
    "minValue": 10.35,
    "maxValue": 12.79,
    "unit": "pH",
    "status": "ONLINE",
    "lastUpdated": "Just now",
    "location": "Unit 1 - Production Zone 104",
    "aiObservations": "Excessive Caustic Feed. Calibrate Caustic Dosing Pump Feedback Controller",
    "maintenanceHistory": []
  },
  {
    "sensor_id": "SCB-302",
    "device_name": "SCB-302",
    "gas_type": "pH",
    "currentValue": 6.54,
    "avgValue": 7.62,
    "minValue": 6.08,
    "maxValue": 9.01,
    "unit": "pH",
    "status": "ONLINE",
    "lastUpdated": "Just now",
    "location": "Unit 1 - Production Zone 302",
    "aiObservations": "Low Alkali Dosing. Increase Caustic Dosing Pump Output",
    "maintenanceHistory": []
  },
  {
    "sensor_id": "SCB-606",
    "device_name": "SCB-606",
    "gas_type": "pH",
    "currentValue": 13.28,
    "avgValue": 11.82,
    "minValue": 4.86,
    "maxValue": 13.39,
    "unit": "pH",
    "status": "ONLINE",
    "lastUpdated": "Just now",
    "location": "Unit 1 - Production Zone 606",
    "aiObservations": "Excessive Caustic Feed. Calibrate Caustic Dosing Pump Feedback Controller",
    "maintenanceHistory": []
  },
  {
    "sensor_id": "SCB-103",
    "device_name": "SCB-103",
    "gas_type": "pH",
    "currentValue": 8.81,
    "avgValue": 8.44,
    "minValue": 1.43,
    "maxValue": 14.0,
    "unit": "pH",
    "status": "ONLINE",
    "lastUpdated": "Just now",
    "location": "Unit 1 - Production Zone 103",
    "aiObservations": "Low Alkali Dosing. Increase Caustic Dosing Pump Output",
    "maintenanceHistory": []
  }
];

// Time-series trend generator for Daily (24h), Weekly (7d), and Monthly (30d)
export const generateTrendData = (sensor, filter = 'Daily') => {
  const currentValue = sensor.currentValue;
  const baseAvg = sensor.avgValue || currentValue;
  const min = sensor.minValue || Math.max(0, currentValue - 2);
  const max = sensor.maxValue || currentValue + 5;

  const points = filter === 'Daily' ? 24 : filter === 'Weekly' ? 7 : 30;
  const data = [];

  for (let i = points - 1; i >= 0; i--) {
    let label = '';
    let variance = (Math.sin(i * 0.8) * 0.4) + (Math.cos(i * 0.3) * 0.2);
    
    if (filter === 'Daily') {
      const hour = (new Date().getHours() - i + 24) % 24;
      label = `${hour.toString().padStart(2, '0')}:00`;
    } else if (filter === 'Weekly') {
      const d = new Date();
      d.setDate(d.getDate() - i);
      label = d.toLocaleDateString('en-US', { weekday: 'short' });
    } else {
      const d = new Date();
      d.setDate(d.getDate() - i);
      label = `${d.getMonth() + 1}/${d.getDate()}`;
    }

    // Ensure the last point matches currentValue
    let value = i === 0 ? currentValue : Math.max(min, Math.min(max, +(baseAvg + variance).toFixed(2)));

    data.push({
      time: label,
      value: value,
      warningThreshold: ALERTS_RULES.WARNING_MAX_PPM,
      criticalThreshold: ALERTS_RULES.CRITICAL_MAX_PPM,
    });
  }

  return data;
};

// Initial system alerts dataset following the explicit required rules
export const INITIAL_ALERTS = [];
