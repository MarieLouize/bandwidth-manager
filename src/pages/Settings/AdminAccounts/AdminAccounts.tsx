import React, { useState } from 'react';
import { Plus, Edit2, Trash2, KeyRound, ShieldAlert } from 'lucide-react';
import Popup from '../../../components/Popup/Popup';
import Toast from '../../../components/Toast/Toast';
import Tooltip from '../../../components/Tooltip/Tooltip';
import styles from './AdminAccounts.module.css';

// --- Types & Mock Data ---
type AdminRole = 'Super Admin' | 'Policy Editor' | 'Read Only';

interface AdminUser {
  id: string;
  username: string;
  fullName: string;
  email: string;
  role: AdminRole;
  status: 'Active' | 'Inactive';
  lastLogin: string;
}

const mockAdmins: AdminUser[] = [
  { id: 'a1', username: 'admin', fullName: 'Chief Administrator', email: 'admin@ui.edu.ng', role: 'Super Admin', status: 'Active', lastLogin: 'Just now' },
  { id: 'a2', username: 'jdoe', fullName: 'Jane Doe', email: 'jdoe@ui.edu.ng', role: 'Policy Editor', status: 'Active', lastLogin: '2 hours ago' },
  { id: 'a3', username: 'm_smith', fullName: 'Michael Smith', email: 'msmith@ui.edu.ng', role: 'Read Only', status: 'Inactive', lastLogin: '5 days ago' },
];

