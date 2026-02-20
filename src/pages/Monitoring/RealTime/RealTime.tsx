import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { RefreshCw, Activity, ArrowUpDown } from 'lucide-react';
import { Chart as ChartJS, ArcElement, Tooltip as ChartTooltip, Legend } from 'chart.js';
import { Doughnut, Pie } from 'react-chartjs-2';
import Popup from '../../../components/Popup/Popup';
import Toast from '../../../components/Toast/Toast';
import styles from './RealTime.module.css';

ChartJS.register(ArcElement, ChartTooltip, Legend);

// --- Types ---
interface ActiveUser {
  id: string;
  username: string;
  usageMbps: number;
  percentTotal: number;
  topApp: string;
  policy: string;
}

interface SortConfig {
  key: keyof ActiveUser;
  direction: 'asc' | 'desc';
}

const RealTime: React.FC = () => {
  const navigate = useNavigate();

  // --- States ---
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [secondsSinceUpdate, setSecondsSinceUpdate] = useState(0);
  
  // Dashboard Data States
  const [usagePercent, setUsagePercent] = useState(0);
  const [throughput, setThroughput] = useState(0);
  const [activeUserCount, setActiveUserCount] = useState(0);
  const [appTraffic, setAppTraffic] = useState<number[]>([0, 0, 0, 0, 0]);
  const [users, setUsers] = useState<ActiveUser[]>([]);
  
  // Table & Modal States
  const [sortConfig, setSortConfig] = useState<SortConfig>({ key: 'usageMbps', direction: 'desc' });
  const [selectedUser, setSelectedUser] = useState<ActiveUser | null>(null);
  const [toast, setToast] = useState({ isVisible: false, title: '', message: '', type: 'success' as 'success'|'error' });

  // --- Data Generator ---
  const fetchLiveMetrics = useCallback(() => {
    setIsRefreshing(true);
    
    // Simulate network delay
    setTimeout(() => {
      const newUsage = Math.floor(Math.random() * (95 - 40 + 1)) + 40; // 40% - 95%
      const newThroughput = Number((10 * (newUsage / 100)).toFixed(2)); // Max 10 Gbps
      const newUserCount = Math.floor(Math.random() * (1500 - 800 + 1)) + 800;
      
      // Randomize pie chart segments ensuring they sum to 100
      const web = Math.floor(Math.random() * 20) + 30; // 30-50
      const video = Math.floor(Math.random() * 20) + 20; // 20-40
      const academic = Math.floor(Math.random() * 15) + 10; // 10-25
      const file = Math.floor(Math.random() * 10) + 5; // 5-15
      const other = 100 - (web + video + academic + file);

      // Generate 20 Random Users
      const generatedUsers: ActiveUser[] = Array.from({ length: 20 }, (_, i) => {
        const usage = Number((Math.random() * 150).toFixed(1)); // 0 - 150 Mbps
        return {
          id: `live_u${i}`,
          username: `user_${Math.floor(Math.random() * 9000) + 1000}`,
          usageMbps: usage,
          percentTotal: Number(((usage / (newThroughput * 1000)) * 100).toFixed(2)),
          topApp: ['Web', 'Video', 'LMS', 'Torrent'][Math.floor(Math.random() * 4)],
          policy: ['Global Default', 'Student Throttle', 'Faculty VIP'][Math.floor(Math.random() * 3)]
        };
      });

      setUsagePercent(newUsage);
      setThroughput(newThroughput);
      setActiveUserCount(newUserCount);
      setAppTraffic([web, video, academic, file, Math.max(0, other)]);
      setUsers(generatedUsers);
      
      setSecondsSinceUpdate(0);
      setIsRefreshing(false);
    }, 600);
  }, []);

  // --- Timers ---
  useEffect(() => {
    // Initial fetch
    fetchLiveMetrics();

    // 10-second data refresh cycle
    const dataInterval = setInterval(() => {
      fetchLiveMetrics();
    }, 10000);

    // 1-second UI ticker
    const tickInterval = setInterval(() => {
      setSecondsSinceUpdate(s => s + 1);
    }, 1000);

    return () => {
      clearInterval(dataInterval);
      clearInterval(tickInterval);
    };
  }, [fetchLiveMetrics]);

  // --- Handlers ---
  const handleSort = (key: keyof ActiveUser) => {
    setSortConfig(prev => ({
      key,
      direction: prev.key === key && prev.direction === 'desc' ? 'asc' : 'desc'
    }));
  };

  const sortedUsers = useMemo(() => {
    return [...users].sort((a, b) => {
      if (a[sortConfig.key] < b[sortConfig.key]) return sortConfig.direction === 'asc' ? -1 : 1;
      if (a[sortConfig.key] > b[sortConfig.key]) return sortConfig.direction === 'asc' ? 1 : -1;
      return 0;
    });
  }, [users, sortConfig]);

  const handleManualRefresh = () => {
    fetchLiveMetrics();
    setToast({ isVisible: true, title: 'Refreshed', message: 'Live data successfully synced.', type: 'success' });
  };

  // --- Chart Configs ---
  const getGaugeColor = (percent: number) => {
    if (percent >= 90) return 'var(--danger)'; 
    if (percent >= 70) return 'var(--warning)'; 
    return 'var(--success)'; 
  };

  const gaugeData = {
    labels: ['Utilized', 'Available'],
    datasets: [{
      data: [usagePercent, 100 - usagePercent],
      backgroundColor: [getGaugeColor(usagePercent), 'rgba(198, 216, 209, 0.4)'],
      borderWidth: 0,
      circumference: 180,
      rotation: 270,
      cutout: '80%',
    }]
  };

  const pieData = {
    labels: ['Web Browsing', 'Video Streaming', 'Academic/LMS', 'File Transfers', 'Other'],
    datasets: [{
      data: appTraffic,
      backgroundColor: [
        '#1B3B6F', // Accent
        '#D98C14', // Warning
        '#288C64', // Success
        '#BA3B3B', // Danger
        '#528072'  // Text-light
      ],
      borderWidth: 2,
      borderColor: 'var(--bg)',
    }]
  };

  const pieOptions = {
    plugins: {
      legend: { position: 'right' as const, labels: { color: 'var(--text)', font: { size: 11, family: 'Inter' } } }
    },
    maintainAspectRatio: false,
  };

  return (
    <div className={styles.pageWrapper}>
      
      {/* Header & Toggle */}
      <div className={styles.header}>
        <div className={styles.headerTop}>
          <h1 className={styles.pageTitle}>Real-Time Monitoring</h1>
          <div className={styles.modeToggle}>
            <button className={`${styles.toggleBtn} ${styles.active}`}>Real-Time</button>
            <button className={styles.toggleBtn} onClick={() => navigate('/monitoring/historical')}>Historical</button>
          </div>
        </div>
      </div>

      {/* Refresh Banner */}
      <div className={styles.refreshBanner}>
        <div className={styles.refreshInfo}>
          <div className={styles.pulseDot}></div>
          <span>Updating every 10s • Last update: {secondsSinceUpdate}s ago</span>
        </div>
        <button className={styles.manualRefreshBtn} onClick={handleManualRefresh} disabled={isRefreshing}>
          <RefreshCw size={16} className={isRefreshing ? styles.spin : ''} />
          {isRefreshing ? 'Syncing...' : 'Sync Now'}
        </button>
      </div>

      <div className={styles.topGrid}>
        {/* Status Gauge Card */}
        <div className={styles.card}>
          <h3 className={styles.cardTitle}>Global Capacity</h3>
          <div className={styles.gaugeWrapper}>
            <Doughnut data={gaugeData} options={{ plugins: { tooltip: { enabled: false } }, maintainAspectRatio: true }} />
            <div className={styles.gaugeText}>
              <span className={styles.gaugeValue}>{usagePercent}%</span>
              <span className={styles.gaugeLabel}>Network Load</span>
            </div>
          </div>
          <div className={styles.metricsRow}>
            <div className={styles.metricBox}>
              <span className={styles.mValue}>{throughput} <small style={{fontSize: '0.6em'}}>Gbps</small></span>
              <span className={styles.mLabel}>Throughput</span>
            </div>
            <div className={styles.metricBox}>
              <span className={styles.mValue}>{activeUserCount}</span>
              <span className={styles.mLabel}>Active Users</span>
            </div>
            <div className={styles.metricBox}>
              <span className={styles.mValue}>{(10 - throughput).toFixed(2)} <small style={{fontSize: '0.6em'}}>Gbps</small></span>
              <span className={styles.mLabel}>Available</span>
            </div>
          </div>
        </div>

        {/* Application Pie Chart */}
        <div className={styles.card}>
          <h3 className={styles.cardTitle}>Traffic Distribution</h3>
          <div className={styles.pieWrapper}>
            <Pie data={pieData} options={pieOptions} />
          </div>
        </div>
      </div>

      {/* Live Table */}
      <div className={styles.tableContainer}>
        <h3 className={styles.tableTitle}>Top Consumers (Live)</h3>
        <div className={styles.tableWrapper}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Identifier</th>
                <th>
                  <div className={styles.sortableHeader} onClick={() => handleSort('usageMbps')}>
                    Live Usage (Mbps) <ArrowUpDown size={14} />
                  </div>
                </th>
                <th>Dominant Application</th>
                <th>Active Policy</th>
              </tr>
            </thead>
            <tbody>
              {sortedUsers.map((user) => (
                <tr key={user.id} className={styles.clickableRow} onClick={() => setSelectedUser(user)}>
                  <td><span className={styles.primaryText}>{user.username}</span></td>
                  <td style={{ minWidth: '150px' }}>
                    <span className={styles.primaryText}>{user.usageMbps} Mbps</span>
                    <div className={styles.usageBar}>
                      <div className={styles.usageFill} style={{ width: `${Math.min(user.percentTotal * 100, 100)}%` }}></div>
                    </div>
                  </td>
                  <td><span className={styles.secondaryText}>{user.topApp}</span></td>
                  <td><span className={styles.secondaryText}>{user.policy}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* User Detail Modal */}
      <Popup 
        isOpen={selectedUser !== null} 
        title="Live Session Details" 
        onClose={() => setSelectedUser(null)}
        footerActions={<button onClick={() => setSelectedUser(null)} style={{ padding: '10px 20px', borderRadius: '10px', border: 'none', backgroundColor: 'var(--bg)', color: 'var(--text)', fontWeight: '600', cursor: 'pointer', boxShadow: '4px 4px 8px var(--shadow-dark), -4px -4px 8px var(--shadow-light)' }}>Close</button>}
      >
        {selectedUser && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <Activity size={20} color="var(--success)" />
              <span style={{ fontWeight: 800, fontSize: '1.2rem' }}>{selectedUser.username}</span>
            </div>
            <hr style={{ borderTop: '1px solid var(--shadow-dark)', borderBottom: 'none' }} />
            <p><strong>Current Throughput:</strong> <span style={{ color: 'var(--accent)', fontWeight: 800 }}>{selectedUser.usageMbps} Mbps</span></p>
            <p><strong>Primary Activity:</strong> {selectedUser.topApp}</p>
            <p><strong>Enforced Policy:</strong> {selectedUser.policy}</p>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-light)', marginTop: '10px' }}>* Connection stats refresh every 10 seconds.</p>
          </div>
        )}
      </Popup>

      <Toast title={toast.title} message={toast.message} type={toast.type} isVisible={toast.isVisible} onClose={() => setToast(prev => ({ ...prev, isVisible: false }))} />

    </div>
  );
};

export default RealTime;
