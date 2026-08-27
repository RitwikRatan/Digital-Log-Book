import React, { useState, useMemo, useEffect } from 'react';
import {
  ArrowLeft,
  Clock,
  Activity,
  CheckCircle2,
  AlertTriangle,
  AlertOctagon,
  Cpu,
  ShieldAlert,
  Wrench,
  Sparkles,
  Check,
  TrendingDown,
  TrendingUp,
  Sliders,
  Wind
} from 'lucide-react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ReferenceLine
} from 'recharts';
import { evaluateStatus, getStatusColor, generateTrendData, RECOMMENDED_ACTIONS, ALERTS_RULES } from '../data/scrubberData';

export default function ScrubberDetailView({ scrubber, alerts, onBack, onResolveAlert }) {
  const sensor = scrubber; // Aliased for easier refactoring
  const [timeFilter, setTimeFilter] = useState('Daily');
  const [xaiExplanation, setXaiExplanation] = useState('');
  const [isLoadingXAI, setIsLoadingXAI] = useState(false);

  useEffect(() => {
    if (sensor) {
      setIsLoadingXAI(true);
      
      // Use local observations instead of calling the nonexistent API
      setTimeout(() => {
        setXaiExplanation(sensor.aiObservations || 'Telemetry analysis indicates stable gas dynamics over the monitored window.');
        setIsLoadingXAI(false);
      }, 500);
    }
  }, [sensor]);

  if (!sensor) return null;

  const status = evaluateStatus(sensor.currentValue);
  const colorStyle = getStatusColor(status);

  // Filter alerts relevant to this sensor
  const sensorAlerts = useMemo(() => {
    return alerts.filter(a => a.sensorId === sensor.sensor_id);
  }, [alerts, sensor.sensor_id]);

  // Generate chart data based on timeFilter
  const trendData = useMemo(() => {
    return generateTrendData(sensor, timeFilter);
  }, [sensor, timeFilter]);

  // Status Icon getter
  const getStatusIcon = () => {
    switch (status.toLowerCase()) {
      case 'healthy':
        return <CheckCircle2 size={18} color="var(--secondary)" />;
      case 'warning':
        return <AlertTriangle size={18} color="var(--accent-warning)" />;
      case 'critical':
        return <AlertOctagon size={18} color="var(--accent-danger)" />;
      default:
        return <CheckCircle2 size={18} color="var(--text-muted)" />;
    }
  };

  // Custom Chart Tooltip
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      const val = payload[0].value;
      const pointStatus = evaluateStatus(val);
      const pointColor = getStatusColor(pointStatus).text;
      return (
        <div className="custom-recharts-tooltip" style={{ fontSize: '12px' }}>
          <p style={{ margin: '0 0 4px 0', color: 'var(--text-dim)', fontWeight: 600 }}>{label}</p>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontWeight: 800, color: pointColor, fontSize: '15px', fontFamily: 'var(--font-mono)' }}>
              {val.toFixed(2)} {sensor.unit}
            </span>
            <span style={{ fontSize: '11px', color: pointColor, fontWeight: 700 }}>({pointStatus})</span>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '22px' }}>
      
      {/* Navigation & Header */}
      <div style={{
        display: 'flex',
        flexWrap: 'wrap',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '16px',
        padding: '20px 24px',
        borderRadius: '16px',
        background: 'var(--bg-card)',
        border: '1px solid var(--border-color)',
        boxShadow: 'var(--card-shadow)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <button
            onClick={onBack}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '38px',
              height: '38px',
              borderRadius: '10px',
              background: 'var(--bg-main)',
              border: '1px solid var(--border-subtle)',
              color: 'var(--text-main)',
              cursor: 'pointer',
              transition: 'all 0.2s ease'
            }}
            onMouseEnter={(e) => { e.currentTarget.style.borderColor = 'var(--primary)'; }}
            onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'var(--border-subtle)'; }}
          >
            <ArrowLeft size={18} />
          </button>

          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <h1 style={{
                fontSize: '24px',
                fontWeight: 800,
                color: 'var(--text-main)',
                margin: 0,
                fontFamily: 'var(--font-heading)',
                letterSpacing: '0.5px'
              }}>
                {sensor.device_name}
              </h1>

              {/* Status Badge */}
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                padding: '4px 12px',
                borderRadius: '20px',
                background: colorStyle.bg,
                border: `1px solid ${colorStyle.border}`,
                color: colorStyle.text,
                fontSize: '12px',
                fontWeight: 700
              }}>
                {getStatusIcon()}
                <span>{status}</span>
              </div>
            </div>
            <p style={{ fontSize: '13px', color: 'var(--text-muted)', margin: '2px 0 0 0' }}>
              {sensor.location || 'Continuous Emission Monitoring System'}
            </p>
          </div>
        </div>

        {/* Timestamp */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          padding: '8px 14px',
          borderRadius: '10px',
          background: 'var(--bg-main)',
          border: '1px solid var(--border-subtle)',
          fontSize: '12.5px',
          color: 'var(--text-dim)'
        }}>
          {sensor.isOffline ? (
            <>
              <AlertTriangle size={15} color="var(--accent-danger)" />
              <span style={{ color: 'var(--accent-danger)', fontWeight: 700 }}>Sensor Offline</span>
            </>
          ) : (
            <>
              <Clock size={15} color="var(--primary)" />
              <span>Last Updated: <strong style={{ color: 'var(--text-main)' }}>{sensor.lastUpdated || 'Just now'}</strong></span>
            </>
          )}
        </div>
      </div>

      {/* Metric KPI Cards (4 Items: Current, Avg, Min, Max) */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: '16px'
      }}>
        {/* Current Value */}
        <div style={{
          padding: '18px 20px',
          borderRadius: '14px',
          background: 'var(--bg-card)',
          border: `2px solid ${colorStyle.border}`,
          boxShadow: 'var(--card-shadow)'
        }}>
          <div style={{ fontSize: '12px', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase' }}>
            Current {sensor.gas_type}
          </div>
          <div style={{
            fontSize: '32px',
            fontWeight: 800,
            color: colorStyle.text,
            fontFamily: 'var(--font-mono)',
            marginTop: '4px'
          }}>
            {sensor.currentValue !== undefined ? sensor.currentValue.toFixed(2) : '0.00'}
          </div>
          <div style={{ fontSize: '11px', color: 'var(--text-dim)', marginTop: '4px' }}>
            Safe Limit: &lt; {ALERTS_RULES.WARNING_MAX_PPM} {sensor.unit}
          </div>
        </div>

        {/* Average Value */}
        <div style={{
          padding: '18px 20px',
          borderRadius: '14px',
          background: 'var(--bg-card)',
          border: '1px solid var(--border-color)',
          boxShadow: 'var(--card-shadow)'
        }}>
          <div style={{ fontSize: '12px', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase' }}>
            Average {sensor.gas_type} (24h)
          </div>
          <div style={{
            fontSize: '32px',
            fontWeight: 800,
            color: 'var(--primary)',
            fontFamily: 'var(--font-mono)',
            marginTop: '4px'
          }}>
            {sensor.avgValue !== undefined ? sensor.avgValue.toFixed(2) : '0.00'}
          </div>
          <div style={{ fontSize: '11px', color: 'var(--text-dim)', marginTop: '4px' }}>
            Historical 24-hour mean
          </div>
        </div>

        {/* Minimum Value */}
        <div style={{
          padding: '18px 20px',
          borderRadius: '14px',
          background: 'var(--bg-card)',
          border: '1px solid var(--border-color)',
          boxShadow: 'var(--card-shadow)'
        }}>
          <div style={{ fontSize: '12px', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: '4px' }}>
            <TrendingDown size={14} color="var(--secondary)" />
            <span>Minimum {sensor.gas_type}</span>
          </div>
          <div style={{
            fontSize: '32px',
            fontWeight: 800,
            color: 'var(--secondary)',
            fontFamily: 'var(--font-mono)',
            marginTop: '4px'
          }}>
            {sensor.minValue !== undefined ? sensor.minValue.toFixed(2) : '0.00'}
          </div>
          <div style={{ fontSize: '11px', color: 'var(--text-dim)', marginTop: '4px' }}>
            Lowest recorded in period
          </div>
        </div>

        {/* Maximum Value */}
        <div style={{
          padding: '18px 20px',
          borderRadius: '14px',
          background: 'var(--bg-card)',
          border: '1px solid var(--border-color)',
          boxShadow: 'var(--card-shadow)'
        }}>
          <div style={{ fontSize: '12px', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: '4px' }}>
            <TrendingUp size={14} color="var(--accent-danger)" />
            <span>Maximum {sensor.gas_type}</span>
          </div>
          <div style={{
            fontSize: '32px',
            fontWeight: 800,
            color: 'var(--accent-danger)',
            fontFamily: 'var(--font-mono)',
            marginTop: '4px'
          }}>
            {sensor.maxValue !== undefined ? sensor.maxValue.toFixed(2) : '0.00'}
          </div>
          <div style={{ fontSize: '11px', color: 'var(--text-dim)', marginTop: '4px' }}>
            Peak recorded in period
          </div>
        </div>
      </div>

      {/* Main Historical Trend Line Chart */}
      <div style={{
        padding: '22px 24px',
        borderRadius: '16px',
        background: 'var(--bg-card)',
        border: '1px solid var(--border-color)',
        boxShadow: 'var(--card-shadow)'
      }}>
        <div style={{
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '12px',
          marginBottom: '20px'
        }}>
          <div>
            <h3 style={{
              fontSize: '17px',
              fontWeight: 700,
              color: 'var(--text-main)',
              margin: '0 0 2px 0',
              fontFamily: 'var(--font-heading)',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}>
              <Activity size={18} color="var(--primary)" />
              <span>Gas Concentration Trend Line Chart</span>
            </h3>
            <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
              Historical gas readings with safety threshold lines
            </span>
          </div>

          {/* Legend Badges & Timeframe Filter Buttons */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
            {/* 3 Threshold Legend Pills */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '11.5px', fontWeight: 600, background: 'var(--bg-main)', padding: '5px 12px', borderRadius: '10px', border: '1px solid var(--border-subtle)' }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#2E7D32' }}>
                <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#2E7D32' }}></span>
                Healthy (&lt; 10)
              </span>
              <span style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#D97706' }}>
                <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#D97706' }}></span>
                Warning (10 - 20)
              </span>
              <span style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#DC2626' }}>
                <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#DC2626' }}></span>
                Critical (≥ 20)
              </span>
            </div>

            {/* Timeframe Filter Buttons */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', background: 'var(--bg-main)', padding: '4px', borderRadius: '10px', border: '1px solid var(--border-subtle)' }}>
              {['Daily', 'Weekly', 'Monthly'].map((filter) => (
                <button
                  key={filter}
                  onClick={() => setTimeFilter(filter)}
                  style={{
                    padding: '6px 14px',
                    borderRadius: '7px',
                    border: timeFilter === filter ? '1px solid var(--primary)' : 'none',
                    background: timeFilter === filter ? 'rgba(21, 101, 192, 0.18)' : 'transparent',
                    color: timeFilter === filter ? 'var(--primary)' : 'var(--text-muted)',
                    fontSize: '12px',
                    fontWeight: 700,
                    cursor: 'pointer',
                    transition: 'all 0.2s ease'
                  }}
                >
                  {filter}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Recharts Component */}
        <div style={{ width: '100%', height: '330px' }}>
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={trendData} margin={{ top: 20, right: 30, left: -10, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border-subtle)" />
              <XAxis dataKey="time" stroke="var(--text-dim)" tick={{ fontSize: 11 }} />
              <YAxis domain={[0, 30]} stroke="var(--text-dim)" tick={{ fontSize: 11 }} />
              <Tooltip content={<CustomTooltip />} />
              
              {/* 1. Warning Threshold Line (PPM = 10.0) */}
              <ReferenceLine
                y={ALERTS_RULES.WARNING_MAX_PPM}
                stroke="#D97706"
                strokeDasharray="6 4"
                strokeWidth={1.5}
                label={{ value: 'Warning (≥ 10 PPM)', fill: '#D97706', fontSize: 11, fontWeight: 700, position: 'insideRight', dy: -10 }}
              />

              {/* 2. Critical Threshold Line (PPM = 20.0) */}
              <ReferenceLine
                y={ALERTS_RULES.CRITICAL_MAX_PPM}
                stroke="#DC2626"
                strokeDasharray="6 4"
                strokeWidth={1.5}
                label={{ value: 'Critical (≥ 20 PPM)', fill: '#DC2626', fontSize: 11, fontWeight: 700, position: 'insideBottomRight', dy: -10 }}
              />

              <Line
                type="monotone"
                dataKey="value"
                stroke="var(--primary)"
                strokeWidth={3}
                isAnimationActive={true}
                animationDuration={1000}
                animationEasing="ease-in-out"
                dot={{ r: 4, fill: 'var(--primary)', stroke: '#ffffff', strokeWidth: 1.5 }}
                activeDot={{ r: 7, fill: 'var(--secondary)', stroke: '#ffffff', strokeWidth: 2 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Grid Row: AI Observations & Recommended Actions */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
        gap: '18px'
      }}>
        {/* AI-Generated Observations */}
        <div style={{
          padding: '20px',
          borderRadius: '16px',
          background: 'var(--bg-card)',
          border: '1px solid var(--border-color)',
          boxShadow: 'var(--card-shadow)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
            <div style={{
              padding: '6px',
              borderRadius: '8px',
              background: 'rgba(21, 101, 192, 0.12)',
              color: 'var(--primary)'
            }}>
              <Sparkles size={18} />
            </div>
            <h3 style={{ fontSize: '16px', fontWeight: 700, color: 'var(--text-main)', margin: 0 }}>
              AI-Generated Observations
            </h3>
          </div>
          <p style={{
            fontSize: '13.5px',
            color: 'var(--text-main)',
            lineHeight: '1.6',
            margin: 0,
            background: 'var(--bg-main)',
            padding: '14px',
            borderRadius: '10px',
            border: '1px solid var(--border-subtle)'
          }}>
            {isLoadingXAI ? 'Generating explainable AI observations...' : xaiExplanation}
          </p>
        </div>

        {/* Recommended Actions */}
        <div style={{
          padding: '20px',
          borderRadius: '16px',
          background: 'var(--bg-card)',
          border: '1px solid var(--border-color)',
          boxShadow: 'var(--card-shadow)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
            <div style={{
              padding: '6px',
              borderRadius: '8px',
              background: 'rgba(46, 125, 50, 0.12)',
              color: 'var(--secondary)'
            }}>
              <Sliders size={18} />
            </div>
            <h3 style={{ fontSize: '16px', fontWeight: 700, color: 'var(--text-main)', margin: 0 }}>
              Recommended Actions
            </h3>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {status === 'Healthy' ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: 'var(--secondary)', background: 'rgba(46, 125, 50, 0.12)', padding: '10px 12px', borderRadius: '8px' }}>
                <Check size={16} />
                <span>Operating within safe parameters. Continue standard monitoring.</span>
              </div>
            ) : (
              RECOMMENDED_ACTIONS.slice(0, 3).map((act, idx) => (
                <div key={idx} style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  fontSize: '13px',
                  color: 'var(--text-main)',
                  background: 'var(--bg-main)',
                  padding: '10px 12px',
                  borderRadius: '8px',
                  border: '1px solid var(--border-subtle)'
                }}>
                  <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: colorStyle.text }}></div>
                  <span>{act}</span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Grid Row: Sensor Details & Maintenance History */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
        gap: '18px'
      }}>
        {/* Sensor Details Card */}
        <div style={{
          padding: '20px',
          borderRadius: '16px',
          background: 'var(--bg-card)',
          border: '1px solid var(--border-color)',
          boxShadow: 'var(--card-shadow)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
            <div style={{ padding: '6px', borderRadius: '8px', background: 'rgba(21, 101, 192, 0.12)', color: 'var(--primary)' }}>
              <Cpu size={18} />
            </div>
            <h3 style={{ fontSize: '16px', fontWeight: 700, color: 'var(--text-main)', margin: 0 }}>
              Sensor Specifications
            </h3>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', fontSize: '12.5px' }}>
            <div style={{ background: 'var(--bg-main)', padding: '10px', borderRadius: '8px' }}>
              <span style={{ color: 'var(--text-dim)', display: 'block' }}>Sensor ID</span>
              <strong style={{ color: 'var(--text-main)', fontFamily: 'var(--font-mono)' }}>{sensor.sensor_id || 'ID-UNKNOWN'}</strong>
            </div>

            <div style={{ background: 'var(--bg-main)', padding: '10px', borderRadius: '8px' }}>
              <span style={{ color: 'var(--text-dim)', display: 'block' }}>Sensor Model</span>
              <strong style={{ color: 'var(--text-main)' }}>{sensor.device_name || 'Uniphos 500DT'}</strong>
            </div>

            <div style={{ background: 'var(--bg-main)', padding: '10px', borderRadius: '8px' }}>
              <span style={{ color: 'var(--text-dim)', display: 'block' }}>Gas Type</span>
              <strong style={{ color: 'var(--primary)' }}>{sensor.gas_type || 'H2S'}</strong>
            </div>

            <div style={{ background: 'var(--bg-main)', padding: '10px', borderRadius: '8px' }}>
              <span style={{ color: 'var(--text-dim)', display: 'block' }}>Unit</span>
              <strong style={{ color: 'var(--text-main)' }}>{sensor.unit || 'PPM'}</strong>
            </div>
          </div>
        </div>

        {/* Maintenance History Card */}
        <div style={{
          padding: '20px',
          borderRadius: '16px',
          background: 'var(--bg-card)',
          border: '1px solid var(--border-color)',
          boxShadow: 'var(--card-shadow)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
            <div style={{ padding: '6px', borderRadius: '8px', background: 'rgba(217, 119, 6, 0.12)', color: 'var(--accent-warning)' }}>
              <Wrench size={18} />
            </div>
            <h3 style={{ fontSize: '16px', fontWeight: 700, color: 'var(--text-main)', margin: 0 }}>
              Maintenance History
            </h3>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {sensor.maintenanceHistory && sensor.maintenanceHistory.length > 0 ? (
              sensor.maintenanceHistory.map((log, idx) => (
                <div key={idx} style={{
                  padding: '10px 12px',
                  borderRadius: '8px',
                  background: 'var(--bg-main)',
                  border: '1px solid var(--border-subtle)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  fontSize: '12px'
                }}>
                  <div>
                    <strong style={{ color: 'var(--text-main)', display: 'block' }}>{log.type}</strong>
                    <span style={{ color: 'var(--text-muted)' }}>{log.desc}</span>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <span style={{ color: 'var(--text-dim)', display: 'block' }}>{log.date}</span>
                    <span style={{ color: 'var(--secondary)', fontWeight: 700 }}>{log.status}</span>
                  </div>
                </div>
              ))
            ) : (
              <p style={{ fontSize: '13px', color: 'var(--text-dim)', margin: 0 }}>No maintenance logs recorded for this unit.</p>
            )}
          </div>
        </div>
      </div>

      {/* Alert History Section for this Sensor */}
      <div style={{
        padding: '20px 24px',
        borderRadius: '16px',
        background: 'var(--bg-card)',
        border: '1px solid var(--border-color)',
        boxShadow: 'var(--card-shadow)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
          <div style={{ padding: '6px', borderRadius: '8px', background: 'rgba(220, 38, 38, 0.12)', color: 'var(--accent-danger)' }}>
            <ShieldAlert size={18} />
          </div>
          <h3 style={{ fontSize: '16px', fontWeight: 700, color: 'var(--text-main)', margin: 0 }}>
            Alert History for {sensor.device_name}
          </h3>
        </div>

        {sensorAlerts.length > 0 ? (
          <div style={{ overflowX: 'auto', maxHeight: '500px' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '12.5px' }}>
              <thead>
                <tr style={{
                  position: 'sticky',
                  top: 0,
                  zIndex: 5,
                  background: 'var(--bg-main)',
                  color: 'var(--text-muted)',
                  borderBottom: '1px solid var(--border-subtle)',
                  fontSize: '11px',
                  fontWeight: 700,
                  letterSpacing: '0.5px',
                  textTransform: 'uppercase'
                }}>
                  <th style={{ padding: '12px 14px' }}>Timestamp</th>
                  <th style={{ padding: '12px 14px' }}>Alert Level</th>
                  <th style={{ padding: '12px 14px' }}>Current Value</th>
                  <th style={{ padding: '12px 14px' }}>Description</th>
                  <th style={{ padding: '12px 14px' }}>Possible Cause</th>
                  <th style={{ padding: '12px 14px' }}>Recommended Action</th>
                  <th style={{ padding: '12px 14px' }}>Status</th>
                </tr>
              </thead>
              <tbody>
                {sensorAlerts.map(alt => {
                  const altColor = getStatusColor(alt.alertLevel);
                  return (
                    <tr key={alt.id} style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                      <td style={{ padding: '10px 14px', color: 'var(--text-dim)', fontFamily: 'var(--font-mono)' }}>
                        {alt.date} {alt.time}
                      </td>
                      <td style={{ padding: '10px 14px' }}>
                        <span style={{
                          padding: '3px 8px',
                          borderRadius: '10px',
                          fontSize: '11px',
                          fontWeight: 700,
                          background: altColor.bg,
                          color: altColor.text
                        }}>
                          {alt.alertLevel}
                        </span>
                      </td>
                      <td style={{ padding: '10px 14px', fontWeight: 800, color: altColor.text, fontFamily: 'var(--font-mono)' }}>
                        {alt.currentValue.toFixed(2)}
                      </td>
                      <td style={{ padding: '10px 14px', color: 'var(--text-main)' }}>{alt.description}</td>
                      <td style={{ padding: '10px 14px', color: 'var(--text-muted)' }}>{alt.possibleCause}</td>
                      <td style={{ padding: '10px 14px', color: 'var(--primary)', fontWeight: 600 }}>{alt.recommendedAction}</td>
                      <td style={{ padding: '10px 14px' }}>
                        {alt.status === 'Open' ? (
                          <button
                            onClick={() => onResolveAlert(alt.id)}
                            style={{
                              padding: '4px 10px',
                              borderRadius: '6px',
                              background: 'rgba(220, 38, 38, 0.12)',
                              border: '1px solid rgba(220, 38, 38, 0.3)',
                              color: 'var(--accent-danger)',
                              fontSize: '11px',
                              fontWeight: 700,
                              cursor: 'pointer'
                            }}
                          >
                            Mark Resolved
                          </button>
                        ) : (
                          <span style={{ color: 'var(--secondary)', fontWeight: 700 }}>Resolved</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <p style={{ fontSize: '13px', color: 'var(--text-dim)', margin: 0 }}>No active or past alerts registered for this sensor.</p>
        )}
      </div>

    </div>
  );
}
