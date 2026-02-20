import React, { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Download, FileSpreadsheet, Printer, Loader2 } from 'lucide-react';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, BarElement, Title, Tooltip as ChartTooltip, Legend, Filler } from 'chart.js';
import { Line, Bar } from 'react-chartjs-2';
import Toast from '../../../components/Toast/Toast';
import styles from './ReportView.module.css';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, BarElement, Title, ChartTooltip, Legend, Filler);

// --- Mock Data ---
interface ReportData {
  title: string;
  dateRange: string;
  generatedAt: string;
  summary: string;
  stats: { total: string; avg: string; peak: string };
  trendLabels: string[];
  trendData: number[];
  topUsers: { name: string; usage: number; percent: number }[];
}

const mockReportData: ReportData = {
  title: 'Network Usage Summary',
  dateRange: 'Feb 01, 2026 - Feb 20, 2026',
  generatedAt: new Date().toLocaleString(),
  summary: 'Over the selected period, overall network traffic has remained stable with expected peaks during standard academic hours (10:00 AM - 2:00 PM). A notable 15% increase in video streaming traffic was observed compared to the previous period, likely correlating with the start of midterm assignments. No critical bandwidth saturation events were recorded.',
  stats: { total: '42.5 TB', avg: '850 GB/day', peak: '8.2 Gbps' },
  trendLabels: ['Feb 1', 'Feb 4', 'Feb 7', 'Feb 10', 'Feb 13', 'Feb 16', 'Feb 19'],
  trendData: [750, 810, 890, 780, 920, 1050, 840],
  topUsers: [
    { name: 'Server-DB-Main', usage: 4500, percent: 12 },
    { name: 'CompSci-Lab-A', usage: 3200, percent: 8.5 },
    { name: 'Library-Public', usage: 2100, percent: 5.6 },
    { name: 'Faculty-Wing-B', usage: 1800, percent: 4.8 },
    { name: 'Hostel-Block-C', usage: 1500, percent: 4.0 },
  ]
};

