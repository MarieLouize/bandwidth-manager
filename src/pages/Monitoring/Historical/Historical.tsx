import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Download, Calendar } from 'lucide-react';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip as ChartTooltip, Legend, Filler } from 'chart.js';
import { Line } from 'react-chartjs-2';
import Popup from '../../../components/Popup/Popup';
import Toast from '../../../components/Toast/Toast';
import styles from './Historical.module.css';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, ChartTooltip, Legend, Filler);

// --- Types ---
type TimeRange = '1h' | '24h' | '7d' | '30d' | 'custom';
type GroupBy = 'User' | 'Group' | 'Application' | 'Overall';

interface TopConsumer {
  id: string;
  name: string;
  totalData: string;
  percent: number;
}

const Historical: React.FC = () => {
  const navigate = useNavigate();

  // States
  const [timeRange, setTimeRange] = useState<TimeRange>('24h');
  const [groupBy, setGroupBy] = useState<GroupBy>('Overall');
  
  // Custom Date Modal States
  const [isDateModalOpen, setIsDateModalOpen] = useState(false);
  const [customStart, setCustomStart] = useState('');
  const [customEnd, setCustomEnd] = useState('');
  
  // Toasts
  const [toast, setToast] = useState({ isVisible: false, title: '', message: '', type: 'success' as 'success'|'error' });

  // --- Mock Data Generators based on State ---
  const { labels, datasets, stats, topConsumers } = useMemo(() => {
    let pointCount = 24; // Default for 24h
    let xLabelPrefix = 'Hour ';
    
    if (timeRange === '1h') { pointCount = 12; xLabelPrefix = 'Min '; } // 5-min intervals
    if (timeRange === '7d') { pointCount = 7; xLabelPrefix = 'Day '; }
    if (timeRange === '30d') { pointCount = 30; xLabelPrefix = 'Day '; }
    if (timeRange === 'custom') { pointCount = 14; xLabelPrefix = 'Data '; }

    const generateLabels = () => Array.from({ length: pointCount }, (_, i) => `${xLabelPrefix}${i + 1}`);
    const generateData = (base: number, variance: number) => Array.from({ length: pointCount }, () => Math.max(0, base + (Math.random() * variance - (variance/2))));

    let ds: any[] = [];
    
    if (groupBy === 'Overall') {
      ds = [{
        label: 'Total Network Traffic (Mbps)',
        data: generateData(5000, 2000), // Base 5Gbps
        borderColor: '#1B3B6F',
        backgroundColor: 'rgba(27, 59, 111, 0.1)',
        fill: true,
        tension: 0.4
      }];
    } else if (groupBy === 'Application') {
      ds = [
        { label: 'Web Browsing', data: generateData(2000, 500), borderColor: '#1B3B6F', tension: 0.4 },
        { label: 'Video Streaming', data: generateData(1500, 800), borderColor: '#D98C14', tension: 0.4 },
        { label: 'Academic/LMS', data: generateData(1000, 300), borderColor: '#288C64', tension: 0.4 }
      ];
    } else if (groupBy === 'Group') {
      ds = [
        { label: 'Students', data: generateData(3000, 1000), borderColor: '#1B3B6F', tension: 0.4 },
        { label: 'Faculty', data: generateData(1200, 400), borderColor: '#288C64', tension: 0.4 },
        { label: 'Admin', data: generateData(500, 100), borderColor: '#BA3B3B', tension: 0.4 }
      ];
    } else {
      // By User (Top 3 for graph clarity)
      ds = [
        { label: 'user_9912', data: generateData(150, 50), borderColor: '#BA3B3B', tension: 0.4 },
        { label: 'user_4410', data: generateData(120, 40), borderColor: '#D98C14', tension: 0.4 },
        { label: 'user_8821', data: generateData(100, 30), borderColor: '#1B3B6F', tension: 0.4 }
      ];
    }

    // Generate relative mock stats
    const peak = Math.max(...ds[0].data);
    const avg = ds[0].data.reduce((a:number, b:number) => a + b, 0) / pointCount;
    const multiplier = timeRange === '1h' ? 1 : timeRange === '24h' ? 24 : timeRange === '7d' ? 168 : 720;
    const totalTB = ((avg * multiplier * 3600) / (8 * 1024 * 1024)).toFixed(2); // Rough Mbps to TB calc

    const topList: TopConsumer[] = Array.from({ length: 5 }, (_, i) => ({
      id: `c${i}`,
      name: groupBy === 'Application' ? ['Web', 'Video', 'LMS', 'Updates', 'Other'][i] : 
            groupBy === 'Group' ? ['Students', 'Faculty', 'Admin', 'Library', 'Guests'][i] :
            `user_${Math.floor(Math.random() * 9000)}`,
      totalData: `${(Math.random() * 500 + 50).toFixed(1)} GB`,
      percent: Math.floor(Math.random() * 30) + 5
    })).sort((a, b) => b.percent - a.percent);

    return {
      labels: generateLabels(),
      datasets: ds,
      stats: { peak: peak.toFixed(0), avg: avg.toFixed(0), total: totalTB },
      topConsumers: topList
    };
  }, [timeRange, groupBy]);

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { position: 'top' as const, labels: { font: { family: 'Inter', size: 12 }, color: 'var(--text)' } },
      tooltip: { mode: 'index' as const, intersect: false }
    },
    scales: {
      y: { beginAtZero: true, grid: { color: 'rgba(198, 216, 209, 0.3)' }, ticks: { color: 'var(--text-light)' } },
      x: { grid: { display: false }, ticks: { color: 'var(--text-light)', maxTicksLimit: 10 } }
    },
    interaction: { mode: 'nearest' as const, axis: 'x' as const, intersect: false }
  };

  // --- Handlers ---
  const handleCustomDateSave = () => {
    if (!customStart || !customEnd) {
      setToast({ isVisible: true, title: 'Error', message: 'Please select both start and end dates.', type: 'error' });
      return;
    }
    if (new Date(customStart) > new Date(customEnd)) {
      setToast({ isVisible: true, title: 'Error', message: 'End date must be after start date.', type: 'error' });
      return;
    }
    
    setTimeRange('custom');
    setIsDateModalOpen(false);
  };

  const handleExportCSV = () => {
    // Generate mock CSV content based on current graph data
    const header = ['TimeLabel', ...datasets.map(d => d.label)].join(',');
    const rows = labels.map((label, index) => {
      const rowData = datasets.map(d => (d.data[index] as number).toFixed(2)).join(',');
      return `${label},${rowData}`;
    }).join('\n');
    
    const csvContent = `${header}\n${rows}`;
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `bandwidth_export_${timeRange}_${groupBy}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    setToast({ isVisible: true, title: 'Export Successful', message: 'CSV file downloaded.', type: 'success' });
  };

  return (
    <div className={styles.pageWrapper}>
      
      <div className={styles.header}>
        <div className={styles.headerTop}>
          <h1 className={styles.pageTitle}>Historical Analysis</h1>
          <div className={styles.modeToggle}>
            <button className={styles.toggleBtn} onClick={() => navigate('/monitoring/realtime')}>Real-Time</button>
            <button className={`${styles.toggleBtn} ${styles.active}`}>Historical</button>
          </div>
        </div>
      </div>

      {/* --- Controls --- */}
      <div className={styles.controlsCard}>
        <div className={styles.controlGroup}>
          <span className={styles.label}>Time Period</span>
          <div className={styles.chipsContainer}>
            <button className={`${styles.chipBtn} ${timeRange === '1h' ? styles.active : ''}`} onClick={() => setTimeRange('1h')}>Last Hour</button>
            <button className={`${styles.chipBtn} ${timeRange === '24h' ? styles.active : ''}`} onClick={() => setTimeRange('24h')}>Last 24h</button>
            <button className={`${styles.chipBtn} ${timeRange === '7d' ? styles.active : ''}`} onClick={() => setTimeRange('7d')}>Last 7 Days</button>
            <button className={`${styles.chipBtn} ${timeRange === '30d' ? styles.active : ''}`} onClick={() => setTimeRange('30d')}>Last 30 Days</button>
            <button className={`${styles.chipBtn} ${timeRange === 'custom' ? styles.active : ''}`} onClick={() => setIsDateModalOpen(true)}>
              <Calendar size={14} style={{ display: 'inline', verticalAlign: 'text-top', marginRight: '4px' }} />
              Custom
            </button>
          </div>
        </div>

        <div className={styles.controlGroup}>
          <span className={styles.label}>Segment Data By</span>
          <select value={groupBy} onChange={(e) => setGroupBy(e.target.value as GroupBy)} className={styles.selectField}>
            <option value="Overall">Overall Network Traffic</option>
            <option value="Application">By Application Type</option>
            <option value="Group">By User Group / Dept</option>
            <option value="User">By Specific User (Top 3)</option>
          </select>
        </div>

        <button className={styles.exportBtn} onClick={handleExportCSV}>
          <Download size={16} /> Export CSV
        </button>
      </div>

      {/* --- Stats --- */}
      <div className={styles.statsGrid}>
        <div className={styles.statCard}>
          <span className={styles.statValue}>{stats.peak} <small style={{fontSize: '0.5em', color: 'var(--text-light)'}}>Mbps</small></span>
          <span className={styles.statLabel}>Peak Usage</span>
        </div>
        <div className={styles.statCard}>
          <span className={styles.statValue}>{stats.avg} <small style={{fontSize: '0.5em', color: 'var(--text-light)'}}>Mbps</small></span>
          <span className={styles.statLabel}>Average Usage</span>
        </div>
        <div className={styles.statCard}>
          <span className={styles.statValue}>{stats.total} <small style={{fontSize: '0.5em', color: 'var(--text-light)'}}>TB</small></span>
          <span className={styles.statLabel}>Total Data Transferred</span>
        </div>
      </div>

      {/* --- Main Chart --- */}
      <div className={styles.chartCard}>
        <h3 className={styles.chartTitle}>Bandwidth Utilization Trend</h3>
        <div className={styles.chartContainer}>
          <Line data={{ labels, datasets }} options={chartOptions} />
        </div>
      </div>

      {/* --- Top Table --- */}
      <div className={styles.tableContainer}>
        <h3 className={styles.tableTitle}>Top Consumers ({timeRange})</h3>
        <div className={styles.tableWrapper}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Identifier ({groupBy === 'Overall' ? 'User' : groupBy})</th>
                <th>Total Data Volume</th>
                <th>Share of Network</th>
              </tr>
            </thead>
            <tbody>
              {topConsumers.map(item => (
                <tr key={item.id}>
                  <td><span className={styles.primaryText}>{item.name}</span></td>
                  <td>{item.totalData}</td>
                  <td style={{ minWidth: '150px' }}>
                    <span style={{ fontWeight: 800 }}>{item.percent}%</span>
                    <div className={styles.usageBar}>
                      <div className={styles.usageFill} style={{ width: `${item.percent}%` }}></div>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Custom Date Modal */}
      <Popup isOpen={isDateModalOpen} title="Select Custom Range" onClose={() => setIsDateModalOpen(false)} footerActions={<button onClick={handleCustomDateSave} style={{ padding: '10px 20px', borderRadius: '10px', border: 'none', backgroundColor: 'var(--accent)', color: '#fff', fontWeight: '600', cursor: 'pointer', boxShadow: '4px 4px 8px rgba(27, 59, 111, 0.3)' }}>Apply Range</button>}>
        <div className={styles.dateGrid}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <label className={styles.label}>Start Date</label>
            <input type="date" value={customStart} onChange={e => setCustomStart(e.target.value)} className={styles.dateInput} />
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <label className={styles.label}>End Date</label>
            <input type="date" value={customEnd} onChange={e => setCustomEnd(e.target.value)} className={styles.dateInput} />
          </div>
        </div>
        <p style={{ fontSize: '0.8rem', color: 'var(--text-light)', textAlign: 'center' }}>Maximum historical range is 90 days.</p>
      </Popup>

      <Toast title={toast.title} message={toast.message} type={toast.type} isVisible={toast.isVisible} onClose={() => setToast(prev => ({ ...prev, isVisible: false }))} />

    </div>
  );
};

export default Historical;
