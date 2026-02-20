import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  FileText, Activity, Users, Shield, Bell, 
  ArrowRight, Download, FileSpreadsheet, Eye, Trash2, 
  Loader2, History
} from 'lucide-react';
import Popup from '../../components/Popup/Popup';
import Toast from '../../components/Toast/Toast';
import Tooltip from '../../components/Tooltip/Tooltip';
import styles from './Reports.module.css';

// --- Types & Data ---
type ReportType = 'Usage Summary' | 'Top Consumers' | 'Policy Effectiveness' | 'Group Bandwidth' | 'Alert History';

interface ReportConfig {
  id: string;
  type: ReportType;
  icon: React.ReactNode;
  desc: string;
}

interface GeneratedReport {
  id: string;
  type: ReportType;
  dateRange: string;
  generatedOn: string;
  size: string;
}

const REPORT_CARDS: ReportConfig[] = [
  { id: 'r1', type: 'Usage Summary', icon: <Activity size={24}/>, desc: 'High-level overview of total bandwidth consumption, peak hours, and overall network health.' },
  { id: 'r2', type: 'Top Consumers', icon: <Users size={24}/>, desc: 'Detailed breakdown of the users, IP addresses, or MACs consuming the most data.' },
  { id: 'r3', type: 'Policy Effectiveness', icon: <Shield size={24}/>, desc: 'Analytics on how often QoS policies were triggered and the amount of traffic shaped.' },
  { id: 'r4', type: 'Group Bandwidth', icon: <FileText size={24}/>, desc: 'Usage segmented by defined user groups (e.g., Students vs. Faculty vs. Guests).' },
  { id: 'r5', type: 'Alert History', icon: <Bell size={24}/>, desc: 'Log of all system warnings, critical alerts, and administrative acknowledgments.' }
];

const mockHistory: GeneratedReport[] = [
  { id: 'gen_1', type: 'Usage Summary', dateRange: 'Last 7 Days', generatedOn: 'Today, 09:15 AM', size: '2.4 MB' },
  { id: 'gen_2', type: 'Top Consumers', dateRange: 'Last 30 Days', generatedOn: 'Yesterday, 14:30 PM', size: '1.1 MB' },
  { id: 'gen_3', type: 'Group Bandwidth', dateRange: 'Jan 01 - Jan 31', generatedOn: 'Feb 01, 08:00 AM', size: '4.8 MB' },
];

