import React, { useState, useMemo } from 'react';
import { 
  AlertTriangle, AlertCircle, Info, Check, 
  CheckCircle2, Trash2, Eye, Clock, Users 
} from 'lucide-react';
import Popup from '../../components/Popup/Popup';
import Toast from '../../components/Toast/Toast';
import Tooltip from '../../components/Tooltip/Tooltip';
import styles from './Alerts.module.css';

// --- Types & Mock Data ---
type AlertSeverity = 'critical' | 'warning' | 'info';
type AlertStatus = 'new' | 'acknowledged';

interface SystemAlert {
  id: string;
  severity: AlertSeverity;
  title: string;
  message: string;
  affected: string;
  timestamp: string;
  status: AlertStatus;
  recommendation: string;
}

const generateMockAlerts = (): SystemAlert[] => [
  { id: 'a1', severity: 'critical', title: 'Core Switch 1 Link Saturation', message: 'Uplink utilization has exceeded 95% for 5 consecutive minutes.', affected: 'Entire Campus', timestamp: '2 mins ago', status: 'new', recommendation: 'Check real-time monitoring for abnormal traffic spikes. Consider enabling emergency bandwidth throttling policy.' },
  { id: 'a2', severity: 'warning', title: 'Guest Wi-Fi Policy Threshold', message: 'Guest network segment is approaching its allocated 2Gbps maximum rate limit.', affected: 'Guest Users', timestamp: '15 mins ago', status: 'new', recommendation: 'No immediate action required. Policy will automatically drop packets if limit is breached.' },
  { id: 'a3', severity: 'info', title: 'Nightly Backup Completed', message: 'System configuration and policy rules successfully backed up to secure storage.', affected: 'System', timestamp: '3 hours ago', status: 'acknowledged', recommendation: 'None.' },
  { id: 'a4', severity: 'critical', title: 'Authentication Server Latency', message: 'Radius server response times exceeding 2000ms. Users may experience login delays.', affected: 'All Users', timestamp: '4 hours ago', status: 'new', recommendation: 'Verify Active Directory server health and network routes to the auth gateway.' },
  { id: 'a5', severity: 'warning', title: 'Unusual Traffic Pattern: Lab B', message: 'Sustained high-volume P2P traffic detected originating from Computer Science Lab B.', affected: 'CompSci-Lab-A', timestamp: '5 hours ago', status: 'acknowledged', recommendation: 'Review user sessions in Lab B. Verify if traffic aligns with scheduled academic coursework.' },
  { id: 'a6', severity: 'info', title: 'Policy Deactivated', message: 'Administrator "admin_sys" manually deactivated the "Exam Week Lockdown" policy.', affected: 'Students', timestamp: '1 day ago', status: 'acknowledged', recommendation: 'Ensure deactivation was authorized.' },
];