const AdminAccounts: React.FC = () => {
  // Use the mocked auth context to identify the current logged-in admin
  // (Assuming 'admin' is the default mock login from earlier)
  const currentUser = 'admin'; 

  const [admins, setAdmins] = useState<AdminUser[]>(mockAdmins);
  const [toast, setToast] = useState({ isVisible: false, title: '', message: '', type: 'success' as 'success'|'error' });

  // Modal States
  const [modalMode, setModalMode] = useState<'add' | 'edit' | 'password' | 'delete' | null>(null);
  const [activeAdmin, setActiveAdmin] = useState<AdminUser | null>(null);

  // Form States
  const [formData, setFormData] = useState({ username: '', fullName: '', email: '', role: 'Read Only' as AdminRole, status: 'Active' as 'Active'|'Inactive', password: '', confirmPassword: '' });
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  // --- Handlers ---
  const openModal = (mode: 'add' | 'edit' | 'password' | 'delete', admin?: AdminUser) => {
    setFormErrors({});
    if (mode === 'add') {
      setFormData({ username: '', fullName: '', email: '', role: 'Read Only', status: 'Active', password: '', confirmPassword: '' });
      setActiveAdmin(null);
    } else if (admin) {
      setActiveAdmin(admin);
      if (mode === 'edit') {
        setFormData({ ...formData, username: admin.username, fullName: admin.fullName, email: admin.email, role: admin.role, status: admin.status });
      } else if (mode === 'password') {
        setFormData({ ...formData, password: '', confirmPassword: '' });
      }
    }
    setModalMode(mode);
  };

  const handleToggleStatus = (admin: AdminUser) => {
    if (admin.username === currentUser) {
      setToast({ isVisible: true, title: 'Action Denied', message: 'You cannot deactivate your own account.', type: 'error' });
      return;
    }
    
    const newStatus = admin.status === 'Active' ? 'Inactive' : 'Active';
    setAdmins(admins.map(a => a.id === admin.id ? { ...a, status: newStatus } : a));
    setToast({ isVisible: true, title: 'Status Updated', message: `${admin.username} is now ${newStatus}.`, type: 'success' });
  };

  const validateForm = () => {
    const errors: Record<string, string> = {};
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (modalMode === 'add' || modalMode === 'edit') {
      if (!formData.username.trim()) errors.username = "Username is required";
      else if (modalMode === 'add' && admins.some(a => a.username === formData.username)) errors.username = "Username already exists";
      
      if (!formData.fullName.trim()) errors.fullName = "Full name is required";
      if (!formData.email.trim()) errors.email = "Email is required";
      else if (!emailRegex.test(formData.email)) errors.email = "Invalid email format";
    }

    if (modalMode === 'add' || modalMode === 'password') {
      if (!formData.password || formData.password.length < 8) errors.password = "Password must be 8+ characters";
      if (formData.password !== formData.confirmPassword) errors.confirmPassword = "Passwords do not match";
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSaveAdmin = () => {
    if (!validateForm()) return;

    if (modalMode === 'add') {
      const newAdmin: AdminUser = {
        id: `a${Date.now()}`,
        username: formData.username,
        fullName: formData.fullName,
        email: formData.email,
        role: formData.role,
        status: formData.status,
        lastLogin: 'Never'
      };
      setAdmins([...admins, newAdmin]);
      setToast({ isVisible: true, title: 'Admin Created', message: `${newAdmin.username} added successfully.`, type: 'success' });
    } else if (modalMode === 'edit' && activeAdmin) {
      setAdmins(admins.map(a => a.id === activeAdmin.id ? { ...a, fullName: formData.fullName, email: formData.email, role: formData.role, status: formData.status } : a));
      setToast({ isVisible: true, title: 'Admin Updated', message: `${activeAdmin.username} updated successfully.`, type: 'success' });
    } else if (modalMode === 'password' && activeAdmin) {
      setToast({ isVisible: true, title: 'Password Changed', message: `Credentials updated for ${activeAdmin.username}.`, type: 'success' });
    }

    setModalMode(null);
  };

  const confirmDelete = () => {
    if (!activeAdmin) return;

    if (activeAdmin.username === currentUser) {
      setToast({ isVisible: true, title: 'Action Denied', message: 'You cannot delete your own account.', type: 'error' });
      setModalMode(null);
      return;
    }

    if (activeAdmin.role === 'Super Admin') {
      const superAdminCount = admins.filter(a => a.role === 'Super Admin').length;
      if (superAdminCount <= 1) {
        setToast({ isVisible: true, title: 'Action Denied', message: 'Cannot delete the last Super Admin.', type: 'error' });
        setModalMode(null);
        return;
      }
    }

    setAdmins(admins.filter(a => a.id !== activeAdmin.id));
    setToast({ isVisible: true, title: 'Admin Deleted', message: `${activeAdmin.username} has been removed.`, type: 'success' });
    setModalMode(null);
  };

  // --- Helpers ---
  const getBadgeClass = (role: AdminRole) => {
    if (role === 'Super Admin') return styles.super;
    if (role === 'Policy Editor') return styles.editor;
    return styles.readonly;
  };

  return (
    <div className={styles.pageWrapper}>
      
      <div className={styles.header}>
        <h1 className={styles.pageTitle}>Administrator Accounts</h1>
        <button className={styles.addBtn} onClick={() => openModal('add')}>
          <Plus size={18} /> Add New Admin
        </button>
      </div>

      <div className={styles.tableContainer}>
        <div className={styles.tableWrapper}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Admin Details</th>
                <th>Role</th>
                <th>Status</th>
                <th>Last Login</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {admins.length > 0 ? (
                admins.map(admin => (
                  <tr key={admin.id}>
                    <td>
                      <span className={styles.primaryText}>{admin.fullName}</span>
                      <span className={styles.secondaryText}>{admin.username} • {admin.email}</span>
                    </td>
                    <td>
                      <span className={`${styles.roleBadge} ${getBadgeClass(admin.role)}`}>
                        {admin.role}
                      </span>
                    </td>
                    <td>
                      <div 
                        className={`${styles.toggleContainer} ${admin.status === 'Active' ? styles.active : ''}`}
                        onClick={() => handleToggleStatus(admin)}
                        title={admin.username === currentUser ? "Cannot deactivate yourself" : "Toggle status"}
                      >
                        <div className={styles.toggleTrack}><div className={styles.toggleKnob}></div></div>
                        <span style={{ fontSize: '0.85rem', fontWeight: 700, color: admin.status === 'Active' ? 'var(--success)' : 'var(--text-light)' }}>
                          {admin.status}
                        </span>
                      </div>
                    </td>
                    <td><span className={styles.secondaryText}>{admin.lastLogin}</span></td>
                    <td>
                      <div className={styles.actionCell}>
                        <Tooltip content="Edit Details" type="default">
                          <button className={styles.iconBtn} onClick={() => openModal('edit', admin)}><Edit2 size={16} /></button>
                        </Tooltip>
                        <Tooltip content="Reset Password" type="default">
                          <button className={styles.iconBtn} onClick={() => openModal('password', admin)}><KeyRound size={16} /></button>
                        </Tooltip>
                        <Tooltip content="Delete Account" type="default">
                          <button className={`${styles.iconBtn} ${styles.deleteBtn}`} onClick={() => openModal('delete', admin)}><Trash2 size={16} /></button>
                        </Tooltip>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr><td colSpan={5} style={{ textAlign: 'center', padding: '40px' }}>No admins found.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* --- Add / Edit Modal --- */}
      <Popup 
        isOpen={modalMode === 'add' || modalMode === 'edit'} 
        title={modalMode === 'add' ? 'Create New Admin' : `Edit: ${activeAdmin?.username}`} 
        onClose={() => setModalMode(null)}
        footerActions={
          <>
            <button className={styles.iconBtn} style={{ padding: '10px 20px' }} onClick={() => setModalMode(null)}>Cancel</button>
            <button className={styles.addBtn} style={{ padding: '10px 20px', margin: 0 }} onClick={handleSaveAdmin}>Save Account</button>
          </>
        }
      >
        <div className={styles.inputGroup}>
          <label className={styles.label}>Username *</label>
          <Tooltip content={formErrors.username || ''} type="error" forceVisible={!!formErrors.username}>
            <input type="text" value={formData.username} onChange={e => { setFormData({...formData, username: e.target.value}); setFormErrors({...formErrors, username: ''}); }} disabled={modalMode === 'edit'} className={`${styles.inputField} ${formErrors.username ? styles.error : ''}`} />
          </Tooltip>
        </div>
        <div className={styles.inputGroup}>
          <label className={styles.label}>Full Name *</label>
          <Tooltip content={formErrors.fullName || ''} type="error" forceVisible={!!formErrors.fullName}>
            <input type="text" value={formData.fullName} onChange={e => { setFormData({...formData, fullName: e.target.value}); setFormErrors({...formErrors, fullName: ''}); }} className={`${styles.inputField} ${formErrors.fullName ? styles.error : ''}`} />
          </Tooltip>
        </div>
        <div className={styles.inputGroup}>
          <label className={styles.label}>Email Address *</label>
          <Tooltip content={formErrors.email || ''} type="error" forceVisible={!!formErrors.email}>
            <input type="email" value={formData.email} onChange={e => { setFormData({...formData, email: e.target.value}); setFormErrors({...formErrors, email: ''}); }} className={`${styles.inputField} ${formErrors.email ? styles.error : ''}`} />
          </Tooltip>
        </div>
        <div className={styles.inputGroup}>
          <label className={styles.label}>System Role *</label>
          <select value={formData.role} onChange={e => setFormData({...formData, role: e.target.value as AdminRole})} className={styles.selectField}>
            <option value="Super Admin">Super Admin (Full Access)</option>
            <option value="Policy Editor">Policy Editor (Cannot alter Settings)</option>
            <option value="Read Only">Read Only (Analytics & Reports)</option>
          </select>
        </div>
        
        {modalMode === 'add' && (
          <>
            <div className={styles.inputGroup} style={{ marginTop: '20px' }}>
              <label className={styles.label}>Initial Password *</label>
              <Tooltip content={formErrors.password || ''} type="error" forceVisible={!!formErrors.password}>
                <input type="password" value={formData.password} onChange={e => { setFormData({...formData, password: e.target.value}); setFormErrors({...formErrors, password: ''}); }} className={`${styles.inputField} ${formErrors.password ? styles.error : ''}`} />
              </Tooltip>
            </div>
            <div className={styles.inputGroup}>
              <label className={styles.label}>Confirm Password *</label>
              <Tooltip content={formErrors.confirmPassword || ''} type="error" forceVisible={!!formErrors.confirmPassword}>
                <input type="password" value={formData.confirmPassword} onChange={e => { setFormData({...formData, confirmPassword: e.target.value}); setFormErrors({...formErrors, confirmPassword: ''}); }} className={`${styles.inputField} ${formErrors.confirmPassword ? styles.error : ''}`} />
              </Tooltip>
            </div>
          </>
        )}
      </Popup>

      {/* --- Change Password Modal --- */}
      <Popup 
        isOpen={modalMode === 'password'} 
        title={`Reset Password: ${activeAdmin?.username}`} 
        onClose={() => setModalMode(null)}
        footerActions={
          <>
            <button className={styles.iconBtn} style={{ padding: '10px 20px' }} onClick={() => setModalMode(null)}>Cancel</button>
            <button className={styles.addBtn} style={{ padding: '10px 20px', margin: 0 }} onClick={handleSaveAdmin}>Update Credentials</button>
          </>
        }
      >
        <div className={styles.inputGroup}>
          <label className={styles.label}>New Password *</label>
          <Tooltip content={formErrors.password || ''} type="error" forceVisible={!!formErrors.password}>
            <input type="password" value={formData.password} onChange={e => { setFormData({...formData, password: e.target.value}); setFormErrors({...formErrors, password: ''}); }} className={`${styles.inputField} ${formErrors.password ? styles.error : ''}`} />
          </Tooltip>
        </div>
        <div className={styles.inputGroup}>
          <label className={styles.label}>Confirm New Password *</label>
          <Tooltip content={formErrors.confirmPassword || ''} type="error" forceVisible={!!formErrors.confirmPassword}>
            <input type="password" value={formData.confirmPassword} onChange={e => { setFormData({...formData, confirmPassword: e.target.value}); setFormErrors({...formErrors, confirmPassword: ''}); }} className={`${styles.inputField} ${formErrors.confirmPassword ? styles.error : ''}`} />
          </Tooltip>
        </div>
      </Popup>

      {/* --- Delete Confirmation --- */}
      <Popup 
        isOpen={modalMode === 'delete'} 
        title="Delete Administrator" 
        onClose={() => setModalMode(null)}
        footerActions={
          <>
            <button className={styles.iconBtn} style={{ padding: '10px 20px' }} onClick={() => setModalMode(null)}>Cancel</button>
            <button className={styles.addBtn} style={{ backgroundColor: 'var(--danger)', padding: '10px 20px', margin: 0 }} onClick={confirmDelete}>Permanently Delete</button>
          </>
        }
      >
        <div style={{ display: 'flex', gap: '15px', alignItems: 'flex-start' }}>
          <ShieldAlert size={24} color="var(--danger)" style={{ flexShrink: 0 }} />
          <div>
            <p>Are you sure you want to permanently delete the administrator account for <strong>{activeAdmin?.username}</strong>?</p>
            <p style={{ marginTop: '10px', fontSize: '0.85rem', color: 'var(--text-light)' }}>They will immediately lose access to the system dashboard.</p>
          </div>
        </div>
      </Popup>

      <Toast title={toast.title} message={toast.message} type={toast.type} isVisible={toast.isVisible} onClose={() => setToast(prev => ({ ...prev, isVisible: false }))} />

    </div>
  );
};

export default AdminAccounts;