const ReportView: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [data, setData] = useState<ReportData | null>(null);
  const [sortKey, setSortKey] = useState<'name' | 'usage'>('usage');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [isExporting, setIsExporting] = useState(false);
  const [toast, setToast] = useState({ isVisible: false, title: '', message: '', type: 'success' as 'success'|'error' });

  useEffect(() => {
    // Simulate loading report from backend using ID
    const timer = setTimeout(() => {
      setData(mockReportData);
    }, 500);
    return () => clearTimeout(timer);
  }, [id]);

  // --- Handlers ---
  const handleSort = (key: 'name' | 'usage') => {
    if (sortKey === key) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortKey(key);
      setSortOrder('desc');
    }
  };

  const sortedUsers = useMemo(() => {
    if (!data) return [];
    return [...data.topUsers].sort((a, b) => {
      if (a[sortKey] < b[sortKey]) return sortOrder === 'asc' ? -1 : 1;
      if (a[sortKey] > b[sortKey]) return sortOrder === 'asc' ? 1 : -1;
      return 0;
    });
  }, [data, sortKey, sortOrder]);

  const handlePrint = () => window.print();

  const handleExportCSV = () => {
    if (!data) return;
    const header = 'Identifier,Data Transferred (GB),Percentage of Total\n';
    const rows = sortedUsers.map(u => `"${u.name}",${u.usage},${u.percent}%`).join('\n');
    
    const blob = new Blob([header + rows], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `report_${id}_data.csv`;
    link.click();
    setToast({ isVisible: true, title: 'Exported', message: 'CSV file generated successfully.', type: 'success' });
  };

  const handleExportPDF = () => {
    setIsExporting(true);
    // Mock PDF generation delay
    setTimeout(() => {
      setIsExporting(false);
      setToast({ isVisible: true, title: 'PDF Exported', message: 'Document has been saved to your downloads.', type: 'success' });
    }, 2000);
  };

  if (!data) return <div style={{ padding: '40px', textAlign: 'center' }}>Loading Report Data...</div>;

  // --- Chart Configs ---
  const lineData = {
    labels: data.trendLabels,
    datasets: [{
      label: 'Daily Transfer Volume (GB)',
      data: data.trendData,
      borderColor: '#1B3B6F',
      backgroundColor: 'rgba(27, 59, 111, 0.1)',
      fill: true,
      tension: 0.4
    }]
  };

  const barData = {
    labels: data.topUsers.slice(0, 5).map(u => u.name),
    datasets: [{
      label: 'Usage (GB)',
      data: data.topUsers.slice(0, 5).map(u => u.usage),
      backgroundColor: '#288C64',
      borderRadius: 4
    }]
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { display: false } },
    scales: {
      y: { beginAtZero: true, grid: { color: 'rgba(0,0,0,0.05)' } },
      x: { grid: { display: false } }
    }
  };

  return (
    <div className={styles.pageWrapper}>
      
      {/* Top Action Bar */}
      <div className={styles.topActions}>
        <button className={styles.backBtn} onClick={() => navigate('/reports')}>
          <ArrowLeft size={18} /> Back to Reports
        </button>
        <div className={styles.exportGroup}>
          <button className={styles.exportBtn} onClick={handleExportCSV}>
            <FileSpreadsheet size={16} /> Export CSV
          </button>
          <button className={styles.exportBtn} onClick={handleExportPDF} disabled={isExporting}>
            {isExporting ? <Loader2 size={16} className={styles.spin} /> : <Download size={16} />} 
            {isExporting ? 'Generating...' : 'Export PDF'}
          </button>
          <button className={styles.exportBtn} onClick={handlePrint} style={{ backgroundColor: 'var(--accent)', color: '#fff' }}>
            <Printer size={16} /> Print
          </button>
        </div>
      </div>

      {/* Main Document Area */}
      <div className={styles.documentArea} id="printable-report">
        
        <div className={styles.docHeader}>
          <h1 className={styles.reportTitle}>{data.title}</h1>
          <div className={styles.metaGrid}>
            <div className={styles.metaItem}>
              <span className={styles.metaLabel}>Date Range</span>
              <span className={styles.metaVal}>{data.dateRange}</span>
            </div>
            <div className={styles.metaItem}>
              <span className={styles.metaLabel}>Generated On</span>
              <span className={styles.metaVal}>{data.generatedAt}</span>
            </div>
            <div className={styles.metaItem}>
              <span className={styles.metaLabel}>Report ID</span>
              <span className={styles.metaVal}>{id}</span>
            </div>
          </div>
        </div>

        <div className={styles.summarySection}>
          <h2 className={styles.sectionTitle}>Executive Summary</h2>
          <p className={styles.summaryText}>{data.summary}</p>
        </div>

        <div className={styles.statsGrid}>
          <div className={styles.statCard}>
            <span className={styles.statValue}>{data.stats.total}</span>
            <span className={styles.statLabel}>Total Data Transferred</span>
          </div>
          <div className={styles.statCard}>
            <span className={styles.statValue}>{data.stats.avg}</span>
            <span className={styles.statLabel}>Daily Average</span>
          </div>
          <div className={styles.statCard}>
            <span className={styles.statValue}>{data.stats.peak}</span>
            <span className={styles.statLabel}>Peak Throughput</span>
          </div>
        </div>

        <div className={styles.chartsGrid}>
          <div>
            <h3 className={styles.sectionTitle} style={{ fontSize: '1rem' }}>Volume Trend</h3>
            <div className={styles.chartContainer}>
              <Line data={lineData} options={chartOptions} />
            </div>
          </div>
          <div>
            <h3 className={styles.sectionTitle} style={{ fontSize: '1rem' }}>Top 5 Consumers</h3>
            <div className={styles.chartContainer}>
              <Bar data={barData} options={chartOptions} />
            </div>
          </div>
        </div>

        <div>
          <h2 className={styles.sectionTitle}>Detailed Consumer Data</h2>
          <div className={styles.tableWrapper}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th onClick={() => handleSort('name')}>Identifier {sortKey === 'name' ? (sortOrder === 'asc' ? '↑' : '↓') : ''}</th>
                  <th onClick={() => handleSort('usage')}>Usage (GB) {sortKey === 'usage' ? (sortOrder === 'asc' ? '↑' : '↓') : ''}</th>
                  <th>Share of Total</th>
                </tr>
              </thead>
              <tbody>
                {sortedUsers.map((user, idx) => (
                  <tr key={idx}>
                    <td className={styles.primaryText}>{user.name}</td>
                    <td>{user.usage.toLocaleString()}</td>
                    <td>{user.percent}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

      </div>

      <Toast title={toast.title} message={toast.message} type={toast.type} isVisible={toast.isVisible} onClose={() => setToast(prev => ({ ...prev, isVisible: false }))} />

    </div>
  );
};

export default ReportView;
