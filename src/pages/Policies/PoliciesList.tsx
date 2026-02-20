import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Eye, Edit2, Trash2, ArrowUpDown } from 'lucide-react';
import Popup from '../../components/Popup/Popup';
import Toast from '../../components/Toast/Toast';
import styles from './PoliciesList.module.css';

// --- Types & Mock Data ---
interface Policy {
  id: string;
  name: string;
  scope: string;
  priority: number; // 1 is highest
  status: 'Active' | 'Inactive';
  createdDate: string;
  inUse: boolean; // Mock flag to test deletion constraint
}

const generateMockPolicies = (): Policy[] => {
  return [
    { id: 'p1', name: 'Exam Week Lockdown', scope: 'Students', priority: 1, status: 'Inactive', createdDate: '2025-10-12', inUse: false },
    { id: 'p2', name: 'Faculty Video Conf', scope: 'Faculty', priority: 2, status: 'Active', createdDate: '2025-09-01', inUse: true },
    { id: 'p3', name: 'Guest Wi-Fi Throttle', scope: 'Guests', priority: 10, status: 'Active', createdDate: '2025-08-15', inUse: true },
    { id: 'p4', name: 'Server Backup Window', scope: 'Global', priority: 3, status: 'Active', createdDate: '2025-07-20', inUse: true },
    { id: 'p5', name: 'Lab B Software Update', scope: 'CompSci-Lab-A', priority: 5, status: 'Inactive', createdDate: '2025-11-01', inUse: false },
    { id: 'p6', name: 'Library Research Tier', scope: 'Library', priority: 4, status: 'Active', createdDate: '2025-08-10', inUse: true },
    { id: 'p7', name: 'Dormitory After-Hours', scope: 'Students', priority: 8, status: 'Active', createdDate: '2025-09-05', inUse: true },
  ];
};

