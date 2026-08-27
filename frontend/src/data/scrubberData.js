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
    sensor_id: 2,
    device_name: 'Uniphos 500DT',
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
