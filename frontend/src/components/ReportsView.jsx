import React from 'react';
import { FileBarChart, Printer, Download } from 'lucide-react';
import { evaluateStatus } from '../data/scrubberData';

export default function ReportsView({ scrubbers, alerts }) {
  const healthyCount = scrubbers.filter(s => evaluateStatus(s.currentValue) === 'Healthy').length;
  const totalCount = scrubbers.length;
  const complianceRate = totalCount > 0 ? ((healthyCount / totalCount) * 100).toFixed(1) : '100.0';

  // Print/Export Table PDF Handler (Only prints the table area)
  const handlePrintTable = () => {
    window.print();
  };

  // Download Table CSV Handler (Downloads CSV file containing only the table rows)
  const handleDownloadCSV = () => {
    const headers = ['Sensor ID', 'Current Value', '24h Avg', 'Min', 'Max', 'Compliance Status'];
    const rows = scrubbers.map(s => {
      const status = evaluateStatus(s.currentValue);
      const statusLabel = status === 'Healthy' ? 'Normal' : status === 'Warning' ? 'Moderate' : 'Critical';
      return [
        s.device_name,
        s.currentValue !== undefined ? s.currentValue.toFixed(2) : '0.00',
        s.avgValue !== undefined ? s.avgValue.toFixed(2) : '-',
        s.minValue !== undefined ? s.minValue.toFixed(2) : '-',
        s.maxValue !== undefined ? s.maxValue.toFixed(2) : '-',
        statusLabel
      ];
    });

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `Gas_Sensor_Operations_Summary_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      
      {/* Header Banner */}
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
        <div>
          <h1 style={{
            fontSize: '22px',
            fontWeight: 800,
            color: 'var(--text-main)',
            margin: '0 0 4px 0',
            fontFamily: 'var(--font-heading)',
            display: 'flex',
            alignItems: 'center',
            gap: '10px'
          }}>
            <FileBarChart size={24} color="var(--primary)" />
            <span>Environmental & Gas Compliance Reports</span>
          </h1>
          <p style={{ fontSize: '13px', color: 'var(--text-muted)', margin: 0 }}>
            Audit-ready telemetry compliance summaries for regulatory oversight
          </p>
        </div>

        {/* Export Action Buttons */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
          <button
            onClick={handleDownloadCSV}
            className="btn-interactive"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '10px 16px',
              borderRadius: '10px',
              border: '1px solid var(--secondary)',
              background: 'rgba(46, 125, 50, 0.12)',
              color: 'var(--secondary)',
              fontSize: '13px',
              fontWeight: 700,
              cursor: 'pointer'
            }}
          >
            <Download size={16} />
            <span>Download Table CSV</span>
          </button>

          <button
            onClick={handlePrintTable}
            className="btn-interactive"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '10px 16px',
              borderRadius: '10px',
              border: '1px solid var(--primary)',
              background: 'rgba(21, 101, 192, 0.12)',
              color: 'var(--primary)',
              fontSize: '13px',
              fontWeight: 700,
              cursor: 'pointer'
            }}
          >
            <Printer size={16} />
            <span>Export Table PDF</span>
          </button>
        </div>
      </div>

      {/* Compliance Metrics Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '16px' }}>
        <div style={{ padding: '20px', borderRadius: '14px', background: 'var(--bg-card)', border: '1px solid rgba(46, 125, 50, 0.3)', boxShadow: 'var(--card-shadow)' }}>
          <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Environmental Compliance Rate</span>
          <div style={{ fontSize: '32px', fontWeight: 800, color: 'var(--secondary)', fontFamily: 'var(--font-mono)', marginTop: '4px' }}>
            {complianceRate}%
          </div>
          <span style={{ fontSize: '11px', color: 'var(--text-dim)' }}>Target: ≥ 98.0%</span>
        </div>

        <div style={{ padding: '20px', borderRadius: '14px', background: 'var(--bg-card)', border: '1px solid var(--border-color)', boxShadow: 'var(--card-shadow)' }}>
          <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Sensors Monitored</span>
          <div style={{ fontSize: '32px', fontWeight: 800, color: 'var(--text-main)', fontFamily: 'var(--font-mono)', marginTop: '4px' }}>
            {totalCount} Units
          </div>
          <span style={{ fontSize: '11px', color: 'var(--text-dim)' }}>Continuous CEMS Feed</span>
        </div>

        <div style={{ padding: '20px', borderRadius: '14px', background: 'var(--bg-card)', border: '1px solid rgba(220, 38, 38, 0.3)', boxShadow: 'var(--card-shadow)' }}>
          <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Registered Anomalies (24h)</span>
          <div style={{ fontSize: '32px', fontWeight: 800, color: 'var(--accent-danger)', fontFamily: 'var(--font-mono)', marginTop: '4px' }}>
            {alerts.length} Incidents
          </div>
          <span style={{ fontSize: '11px', color: 'var(--text-dim)' }}>All logged to audit trail</span>
        </div>
      </div>

      {/* Sensor Status Summary Table (PRINTABLE AREA ONLY) */}
      <div
        className="printable-table-area"
        style={{
          borderRadius: '16px',
          background: 'var(--bg-card)',
          border: '1px solid var(--border-color)',
          overflow: 'hidden',
          boxShadow: 'var(--card-shadow)'
        }}
      >
        <div style={{
          padding: '16px 20px',
          borderBottom: '1px solid var(--border-subtle)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '10px'
        }}>
          <div>
            <div style={{ fontWeight: 800, color: 'var(--text-main)', fontSize: '16px', fontFamily: 'var(--font-heading)' }}>
              Daily Gas Sensor Operations Summary
            </div>
            <div style={{ fontSize: '11.5px', color: 'var(--text-muted)', marginTop: '2px' }}>
              Industrial Sensor CEMS Telemetry Summary Report • Generated {new Date().toLocaleDateString()}
            </div>
          </div>

          <button
            onClick={handleDownloadCSV}
            className="btn-interactive"
            style={{
              padding: '6px 12px',
              borderRadius: '8px',
              background: 'rgba(21, 101, 192, 0.1)',
              border: '1px solid rgba(21, 101, 192, 0.3)',
              color: 'var(--primary)',
              fontSize: '12px',
              fontWeight: 700,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}
          >
            <Download size={14} />
            <span>CSV</span>
          </button>
        </div>

        <div style={{ overflowX: 'auto', maxHeight: '700px' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '13px' }}>
            <thead>
              <tr style={{
                position: 'sticky',
                top: 0,
                zIndex: 5,
                background: 'var(--bg-main)',
                color: 'var(--text-muted)',
                borderBottom: '1px solid var(--border-subtle)',
                fontSize: '11.5px',
                fontWeight: 700,
                letterSpacing: '0.5px',
                textTransform: 'uppercase'
              }}>
                <th style={{ padding: '14px 18px' }}>Sensor ID</th>
                <th style={{ padding: '14px 18px' }}>Current Value</th>
                <th style={{ padding: '14px 18px' }}>24h Avg</th>
                <th style={{ padding: '14px 18px' }}>Min</th>
                <th style={{ padding: '14px 18px' }}>Max</th>
                <th style={{ padding: '14px 18px' }}>Compliance Status</th>
              </tr>
            </thead>
          <tbody>
            {scrubbers.map((s, idx) => {
              const status = evaluateStatus(s.currentValue);
              return (
                <tr key={s.sensor_id} className="animate-row" style={{ '--row-index': idx, borderBottom: '1px solid var(--border-subtle)' }}>
                  <td style={{ padding: '12px 18px', fontWeight: 800, color: 'var(--text-main)', fontFamily: 'var(--font-mono)' }}>{s.device_name}</td>
                  <td style={{ padding: '12px 18px', fontWeight: 700, fontFamily: 'var(--font-mono)' }}>
                    {s.currentValue !== undefined ? s.currentValue.toFixed(2) : '0.00'}
                  </td>
                  <td style={{ padding: '12px 18px', fontFamily: 'var(--font-mono)', color: 'var(--text-muted)' }}>{s.avgValue !== undefined ? s.avgValue.toFixed(2) : '-'}</td>
                  <td style={{ padding: '12px 18px', fontFamily: 'var(--font-mono)', color: 'var(--text-dim)' }}>{s.minValue !== undefined ? s.minValue.toFixed(2) : '-'}</td>
                  <td style={{ padding: '12px 18px', fontFamily: 'var(--font-mono)', color: 'var(--text-dim)' }}>{s.maxValue !== undefined ? s.maxValue.toFixed(2) : '-'}</td>
                  <td style={{ padding: '12px 18px' }}>
                    <span style={{
                      padding: '4px 10px',
                      borderRadius: '12px',
                      fontSize: '11px',
                      fontWeight: 700,
                      color: status === 'Healthy' ? 'var(--secondary)' : status === 'Warning' ? 'var(--accent-warning)' : 'var(--accent-danger)',
                      background: status === 'Healthy' ? 'rgba(46, 125, 50, 0.12)' : status === 'Warning' ? 'rgba(217, 119, 6, 0.12)' : 'rgba(220, 38, 38, 0.12)',
                      border: status === 'Healthy' ? '1px solid rgba(46, 125, 50, 0.3)' : status === 'Warning' ? '1px solid rgba(217, 119, 6, 0.3)' : '1px solid rgba(220, 38, 38, 0.3)'
                    }}>
                      {status === 'Healthy' ? 'Normal' : status === 'Warning' ? 'Moderate' : 'Critical'}
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>

  </div>
);
}
