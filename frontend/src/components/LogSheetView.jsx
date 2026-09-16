import React, { useState, useEffect, useMemo, useRef } from 'react';
import { FileText, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-react';
import logoImg from '../assets/logo.png';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import html2canvas from 'html2canvas';

export default function LogSheetView() {
  const [logSheet, setLogSheet] = useState('SC-126');
  
  const today = new Date();
  const pastDate = new Date();
  pastDate.setDate(today.getDate() - 2);

  const [fromDate, setFromDate] = useState(pastDate.toISOString().split('T')[0]);
  const [toDate, setToDate] = useState(today.toISOString().split('T')[0]);
  const [startTime, setStartTime] = useState('12:00 AM');
  const [frequency, setFrequency] = useState('30 Mins');

  const [readings, setReadings] = useState([]);
  const [loading, setLoading] = useState(true);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  
  // Filter toggle state
  const [applyFilters, setApplyFilters] = useState(false);

  // Generate time options
  const timeOptions = useMemo(() => {
    const options = [];
    const ampm = ['AM', 'PM'];
    for (let p of ampm) {
      for (let h = 0; h < 12; h++) {
        const hour = h === 0 ? 12 : h;
        options.push(`${hour}:00 ${p}`);
        options.push(`${hour}:30 ${p}`);
      }
    }
    return options;
  }, []);

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
    
    const parseTime = (timeString) => {
      const [time, period] = timeString.split(' ');
      let [h, m] = time.split(':').map(Number);
      if (period === 'PM' && h !== 12) h += 12;
      if (period === 'AM' && h === 12) h = 0;
      return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:00`;
    };
    
    const timeStr = parseTime(startTime);
    const fromTime = new Date(`${fromDate}T${timeStr}`).getTime();
    const toTime = new Date(`${toDate}T23:59:59`).getTime();
    
    return readings.filter(r => {
      const rTime = new Date(r.timestamp).getTime();
      return rTime >= fromTime && rTime <= toTime;
    });
  }, [readings, applyFilters, fromDate, startTime, toDate]);

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

  const exportContainerRef = useRef(null);

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

  const handleExportCSV = () => {
    if (filteredReadings.length === 0) return alert("No data to export.");
    const headers = ['Date', 'Time', 'Sensor ID', 'Device Name', 'Gas Type', 'Value (ppm)', 'Status'];
    const rows = filteredReadings.map(r => [
      new Date(r.timestamp).toLocaleDateString(),
      new Date(r.timestamp).toLocaleTimeString(),
      r.sensor_id,
      r.device_name,
      r.gas_type,
      r.value !== null ? r.value : '---',
      r.status
    ]);
    const csvContent = [headers, ...rows].map(e => e.join(",")).join("\n");
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", `Digital_Log_Sheet_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleExportPDF = () => {
    if (filteredReadings.length === 0) return alert("No data to export.");
    const doc = new jsPDF();
    
    // Add Logo
    const img = new Image();
    img.src = logoImg;
    // (image, format, x, y, width, height)
    doc.addImage(img, 'PNG', 14, 10, 35, 12);
    
    const pageWidth = doc.internal.pageSize.getWidth();
    
    doc.setFont("helvetica", "bold");
    doc.setFontSize(18);
    doc.text(`Digital Log Sheet for ${logSheet}`, pageWidth / 2, 18, { align: 'center' });
    
    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    doc.text(`Generated on: ${new Date().toLocaleString()}`, pageWidth / 2, 24, { align: 'center' });
    
    const tableColumn = ["Date", "Time", "Sensor ID", "Device Name", "Gas Type", "Value (ppm)", "Status"];
    const tableRows = filteredReadings.map(r => [
      new Date(r.timestamp).toLocaleDateString(),
      new Date(r.timestamp).toLocaleTimeString(),
      r.sensor_id,
      r.device_name,
      r.gas_type,
      r.value !== null ? r.value : '---',
      r.status
    ]);

    autoTable(doc, {
      head: [tableColumn],
      body: tableRows,
      startY: 32,
      theme: 'grid',
      styles: { fontSize: 8, halign: 'center', cellPadding: 3 },
      headStyles: { fillColor: [25, 118, 210], halign: 'center', textColor: 255, fontStyle: 'bold' }
    });
    doc.save(`Digital_Log_Sheet_${new Date().toISOString().split('T')[0]}.pdf`);
  };

  const handleExportImage = async () => {
    if (!exportContainerRef.current) return;
    try {
      const canvas = await html2canvas(exportContainerRef.current, { scale: 2, useCORS: true, backgroundColor: '#f4f7f6' });
      const image = canvas.toDataURL("image/png", 1.0);
      const link = document.createElement("a");
      link.download = `Digital_Log_Sheet_${new Date().toISOString().split('T')[0]}.png`;
      link.href = image;
      link.click();
    } catch (error) {
      console.error("Error generating image:", error);
      alert("Failed to export as image.");
    }
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

        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', width: '130px', flexShrink: 0 }}>
          <label style={{ fontSize: '12px', color: '#555' }}>Start Time</label>
          <select 
            value={startTime}
            onChange={(e) => setStartTime(e.target.value)}
            style={{ padding: '8px 12px', border: '1px solid #bdbdbd', fontSize: '13px', outline: 'none', background: '#fff' }}
          >
            {timeOptions.map(t => (
              <option key={t} value={t}>{t}</option>
            ))}
          </select>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', width: '140px', flexShrink: 0 }}>
          <label style={{ fontSize: '12px', color: '#555' }}>Frequency</label>
          <select 
            value={frequency}
            onChange={(e) => setFrequency(e.target.value)}
            style={{ padding: '8px 12px', border: '1px solid #bdbdbd', fontSize: '13px', outline: 'none', background: '#fff', borderRadius: '4px' }}
          >
            <option value="5 Mins">5 Mins</option>
            <option value="30 Mins">30 Mins</option>
            <option value="1 Hour">1 Hour</option>
            <option value="2 Hours">2 Hours</option>
            <option value="3 Hours">3 Hours</option>
            <option value="6 Hours">6 Hours</option>
            <option value="12 Hours">12 Hours</option>
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

      <div ref={exportContainerRef} style={{ background: '#f4f7f6', padding: '16px', margin: '-16px', marginBottom: '16px' }}>
        {/* Header Section above Table */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px', minHeight: '60px' }}>
          <div style={{ flex: 1, display: 'flex', justifyContent: 'flex-start' }}>
            <img 
              src={logoImg} 
              alt="Laurus Labs" 
              style={{ width: '130px', height: 'auto', objectFit: 'contain', mixBlendMode: 'multiply' }}
            />
          </div>
          <h2 style={{ fontSize: '24px', fontWeight: 600, margin: 0, color: '#000', textAlign: 'center', flex: 2 }}>
            Digital Log Sheet for {logSheet}
          </h2>
          <div style={{ flex: 1 }}></div>
        </div>

        {/* Table Export Bar */}
        <div data-html2canvas-ignore style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid #bdbdbd', borderLeft: '1px solid #bdbdbd', borderRight: '1px solid #bdbdbd', padding: '6px 12px' }}>
          <div style={{ fontSize: '13px', color: '#555' }}>
            {applyFilters ? <span style={{ color: '#1976d2', fontWeight: 600 }}>Showing Filtered Results</span> : "Showing All Live Data"}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <FileText size={16} color="#2e7d32" />
            <select 
              onChange={(e) => {
                if (e.target.value === 'excel') handleExportExcel();
                else if (e.target.value === 'pdf') handleExportPDF();
                else if (e.target.value === 'image') handleExportImage();
                else if (e.target.value === 'csv') handleExportCSV();
                e.target.value = ''; // reset after selection
              }}
            defaultValue=""
            style={{
              padding: '4px 8px',
              background: '#fff',
              border: '1px solid #e0e0e0',
              color: '#2e7d32',
              fontWeight: 500,
              cursor: 'pointer',
              fontSize: '13px',
              borderRadius: '4px',
              outline: 'none'
            }}>
            <option value="" disabled>Export Data As...</option>
            <option value="excel">Excel (.xlsx)</option>
            <option value="pdf">PDF Document</option>
            <option value="image">Image (.png)</option>
            <option value="csv">CSV File</option>
          </select>
        </div>
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
