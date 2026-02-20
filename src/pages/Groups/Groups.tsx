import React, { useState } from 'react';
import { Plus, Users, Edit2, Trash2, UserMinus, UserPlus } from 'lucide-react';
import Popup from '../../components/Popup/Popup';
import Toast from '../../components/Toast/Toast';
import Tooltip from '../../components/Tooltip/Tooltip';
import styles from './Groups.module.css';

// --- Types & Mock Data ---
interface User { id: string; name: string; email: string; }
interface Group { id: string; name: string; department: string; description: string; members: User[]; }

const mockUsers: User[] = [
  { id: 'u1', name: 'Alice Johnson', email: 'alice@ui.edu.ng' },
  { id: 'u2', name: 'Bob Smith', email: 'bob@ui.edu.ng' },
  { id: 'u3', name: 'Dr. Charles', email: 'charles@ui.edu.ng' },
  { id: 'u4', name: 'Diana Prince', email: 'diana@ui.edu.ng' },
];

const initialGroups: Group[] = [
  { id: 'g1', name: 'CS Seniors', department: 'Computer Science', description: 'Final year CS students', members: [mockUsers[0], mockUsers[1]] },
  { id: 'g2', name: 'Faculty Admin', department: 'Admin', description: 'System administrators', members: [mockUsers[2]] },
  { id: 'g3', name: 'Library Guests', department: 'Library', description: 'Temporary library access', members: [] },
];

