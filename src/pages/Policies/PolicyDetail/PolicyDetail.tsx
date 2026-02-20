import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { 
  ArrowLeft, Edit2, Trash2, Info, Target, 
  Clock, Shield, Users, Activity 
} from 'lucide-react';
import Popup from '../../../components/Popup/Popup';
import Toast from '../../../components/Toast/Toast';
import Tooltip from '../../../components/Tooltip/Tooltip';
import styles from './PolicyDetail.module.css';

// --- Types & Mock Data ---
interface AffectedUser {
  id: string;
  name: string;
  email: string;
  group: string;
}

interface PolicyDetailData {
  id: string;
  name: string;
  description: string;
  status: 'Active' | 'Inactive';
  scope: string[];
  days: string[];
  timeRange: string;
  loadCondition: string;
  ruleDetails: string;
  priority: number;
  inUse: boolean;
  affectedUsers: AffectedUser[];
  createdBy: string;
  createdDate: string;
  modifiedBy: string;
  modifiedDate: string;
}

const generateMockUsers = (count: number): AffectedUser[] => {
  return Array.from({ length: count }, (_, i) => ({
    id: `usr_${i + 1}`,
    name: `Faculty Member ${i + 1}`,
    email: `faculty${i + 1}@ui.edu.ng`,
    group: 'Faculty'
  }));
};