const Alerts: React.FC = () => {
  const [alerts, setAlerts] = useState<SystemAlert[]>(generateMockAlerts());
  const [activeTab, setActiveTab] = useState<'All' | 'New' | 'Acknowledged'>('All');
  
  // Overlays
  const [selectedAlert, setSelectedAlert] = useState<SystemAlert | null>(null);
  const [isClearModalOpen, setIsClearModalOpen] = useState(false);
  const [toast, setToast] = useState({ isVisible: false, title: '', message: '', type: 'success' as 'success'|'error' });

  // --- Derived Data ---
  const displayedAlerts = useMemo(() => {
    if (activeTab === 'All') return alerts;
    return alerts.filter(a => a.status.toLowerCase() === activeTab.toLowerCase());
  }, [alerts, activeTab]);

  const newAlertsCount = alerts.filter(a => a.status === 'new').length;
  const ackAlertsCount = alerts.filter(a => a.status === 'acknowledged').length;

  // --- Handlers ---
  const handleAcknowledge = (id: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setAlerts(prev => prev.map(a => a.id === id ? { ...a, status: 'acknowledged' } : a));
    setToast({ isVisible: true, title: 'Alert Acknowledged', message: 'Status updated successfully.', type: 'success' });
    if (selectedAlert?.id === id) setSelectedAlert(null); // Close modal if open
  };

  const handleAcknowledgeAll = () => {
    setAlerts(prev => prev.map(a => ({ ...a, status: 'acknowledged' })));
    setToast({ isVisible: true, title: 'All Acknowledged', message: 'All new alerts have been marked as acknowledged.', type: 'success' });
  };

  const confirmClearAcknowledged = () => {
    setAlerts(prev => prev.filter(a => a.status !== 'acknowledged'));
    setIsClearModalOpen(false);
    setToast({ isVisible: true, title: 'Cleared', message: 'Acknowledged alerts removed from history.', type: 'success' });
  };

  const openDetail = (alert: SystemAlert) => {
    setSelectedAlert(alert);
  };

  // --- Helpers ---
  const getIcon = (severity: AlertSeverity) => {
    if (severity === 'critical') return <AlertTriangle size={20} className={styles.iconCritical} />;
    if (severity === 'warning') return <AlertCircle size={20} className={styles.iconWarning} />;
    return <Info size={20} className={styles.iconInfo} />;
  };

  return (
    <div className={styles.pageWrapper}>
      
      <div className={styles.header}>
        <div className={styles.headerTop}>
          <h1 className={styles.pageTitle}>System Alerts & Notifications</h1>
          
          <div className={styles.bulkActions}>
            <button className={`${styles.btn} ${styles.ackAllBtn}`} onClick={handleAcknowledgeAll} disabled={newAlertsCount === 0}>
              <CheckCircle2 size={16} /> Acknowledge All
            </button>
            <button className={`${styles.btn} ${styles.clearBtn}`} onClick={() => setIsClearModalOpen(true)} disabled={ackAlertsCount === 0}>
              <Trash2 size={16} /> Clear Acknowledged
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className={styles.tabsContainer}>
          <button className={`${styles.tabBtn} ${activeTab === 'All' ? styles.active : ''}`} onClick={() => setActiveTab('All')}>
            All Alerts ({alerts.length})
          </button>
          <button className={`${styles.tabBtn} ${activeTab === 'New' ? styles.active : ''}`} onClick={() => setActiveTab('New')}>
            New ({newAlertsCount})
          </button>
          <button className={`${styles.tabBtn} ${activeTab === 'Acknowledged' ? styles.active : ''}`} onClick={() => setActiveTab('Acknowledged')}>
            Acknowledged ({ackAlertsCount})
          </button>
        </div>
      </div>

      {/* Table */}
      <div className={styles.tableContainer}>
        <div className={styles.tableWrapper}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th style={{ width: '40px' }}></th>
                <th>Alert Details</th>
                <th>Scope / Impact</th>
                <th>Time</th>
                <th>Status</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {displayedAlerts.length > 0 ? (
                displayedAlerts.map(alert => (
                  <tr key={alert.id} className={`${styles.alertRow} ${styles[alert.severity]}`} onClick={() => openDetail(alert)}>
                    <td><div className={styles.iconWrapper}>{getIcon(alert.severity)}</div></td>
                    <td>
                      <span className={styles.primaryText}>{alert.title}</span>
                      <span className={styles.secondaryText}>
                        {alert.message.length > 60 ? alert.message.substring(0, 60) + '...' : alert.message}
                      </span>
                    </td>
                    <td><span className={styles.primaryText}>{alert.affected}</span></td>
                    <td><span className={styles.timeText}>{alert.timestamp}</span></td>
                    <td>
                      <span className={`${styles.statusBadge} ${styles[alert.status]}`}>
                        {alert.status}
                      </span>
                    </td>
                    <td>
                      <div className={styles.actionCell}>
                        {alert.status === 'new' && (
                          <Tooltip content="Mark Acknowledged" type="default">
                            <button className={styles.iconBtn} onClick={(e) => handleAcknowledge(alert.id, e)}>
                              <Check size={16} />
                            </button>
                          </Tooltip>
                        )}
                        <Tooltip content="View Details" type="default">
                          <button className={styles.iconBtn} onClick={(e) => { e.stopPropagation(); openDetail(alert); }}>
                            <Eye size={16} />
                          </button>
                        </Tooltip>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6}>
                    <div className={styles.emptyState}>
                      {activeTab === 'New' ? 'No new alerts. System is healthy.' : 'No alerts found for this filter.'}
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Detail Modal */}
      <Popup 
        isOpen={selectedAlert !== null} 
        title="Alert Details" 
        onClose={() => setSelectedAlert(null)}
        footerActions={
          selectedAlert?.status === 'new' ? (
            <button onClick={() => selectedAlert && handleAcknowledge(selectedAlert.id)} style={{ padding: '10px 20px', borderRadius: '10px', border: 'none', backgroundColor: 'var(--accent)', color: '#fff', fontWeight: '600', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Check size={18} /> Mark as Acknowledged
            </button>
          ) : undefined
        }
      >
        {selectedAlert && (
          <div>
            <div className={styles.modalMeta}>
              <span className={styles.metaPill}><Clock size={14} /> {selectedAlert.timestamp}</span>
              <span className={styles.metaPill}><Users size={14} /> {selectedAlert.affected}</span>
              <span className={styles.metaPill} style={{ textTransform: 'capitalize', color: selectedAlert.severity === 'critical' ? 'var(--danger)' : selectedAlert.severity === 'warning' ? 'var(--warning)' : 'var(--accent)' }}>
                {getIcon(selectedAlert.severity)} {selectedAlert.severity}
              </span>
            </div>

            <div className={styles.modalSection}>
              <h4>Event Description</h4>
              <p><strong>{selectedAlert.title}</strong><br/>{selectedAlert.message}</p>
            </div>

            <div className={`${styles.modalSection} ${styles.recommendationBox}`}>
              <h4>Recommended Action</h4>
              <p>{selectedAlert.recommendation}</p>
            </div>
          </div>
        )}
      </Popup>

      {/* Clear Confirmation */}
      <Popup 
        isOpen={isClearModalOpen} 
        title="Clear Alert History" 
        onClose={() => setIsClearModalOpen(false)}
        footerActions={
          <>
            <button onClick={() => setIsClearModalOpen(false)} style={{ padding: '10px 15px', borderRadius: '10px', border: 'none', backgroundColor: 'var(--bg)', color: 'var(--text)', fontWeight: '600', cursor: 'pointer' }}>
              Cancel
            </button>
            <button onClick={confirmClearAcknowledged} style={{ padding: '10px 15px', borderRadius: '10px', border: 'none', backgroundColor: 'var(--danger)', color: '#fff', fontWeight: '600', cursor: 'pointer' }}>
              Clear Records
            </button>
          </>
        }
      >
        <p>Are you sure you want to permanently remove all acknowledged alerts from the system history? New (unacknowledged) alerts will remain.</p>
      </Popup>

      <Toast title={toast.title} message={toast.message} type={toast.type} isVisible={toast.isVisible} onClose={() => setToast(prev => ({ ...prev, isVisible: false }))} />

    </div>
  );
};

export default Alerts;