const PoliciesList: React.FC = () => {
  const navigate = useNavigate();

  // State
  const [policies, setPolicies] = useState<Policy[]>(generateMockPolicies());
  const [activeTab, setActiveTab] = useState<'All' | 'Active' | 'Inactive'>('All');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  
  // Overlay States
  const [policyToToggle, setPolicyToToggle] = useState<Policy | null>(null);
  const [policyToDelete, setPolicyToDelete] = useState<Policy | null>(null);
  const [toast, setToast] = useState({ isVisible: false, title: '', message: '', type: 'default' as 'success'|'error' });

  // --- Filtering & Sorting ---
  const displayedPolicies = useMemo(() => {
    // 1. Filter
    let filtered = policies;
    if (activeTab !== 'All') {
      filtered = policies.filter(p => p.status === activeTab);
    }
    
    // 2. Sort by Priority
    return filtered.sort((a, b) => {
      if (sortOrder === 'asc') return a.priority - b.priority;
      return b.priority - a.priority;
    });
  }, [policies, activeTab, sortOrder]);

  // --- Handlers ---
  const handleSortToggle = () => {
    setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc');
  };

  const initiateToggle = (policy: Policy) => {
    if (policy.status === 'Inactive') {
      // Instantly activate without confirmation
      setPolicies(policies.map(p => p.id === policy.id ? { ...p, status: 'Active' } : p));
      setToast({ isVisible: true, title: 'Policy Activated', message: `${policy.name} is now enforcing rules.`, type: 'success' });
    } else {
      // Require confirmation to deactivate
      setPolicyToToggle(policy);
    }
  };

  const confirmDeactivate = () => {
    if (policyToToggle) {
      setPolicies(policies.map(p => p.id === policyToToggle.id ? { ...p, status: 'Inactive' } : p));
      setToast({ isVisible: true, title: 'Policy Deactivated', message: `${policyToToggle.name} has been disabled.`, type: 'success' });
      setPolicyToToggle(null);
    }
  };

  const confirmDelete = () => {
    if (policyToDelete) {
      if (policyToDelete.inUse) {
        setToast({ isVisible: true, title: 'Deletion Rejected', message: `Cannot delete "${policyToDelete.name}" because it is currently assigned to active traffic.`, type: 'error' });
      } else {
        setPolicies(policies.filter(p => p.id !== policyToDelete.id));
        setToast({ isVisible: true, title: 'Policy Deleted', message: `"${policyToDelete.name}" was permanently removed.`, type: 'success' });
      }
      setPolicyToDelete(null);
    }
  };

  return (
    <div className={styles.pageWrapper}>
      
      {/* Header */}
      <div className={styles.header}>
        <h1 className={styles.pageTitle}>Bandwidth Policies</h1>
        <button className={styles.addBtn} onClick={() => navigate('/policies/new')}>
          <Plus size={18} /> Create New Policy
        </button>
      </div>

      {/* Filter Tabs */}
      <div className={styles.tabsContainer}>
        {(['All', 'Active', 'Inactive'] as const).map(tab => (
          <button 
            key={tab}
            className={`${styles.tabBtn} ${activeTab === tab ? styles.active : ''}`}
            onClick={() => setActiveTab(tab)}
          >
            {tab} Policies
          </button>
        ))}
      </div>

      {/* Data Table */}
      <div className={`neu-outset ${styles.tableContainer}`}>
        <div className={styles.tableWrapper}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Policy Name</th>
                <th>Target Scope</th>
                <th>
                  <div className={styles.sortableHeader} onClick={handleSortToggle} title="Sort by Priority">
                    Priority <ArrowUpDown size={14} />
                  </div>
                </th>
                <th>Created Date</th>
                <th>Enforcement Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {displayedPolicies.length > 0 ? (
                displayedPolicies.map(policy => (
                  <tr key={policy.id}>
                    <td><span className={styles.primaryText}>{policy.name}</span></td>
                    <td><span className={styles.secondaryText}>{policy.scope}</span></td>
                    <td><div className={styles.priorityBadge}>{policy.priority}</div></td>
                    <td><span className={styles.secondaryText}>{policy.createdDate}</span></td>
                    <td>
                      <div 
                        className={`${styles.toggleContainer} ${policy.status === 'Active' ? styles.active : ''}`}
                        onClick={() => initiateToggle(policy)}
                        title={policy.status === 'Active' ? "Click to deactivate" : "Click to activate"}
                      >
                        <div className={styles.toggleTrack}>
                          <div className={styles.toggleKnob}></div>
                        </div>
                        <span className={`${styles.statusLabel} ${policy.status === 'Active' ? styles.active : styles.inactive}`}>
                          {policy.status}
                        </span>
                      </div>
                    </td>
                    <td>
                      <div className={styles.actionCell}>
                        <button className={`${styles.iconBtn} ${styles.viewBtn}`} title="View Details" onClick={() => navigate(`/policies/${policy.id}`)}>
                          <Eye size={16} />
                        </button>
                        <button className={`${styles.iconBtn} ${styles.editBtn}`} title="Edit Policy" onClick={() => navigate(`/policies/edit/${policy.id}`)}>
                          <Edit2 size={16} />
                        </button>
                        <button className={`${styles.iconBtn} ${styles.deleteBtn}`} title="Delete Policy" onClick={() => setPolicyToDelete(policy)}>
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6}>
                    <div className={styles.emptyState}>
                      No {activeTab !== 'All' ? activeTab.toLowerCase() : ''} policies found.
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Global Overlays */}
      <Popup 
        isOpen={policyToToggle !== null} 
        title="Deactivate Policy?" 
        onClose={() => setPolicyToToggle(null)}
        footerActions={
          <>
            <button onClick={() => setPolicyToToggle(null)} style={{ padding: '10px 15px', borderRadius: '10px', border: 'none', backgroundColor: 'var(--bg)', color: 'var(--text)', fontWeight: '600', cursor: 'pointer', boxShadow: '4px 4px 8px var(--shadow-dark), -4px -4px 8px var(--shadow-light)' }}>
              Keep Active
            </button>
            <button onClick={confirmDeactivate} style={{ padding: '10px 15px', borderRadius: '10px', border: 'none', backgroundColor: 'var(--warning)', color: '#fff', fontWeight: '600', cursor: 'pointer', boxShadow: '4px 4px 8px rgba(217, 140, 20, 0.3)' }}>
              Deactivate
            </button>
          </>
        }
      >
        <p>You are about to disable <strong>{policyToToggle?.name}</strong>.</p>
        <p style={{ marginTop: '10px', fontSize: '0.85rem', color: 'var(--warning)', fontWeight: 600 }}>Traffic assigned to this scope will revert to the default global policy. Proceed?</p>
      </Popup>

      <Popup 
        isOpen={policyToDelete !== null} 
        title="Confirm Deletion" 
        onClose={() => setPolicyToDelete(null)}
        footerActions={
          <>
            <button onClick={() => setPolicyToDelete(null)} style={{ padding: '10px 15px', borderRadius: '10px', border: 'none', backgroundColor: 'var(--bg)', color: 'var(--text)', fontWeight: '600', cursor: 'pointer', boxShadow: '4px 4px 8px var(--shadow-dark), -4px -4px 8px var(--shadow-light)' }}>
              Cancel
            </button>
            <button onClick={confirmDelete} style={{ padding: '10px 15px', borderRadius: '10px', border: 'none', backgroundColor: 'var(--danger)', color: '#fff', fontWeight: '600', cursor: 'pointer', boxShadow: '4px 4px 8px rgba(186, 59, 59, 0.3)' }}>
              Delete Policy
            </button>
          </>
        }
      >
        <p>Are you sure you want to permanently delete the <strong>{policyToDelete?.name}</strong> policy?</p>
        <p style={{ marginTop: '10px', fontSize: '0.85rem', color: 'var(--text-light)' }}>This action cannot be undone.</p>
      </Popup>

      <Toast 
        title={toast.title} message={toast.message} type={toast.type} 
        isVisible={toast.isVisible} onClose={() => setToast(prev => ({ ...prev, isVisible: false }))} 
      />

    </div>
  );
};

export default PoliciesList;
