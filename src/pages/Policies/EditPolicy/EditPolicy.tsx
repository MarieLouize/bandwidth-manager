import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { 
  ArrowLeft, Info, Target, Clock, Shield, 
  X, AlertTriangle, Eye, Save, History 
} from 'lucide-react';
import Tooltip from '../../../components/Tooltip/Tooltip';
import Toast from '../../../components/Toast/Toast';
import Popup from '../../../components/Popup/Popup';
import styles from './EditPolicy.module.css';

interface PolicyFormState {
  name: string;
  description: string;
  isActive: boolean;
  scope: string[];
  days: string[];
  startTime: string;
  endTime: string;
  useLoadCondition: boolean;
  loadThreshold: string;
  ruleType: 'MaxRate' | 'MinGuaranteed' | 'Priority';
  bandwidthValue: string;
  priorityLevel: string;
}

interface PolicyMetadata {
  lastModifiedBy: string;
  lastModifiedDate: string;
  inUse: boolean;
}

const EditPolicy: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();

  const [form, setForm] = useState<PolicyFormState | null>(null);
  const [originalForm, setOriginalForm] = useState<PolicyFormState | null>(null);
  const [meta, setMeta] = useState<PolicyMetadata | null>(null);
  const [errors, setErrors] = useState<Partial<Record<keyof PolicyFormState, string>>>({});
  
  // UI States
  const [scopeDropdown, setScopeDropdown] = useState('');
  const [hasConflict, setHasConflict] = useState(false);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [showInUseWarning, setShowInUseWarning] = useState(false);
  const [showCancelWarning, setShowCancelWarning] = useState(false);
  const [toast, setToast] = useState({ isVisible: false, title: '', message: '', type: 'success' as 'success'|'error' });

  const DAYS_OF_WEEK = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const SCOPE_OPTIONS = ['Students', 'Faculty', 'Guests', 'Admin', 'Lab-A', 'Library'];

  // --- Data Loading Mock ---
  useEffect(() => {
    // Simulate API fetch using ID
    if (id) {
      const mockFetchedData: PolicyFormState = {
        name: 'Faculty Video Conf',
        description: 'Prioritizes faculty video traffic during business hours.',
        isActive: true,
        scope: ['Faculty'],
        days: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'],
        startTime: '08:00',
        endTime: '18:00',
        useLoadCondition: false,
        loadThreshold: '80',
        ruleType: 'Priority',
        bandwidthValue: '',
        priorityLevel: '2'
      };
      
      const mockMeta: PolicyMetadata = {
        lastModifiedBy: 'admin_sys',
        lastModifiedDate: '2025-11-01 14:30',
        inUse: true // Force to true to test the force-save warning
      };

      setForm(mockFetchedData);
      setOriginalForm(mockFetchedData);
      setMeta(mockMeta);
    } else {
      navigate('/policies');
    }
  }, [id, navigate]);

  // --- Conflict Detection ---
  useEffect(() => {
    if (form && form.ruleType === 'Priority' && form.priorityLevel === '1') {
      setHasConflict(true); // Simulate conflict with Priority 1
    } else {
      setHasConflict(false);
    }
  }, [form?.priorityLevel, form?.ruleType]);

  if (!form || !originalForm || !meta) return <div style={{ padding: '40px', textAlign: 'center' }}>Loading policy data...</div>;

  // --- Handlers ---
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    const val = type === 'checkbox' ? (e.target as HTMLInputElement).checked : value;
    setForm(prev => prev ? { ...prev, [name]: val } : null);
    if (errors[name as keyof PolicyFormState]) setErrors(prev => ({ ...prev, [name]: undefined }));
  };

  const handleScopeAdd = () => {
    if (scopeDropdown && !form.scope.includes(scopeDropdown)) {
      setForm(prev => prev ? { ...prev, scope: [...prev.scope, scopeDropdown] } : null);
      setErrors(prev => ({ ...prev, scope: undefined }));
    }
    setScopeDropdown('');
  };

  const removeScope = (item: string) => {
    setForm(prev => prev ? { ...prev, scope: prev.scope.filter(s => s !== item) } : null);
  };

  const toggleDay = (day: string) => {
    setForm(prev => {
      if (!prev) return null;
      const newDays = prev.days.includes(day) ? prev.days.filter(d => d !== day) : [...prev.days, day];
      return { ...prev, days: newDays };
    });
  };

  // --- Validation & Saving ---
  const validateForm = (): boolean => {
    const newErrors: Partial<Record<keyof PolicyFormState, string>> = {};

    if (!form.name.trim()) newErrors.name = "Policy name is required";
    if (form.scope.length === 0) newErrors.scope = "Select at least one scope";
    if (form.startTime && form.endTime && form.startTime >= form.endTime) newErrors.endTime = "End time must be after start time";
    
    if (form.useLoadCondition && (!form.loadThreshold || Number(form.loadThreshold) <= 0 || Number(form.loadThreshold) > 100)) {
      newErrors.loadThreshold = "Must be 1-100";
    }

    if (form.ruleType !== 'Priority') {
      if (!form.bandwidthValue || Number(form.bandwidthValue) <= 0) newErrors.bandwidthValue = "Must be > 0";
    } else {
      if (!form.priorityLevel || Number(form.priorityLevel) < 1 || Number(form.priorityLevel) > 100) {
        newErrors.priorityLevel = "Must be 1-100";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const initiateSave = () => {
    setIsPreviewOpen(false);
    if (validateForm()) {
      if (meta.inUse) {
        setShowInUseWarning(true);
      } else {
        executeSave();
      }
    } else {
      setToast({ isVisible: true, title: 'Validation Error', message: 'Please fix the highlighted errors.', type: 'error' });
    }
  };

  const executeSave = () => {
    setShowInUseWarning(false);
    setToast({ isVisible: true, title: 'Policy Updated', message: `Changes to ${form.name} saved successfully.`, type: 'success' });
    setTimeout(() => navigate('/policies'), 1500);
  };

  const handlePreview = () => {
    if (validateForm()) setIsPreviewOpen(true);
    else setToast({ isVisible: true, title: 'Validation Error', message: 'Please fix the highlighted errors.', type: 'error' });
  };

  const handleCancel = () => {
    const isDirty = JSON.stringify(form) !== JSON.stringify(originalForm);
    if (isDirty) setShowCancelWarning(true);
    else navigate('/policies');
  };

  // Helper to highlight changes in preview
  const diff = (key: keyof PolicyFormState, label: string) => {
    const oldVal = originalForm[key]?.toString();
    const newVal = form[key]?.toString();
    if (oldVal !== newVal) {
      return (
        <div className={styles.diffItem}>
          <strong>{label}:</strong> <span className={styles.changed}>{oldVal || 'None'}</span> ➔ <span className={styles.newVal}>{newVal || 'None'}</span>
        </div>
      );
    }
    return <div className={styles.diffItem}><strong>{label}:</strong> {oldVal || 'None'}</div>;
  };

  return (
    <div className={styles.pageWrapper}>
      <div className={styles.header}>
        <button className={styles.backBtn} onClick={handleCancel} title="Cancel">
          <ArrowLeft size={20} />
        </button>
        <h1 className={styles.pageTitle}>Edit Policy: {originalForm.name}</h1>
      </div>

      <div className={styles.metaBanner}>
        <History size={16} />
        <span>Last modified by <strong>{meta.lastModifiedBy}</strong> on <strong>{meta.lastModifiedDate}</strong></span>
      </div>

      {/* --- Section 1: Basic Info --- */}
      <div className={styles.formSection}>
        <h3 className={styles.sectionTitle}><Info size={20}/> Basic Information</h3>
        <div className={styles.inputGroup}>
          <label className={styles.label}>Policy Name *</label>
          <Tooltip content={errors.name || ''} type="error" forceVisible={!!errors.name}>
            <input type="text" name="name" value={form.name} onChange={handleChange} className={`${styles.inputField} ${errors.name ? styles.error : ''}`} />
          </Tooltip>
        </div>
        <div className={styles.inputGroup}>
          <label className={styles.label}>Description</label>
          <textarea name="description" value={form.description} onChange={handleChange} className={styles.inputField} />
        </div>
        <label className={styles.toggleContainer} style={{ marginTop: '10px' }}>
          <input type="checkbox" name="isActive" checked={form.isActive} onChange={handleChange} />
          <div className={styles.toggleTrack}><div className={styles.toggleKnob}></div></div>
          <span className={styles.toggleLabel}>Active status</span>
        </label>
      </div>

      {/* --- Section 2: Scope --- */}
      <div className={styles.formSection}>
        <h3 className={styles.sectionTitle}><Target size={20}/> Target Scope</h3>
        <div className={styles.inputGroup}>
          <label className={styles.label}>Apply Policy To *</label>
          <div className={styles.scopeSelector}>
            <select value={scopeDropdown} onChange={(e) => setScopeDropdown(e.target.value)} className={styles.selectField}>
              <option value="" disabled>Select User Group or Dept...</option>
              {SCOPE_OPTIONS.filter(opt => !form.scope.includes(opt)).map(opt => <option key={opt} value={opt}>{opt}</option>)}
            </select>
            <button className={styles.addScopeBtn} onClick={handleScopeAdd} type="button">Add</button>
          </div>
          {errors.scope && <span style={{ color: 'var(--danger)', fontSize: '0.8rem', fontWeight: 600 }}>{errors.scope}</span>}
        </div>
        {form.scope.length > 0 && (
          <div className={styles.chipsContainer}>
            {form.scope.map(item => (
              <div key={item} className={styles.chip}>
                {item} <button className={styles.removeChipBtn} onClick={() => removeScope(item)}><X size={14}/></button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* --- Section 3: Conditions --- */}
      <div className={styles.formSection}>
        <h3 className={styles.sectionTitle}><Clock size={20}/> Enforcement Conditions</h3>
        <div className={styles.inputGroup}>
          <label className={styles.label}>Active Days</label>
          <div className={styles.daysContainer}>
            {DAYS_OF_WEEK.map(day => (
              <button key={day} type="button" onClick={() => toggleDay(day)} className={`${styles.dayBtn} ${form.days.includes(day) ? styles.active : ''}`}>{day.charAt(0)}</button>
            ))}
          </div>
        </div>
        <div className={styles.rowGrid} style={{ marginTop: '10px' }}>
          <div className={styles.inputGroup}>
            <label className={styles.label}>Start Time</label>
            <input type="time" name="startTime" value={form.startTime} onChange={handleChange} className={styles.inputField} />
          </div>
          <div className={styles.inputGroup}>
            <label className={styles.label}>End Time</label>
            <Tooltip content={errors.endTime || ''} type="error" forceVisible={!!errors.endTime}>
              <input type="time" name="endTime" value={form.endTime} onChange={handleChange} className={`${styles.inputField} ${errors.endTime ? styles.error : ''}`} />
            </Tooltip>
          </div>
        </div>
        <div style={{ marginTop: '20px', paddingTop: '20px', borderTop: '1px solid rgba(198, 216, 209, 0.4)' }}>
          <label className={styles.toggleContainer}>
            <input type="checkbox" name="useLoadCondition" checked={form.useLoadCondition} onChange={handleChange} />
            <div className={styles.toggleTrack}><div className={styles.toggleKnob}></div></div>
            <span className={styles.toggleLabel}>Trigger only during high network load</span>
          </label>
          {form.useLoadCondition && (
            <div className={styles.inputGroup} style={{ marginTop: '15px' }}>
              <label className={styles.label}>Load Threshold (%)</label>
              <Tooltip content={errors.loadThreshold || ''} type="error" forceVisible={!!errors.loadThreshold}>
                <input type="number" name="loadThreshold" value={form.loadThreshold} onChange={handleChange} className={`${styles.inputField} ${errors.loadThreshold ? styles.error : ''}`} />
              </Tooltip>
            </div>
          )}
        </div>
      </div>

      {/* --- Section 4: Rules --- */}
      <div className={styles.formSection}>
        <h3 className={styles.sectionTitle}><Shield size={20}/> Allocation Rules</h3>
        <div className={styles.radioGrid}>
          <div className={`${styles.radioCard} ${form.ruleType === 'MaxRate' ? styles.active : ''}`} onClick={() => setForm({...form, ruleType: 'MaxRate'})}>
            <span className={styles.radioTitle}>Max Rate Limit</span>
            <span className={styles.radioDesc}>Caps total bandwidth usage.</span>
          </div>
          <div className={`${styles.radioCard} ${form.ruleType === 'MinGuaranteed' ? styles.active : ''}`} onClick={() => setForm({...form, ruleType: 'MinGuaranteed'})}>
            <span className={styles.radioTitle}>Minimum Guarantee</span>
            <span className={styles.radioDesc}>Reserves bandwidth for scope.</span>
          </div>
          <div className={`${styles.radioCard} ${form.ruleType === 'Priority' ? styles.active : ''}`} onClick={() => setForm({...form, ruleType: 'Priority'})}>
            <span className={styles.radioTitle}>Traffic Priority</span>
            <span className={styles.radioDesc}>Drops lower priority packets first.</span>
          </div>
        </div>
        <div className={styles.rowGrid} style={{ marginTop: '20px' }}>
          {form.ruleType !== 'Priority' ? (
            <div className={styles.inputGroup}>
              <label className={styles.label}>Limit Value (Mbps) *</label>
              <Tooltip content={errors.bandwidthValue || ''} type="error" forceVisible={!!errors.bandwidthValue}>
                <input type="number" name="bandwidthValue" value={form.bandwidthValue} onChange={handleChange} className={`${styles.inputField} ${errors.bandwidthValue ? styles.error : ''}`} />
              </Tooltip>
            </div>
          ) : (
            <div className={styles.inputGroup}>
              <label className={styles.label}>Priority Level (1-100) *</label>
              <Tooltip content={errors.priorityLevel || ''} type="error" forceVisible={!!errors.priorityLevel}>
                <input type="number" name="priorityLevel" value={form.priorityLevel} onChange={handleChange} className={`${styles.inputField} ${errors.priorityLevel ? styles.error : ''}`} />
              </Tooltip>
            </div>
          )}
        </div>
      </div>

      {hasConflict && (
        <div className={styles.warningBox}>
          <AlertTriangle size={24} color="var(--warning)" style={{ flexShrink: 0 }} />
          <div className={styles.warningContent}>
            <h4>Priority Conflict Detected</h4>
            <p>Another policy already utilizes Priority Level {form.priorityLevel}. Saving this may cause unpredictable traffic shaping during congestion.</p>
          </div>
        </div>
      )}

      {/* Actions */}
      <div className={styles.actionRow}>
        <button type="button" className={`${styles.btn} ${styles.cancelBtn}`} onClick={handleCancel}>Cancel</button>
        <button type="button" className={`${styles.btn} ${styles.previewBtn}`} onClick={handlePreview}><Eye size={18}/> Preview Changes</button>
        <button type="button" className={`${styles.btn} ${styles.saveBtn}`} onClick={initiateSave}><Save size={18}/> Save Changes</button>
      </div>

      {/* --- Overlays --- */}
      <Popup isOpen={isPreviewOpen} title="Review Modifications" onClose={() => setIsPreviewOpen(false)} footerActions={<button onClick={initiateSave} className={`${styles.btn} ${styles.saveBtn}`} style={{ padding: '10px 20px', width: 'auto' }}>Confirm Updates</button>}>
        <p style={{ fontSize: '0.9rem', color: 'var(--text-light)', marginBottom: '10px' }}>Please review the differences before finalizing your changes.</p>
        <div className={styles.diffGrid}>
          <div className={styles.diffColumn}>
            <h5>Original Configuration</h5>
            <div className={styles.diffItem}><strong>Name:</strong> {originalForm.name}</div>
            <div className={styles.diffItem}><strong>Status:</strong> {originalForm.isActive ? 'Active' : 'Inactive'}</div>
            <div className={styles.diffItem}><strong>Scope:</strong> {originalForm.scope.join(', ')}</div>
            <div className={styles.diffItem}><strong>Rule:</strong> {originalForm.ruleType} ({originalForm.ruleType === 'Priority' ? originalForm.priorityLevel : originalForm.bandwidthValue})</div>
          </div>
          <div className={styles.diffColumn}>
            <h5>New Configuration</h5>
            {diff('name', 'Name')}
            {diff('isActive', 'Status')}
            {diff('scope', 'Scope')}
            {diff('ruleType', 'Rule')}
            {diff('priorityLevel', 'Priority')}
          </div>
        </div>
      </Popup>

      <Popup isOpen={showInUseWarning} title="Active Policy Modification" onClose={() => setShowInUseWarning(false)} footerActions={<><button onClick={() => setShowInUseWarning(false)} style={{ padding: '10px 15px', borderRadius: '10px', border: 'none', backgroundColor: 'var(--bg)', color: 'var(--text)', fontWeight: '600', cursor: 'pointer' }}>Cancel Save</button><button onClick={executeSave} style={{ padding: '10px 15px', borderRadius: '10px', border: 'none', backgroundColor: 'var(--warning)', color: '#fff', fontWeight: '600', cursor: 'pointer' }}>Force Update</button></>}>
        <p>You are editing a policy that is <strong>currently routing active traffic</strong>.</p>
        <p style={{ marginTop: '10px', fontSize: '0.85rem', color: 'var(--warning)', fontWeight: 600 }}>Applying changes immediately may cause temporary connection resets for users in the target scope. Do you wish to proceed?</p>
      </Popup>

      <Popup isOpen={showCancelWarning} title="Discard Edits?" onClose={() => setShowCancelWarning(false)} footerActions={<><button onClick={() => setShowCancelWarning(false)} style={{ padding: '10px 15px', borderRadius: '10px', border: 'none', backgroundColor: 'var(--bg)', color: 'var(--text)', fontWeight: '600', cursor: 'pointer' }}>Keep Editing</button><button onClick={() => navigate('/policies')} style={{ padding: '10px 15px', borderRadius: '10px', border: 'none', backgroundColor: 'var(--danger)', color: '#fff', fontWeight: '600', cursor: 'pointer' }}>Discard Changes</button></>}>
        <p>You have unsaved edits. Are you sure you want to leave? Your changes will be lost.</p>
      </Popup>

      <Toast title={toast.title} message={toast.message} type={toast.type} isVisible={toast.isVisible} onClose={() => setToast(prev => ({ ...prev, isVisible: false }))} />

    </div>
  );
};

export default EditPolicy;
