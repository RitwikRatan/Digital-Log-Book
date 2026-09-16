import React, { useState, useEffect, useMemo } from 'react';
import { FileText, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-react';
import logoImg from '../assets/logo.png';
import * as XLSX from 'xlsx';

export default function LogSheetView() {
  const [logSheet, setLogSheet] = useState('SC-126');
  
  const today = new Date();
  const pastDate = new Date();
  pastDate.setDate(today.getDate() - 2);

  const [fromDate, setFromDate] = useState(pastDate.toISOString().split('T')[0]);
  const [toDate, setToDate] = useState(today.toISOString().split('T')[0]);
  const [startHour, setStartHour] = useState('12');
  const [startMinute, setStartMinute] = useState('00');
  const [startAmPm, setStartAmPm] = useState('AM');
  const [frequency, setFrequency] = useState('30');

  const [readings, setReadings] = useState([]);
  const [loading, setLoading] = useState(true);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  
  // Filter toggle state
  const [applyFilters, setApplyFilters] = useState(false);

  const fetchReadings = async () => {
    try {
      const response = await fetch('http://localhost:8000/readings/?limit=500'); // Fetch enough for local filtering
      if (response.ok) {
        const data = await response.json();
        setReadings(data);
      }
    } catch (error) {
      console.error('Error fetching readings:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReadings();
    const interval = setInterval(fetchReadings, 10000); // Poll every 10 seconds
    return () => clearInterval(interval);
  }, []);

  // Filter logic
  const filteredReadings = useMemo(() => {
    if (!applyFilters) return readings;
    
    let hour24 = parseInt(startHour, 10);
    if (startAmPm === 'AM' && hour24 === 12) hour24 = 0;
    if (startAmPm === 'PM' && hour24 !== 12) hour24 += 12;
    const timeStr = `${hour24.toString().padStart(2, '0')}:${startMinute}:00`;
    
    const fromTime = new Date(`${fromDate}T${timeStr}`).getTime();
    const toTime = new Date(`${toDate}T23:59:59`).getTime();
    
    return readings.filter(r => {
      const rTime = new Date(r.timestamp).getTime();
      return rTime >= fromTime && rTime <= toTime;
    });
  }, [readings, applyFilters, fromDate, startHour, startMinute, startAmPm, toDate]);

  // Pagination logic
  const totalPages = Math.ceil(filteredReadings.length / itemsPerPage) || 1;
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedReadings = filteredReadings.slice(startIndex, startIndex + itemsPerPage);

  const handlePageChange = (page) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  const handleItemsPerPageChange = (e) => {
    setItemsPerPage(Number(e.target.value));
    setCurrentPage(1);
  };

  const handleSubmitFilters = () => {
    setApplyFilters(true);
    setCurrentPage(1); // Reset to first page on new filter
  };
  
  const handleClearFilters = () => {
    setApplyFilters(false);
    setCurrentPage(1);
  };

  const handleExportExcel = () => {
    const exportData = filteredReadings.map(r => ({
      Date: new Date(r.timestamp).toLocaleDateString(),
      Time: new Date(r.timestamp).toLocaleTimeString(),
      'Sensor ID': r.sensor_id,
      'Device Name': r.device_name,
      'Gas Type': r.gas_type,
      'Value (ppm)': r.value !== null ? r.value : '---',
      Status: r.status
    }));
    
    const worksheet = XLSX.utils.json_to_sheet(exportData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Log Sheet");
    XLSX.writeFile(workbook, `Digital_Log_Sheet_${new Date().toISOString().split('T')[0]}.xlsx`);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', fontFamily: 'var(--font-sans)', color: 'var(--text-main)', width: '100%' }}>
      
      {/* Title */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
        <h1 style={{ fontSize: '24px', fontWeight: 500, margin: 0, letterSpacing: '0.5px' }}>
          Log Sheet Generation
        </h1>
        {applyFilters && (
          <button 
            onClick={handleClearFilters}
            style={{ padding: '6px 12px', background: '#f5f5f5', border: '1px solid #ccc', borderRadius: '4px', cursor: 'pointer', fontSize: '13px' }}>
            Clear Filters
          </button>
        )}
      </div>

      {/* Top Filter Bar */}
      <div style={{
        display: 'flex',
        alignItems: 'flex-end',
        gap: '12px',
        padding: '16px 0',
        borderTop: '1px solid #e0e0e0',
        borderBottom: '1px solid #e0e0e0',
        marginBottom: '32px',
        flexWrap: 'nowrap',
        overflowX: 'auto',
        minWidth: 'min-content'
      }}>
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', width: '180px', flexShrink: 0 }}>
          <label style={{ fontSize: '12px', color: '#555' }}>Select Log Sheet</label>
          <select 
            value={logSheet}
            onChange={(e) => setLogSheet(e.target.value)}
            style={{ padding: '8px 12px', border: '1px solid #bdbdbd', fontSize: '13px', outline: 'none', background: '#fff' }}
          >
            <option value="SC-126">SC-126 (Gas Analyzer)</option>
            <option value="SC-127">SC-127 (Future)</option>
          </select>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', width: '150px', flexShrink: 0 }}>
          <label style={{ fontSize: '12px', color: '#555' }}>From</label>
          <input 
            type="date" 
            value={fromDate}
            onChange={(e) => setFromDate(e.target.value)}
            style={{ padding: '7px 12px', border: '1px solid #bdbdbd', fontSize: '13px', outline: 'none' }}
          />
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', width: '150px', flexShrink: 0 }}>
          <label style={{ fontSize: '12px', color: '#555' }}>To</label>
          <input 
            type="date" 
            value={toDate}
            onChange={(e) => setToDate(e.target.value)}
            style={{ padding: '7px 12px', border: '1px solid #bdbdbd', fontSize: '13px', outline: 'none' }}
          />
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', width: '200px', flexShrink: 0 }}>
          <label style={{ fontSize: '12px', color: '#555' }}>Start Time</label>
          <div style={{ display: 'flex', border: '1px solid #bdbdbd', borderRadius: '4px', background: '#fff', overflow: 'hidden' }}>
            <select 
              value={startHour}
              onChange={(e) => setStartHour(e.target.value)}
              style={{ padding: '7px 8px', border: 'none', borderRight: '1px solid #e0e0e0', fontSize: '13px', outline: 'none', background: 'transparent', flex: 1, appearance: 'none', textAlign: 'center', cursor: 'pointer' }}
            >
              {Array.from({length: 12}, (_, i) => i + 1).map(h => (
                <option key={h} value={h.toString().padStart(2, '0')}>{h.toString().padStart(2, '0')}</option>
              ))}
            </select>
            <div style={{ padding: '7px 4px', color: '#555', background: '#f5f5f5', display: 'flex', alignItems: 'center' }}>:</div>
            <select 
              value={startMinute}
              onChange={(e) => setStartMinute(e.target.value)}
              style={{ padding: '7px 8px', border: 'none', borderLeft: '1px solid #e0e0e0', borderRight: '1px solid #e0e0e0', fontSize: '13px', outline: 'none', background: 'transparent', flex: 1, appearance: 'none', textAlign: 'center', cursor: 'pointer' }}
            >
              {Array.from({length: 60}, (_, i) => i).map(m => (
                <option key={m} value={m.toString().padStart(2, '0')}>{m.toString().padStart(2, '0')}</option>
              ))}
            </select>
            <select 
              value={startAmPm}
              onChange={(e) => setStartAmPm(e.target.value)}
              style={{ padding: '7px 8px', border: 'none', fontSize: '13px', outline: 'none', background: '#f9f9f9', flex: 1, fontWeight: 500, color: '#1976d2', cursor: 'pointer' }}
            >
              <option value="AM">AM</option>
              <option value="PM">PM</option>
            </select>
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', width: '140px', flexShrink: 0 }}>
          <label style={{ fontSize: '12px', color: '#555' }}>Frequency</label>
          <select 
            value={frequency}
            onChange={(e) => setFrequency(e.target.value)}
            style={{ padding: '8px 12px', border: '1px solid #bdbdbd', fontSize: '13px', outline: 'none', background: '#fff', borderRadius: '4px' }}
          >
            <option value="5">5 Mins</option>
            <option value="15">15 Mins</option>
            <option value="30">30 Mins</option>
            <option value="60">1 Hour</option>
            <option value="120">2 Hours</option>
          </select>
        </div>

        <button 
          onClick={handleSubmitFilters}
          style={{
            background: '#1976d2',
            color: '#fff',
            border: 'none',
            padding: '9px 24px',
            fontWeight: 600,
            cursor: 'pointer',
            height: '35px',
            flexShrink: 0,
            fontSize: '13px',
            borderRadius: '4px'
          }}>
          Submit
        </button>
      </div>

      {/* Header Section above Table */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative', marginBottom: '24px' }}>
        <img 
          src={logoImg} 
          alt="Laurus Labs" 
          style={{ width: '140px', height: 'auto', objectFit: 'contain', position: 'absolute', left: 0 }}
        />
        <h2 style={{ fontSize: '24px', fontWeight: 600, margin: 0, color: '#000' }}>
          Digital Log Sheet for {logSheet}
        </h2>
      </div>

      {/* Table Export Bar */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid #bdbdbd', borderLeft: '1px solid #bdbdbd', borderRight: '1px solid #bdbdbd', padding: '6px 12px' }}>
        <div style={{ fontSize: '13px', color: '#555' }}>
          {applyFilters ? <span style={{ color: '#1976d2', fontWeight: 600 }}>Showing Filtered Results</span> : "Showing All Live Data"}
        </div>
        <button 
          onClick={handleExportExcel}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            padding: '6px 12px',
            background: '#fff',
            border: '1px solid #e0e0e0',
            color: '#2e7d32',
            fontWeight: 500,
            cursor: 'pointer',
            fontSize: '13px',
            borderRadius: '4px'
          }}>
          <FileText size={16} />
          Export To Excel
        </button>
      </div>

      {/* Main Table */}
      <div style={{ overflowX: 'auto', borderLeft: '1px solid #bdbdbd', borderRight: '1px solid #bdbdbd' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '11px', textAlign: 'center', whiteSpace: 'nowrap' }}>
          <thead>
            <tr style={{ background: '#1976d2', color: '#fff' }}>
              <th style={{ padding: '10px 8px', border: '1px solid #bdbdbd', fontWeight: 500 }}>Date</th>
              <th style={{ padding: '10px 8px', border: '1px solid #bdbdbd', fontWeight: 500 }}>Time</th>
              <th style={{ padding: '10px 8px', border: '1px solid #bdbdbd', fontWeight: 500 }}>Sensor ID</th>
              <th style={{ padding: '10px 8px', border: '1px solid #bdbdbd', fontWeight: 500 }}>Device Name</th>
              <th style={{ padding: '10px 8px', border: '1px solid #bdbdbd', fontWeight: 500 }}>Gas Type</th>
              <th style={{ padding: '10px 8px', border: '1px solid #bdbdbd', fontWeight: 500 }}>Value (ppm)</th>
              <th style={{ padding: '10px 8px', border: '1px solid #bdbdbd', fontWeight: 500 }}>Status</th>
            </tr>
          </thead>
          <tbody>
            {loading && readings.length === 0 ? (
              <tr><td colSpan="7" style={{ padding: '20px', border: '1px solid #bdbdbd' }}>Loading...</td></tr>
            ) : paginatedReadings.length === 0 ? (
              <tr><td colSpan="7" style={{ padding: '20px', border: '1px solid #bdbdbd' }}>No data available</td></tr>
            ) : (
              paginatedReadings.map((r, idx) => (
                <tr key={idx} style={{ height: '32px', background: '#fff' }}>
                  <td style={{ border: '1px solid #bdbdbd' }}>{new Date(r.timestamp).toLocaleDateString()}</td>
                  <td style={{ border: '1px solid #bdbdbd' }}>{new Date(r.timestamp).toLocaleTimeString()}</td>
                  <td style={{ border: '1px solid #bdbdbd' }}>{r.sensor_id}</td>
                  <td style={{ border: '1px solid #bdbdbd' }}>{r.device_name}</td>
                  <td style={{ border: '1px solid #bdbdbd' }}>{r.gas_type}</td>
                  <td style={{ border: '1px solid #bdbdbd' }}>{r.value !== null ? r.value : '---'}</td>
                  <td style={{ border: '1px solid #bdbdbd', color: r.status === 'ONLINE' ? '#2e7d32' : '#d32f2f', fontWeight: 500 }}>
                    {r.status}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Footer */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '10px 16px',
        border: '1px solid #bdbdbd',
        borderTop: 'none',
        background: '#fff',
        fontSize: '12px',
        color: '#333'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '32px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <button 
              onClick={() => handlePageChange(1)}
              disabled={currentPage === 1}
              style={{ background: 'none', border: 'none', cursor: currentPage === 1 ? 'not-allowed' : 'pointer', color: currentPage === 1 ? '#ccc' : '#555', padding: 0 }}>
              <ChevronsLeft size={16} />
            </button>
            <button 
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
              style={{ background: 'none', border: 'none', cursor: currentPage === 1 ? 'not-allowed' : 'pointer', color: currentPage === 1 ? '#ccc' : '#555', padding: 0 }}>
              <ChevronLeft size={16} />
            </button>
            
            <div style={{ display: 'flex', gap: '2px', alignItems: 'center', margin: '0 8px' }}>
              <span style={{ padding: '4px 8px', background: '#1976d2', color: '#fff', borderRadius: '4px' }}>
                {currentPage}
              </span>
              <span style={{ padding: '4px 8px' }}>of {totalPages}</span>
            </div>

            <button 
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
              style={{ background: 'none', border: 'none', cursor: currentPage === totalPages ? 'not-allowed' : 'pointer', color: currentPage === totalPages ? '#ccc' : '#555', padding: 0 }}>
              <ChevronRight size={16} />
            </button>
            <button 
              onClick={() => handlePageChange(totalPages)}
              disabled={currentPage === totalPages}
              style={{ background: 'none', border: 'none', cursor: currentPage === totalPages ? 'not-allowed' : 'pointer', color: currentPage === totalPages ? '#ccc' : '#555', padding: 0 }}>
              <ChevronsRight size={16} />
            </button>
          </div>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <select 
              value={itemsPerPage} 
              onChange={handleItemsPerPageChange}
              style={{ padding: '4px 8px', border: '1px solid #bdbdbd', background: '#fff', outline: 'none', borderRadius: '4px' }}>
              <option value="10">10</option>
              <option value="20">20</option>
              <option value="50">50</option>
              <option value="100">100</option>
            </select>
            <span style={{ whiteSpace: 'nowrap' }}>Items Per Page</span>
          </div>
        </div>
        
        <div style={{ whiteSpace: 'nowrap' }}>
          {filteredReadings.length === 0 ? '0' : startIndex + 1} - {Math.min(startIndex + itemsPerPage, filteredReadings.length)} of {filteredReadings.length} items
        </div>
      </div>
    </div>
  );
}