const EditPolicyDetail: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();

  const [policy, setPolicy] = useState<PolicyDetailData | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [toast, setToast] = useState({ isVisible: false, title: '', message: '', type: 'success' as 'success'|'error' });

  useEffect(() => {
    // Simulate API fetch
    if (id) {
      setTimeout(() => {
        setPolicy({
          id: id,
          name: 'Faculty Video Conf',
          description: 'Prioritizes faculty video conferencing traffic (Zoom, Teams, Meet) during business hours to ensure undisrupted lectures.',
          status: 'Active',
          scope: ['Faculty', 'Admin'],
          days: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'],
          timeRange: '08:00 AM - 06:00 PM',
          loadCondition: 'None (Always Active)',
          ruleDetails: 'Traffic Priority',
          priority: 2,
          inUse: true, // Set to true to test the disabled delete button
          affectedUsers: generateMockUsers(14), // Generate 14 users to test the "+4 more" text
          createdBy: 'admin_sys',
          createdDate: '2025-09-01 09:00',
          modifiedBy: 'net_engineer_1',
          modifiedDate: '2025-11-01 14:30',
        });
      }, 400);
    } else {
      navigate('/policies');
    }
  }, [id, navigate]);

  if (!policy) return <div style={{ padding: '40px', textAlign: 'center' }}>Loading policy details...</div>;

  // --- Handlers ---
  const handleEdit = () => navigate(`/policies/edit/${policy.id}`);
  
  const confirmDelete = () => {
    setIsDeleteDialogOpen(false);
    setToast({ isVisible: true, title: 'Policy Deleted', message: `${policy.name} has been removed.`, type: 'success' });
    setTimeout(() => navigate('/policies'), 1500);
  };

  const displayedUsers = policy.affectedUsers.slice(0, 10);
  const hiddenUsersCount = policy.affectedUsers.length - displayedUsers.length;

  return (
    <div className={styles.pageWrapper}>
      
      {/* Header */}
      <div className={styles.header}>
        <div className={styles.headerTop}>
          <button className={styles.backBtn} onClick={() => navigate('/policies')} title="Back to Policies">
            <ArrowLeft size={20} />
          </button>
          <h1 className={styles.pageTitle}>Policy: {policy.name}</h1>
        </div>
        <div className={`${styles.statusBadge} ${styles[policy.status.toLowerCase()]}`}>
          <div className={styles.dot}></div>
          {policy.status}
        </div>
      </div>

      <div className={styles.grid}>
        
        {/* Card 1: Basic Details */}
        <div className={`neu-outset ${styles.card}`}>
          <h3 className={styles.cardTitle}><Info size={20}/> Basic Details</h3>
          <div className={styles.dataGroup}>
            <span className={styles.dataLabel}>Description</span>
            <span className={styles.dataValue}>{policy.description || 'No description provided.'}</span>
          </div>
          <div className={styles.dataGroup} style={{ marginTop: '10px' }}>
            <span className={styles.dataLabel}>Policy ID</span>
            <span className={styles.dataValue} style={{ fontFamily: 'monospace' }}>{policy.id}</span>
          </div>
        </div>

        {/* Card 2: Scope */}
        <div className={`neu-outset ${styles.card}`}>
          <h3 className={styles.cardTitle}><Target size={20}/> Target Scope</h3>
          <div className={styles.dataGroup}>
            <span className={styles.dataLabel}>Applied To ({policy.scope.length} Groups)</span>
            <div className={styles.chipsContainer}>
              {policy.scope.map(s => <div key={s} className={styles.chip}>{s}</div>)}
            </div>
          </div>
        </div>

        {/* Card 3: Conditions */}
        <div className={`neu-outset ${styles.card}`}>
          <h3 className={styles.cardTitle}><Clock size={20}/> Enforcement Conditions</h3>
          <div className={styles.dataGroup}>
            <span className={styles.dataLabel}>Active Window</span>
            <span className={styles.dataValue}>{policy.days.join(', ')}</span>
            <span className={styles.dataValue} style={{ color: 'var(--text-light)' }}>{policy.timeRange}</span>
          </div>
          <div className={styles.dataGroup} style={{ marginTop: '15px' }}>
            <span className={styles.dataLabel}>Network Load Trigger</span>
            <span className={styles.dataValue}>{policy.loadCondition}</span>
          </div>
        </div>

        {/* Card 4: Rules & Status */}
        <div className={`neu-outset ${styles.card}`}>
          <h3 className={styles.cardTitle}><Shield size={20}/> Allocation Rules</h3>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
            <div className={styles.dataGroup}>
              <span className={styles.dataLabel}>Rule Type</span>
              <span className={styles.dataValue}>{policy.ruleDetails}</span>
            </div>
            <div className={styles.dataGroup}>
              <span className={styles.dataLabel}>Priority Level</span>
              <span className={styles.dataValue} style={{ color: 'var(--accent)', fontSize: '1.2rem', fontWeight: 800 }}>
                {policy.priority}
              </span>
            </div>
          </div>
          
          <div className={styles.dataGroup} style={{ marginTop: '15px', paddingTop: '15px', borderTop: '1px dashed var(--shadow-dark)' }}>
            <span className={styles.dataLabel}>Current Enforcement</span>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '5px' }}>
              <Activity size={16} color={policy.status === 'Active' ? 'var(--success)' : 'var(--text-light)'} />
              <span className={styles.dataValue} style={{ color: policy.status === 'Active' ? 'var(--success)' : 'var(--text-light)' }}>
                {policy.status === 'Active' ? 'Actively shaping network traffic' : 'Policy is dormant'}
              </span>
            </div>
          </div>
        </div>

        {/* Card 5: Affected Users (Spans full width) */}
        <div className={`neu-outset ${styles.card} ${styles.usersCard}`}>
          <h3 className={styles.cardTitle}><Users size={20}/> Affected Users</h3>
          <p className={styles.userCount}>
            Currently applying to <strong>{policy.affectedUsers.length}</strong> active users on the network.
          </p>
          
          <div className={styles.usersList}>
            {displayedUsers.map(user => (
              <div key={user.id} className={styles.userRow}>
                <div className={styles.userInfo}>
                  <span className={styles.userName}>{user.name}</span>
                  <span className={styles.userEmail}>{user.email}</span>
                </div>
                <span className={styles.userGroup}>{user.group}</span>
              </div>
            ))}
          </div>
          
          {hiddenUsersCount > 0 && (
            <div className={styles.moreUsersMsg}>
              + {hiddenUsersCount} more users are affected by this policy.
            </div>
          )}
        </div>

      </div>

      {/* Actions Row */}
      <div className={styles.actionRow}>
        <Tooltip content="Cannot delete a policy that is currently in use." type="error" forceVisible={false}>
          <div className={styles.tooltipWrapper}>
            <button 
              className={`${styles.btn} ${styles.deleteBtn}`} 
              disabled={policy.inUse}
              onClick={() => setIsDeleteDialogOpen(true)}
            >
              <Trash2 size={18} /> Delete Policy
            </button>
          </div>
        </Tooltip>
        
        <button className={`${styles.btn} ${styles.editBtn}`} onClick={handleEdit}>
          <Edit2 size={18} /> Edit Policy
        </button>
      </div>

      {/* Footer Metadata */}
      <div className={styles.metaFooter}>
        <span>Created by <strong>{policy.createdBy}</strong> on {policy.createdDate}</span>
        <span>Last modified by <strong>{policy.modifiedBy}</strong> on {policy.modifiedDate}</span>
      </div>

      {/* Delete Confirmation */}
      <Popup 
        isOpen={isDeleteDialogOpen} 
        title="Confirm Deletion" 
        onClose={() => setIsDeleteDialogOpen(false)}
        footerActions={
          <>
            <button onClick={() => setIsDeleteDialogOpen(false)} style={{ padding: '10px 15px', borderRadius: '10px', border: 'none', backgroundColor: 'var(--bg)', color: 'var(--text)', fontWeight: '600', cursor: 'pointer', boxShadow: '4px 4px 8px var(--shadow-dark), -4px -4px 8px var(--shadow-light)' }}>
              Cancel
            </button>
            <button onClick={confirmDelete} style={{ padding: '10px 15px', borderRadius: '10px', border: 'none', backgroundColor: 'var(--danger)', color: '#fff', fontWeight: '600', cursor: 'pointer', boxShadow: '4px 4px 8px rgba(186, 59, 59, 0.3)' }}>
              Permanently Delete
            </button>
          </>
        }
      >
        <p>Are you sure you want to permanently delete the <strong>{policy.name}</strong> policy?</p>
        <p style={{ marginTop: '10px', fontSize: '0.85rem', color: 'var(--text-light)' }}>This action cannot be undone.</p>
      </Popup>

      <Toast title={toast.title} message={toast.message} type={toast.type} isVisible={toast.isVisible} onClose={() => setToast(prev => ({ ...prev, isVisible: false }))} />

    </div>
  );
};

export default EditPolicyDetail;