const Reports: React.FC = () => {
  const navigate = useNavigate();

  // States
  const [history, setHistory] = useState<GeneratedReport[]>(mockHistory);
  
  // Modal States
  const [selectedReportType, setSelectedReportType] = useState<ReportConfig | null>(null);
  const [dateRange, setDateRange] = useState<'7d' | '30d' | 'custom'>('7d');
  const [customStart, setCustomStart] = useState('');
  const [customEnd, setCustomEnd] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  
  // Delete States
  const [reportToDelete, setReportToDelete] = useState<string | null>(null);
  const [toast, setToast] = useState({ isVisible: false, title: '', message: '', type: 'success' as 'success'|'error' });

  // --- Handlers ---
  const handleGenerate = () => {
    if (dateRange === 'custom' && (!customStart || !customEnd)) {
      setToast({ isVisible: true, title: 'Validation Error', message: 'Please provide both start and end dates.', type: 'error' });
      return;
    }
    if (dateRange === 'custom' && new Date(customStart) > new Date(customEnd)) {
      setToast({ isVisible: true, title: 'Validation Error', message: 'Start date must be before end date.', type: 'error' });
      return;
    }

    setIsGenerating(true);

    // Simulate backend generation time
    setTimeout(() => {
      setIsGenerating(false);
      setSelectedReportType(null);
      
      // In a real app, we would pass the generated ID to the view page. 
      // For the mock, we just navigate to the static Report Output page.
      navigate('/reports/view/mock_id');
    }, 2000);
  };

  const handleDownload = (format: 'PDF' | 'CSV', e: React.MouseEvent) => {
    e.stopPropagation();
    setToast({ isVisible: true, title: 'Download Started', message: `Your ${format} report is generating.`, type: 'success' });
  };

  const confirmDelete = () => {
    if (reportToDelete) {
      setHistory(prev => prev.filter(r => r.id !== reportToDelete));
      setToast({ isVisible: true, title: 'Report Deleted', message: 'The generated report was removed from history.', type: 'success' });
      setReportToDelete(null);
    }
  };

  return (
    <div className={styles.pageWrapper}>
      
      <div className={styles.header}>
        <h1 className={styles.pageTitle}>Reports & Analytics</h1>
        <span className={styles.pageSub}>Generate and export compliance audits and network utilization data.</span>
      </div>

      <h2 className={styles.sectionTitle}><FileText size={20}/> Available Reports</h2>
      
      <div className={styles.cardsGrid}>
        {REPORT_CARDS.map(report => (
          <div key={report.id} className={styles.reportCard} onClick={() => setSelectedReportType(report)}>
            <div className={styles.cardHeader}>
              <div className={styles.iconBox}>{report.icon}</div>
              <span className={styles.cardTitle}>{report.type}</span>
            </div>
            <p className={styles.cardDesc}>{report.desc}</p>
            <div className={styles.generateBtnText}>
              Configure Report <ArrowRight size={16} />
            </div>
          </div>
        ))}
      </div>

      {/* History Table */}
      <div className={styles.historyContainer}>
        <h2 className={`${styles.sectionTitle} ${styles.tableTitle}`}><History size={20}/> Generated History</h2>
        
        <div className={styles.tableWrapper}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Report Name</th>
                <th>Covered Period</th>
                <th>Generated On</th>
                <th>File Size</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {history.length > 0 ? (
                history.map(report => (
                  <tr key={report.id}>
                    <td><span className={styles.primaryText}>{report.type}</span></td>
                    <td><span className={styles.primaryText}>{report.dateRange}</span></td>
                    <td><span className={styles.secondaryText}>{report.generatedOn}</span></td>
                    <td><span className={styles.secondaryText}>{report.size}</span></td>
                    <td>
                      <div className={styles.actionCell}>
                        <Tooltip content="View in Browser" type="default">
                          <button className={styles.iconBtn} onClick={() => navigate(`/reports/view/${report.id}`)}><Eye size={16} /></button>
                        </Tooltip>
                        <Tooltip content="Download PDF" type="default">
                          <button className={styles.iconBtn} onClick={(e) => handleDownload('PDF', e)}><Download size={16} /></button>
                        </Tooltip>
                        <Tooltip content="Download CSV" type="default">
                          <button className={styles.iconBtn} onClick={(e) => handleDownload('CSV', e)}><FileSpreadsheet size={16} /></button>
                        </Tooltip>
                        <Tooltip content="Delete Record" type="default">
                          <button className={`${styles.iconBtn} ${styles.deleteBtn}`} onClick={() => setReportToDelete(report.id)}><Trash2 size={16} /></button>
                        </Tooltip>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr><td colSpan={5} style={{ textAlign: 'center', padding: '40px', color: 'var(--text-light)' }}>No previously generated reports found.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* --- Generation Modal --- */}
      <Popup 
        isOpen={selectedReportType !== null} 
        title={`Generate: ${selectedReportType?.type}`} 
        onClose={() => !isGenerating && setSelectedReportType(null)}
        footerActions={
          <button className={styles.generateModalBtn} onClick={handleGenerate} disabled={isGenerating}>
            {isGenerating ? <><Loader2 size={18} className={styles.spin} /> Processing Data...</> : 'Generate Report'}
          </button>
        }
      >
        <p className={styles.modalDesc}>{selectedReportType?.desc}</p>
        
        <div className={styles.inputGroup}>
          <label className={styles.label}>Select Date Range</label>
          <div className={styles.chipsContainer}>
            <button className={`${styles.chipBtn} ${dateRange === '7d' ? styles.active : ''}`} onClick={() => setDateRange('7d')} disabled={isGenerating}>Last 7 Days</button>
            <button className={`${styles.chipBtn} ${dateRange === '30d' ? styles.active : ''}`} onClick={() => setDateRange('30d')} disabled={isGenerating}>Last 30 Days</button>
            <button className={`${styles.chipBtn} ${dateRange === 'custom' ? styles.active : ''}`} onClick={() => setDateRange('custom')} disabled={isGenerating}>Custom Range</button>
          </div>
        </div>

        {dateRange === 'custom' && (
          <div className={styles.dateGrid}>
            <div className={styles.inputGroup}>
              <label className={styles.label}>Start Date</label>
              <input type="date" value={customStart} onChange={e => setCustomStart(e.target.value)} className={styles.dateInput} disabled={isGenerating} />
            </div>
            <div className={styles.inputGroup}>
              <label className={styles.label}>End Date</label>
              <input type="date" value={customEnd} onChange={e => setCustomEnd(e.target.value)} className={styles.dateInput} disabled={isGenerating} />
            </div>
          </div>
        )}
      </Popup>

      {/* Delete Confirmation */}
      <Popup 
        isOpen={reportToDelete !== null} 
        title="Delete Report Record" 
        onClose={() => setReportToDelete(null)}
        footerActions={
          <>
            <button onClick={() => setReportToDelete(null)} style={{ padding: '10px 15px', borderRadius: '10px', border: 'none', backgroundColor: 'var(--bg)', color: 'var(--text)', fontWeight: '600', cursor: 'pointer' }}>Cancel</button>
            <button onClick={confirmDelete} style={{ padding: '10px 15px', borderRadius: '10px', border: 'none', backgroundColor: 'var(--danger)', color: '#fff', fontWeight: '600', cursor: 'pointer' }}>Delete Record</button>
          </>
        }
      >
        <p>Are you sure you want to delete this report from the history log? The underlying data will not be affected.</p>
      </Popup>

      <Toast title={toast.title} message={toast.message} type={toast.type} isVisible={toast.isVisible} onClose={() => setToast(prev => ({ ...prev, isVisible: false }))} />

    </div>
  );
};

export default Reports;
