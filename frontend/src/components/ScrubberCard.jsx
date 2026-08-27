import React from 'react';
import {
  CheckCircle2,
  AlertTriangle,
  AlertOctagon,
  Clock,
  ArrowRight,
  Wind
} from 'lucide-react';
import { evaluateStatus, getStatusColor, ALERTS_RULES } from '../data/scrubberData';

export default function ScrubberCard({ scrubber, index = 0, onClick }) {
  const status = evaluateStatus(scrubber.currentValue);
  const colorStyle = getStatusColor(status);

  // Status Badge Animation Class getter
  const getBadgeAnimClass = () => {
    switch (status.toLowerCase()) {
      case 'healthy':
        return 'status-badge-healthy';
      case 'warning':
        return 'status-badge-warning';
      case 'critical':
        return 'status-badge-critical';
      default:
        return '';
    }
  };

  // Small status icon getter
  const getStatusIcon = () => {
    switch (status.toLowerCase()) {
      case 'healthy':
        return <CheckCircle2 size={16} color="var(--secondary)" className="icon-hover-scale" />;
      case 'warning':
        return <AlertTriangle size={16} color="var(--accent-warning)" className="icon-hover-scale" />;
      case 'critical':
        return <AlertOctagon size={16} color="var(--accent-danger)" className="icon-hover-scale" />;
      default:
        return <CheckCircle2 size={16} color="var(--text-muted)" className="icon-hover-scale" />;
    }
  };

  return (
    <div
      onClick={() => onClick(scrubber.sensor_id)}
      className="stagger-card btn-interactive"
      style={{
        '--stagger': index,
        background: 'var(--bg-card)',
        border: `1px solid ${colorStyle.border}`,
        borderRadius: '16px',
        padding: '20px',
        cursor: 'pointer',
        position: 'relative',
        overflow: 'hidden',
        boxShadow: 'var(--card-shadow)',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        height: '100%',
        minHeight: '190px'
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = 'translateY(-4px) scale(1.01)';
        e.currentTarget.style.boxShadow = 'var(--card-shadow-hover)';
        e.currentTarget.style.borderColor = colorStyle.text;
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = 'translateY(0) scale(1)';
        e.currentTarget.style.boxShadow = 'var(--card-shadow)';
        e.currentTarget.style.borderColor = colorStyle.border;
      }}
    >
      {/* Top Header Row */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div style={{
            padding: '6px',
            borderRadius: '8px',
            background: 'rgba(21, 101, 192, 0.1)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <Wind size={18} color="var(--primary)" className="icon-hover-scale" />
          </div>
          <div>
            <h3 style={{
              fontSize: '18px',
              fontWeight: 800,
              color: 'var(--text-main)',
              margin: 0,
              fontFamily: 'var(--font-heading)',
              letterSpacing: '0.3px'
            }}>
              {scrubber.device_name}
            </h3>
            <span style={{ fontSize: '11px', color: 'var(--text-dim)', fontWeight: 500 }}>
              {scrubber.location || 'H2S Gas Sensor'}
            </span>
          </div>
        </div>

        {/* Badges Container */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          {/* Health Status Badge */}
          <div
            className={getBadgeAnimClass()}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '5px 10px',
              borderRadius: '20px',
              background: colorStyle.bg,
              border: `1px solid ${colorStyle.border}`,
              color: colorStyle.text,
              fontSize: '12px',
              fontWeight: 700,
              transition: 'all 0.2s ease'
            }}
          >
            {getStatusIcon()}
            <span>{status}</span>
          </div>
        </div>
      </div>

      {/* Center Metric Row */}
      <div style={{
        display: 'flex',
        alignItems: 'baseline',
        justifyContent: 'space-between',
        padding: '12px 14px',
        borderRadius: '12px',
        background: 'var(--bg-main)',
        border: '1px solid var(--border-subtle)',
        margin: 'auto 0 14px 0'
      }}>
        <div>
          <span style={{ fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
            Current {scrubber.gas_type}
          </span>
          <div style={{
            fontSize: '28px',
            fontWeight: 800,
            color: colorStyle.text,
            fontFamily: 'var(--font-mono)',
            lineHeight: '1.1',
            marginTop: '2px',
            transition: 'color 0.3s ease'
          }}>
            {scrubber.currentValue !== undefined ? scrubber.currentValue.toFixed(2) : '0.00'}
          </div>
        </div>

        <div style={{ textAlign: 'right' }}>
          <span style={{ fontSize: '10.5px', color: 'var(--text-dim)' }}>Safe Limit</span>
          <div style={{ fontSize: '12px', color: 'var(--text-main)', fontWeight: 700, fontFamily: 'var(--font-mono)' }}>
            &lt; {ALERTS_RULES.WARNING_MAX_PPM} {scrubber.unit}
          </div>
        </div>
      </div>

      {/* Bottom Footer Row */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        fontSize: '11.5px',
        color: 'var(--text-dim)',
        paddingTop: '8px',
        borderTop: '1px solid var(--border-subtle)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
          {scrubber.isOffline ? (
            <>
              <AlertTriangle size={12} color="var(--accent-danger)" />
              <span style={{ color: 'var(--accent-danger)', fontWeight: 700 }}>Sensor Offline</span>
            </>
          ) : (
            <>
              <Clock size={12} color="var(--text-dim)" />
              <span>Updated {scrubber.lastUpdated || 'Just now'}</span>
            </>
          )}
        </div>

        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '4px',
          color: 'var(--primary)',
          fontWeight: 700
        }}>
          <span>View Details</span>
          <ArrowRight size={13} className="icon-hover-scale" />
        </div>
      </div>
    </div>
  );
}
