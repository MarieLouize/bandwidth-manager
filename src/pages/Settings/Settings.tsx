import React, { useState, useEffect } from 'react';
import { 
  Server, Shield, Activity, Bell, Settings as SettingsIcon, 
  Save, RotateCcw, X, Plus 
} from 'lucide-react';
import Tooltip from '../../components/Tooltip/Tooltip';
import Toast from '../../components/Toast/Toast';
import Popup from '../../components/Popup/Popup';
import styles from './Settings.module.css';

// --- Types ---
interface SystemConfig {
  networkCapacity: string; // Mbps
  defaultUserAlloc: string; // Mbps
  defaultGroupAlloc: string; // Mbps
  dashboardRefresh: string; // Seconds
  dataRetention: string; // Days
  highUsageThreshold: string; // %
  criticalThreshold: string; // %
  alertEmails: string[];
  sessionTimeout: string; // Minutes
}

const DEFAULT_CONFIG: SystemConfig = {
  networkCapacity: '10000', // 10 Gbps
  defaultUserAlloc: '10',
  defaultGroupAlloc: '500',
  dashboardRefresh: '10',
  dataRetention: '90',
  highUsageThreshold: '75',
  criticalThreshold: '90',
  alertEmails: ['admin@ui.edu.ng'],
  sessionTimeout: '30'
};

