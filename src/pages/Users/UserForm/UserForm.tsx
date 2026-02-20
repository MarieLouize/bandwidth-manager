import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Save, Loader2 } from 'lucide-react';
import Tooltip from '../../../components/Tooltip/Tooltip';
import Toast from '../../../components/Toast/Toast';
import Popup from '../../../components/Popup/Popup';
import styles from './UserForm.module.css';

// Form State Interface
interface UserFormData {
  username: string;
  fullName: string;
  email: string;
  department: string;
  group: string;
  role: string;
  status: boolean; // true = Active
}

const initialFormState: UserFormData = {
  username: '', fullName: '', email: '', department: '', group: '', role: '', status: true
};

const UserForm: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>(); // Grabs ID from URL if editing
  const isEditMode = Boolean(id);

  // States
  const [formData, setFormData] = useState<UserFormData>(initialFormState);
  const [errors, setErrors] = useState<Partial<Record<keyof UserFormData, string>>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDirty, setIsDirty] = useState(false); // Tracks if form was modified
  
  // Overlay States
  const [toast, setToast] = useState({ isVisible: false, title: '', message: '', type: 'default' as 'success'|'error' });
  const [showCancelWarning, setShowCancelWarning] = useState(false);

  // --- Mock Data Fetching for Edit Mode ---
  useEffect(() => {
    if (isEditMode && id) {
      // Simulate API fetch based on ID
      setTimeout(() => {
        setFormData({
          username: 'user1',
          fullName: 'Mock User 1',
          email: 'user1@ui.edu.ng',
          department: 'Computer Science',
          group: 'Students',
          role: 'Standard',
          status: true
        });
      }, 500);
    }
  }, [isEditMode, id]);

  // --- Handlers ---
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    const finalValue = type === 'checkbox' ? (e.target as HTMLInputElement).checked : value;
    
    setFormData(prev => ({ ...prev, [name]: finalValue }));
    setIsDirty(true);
    
    // Clear error for this field when user starts typing
    if (errors[name as keyof UserFormData]) {
      setErrors(prev => ({ ...prev, [name]: undefined }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Partial<Record<keyof UserFormData, string>> = {};
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!formData.username.trim()) newErrors.username = "Username is required";
    if (!formData.fullName.trim()) newErrors.fullName = "Full name is required";
    
    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!emailRegex.test(formData.email)) {
      newErrors.email = "Invalid email format";
    }

    if (!formData.department) newErrors.department = "Select a department";
    if (!formData.group) newErrors.group = "Select a group";
    if (!formData.role) newErrors.role = "Select a role";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (validateForm()) {
      setIsSubmitting(true);
      
      // Mock API Save
      setTimeout(() => {
        setIsSubmitting(false);
        setIsDirty(false); // Reset dirty state on successful save
        setToast({ 
          isVisible: true, 
          title: isEditMode ? 'User Updated' : 'User Created', 
          message: `${formData.fullName} has been successfully saved.`, 
          type: 'success' 
        });
        
        // Redirect after short delay so user sees toast
        setTimeout(() => navigate('/users'), 1500);
      }, 1000);
    } else {
      setToast({ isVisible: true, title: 'Validation Error', message: 'Please correct the highlighted fields.', type: 'error' });
    }
  };

  const handleCancelClick = () => {
    if (isDirty) {
      setShowCancelWarning(true);
    } else {
      navigate('/users');
    }
  };

  return (
    <div className={styles.pageWrapper}>
      
      <div className={styles.header}>
        <button className={styles.backBtn} onClick={handleCancelClick} title="Back to Users">
          <ArrowLeft size={20} />
        </button>
        <h1 className={styles.pageTitle}>{isEditMode ? 'Edit User' : 'Add New User'}</h1>
      </div>

      <form className={`neu-outset ${styles.formCard}`} onSubmit={handleSubmit}>
        
        <div className={styles.formGrid}>
          {/* Full Name spans full width on desktop */}
          <div className={`${styles.inputGroup} ${styles.fullWidth}`}>
            <label htmlFor="fullName" className={styles.label}>Full Name *</label>
            <Tooltip content={errors.fullName || ''} type="error" forceVisible={!!errors.fullName}>
              <input 
                type="text" 
                id="fullName" 
                name="fullName"
                value={formData.fullName}
                onChange={handleChange}
                placeholder="e.g. Jane Doe"
                className={`${styles.inputField} ${errors.fullName ? styles.error : ''}`}
              />
            </Tooltip>
          </div>

          <div className={styles.inputGroup}>
            <label htmlFor="username" className={styles.label}>Username *</label>
            <Tooltip content={errors.username || ''} type="error" forceVisible={!!errors.username}>
              <input 
                type="text" 
                id="username" 
                name="username"
                value={formData.username}
                onChange={handleChange}
                placeholder="e.g. jdoe_admin"
                className={`${styles.inputField} ${errors.username ? styles.error : ''}`}
              />
            </Tooltip>
          </div>

          <div className={styles.inputGroup}>
            <label htmlFor="email" className={styles.label}>Email Address *</label>
            <Tooltip content={errors.email || ''} type="error" forceVisible={!!errors.email}>
              <input 
                type="email" 
                id="email" 
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="user@ui.edu.ng"
                className={`${styles.inputField} ${errors.email ? styles.error : ''}`}
              />
            </Tooltip>
          </div>

          <div className={styles.inputGroup}>
            <label htmlFor="department" className={styles.label}>Department *</label>
            <Tooltip content={errors.department || ''} type="error" forceVisible={!!errors.department}>
              <select 
                id="department" 
                name="department"
                value={formData.department}
                onChange={handleChange}
                className={`${styles.inputField} ${styles.selectField} ${errors.department ? styles.error : ''}`}
              >
                <option value="" disabled>Select Department</option>
                <option value="Computer Science">Computer Science</option>
                <option value="Mathematics">Mathematics</option>
                <option value="Physics">Physics</option>
                <option value="Admin">Admin</option>
                <option value="Library">Library</option>
              </select>
            </Tooltip>
          </div>

          <div className={styles.inputGroup}>
            <label htmlFor="group" className={styles.label}>Group *</label>
            <Tooltip content={errors.group || ''} type="error" forceVisible={!!errors.group}>
              <select 
                id="group" 
                name="group"
                value={formData.group}
                onChange={handleChange}
                className={`${styles.inputField} ${styles.selectField} ${errors.group ? styles.error : ''}`}
              >
                <option value="" disabled>Select Group</option>
                <option value="Students">Students</option>
                <option value="Faculty">Faculty</option>
                <option value="Staff">Staff</option>
                <option value="Guests">Guests</option>
              </select>
            </Tooltip>
          </div>

          <div className={styles.inputGroup}>
            <label htmlFor="role" className={styles.label}>Role *</label>
            <Tooltip content={errors.role || ''} type="error" forceVisible={!!errors.role}>
              <select 
                id="role" 
                name="role"
                value={formData.role}
                onChange={handleChange}
                className={`${styles.inputField} ${styles.selectField} ${errors.role ? styles.error : ''}`}
              >
                <option value="" disabled>Select Role</option>
                <option value="Standard">Standard</option>
                <option value="Elevated">Elevated (Faculty)</option>
                <option value="Restricted">Restricted (Guest)</option>
                <option value="Admin">System Admin</option>
              </select>
            </Tooltip>
          </div>
        </div>

        {/* Status Toggle */}
        <label className={styles.toggleContainer}>
          <input 
            type="checkbox" 
            name="status"
            checked={formData.status}
            onChange={handleChange}
          />
          <div className={styles.toggleTrack}>
            <div className={styles.toggleKnob}></div>
          </div>
          <span className={styles.toggleLabel}>
            Account Status: {formData.status ? <span style={{color: 'var(--success)'}}>Active</span> : <span style={{color: 'var(--text-light)'}}>Inactive</span>}
          </span>
        </label>

        {/* Form Actions */}
        <div className={styles.actionRow}>
          <button type="button" className={`${styles.btn} ${styles.cancelBtn}`} onClick={handleCancelClick} disabled={isSubmitting}>
            Cancel
          </button>
          <button type="submit" className={`${styles.btn} ${styles.saveBtn}`} disabled={isSubmitting}>
            {isSubmitting ? <Loader2 size={18} className="spin" /> : <Save size={18} />}
            {isEditMode ? 'Save Changes' : 'Create User'}
          </button>
        </div>

      </form>

      {/* Global Overlays */}
      <Toast 
        title={toast.title} message={toast.message} type={toast.type} 
        isVisible={toast.isVisible} onClose={() => setToast(prev => ({ ...prev, isVisible: false }))} 
      />

      <Popup 
        isOpen={showCancelWarning} title="Discard Changes?" onClose={() => setShowCancelWarning(false)}
        footerActions={
          <>
            <button onClick={() => setShowCancelWarning(false)} style={{ padding: '10px 15px', borderRadius: '10px', border: 'none', backgroundColor: 'var(--bg)', color: 'var(--text)', fontWeight: '600', cursor: 'pointer', boxShadow: '4px 4px 8px var(--shadow-dark), -4px -4px 8px var(--shadow-light)' }}>
              Keep Editing
            </button>
            <button onClick={() => navigate('/users')} style={{ padding: '10px 15px', borderRadius: '10px', border: 'none', backgroundColor: 'var(--danger)', color: '#fff', fontWeight: '600', cursor: 'pointer', boxShadow: '4px 4px 8px rgba(186, 59, 59, 0.3)' }}>
              Discard
            </button>
          </>
        }
      >
        <p>You have unsaved changes. Are you sure you want to leave this page? Your progress will be lost.</p>
      </Popup>

    </div>
  );
};

export default UserForm;