const Groups: React.FC = () => {
  const [groups, setGroups] = useState<Group[]>(initialGroups);
  const [toast, setToast] = useState({ isVisible: false, title: '', message: '', type: 'default' as 'success'|'error' });

  // Modal States
  const [modalMode, setModalMode] = useState<'add' | 'edit' | 'members' | 'delete' | null>(null);
  const [activeGroup, setActiveGroup] = useState<Group | null>(null);
  
  // Form State (for Add/Edit)
  const [formData, setFormData] = useState({ name: '', department: '', description: '' });
  const [formErrors, setFormErrors] = useState({ name: '', department: '' });

  // Assignment State (for Members Modal)
  const [selectedUserToAdd, setSelectedUserToAdd] = useState('');

  // --- Handlers ---
  const openAddModal = () => {
    setFormData({ name: '', department: '', description: '' });
    setFormErrors({ name: '', department: '' });
    setModalMode('add');
  };

  const openEditModal = (group: Group) => {
    setActiveGroup(group);
    setFormData({ name: group.name, department: group.department, description: group.description });
    setFormErrors({ name: '', department: '' });
    setModalMode('edit');
  };

  const handleSaveGroup = () => {
    // Validate
    let valid = true;
    const errors = { name: '', department: '' };
    
    if (!formData.name.trim()) { errors.name = 'Name is required'; valid = false; }
    else if (groups.some(g => g.name.toLowerCase() === formData.name.toLowerCase() && g.id !== activeGroup?.id)) {
      errors.name = 'Group name already exists'; valid = false;
    }
    if (!formData.department) { errors.department = 'Department is required'; valid = false; }
    
    setFormErrors(errors);

    if (valid) {
      if (modalMode === 'add') {
        const newGroup: Group = {
          id: `g${Date.now()}`,
          name: formData.name,
          department: formData.department,
          description: formData.description,
          members: []
        };
        setGroups([...groups, newGroup]);
        setToast({ isVisible: true, title: 'Group Created', message: `${newGroup.name} was created.`, type: 'success' });
      } else if (modalMode === 'edit' && activeGroup) {
        setGroups(groups.map(g => g.id === activeGroup.id ? { ...g, ...formData } : g));
        setToast({ isVisible: true, title: 'Group Updated', message: `${formData.name} was updated.`, type: 'success' });
      }
      setModalMode(null);
    }
  };

  const confirmDelete = () => {
    if (activeGroup) {
      if (activeGroup.members.length > 0) {
        setToast({ isVisible: true, title: 'Deletion Failed', message: 'Cannot delete a group that has assigned members.', type: 'error' });
      } else {
        setGroups(groups.filter(g => g.id !== activeGroup.id));
        setToast({ isVisible: true, title: 'Group Deleted', message: `${activeGroup.name} removed.`, type: 'success' });
      }
      setModalMode(null);
    }
  };

  const handleAddMember = () => {
    if (!activeGroup || !selectedUserToAdd) return;
    
    const user = mockUsers.find(u => u.id === selectedUserToAdd);
    if (!user) return;

    if (activeGroup.members.some(m => m.id === user.id)) {
      setToast({ isVisible: true, title: 'Duplicate', message: 'User is already in this group.', type: 'error' });
      return;
    }

    const updatedGroup = { ...activeGroup, members: [...activeGroup.members, user] };
    setGroups(groups.map(g => g.id === activeGroup.id ? updatedGroup : g));
    setActiveGroup(updatedGroup);
    setSelectedUserToAdd('');
    setToast({ isVisible: true, title: 'Member Added', message: `${user.name} added to group.`, type: 'success' });
  };

  const handleRemoveMember = (userId: string) => {
    if (!activeGroup) return;
    const updatedGroup = { ...activeGroup, members: activeGroup.members.filter(m => m.id !== userId) };
    setGroups(groups.map(g => g.id === activeGroup.id ? updatedGroup : g));
    setActiveGroup(updatedGroup);
  };

  return (
    <div className={styles.pageWrapper}>
      <div className={styles.header}>
        <h1 className={styles.pageTitle}>User Groups & Departments</h1>
        <button className={styles.addBtn} onClick={openAddModal}>
          <Plus size={18} /> Add New Group
        </button>
      </div>

      <div className={`neu-outset ${styles.tableContainer}`}>
        <div className={styles.tableWrapper}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Group Name</th>
                <th>Department</th>
                <th>Description</th>
                <th>Members</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {groups.length > 0 ? (
                groups.map(group => (
                  <tr key={group.id}>
                    <td><span className={styles.primaryText}>{group.name}</span></td>
                    <td><span className={styles.primaryText}>{group.department}</span></td>
                    <td><span className={styles.secondaryText}>{group.description || '--'}</span></td>
                    <td>
                      <span className={styles.primaryText} style={{ color: group.members.length > 0 ? 'var(--text)' : 'var(--text-light)' }}>
                        {group.members.length} User{group.members.length !== 1 ? 's' : ''}
                      </span>
                    </td>
                    <td>
                      <div className={styles.actionCell}>
                        <button className={`${styles.iconBtn} ${styles.viewBtn}`} title="Manage Members" onClick={() => { setActiveGroup(group); setModalMode('members'); }}>
                          <Users size={16} />
                        </button>
                        <button className={`${styles.iconBtn} ${styles.editBtn}`} title="Edit Group" onClick={() => openEditModal(group)}>
                          <Edit2 size={16} />
                        </button>
                        <button className={`${styles.iconBtn} ${styles.deleteBtn}`} title="Delete Group" onClick={() => { setActiveGroup(group); setModalMode('delete'); }}>
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr><td colSpan={5} style={{ textAlign: 'center', padding: '40px' }}>No groups found.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* --- Add / Edit Modal --- */}
      <Popup 
        isOpen={modalMode === 'add' || modalMode === 'edit'} 
        title={modalMode === 'add' ? 'Create New Group' : 'Edit Group'} 
        onClose={() => setModalMode(null)}
        footerActions={
          <>
            <button className={styles.iconBtn} style={{ padding: '10px 20px' }} onClick={() => setModalMode(null)}>Cancel</button>
            <button className={styles.addBtn} style={{ padding: '10px 20px', margin: 0 }} onClick={handleSaveGroup}>Save Group</button>
          </>
        }
      >
        <div className={styles.inputGroup}>
          <label className={styles.label}>Group Name *</label>
          <Tooltip content={formErrors.name} type="error" forceVisible={!!formErrors.name}>
            <input type="text" className={`${styles.inputField} ${formErrors.name ? styles.error : ''}`} value={formData.name} onChange={e => { setFormData({...formData, name: e.target.value}); setFormErrors({...formErrors, name: ''}); }} placeholder="e.g. Researchers" />
          </Tooltip>
        </div>
        <div className={styles.inputGroup}>
          <label className={styles.label}>Department *</label>
          <Tooltip content={formErrors.department} type="error" forceVisible={!!formErrors.department}>
            <select className={`${styles.inputField} ${styles.selectField} ${formErrors.department ? styles.error : ''}`} value={formData.department} onChange={e => { setFormData({...formData, department: e.target.value}); setFormErrors({...formErrors, department: ''}); }}>
              <option value="" disabled>Select Department</option>
              <option value="Computer Science">Computer Science</option>
              <option value="Admin">Admin</option>
              <option value="Library">Library</option>
            </select>
          </Tooltip>
        </div>
        <div className={styles.inputGroup}>
          <label className={styles.label}>Description</label>
          <input type="text" className={styles.inputField} value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} placeholder="Optional description..." />
        </div>
      </Popup>

      {/* --- Manage Members Modal --- */}
      <Popup 
        isOpen={modalMode === 'members'} 
        title={`Members: ${activeGroup?.name}`} 
        onClose={() => { setModalMode(null); setSelectedUserToAdd(''); }}
      >
        <div className={styles.assignRow}>
          <select className={`${styles.inputField} ${styles.selectField}`} value={selectedUserToAdd} onChange={(e) => setSelectedUserToAdd(e.target.value)}>
            <option value="" disabled>Select user to add...</option>
            {mockUsers.map(u => (
              <option key={u.id} value={u.id}>{u.name} ({u.email})</option>
            ))}
          </select>
          <button className={styles.assignBtn} onClick={handleAddMember} disabled={!selectedUserToAdd}>
            <UserPlus size={18} />
          </button>
        </div>

        <div className={styles.membersList}>
          {activeGroup?.members.length === 0 && <p style={{ fontSize: '0.85rem', color: 'var(--text-light)', textAlign: 'center' }}>No users currently assigned to this group.</p>}
          {activeGroup?.members.map(member => (
            <div key={member.id} className={styles.memberItem}>
              <div>
                <span className={styles.memberName}>{member.name}</span>
                <span className={styles.memberEmail} style={{ display: 'block' }}>{member.email}</span>
              </div>
              <button className={styles.removeBtn} onClick={() => handleRemoveMember(member.id)} title="Remove User">
                <UserMinus size={18} />
              </button>
            </div>
          ))}
        </div>
      </Popup>

      {/* --- Delete Confirmation --- */}
      <Popup 
        isOpen={modalMode === 'delete'} 
        title="Delete Group" 
        onClose={() => setModalMode(null)}
        footerActions={
          <>
            <button className={styles.iconBtn} style={{ padding: '10px 20px' }} onClick={() => setModalMode(null)}>Cancel</button>
            <button className={styles.addBtn} style={{ backgroundColor: 'var(--danger)', padding: '10px 20px', margin: 0 }} onClick={confirmDelete}>Delete</button>
          </>
        }
      >
        <p>Are you sure you want to delete <strong>{activeGroup?.name}</strong>?</p>
        {activeGroup && activeGroup.members.length > 0 && (
          <p style={{ color: 'var(--danger)', marginTop: '10px', fontSize: '0.85rem', fontWeight: 600 }}>
            Warning: This group currently has {activeGroup.members.length} assigned member(s). You must remove them before deleting.
          </p>
        )}
      </Popup>

      <Toast title={toast.title} message={toast.message} type={toast.type} isVisible={toast.isVisible} onClose={() => setToast(prev => ({ ...prev, isVisible: false }))} />
    </div>
  );
};

export default Groups;
