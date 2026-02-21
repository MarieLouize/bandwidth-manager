import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, Info, Target, Clock, Shield, 
  X, AlertTriangle, Eye, Save 
} from 'lucide-react';
import Tooltip from '../../../components/Tooltip/Tooltip';
import Toast from '../../../components/Toast/Toast';
import Popup from '../../../components/Popup/Popup';
import styles from './CreatePolicy.module.css';

// --- Types ---
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

const initialForm: PolicyFormState = {
  name: '', description: '', isActive: true,
  scope: [], days: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'],
  startTime: '08:00', endTime: '18:00',
  useLoadCondition: false, loadThreshold: '80',
  ruleType: 'MaxRate', bandwidthValue: '', priorityLevel: ''
};

const CreatePolicy: React.FC = () => {
  const navigate = useNavigate();

  const [form, setForm] = useState<PolicyFormState>(initialForm);
  const [errors, setErrors] = useState<Partial<Record<keyof PolicyFormState, string>>>({});
  
  // UI States
  const [scopeDropdown, setScopeDropdown] = useState('');
  const [hasConflict, setHasConflict] = useState(false);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [showCancelWarning, setShowCancelWarning] = useState(false);
  const [toast, setToast] = useState({ isVisible: false, title: '', message: '', type: 'success' as 'success'|'error' });

  const DAYS_OF_WEEK = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const SCOPE_OPTIONS = ['Students', 'Faculty', 'Guests', 'Admin', 'Lab-A', 'Library'];

  // --- Handlers: Form Updates ---
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    const val = type === 'checkbox' ? (e.target as HTMLInputElement).checked : value;
    setForm(prev => ({ ...prev, [name]: val }));
    if (errors[name as keyof PolicyFormState]) setErrors(prev => ({ ...prev, [name]: undefined }));
  };

  const handleScopeAdd = () => {
    if (scopeDropdown && !form.scope.includes(scopeDropdown)) {
      setForm(prev => ({ ...prev, scope: [...prev.scope, scopeDropdown] }));
      setErrors(prev => ({ ...prev, scope: undefined }));
    }
    setScopeDropdown('');
  };

  const removeScope = (item: string) => {
    setForm(prev => ({ ...prev, scope: prev.scope.filter(s => s !== item) }));
  };

  const toggleDay = (day: string) => {
    setForm(prev => {
      const newDays = prev.days.includes(day) 
        ? prev.days.filter(d => d !== day) 
        : [...prev.days, day];
      return { ...prev, days: newDays };
    });
  };

  // --- Validation & Conflicts ---
  // Mock conflict detection: if priority is 1 or 2, simulate a clash with existing core rules.
  useEffect(() => {
    if (form.ruleType === 'Priority' && (form.priorityLevel === '1' || form.priorityLevel === '2')) {
      setHasConflict(true);
    } else {
      setHasConflict(false);
    }
  }, [form.priorityLevel, form.ruleType]);

  const validateForm = (): boolean => {
    const newErrors: Partial<Record<keyof PolicyFormState, string>> = {};

    if (!form.name.trim()) newErrors.name = "Policy name is required";
    if (form.scope.length === 0) newErrors.scope = "Select at least one scope";
    
    if (form.startTime && form.endTime) {
      if (form.startTime >= form.endTime) newErrors.endTime = "End time must be after start time";
    }

    if (form.useLoadCondition && (!form.loadThreshold || Number(form.loadThreshold) <= 0 || Number(form.loadThreshold) > 100)) {
      newErrors.loadThreshold = "Threshold must be between 1 and 100";
    }

    if (form.ruleType !== 'Priority') {
      if (!form.bandwidthValue || Number(form.bandwidthValue) <= 0) newErrors.bandwidthValue = "Bandwidth must be > 0 Mbps";
    } else {
      if (!form.priorityLevel || Number(form.priorityLevel) < 1 || Number(form.priorityLevel) > 100) {
        newErrors.priorityLevel = "Priority must be between 1 and 100";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handlePreview = () => {
    if (validateForm()) setIsPreviewOpen(true);
    else setToast({ isVisible: true, title: 'Validation Error', message: 'Please fix the highlighted errors.', type: 'error' });
  };

  const handleSave = () => {
    setIsPreviewOpen(false);
    if (validateForm()) {
      // Mock Save
      setToast({ isVisible: true, title: 'Policy Created', message: `${form.name} saved successfully.`, type: 'success' });
      setTimeout(() => navigate('/policies'), 1500);
    }
  };

  const handleCancel = () => {
    if (form.name || form.scope.length > 0) setShowCancelWarning(true);
    else navigate('/policies');
  };

  return (
    <div className={styles.pageWrapper}>
      
      <div className={styles.header}>
        <button className={styles.backBtn} onClick={handleCancel} title="Cancel">
          <ArrowLeft size={20} />
        </button>
        <h1 className={styles.pageTitle}>Create New Policy</h1>
      </div>

      <div className={styles.progressTracker}>
        <span className={styles.progressStep}>1. Basic Info</span>
        <span className={styles.progressStep}>2. Scope</span>
        <span className={styles.progressStep}>3. Conditions</span>
        <span className={styles.progressStep}>4. Rules</span>
      </div>

      {/* --- Section 1: Basic Info --- */}
      <div className={`neu-outset ${styles.formSection}`}>
        <h3 className={styles.sectionTitle}><Info size={20}/> Basic Information</h3>
        
        <div className={styles.inputGroup}>
          <label className={styles.label}>Policy Name *</label>
          <Tooltip content={errors.name || ''} type="error" forceVisible={!!errors.name}>
            <input type="text" name="name" value={form.name} onChange={handleChange} placeholder="e.g. Student Throttle During Exams" className={`${styles.inputField} ${errors.name ? styles.error : ''}`} />
          </Tooltip>
        </div>

        <div className={styles.inputGroup}>
          <label className={styles.label}>Description</label>
          <textarea name="description" value={form.description} onChange={handleChange} placeholder="What is the purpose of this rule?" className={styles.inputField} />
        </div>

        <label className={styles.toggleContainer} style={{ marginTop: '10px' }}>
          <input type="checkbox" name="isActive" checked={form.isActive} onChange={handleChange} />
          <div className={styles.toggleTrack}><div className={styles.toggleKnob}></div></div>
          <span className={styles.toggleLabel}>Activate immediately upon saving</span>
        </label>
      </div>

      {/* --- Section 2: Scope --- */}
      <div className={`neu-outset ${styles.formSection}`}>
        <h3 className={styles.sectionTitle}><Target size={20}/> Target Scope</h3>
        
        <div className={styles.inputGroup}>
          <label className={styles.label}>Apply Policy To *</label>
          <div className={styles.scopeSelector}>
            <select value={scopeDropdown} onChange={(e) => setScopeDropdown(e.target.value)} className={styles.selectField}>
              <option value="" disabled>Select User Group or Dept...</option>
              {SCOPE_OPTIONS.filter(opt => !form.scope.includes(opt)).map(opt => (
                <option key={opt} value={opt}>{opt}</option>
              ))}
            </select>
            <button className={styles.addScopeBtn} onClick={handleScopeAdd} type="button">Add</button>
          </div>
          {errors.scope && <span style={{ color: 'var(--danger)', fontSize: '0.8rem', fontWeight: 600 }}>{errors.scope}</span>}
        </div>

        {form.scope.length > 0 && (
          <div className={styles.chipsContainer}>
            {form.scope.map(item => (
              <div key={item} className={styles.chip}>
                {item}
                <button className={styles.removeChipBtn} onClick={() => removeScope(item)}><X size={14}/></button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* --- Section 3: Conditions --- */}
      <div className={`neu-outset ${styles.formSection}`}>
        <h3 className={styles.sectionTitle}><Clock size={20}/> Enforcement Conditions</h3>
        
        <div className={styles.inputGroup}>
          <label className={styles.label}>Active Days</label>
          <div className={styles.daysContainer}>
            {DAYS_OF_WEEK.map(day => (
              <button key={day} type="button" onClick={() => toggleDay(day)} className={`${styles.dayBtn} ${form.days.includes(day) ? styles.active : ''}`}>
                {day.charAt(0)}
              </button>
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
                <input type="number" name="loadThreshold" value={form.loadThreshold} onChange={handleChange} placeholder="e.g. 80" className={`${styles.inputField} ${errors.loadThreshold ? styles.error : ''}`} />
              </Tooltip>
            </div>
          )}
        </div>
      </div>

      {/* --- Section 4: Rules --- */}
      <div className={`neu-outset ${styles.formSection}`}>
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
                <input type="number" name="bandwidthValue" value={form.bandwidthValue} onChange={handleChange} placeholder="e.g. 50" className={`${styles.inputField} ${errors.bandwidthValue ? styles.error : ''}`} />
              </Tooltip>
            </div>
          ) : (
            <div className={styles.inputGroup}>
              <label className={styles.label}>Priority Level (1-100) *</label>
              <Tooltip content={errors.priorityLevel || ''} type="error" forceVisible={!!errors.priorityLevel}>
                <input type="number" name="priorityLevel" value={form.priorityLevel} onChange={handleChange} placeholder="1 = Highest" className={`${styles.inputField} ${errors.priorityLevel ? styles.error : ''}`} />
              </Tooltip>
            </div>
          )}
        </div>
      </div>

      {/* Warning Box */}
      {hasConflict && (
        <div className={styles.warningBox}>
          <AlertTriangle size={24} color="var(--warning)" style={{ flexShrink: 0 }} />
          <div className={styles.warningContent}>
            <h4>Priority Conflict Detected</h4>
            <p>Another active policy ("Faculty Video Conf") already utilizes Priority Level {form.priorityLevel}. Saving this policy may cause unpredictable traffic shaping during congestion. Consider assigning a different priority.</p>
          </div>
        </div>
      )}

      {/* Actions */}
      <div className={styles.actionRow}>
        <button type="button" className={`${styles.btn} ${styles.cancelBtn}`} onClick={handleCancel}>Cancel</button>
        <button type="button" className={`${styles.btn} ${styles.previewBtn}`} onClick={handlePreview}><Eye size={18}/> Preview Policy</button>
        <button type="button" className={`${styles.btn} ${styles.saveBtn}`} onClick={handleSave}><Save size={18}/> Save Policy</button>
      </div>

      {/* --- Overlays --- */}
      <Popup isOpen={isPreviewOpen} title="Policy Summary" onClose={() => setIsPreviewOpen(false)} footerActions={<button onClick={handleSave} className={`${styles.btn} ${styles.saveBtn}`} style={{ padding: '10px 20px', width: 'auto' }}>Confirm & Save</button>}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '15px', fontSize: '0.95rem' }}>
          <p><strong>Name:</strong> {form.name}</p>
          <p><strong>Status:</strong> {form.isActive ? 'Active upon save' : 'Inactive'}</p>
          <p><strong>Scope:</strong> {form.scope.join(', ')}</p>
          <p><strong>Active Window:</strong> {form.days.length} days/week, {form.startTime} - {form.endTime}</p>
          {form.useLoadCondition && <p><strong>Trigger Condition:</strong> Network load exceeds {form.loadThreshold}%</p>}
          <p><strong>Rule:</strong> {form.ruleType === 'Priority' ? `Priority Level ${form.priorityLevel}` : `${form.ruleType} @ ${form.bandwidthValue} Mbps`}</p>
        </div>
      </Popup>

      <Popup isOpen={showCancelWarning} title="Discard Policy?" onClose={() => setShowCancelWarning(false)} footerActions={<><button onClick={() => setShowCancelWarning(false)} style={{ padding: '10px 15px', borderRadius: '10px', border: 'none', backgroundColor: 'var(--bg)', color: 'var(--text)', fontWeight: '600', cursor: 'pointer', boxShadow: '4px 4px 8px var(--shadow-dark), -4px -4px 8px var(--shadow-light)' }}>Keep Editing</button><button onClick={() => navigate('/policies')} style={{ padding: '10px 15px', borderRadius: '10px', border: 'none', backgroundColor: 'var(--danger)', color: '#fff', fontWeight: '600', cursor: 'pointer', boxShadow: '4px 4px 8px rgba(186, 59, 59, 0.3)' }}>Discard</button></>}>
        <p>You have unsaved policy configurations. Are you sure you want to leave this page?</p>
      </Popup>

      <Toast title={toast.title} message={toast.message} type={toast.type} isVisible={toast.isVisible} onClose={() => setToast(prev => ({ ...prev, isVisible: false }))} />

    </div>
  );
};

export default CreatePolicy;
