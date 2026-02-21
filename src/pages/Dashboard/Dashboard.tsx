import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Activity, AlertTriangle, Users, Zap, FileText, 
  PlusCircle, Monitor, RefreshCw 
} from 'lucide-react';
import { Chart as ChartJS, ArcElement, Tooltip as ChartTooltip } from 'chart.js';
import { Doughnut } from 'react-chartjs-2';
import styles from './Dashboard.module.css';

ChartJS.register(ArcElement, ChartTooltip);

const Dashboard: React.FC = () => {
  const navigate = useNavigate();

  const [usagePercent, setUsagePercent] = useState(65);
  const [lastUpdated, setLastUpdated] = useState(new Date().toLocaleTimeString());
  const [isRefreshing, setIsRefreshing] = useState(false);

  const getGaugeColor = (percent: number) => {
    if (percent >= 90) return 'var(--danger)'; 
    if (percent >= 70) return 'var(--warning)'; 
    return 'var(--success)'; 
  };

  useEffect(() => {
    const interval = setInterval(() => {
      setIsRefreshing(true);
      
      setTimeout(() => {
        const newUsage = Math.floor(Math.random() * (95 - 60 + 1)) + 60;
        setUsagePercent(newUsage);
        // FIX: Removed unused parameter 'newDate'
        setLastUpdated(new Date().toLocaleTimeString());
        setIsRefreshing(false);
      }, 1000); 

    }, 30000);

    return () => clearInterval(interval);
  }, []);

  const gaugeData = {
    labels: ['Used', 'Available'],
    datasets: [{
      data: [usagePercent, 100 - usagePercent],
      backgroundColor: [getGaugeColor(usagePercent), 'rgba(198, 216, 209, 0.4)'],
      borderWidth: 0,
      circumference: 180,
      rotation: 270,
      cutout: '80%',
    }]
  };

  const recentAlerts = [
    { id: 1, type: 'critical', msg: 'Core Switch 1 bandwidth exceeded 90%', time: '2m ago' },
    { id: 2, type: 'warning', msg: 'Guest WiFi segment experiencing high latency', time: '15m ago' },
    { id: 3, type: 'info', msg: 'Nightly backup completed successfully', time: '1h ago' },
    { id: 4, type: 'warning', msg: 'Unusual traffic spike in Lab B', time: '3h ago' }
  ];

  const topConsumers = [
    { id: 'usr_1', name: 'Server-DB-Main', usage: '850 GB', percent: '42%' },
    { id: 'usr_2', name: 'CompSci-Lab-A', usage: '412 GB', percent: '20%' },
    { id: 'usr_3', name: 'Admin-Bldg-Gateway', usage: '205 GB', percent: '10%' },
    { id: 'usr_4', name: 'Library-Public-WiFi', usage: '150 GB', percent: '7%' },
    { id: 'usr_5', name: 'Student-Hostel-C', usage: '98 GB', percent: '5%' }
  ];

  return (
    <div className={styles.dashboardWrapper}>
      
      <div className={styles.header}>
        <div className={styles.titleGroup}>
          <h1>Network Overview</h1>
        </div>
        <div className={styles.refreshGroup}>
          <RefreshCw size={16} className={isRefreshing ? styles.spin : ''} />
          <span>Last updated: {lastUpdated}</span>
        </div>
      </div>

      <div className={styles.grid}>
        
        <div className={`neu-outset ${styles.card}`}>
          <h3 className={styles.cardTitle}><Activity size={20}/> Global Traffic Status</h3>
          
          <div className={styles.gaugeContainer}>
            <Doughnut data={gaugeData} options={{ maintainAspectRatio: true, responsive: true }} />
            <div className={styles.gaugeText}>
              <span className={styles.gaugeValue}>{usagePercent}%</span>
              <span className={styles.gaugeLabel}>Utilized</span>
            </div>
          </div>

          <div className={styles.metricsGrid}>
            <div className={`neu-inset ${styles.metricBox}`}>
              <span className={styles.metricValue}>10 Gbps</span>
              <span className={styles.metricName}>Capacity</span>
            </div>
            <div className={`neu-inset ${styles.metricBox}`}>
              <span className={styles.metricValue}>{(10 * (usagePercent / 100)).toFixed(1)} Gbps</span>
              <span className={styles.metricName}>Current</span>
            </div>
            <div className={`neu-inset ${styles.metricBox}`}>
              <span className={styles.metricValue}>1,204</span>
              <span className={styles.metricName}>Active Users</span>
            </div>
            <div className={`neu-inset ${styles.metricBox}`}>
              <span className={styles.metricValue}>48</span>
              <span className={styles.metricName}>Policies</span>
            </div>
          </div>
        </div>

        <div className={`neu-outset ${styles.card}`}>
          <h3 className={styles.cardTitle}><Zap size={20}/> Quick Actions</h3>
          <div className={styles.actionsGrid}>
            <button className={styles.actionBtn} onClick={() => navigate('/policies/new')}>
              <PlusCircle size={24} />
              <span>New Policy</span>
            </button>
            <button className={styles.actionBtn} onClick={() => navigate('/reports')}>
              <FileText size={24} />
              <span>Reports</span>
            </button>
            <button className={styles.actionBtn} onClick={() => navigate('/monitoring')}>
              <Monitor size={24} />
              <span>Monitor</span>
            </button>
            <button className={styles.actionBtn} onClick={() => navigate('/users')}>
              <Users size={24} />
              <span>Users</span>
            </button>
          </div>
        </div>

        <div className={`neu-outset ${styles.card}`}>
          <h3 className={styles.cardTitle}><Users size={20}/> Top Consumers</h3>
          <div className={styles.tableWrapper}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Identifier</th>
                  <th>Total Usage</th>
                  <th>Share</th>
                </tr>
              </thead>
              <tbody>
                {topConsumers.map((user) => (
                  <tr key={user.id} className={styles.clickableRow} onClick={() => alert(`Navigating to detail for ${user.name}`)}>
                    <td>{user.name}</td>
                    <td style={{ fontWeight: 800 }}>{user.usage}</td>
                    <td>{user.percent}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className={`neu-outset ${styles.card}`}>
          <h3 className={styles.cardTitle}><AlertTriangle size={20}/> Recent Alerts</h3>
          <div className={styles.alertsList}>
            {recentAlerts.map((alert) => (
              <div key={alert.id} className={styles.alertItem} onClick={() => navigate('/alerts')}>
                <AlertTriangle size={18} className={`${styles.alertIcon} ${styles[alert.type]}`} />
                <div className={styles.alertContent}>
                  <span className={styles.alertMsg}>{alert.msg}</span>
                  <span className={styles.alertTime}>{alert.time}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
};

export default Dashboard;