const Settings: React.FC = () => {
  // States
  const [config, setConfig] = useState<SystemConfig>(DEFAULT_CONFIG);
  const [errors, setErrors] = useState<Partial<Record<keyof SystemConfig, string>>>({});
  
  // UI States
  const [newEmail, setNewEmail] = useState('');
  const [emailError, setEmailError] = useState('');
  const [isSaveModalOpen, setIsSaveModalOpen] = useState(false);
  const [isResetModalOpen, setIsResetModalOpen] = useState(false);
  const [toast, setToast] = useState({ isVisible: false, title: '', message: '', type: 'success' as 'success'|'error' });

  // Simulate loading from API
  useEffect(() => {
    // In a real app, fetch config from API here. For now, we start with DEFAULT_CONFIG.
  }, []);

  // --- Handlers ---
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setConfig(prev => ({ ...prev, [name]: value }));
    if (errors[name as keyof SystemConfig]) setErrors(prev => ({ ...prev, [name]: undefined }));
  };

  const handleAddEmail = () => {
    setEmailError('');
    if (!newEmail.trim()) return;
    
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(newEmail)) {
      setEmailError('Invalid email format');
      return;
    }
    if (config.alertEmails.includes(newEmail)) {
      setEmailError('Email already exists');
      return;
    }

    setConfig(prev => ({ ...prev, alertEmails: [...prev.alertEmails, newEmail] }));
    setNewEmail('');
  };

  const handleRemoveEmail = (email: string) => {
    setConfig(prev => ({ ...prev, alertEmails: prev.alertEmails.filter(e => e !== email) }));
  };

  // --- Validation ---
  const validateConfig = (): boolean => {
    const newErrors: Partial<Record<keyof SystemConfig, string>> = {};
    const capacity = Number(config.networkCapacity);

    // Section 1 & 2
    if (!capacity || capacity <= 0) newErrors.networkCapacity = "Must be greater than 0";
    if (!Number(config.defaultUserAlloc) || Number(config.defaultUserAlloc) <= 0) newErrors.defaultUserAlloc = "Must be > 0";
    if (!Number(config.defaultGroupAlloc) || Number(config.defaultGroupAlloc) <= 0) newErrors.defaultGroupAlloc = "Must be > 0";
    
    // Interdependent logic
    if (capacity > 0) {
      if (Number(config.defaultUserAlloc) > capacity) newErrors.defaultUserAlloc = "Cannot exceed capacity";
      if (Number(config.defaultGroupAlloc) > capacity) newErrors.defaultGroupAlloc = "Cannot exceed capacity";
    }

    // Section 4
    const high = Number(config.highUsageThreshold);
    const crit = Number(config.criticalThreshold);
    if (!high || high <= 0 || high > 100) newErrors.highUsageThreshold = "Must be 1-100";
    if (!crit || crit <= 0 || crit > 100) newErrors.criticalThreshold = "Must be 1-100";
    if (high && crit && high >= crit) newErrors.criticalThreshold = "Critical must be > High";

    // Section 5
    if (!Number(config.sessionTimeout) || Number(config.sessionTimeout) < 5) newErrors.sessionTimeout = "Min 5 minutes";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const initiateSave = () => {
    if (validateConfig()) setIsSaveModalOpen(true);
    else setToast({ isVisible: true, title: 'Validation Failed', message: 'Please correct the highlighted fields.', type: 'error' });
  };

  const executeSave = () => {
    setIsSaveModalOpen(false);
    // Simulate API Save
    setToast({ isVisible: true, title: 'Settings Saved', message: 'Global configuration updated successfully.', type: 'success' });
  };

  const executeReset = () => {
    setConfig(DEFAULT_CONFIG);
    setErrors({});
    setIsResetModalOpen(false);
    setToast({ isVisible: true, title: 'Settings Reset', message: 'Restored to factory defaults.', type: 'success' });
  };

  return (
    <div className={styles.pageWrapper}>
      
      <div className={styles.header}>
        <h1 className={styles.pageTitle}>System Configuration</h1>
        <span className={styles.pageSub}>Global settings, baseline capacities, and administrative preferences.</span>
      </div>

      {/* Section 1: Capacity */}
      <div className={styles.sectionCard}>
        <h2 className={styles.sectionTitle}><Server size={20} /> Network Foundation</h2>
        <div className={styles.rowGrid}>
          <div className={styles.inputGroup}>
            <label className={styles.label}>Total Uplink Capacity (Mbps) *</label>
            <Tooltip content={errors.networkCapacity || ''} type="error" forceVisible={!!errors.networkCapacity}>
              <input type="number" name="networkCapacity" value={config.networkCapacity} onChange={handleChange} className={`${styles.inputField} ${errors.networkCapacity ? styles.error : ''}`} />
            </Tooltip>
            <span className={styles.inputHelp}>Absolute maximum external bandwidth. (10 Gbps = 10,000 Mbps)</span>
          </div>
        </div>
      </div>

      {/* Section 2: Default Allocation */}
      <div className={styles.sectionCard}>
        <h2 className={styles.sectionTitle}><Shield size={20} /> Default Allocations</h2>
        <div className={styles.rowGrid}>
          <div className={styles.inputGroup}>
            <label className={styles.label}>Default User Rate Limit (Mbps) *</label>
            <Tooltip content={errors.defaultUserAlloc || ''} type="error" forceVisible={!!errors.defaultUserAlloc}>
              <input type="number" name="defaultUserAlloc" value={config.defaultUserAlloc} onChange={handleChange} className={`${styles.inputField} ${errors.defaultUserAlloc ? styles.error : ''}`} />
            </Tooltip>
            <span className={styles.inputHelp}>Applied to new users without specific policies.</span>
          </div>
          <div className={styles.inputGroup}>
            <label className={styles.label}>Default Group Rate Limit (Mbps) *</label>
            <Tooltip content={errors.defaultGroupAlloc || ''} type="error" forceVisible={!!errors.defaultGroupAlloc}>
              <input type="number" name="defaultGroupAlloc" value={config.defaultGroupAlloc} onChange={handleChange} className={`${styles.inputField} ${errors.defaultGroupAlloc ? styles.error : ''}`} />
            </Tooltip>
            <span className={styles.inputHelp}>Aggregate max for unconfigured groups.</span>
          </div>
        </div>
      </div>

      {/* Section 3: Data & Monitoring */}
      <div className={styles.sectionCard}>
        <h2 className={styles.sectionTitle}><Activity size={20} /> Data & Telemetry</h2>
        <div className={styles.rowGrid}>
          <div className={styles.inputGroup}>
            <label className={styles.label}>Real-Time Refresh Interval</label>
            <select name="dashboardRefresh" value={config.dashboardRefresh} onChange={handleChange} className={styles.selectField}>
              <option value="5">Every 5 Seconds</option>
              <option value="10">Every 10 Seconds</option>
              <option value="30">Every 30 Seconds</option>
            </select>
          </div>
          <div className={styles.inputGroup}>
            <label className={styles.label}>Historical Data Retention</label>
            <select name="dataRetention" value={config.dataRetention} onChange={handleChange} className={styles.selectField}>
              <option value="30">30 Days</option>
              <option value="90">90 Days</option>
              <option value="365">1 Year</option>
            </select>
          </div>
        </div>
      </div>

      {/* Section 4: Alerts */}
      <div className={styles.sectionCard}>
        <h2 className={styles.sectionTitle}><Bell size={20} /> Alert Thresholds & Notification</h2>
        <div className={styles.rowGrid}>
          <div className={styles.inputGroup}>
            <label className={styles.label}>High Usage Warning Threshold (%) *</label>
            <Tooltip content={errors.highUsageThreshold || ''} type="error" forceVisible={!!errors.highUsageThreshold}>
              <input type="number" name="highUsageThreshold" value={config.highUsageThreshold} onChange={handleChange} className={`${styles.inputField} ${errors.highUsageThreshold ? styles.error : ''}`} />
            </Tooltip>
          </div>
          <div className={styles.inputGroup}>
            <label className={styles.label}>Critical Saturation Threshold (%) *</label>
            <Tooltip content={errors.criticalThreshold || ''} type="error" forceVisible={!!errors.criticalThreshold}>
              <input type="number" name="criticalThreshold" value={config.criticalThreshold} onChange={handleChange} className={`${styles.inputField} ${errors.criticalThreshold ? styles.error : ''}`} />
            </Tooltip>
          </div>
        </div>
        
        <div className={styles.inputGroup} style={{ marginTop: '10px' }}>
          <label className={styles.label}>System Alert Recipients</label>
          <div className={styles.emailWrapper}>
            <div className={styles.emailInputRow}>
              <Tooltip content={emailError} type="error" forceVisible={!!emailError}>
                <input type="email" value={newEmail} onChange={(e) => { setNewEmail(e.target.value); setEmailError(''); }} placeholder="admin@ui.edu.ng" className={`${styles.inputField} ${emailError ? styles.error : ''}`} />
              </Tooltip>
              <button className={styles.addBtn} onClick={handleAddEmail} type="button"><Plus size={18} /></button>
            </div>
            {config.alertEmails.length > 0 && (
              <div className={styles.emailList}>
                {config.alertEmails.map(email => (
                  <div key={email} className={styles.emailPill}>
                    {email} <button className={styles.removeBtn} onClick={() => handleRemoveEmail(email)}><X size={16} /></button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Section 5: Admin Session */}
      <div className={styles.sectionCard}>
        <h2 className={styles.sectionTitle}><SettingsIcon size={20} /> Security Settings</h2>
        <div className={styles.rowGrid}>
          <div className={styles.inputGroup}>
            <label className={styles.label}>Admin Session Timeout (Minutes) *</label>
            <Tooltip content={errors.sessionTimeout || ''} type="error" forceVisible={!!errors.sessionTimeout}>
              <input type="number" name="sessionTimeout" value={config.sessionTimeout} onChange={handleChange} className={`${styles.inputField} ${errors.sessionTimeout ? styles.error : ''}`} />
            </Tooltip>
            <span className={styles.inputHelp}>Inactivity time before requiring re-authentication.</span>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className={styles.actionRow}>
        <button type="button" className={`${styles.btn} ${styles.resetBtn}`} onClick={() => setIsResetModalOpen(true)}>
          <RotateCcw size={18} /> Restore Defaults
        </button>
        <button type="button" className={`${styles.btn} ${styles.saveBtn}`} onClick={initiateSave}>
          <Save size={18} /> Apply Changes
        </button>
      </div>

      <div className={styles.metaFooter}>
        Last updated by <strong>admin_sys</strong> on <strong>{new Date().toLocaleDateString()}</strong>
      </div>

      {/* Overlays */}
      <Popup isOpen={isSaveModalOpen} title="Apply System Configuration?" onClose={() => setIsSaveModalOpen(false)} footerActions={<><button onClick={() => setIsSaveModalOpen(false)} style={{ padding: '10px 15px', borderRadius: '10px', border: 'none', backgroundColor: 'var(--bg)', color: 'var(--text)', fontWeight: '600', cursor: 'pointer' }}>Cancel</button><button onClick={executeSave} style={{ padding: '10px 15px', borderRadius: '10px', border: 'none', backgroundColor: 'var(--accent)', color: '#fff', fontWeight: '600', cursor: 'pointer' }}>Yes, Apply</button></>}>
        <p>You are about to change global parameters that govern network behavior. Changes will take effect across the entire system immediately.</p>
      </Popup>

      <Popup isOpen={isResetModalOpen} title="Factory Reset Settings" onClose={() => setIsResetModalOpen(false)} footerActions={<><button onClick={() => setIsResetModalOpen(false)} style={{ padding: '10px 15px', borderRadius: '10px', border: 'none', backgroundColor: 'var(--bg)', color: 'var(--text)', fontWeight: '600', cursor: 'pointer' }}>Cancel</button><button onClick={executeReset} style={{ padding: '10px 15px', borderRadius: '10px', border: 'none', backgroundColor: 'var(--danger)', color: '#fff', fontWeight: '600', cursor: 'pointer' }}>Yes, Reset</button></>}>
        <p>Are you sure you want to discard all current configurations and revert to the system defaults? This cannot be undone.</p>
      </Popup>

      <Toast title={toast.title} message={toast.message} type={toast.type} isVisible={toast.isVisible} onClose={() => setToast(prev => ({ ...prev, isVisible: false }))} />

    </div>
  );
};

export default Settings;
