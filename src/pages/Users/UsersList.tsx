import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Search, Plus, Edit2, Trash2, 
  ChevronLeft, ChevronRight 
} from 'lucide-react';
import Popup from '../../components/Popup/Popup';
import Toast from '../../components/Toast/Toast';
import styles from './UsersList.module.css';

// --- Types & Mock Data Generator ---
interface User {
  id: string;
  username: string;
  fullName: string;
  email: string;
  department: string;
  group: string;
  role: string;
  status: 'Active' | 'Inactive';
}

const generateMockUsers = (): User[] => {
  const depts = ['Computer Science', 'Mathematics', 'Physics', 'Admin', 'Library'];
  const groups = ['Students', 'Faculty', 'Staff', 'Guests'];
  const roles = ['Standard', 'Elevated', 'Restricted'];
  const statuses: ('Active' | 'Inactive')[] = ['Active', 'Active', 'Active', 'Inactive']; // 75% active
  
  return Array.from({ length: 50 }, (_, i) => {
    const num = i + 1;
    return {
      id: `usr_${num.toString().padStart(3, '0')}`,
      username: `user${num}`,
      fullName: `Mock User ${num}`,
      email: `user${num}@ui.edu.ng`,
      department: depts[Math.floor(Math.random() * depts.length)],
      group: groups[Math.floor(Math.random() * groups.length)],
      role: roles[Math.floor(Math.random() * roles.length)],
      status: statuses[Math.floor(Math.random() * statuses.length)],
    };
  });
};

const UsersList: React.FC = () => {
  const navigate = useNavigate();
  
  // State
  const [users, setUsers] = useState<User[]>(generateMockUsers());
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState({ department: '', group: '', role: '', status: '' });
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 20;

  // Modal & Toast State
  const [userToDelete, setUserToDelete] = useState<User | null>(null);
  const [toast, setToast] = useState({ isVisible: false, title: '', message: '', type: 'default' as 'success'|'error' });

  // --- Filtering Logic ---
  const filteredUsers = useMemo(() => {
    return users.filter(user => {
      const matchesSearch = 
        user.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.username.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesDept = filters.department ? user.department === filters.department : true;
      const matchesGroup = filters.group ? user.group === filters.group : true;
      const matchesRole = filters.role ? user.role === filters.role : true;
      const matchesStatus = filters.status ? user.status === filters.status : true;

      return matchesSearch && matchesDept && matchesGroup && matchesRole && matchesStatus;
    });
  }, [users, searchQuery, filters]);

  // --- Pagination Logic ---
  const totalPages = Math.ceil(filteredUsers.length / ITEMS_PER_PAGE);
  
  // Reset to page 1 if filters change
  useMemo(() => { setCurrentPage(1); }, [searchQuery, filters]);

  const paginatedUsers = filteredUsers.slice(
    (currentPage - 1) * ITEMS_PER_PAGE, 
    currentPage * ITEMS_PER_PAGE
  );

  // --- Handlers ---
  const handleFilterChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setFilters({ ...filters, [e.target.name]: e.target.value });
  };

  const clearFilters = () => {
    setSearchQuery('');
    setFilters({ department: '', group: '', role: '', status: '' });
  };

  const confirmDelete = () => {
    if (userToDelete) {
      setUsers(users.filter(u => u.id !== userToDelete.id));
      setToast({ isVisible: true, title: 'User Deleted', message: `${userToDelete.fullName} has been removed.`, type: 'success' });
      setUserToDelete(null);
    }
  };

  return (
    <div className={styles.pageWrapper}>
      
      {/* Header */}
      <div className={styles.header}>
        <h1 className={styles.pageTitle}>Network Users</h1>
        <button className={styles.addBtn} onClick={() => navigate('/users/new')}>
          <Plus size={18} /> Add New User
        </button>
      </div>

      {/* Controls: Search & Filter */}
      <div className={`neu-outset ${styles.controlsCard}`}>
        <div className={styles.searchWrapper}>
          <Search size={18} className={styles.searchIcon} />
          <input 
            type="text" 
            placeholder="Search by name, username, or email..." 
            className={styles.searchInput}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <div className={styles.filtersRow}>
            <select name="department" value={filters.department} onChange={handleFilterChange} className={styles.selectInput}>
              <option value="">All Departments</option>
              <option value="Computer Science">Computer Science</option>
              <option value="Mathematics">Mathematics</option>
              <option value="Physics">Physics</option>
              <option value="Admin">Admin</option>
              <option value="Library">Library</option>
            </select>
            
            <select name="group" value={filters.group} onChange={handleFilterChange} className={styles.selectInput}>
              <option value="">All Groups</option>
              <option value="Students">Students</option>
              <option value="Faculty">Faculty</option>
              <option value="Staff">Staff</option>
              <option value="Guests">Guests</option>
            </select>

            <select name="status" value={filters.status} onChange={handleFilterChange} className={styles.selectInput}>
              <option value="">All Statuses</option>
              <option value="Active">Active</option>
              <option value="Inactive">Inactive</option>
            </select>
          </div>
          
          {/* Clear Filters Button appears if any filter is active */}
          {(searchQuery || filters.department || filters.group || filters.role || filters.status) && (
            <button className={styles.clearFiltersBtn} onClick={clearFilters}>Clear Filters</button>
          )}
        </div>
      </div>

      {/* Data Table */}
      <div className={`neu-outset ${styles.tableContainer}`}>
        <div className={styles.tableWrapper}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>User Details</th>
                <th>Department / Group</th>
                <th>Role</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {paginatedUsers.length > 0 ? (
                paginatedUsers.map(user => (
                  <tr key={user.id}>
                    <td>
                      <span className={styles.primaryText}>{user.fullName}</span>
                      <span className={styles.secondaryText}>{user.username} • {user.email}</span>
                    </td>
                    <td>
                      <span className={styles.primaryText}>{user.department}</span>
                      <span className={styles.secondaryText}>{user.group}</span>
                    </td>
                    <td><span className={styles.primaryText}>{user.role}</span></td>
                    <td>
                      <div className={`${styles.statusBadge} ${styles[user.status.toLowerCase()]}`}>
                        <div className={styles.dot}></div>
                        {user.status}
                      </div>
                    </td>
                    <td>
                      <div className={styles.actionCell}>
                        <button className={`${styles.iconBtn} ${styles.editBtn}`} onClick={() => navigate(`/users/edit/${user.id}`)} title="Edit User">
                          <Edit2 size={16} />
                        </button>
                        <button className={`${styles.iconBtn} ${styles.deleteBtn}`} onClick={() => setUserToDelete(user)} title="Delete User">
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5}>
                    <div className={styles.emptyState}>
                      No users match your search and filter criteria.
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Controls */}
        {totalPages > 1 && (
          <div className={styles.pagination}>
            <span className={styles.pageInfo}>
              Showing {(currentPage - 1) * ITEMS_PER_PAGE + 1} - {Math.min(currentPage * ITEMS_PER_PAGE, filteredUsers.length)} of {filteredUsers.length}
            </span>
            <div className={styles.pageControls}>
              <button 
                className={styles.pageBtn} 
                disabled={currentPage === 1} 
                onClick={() => setCurrentPage(prev => prev - 1)}
              >
                <ChevronLeft size={16} /> Prev
              </button>
              <button 
                className={styles.pageBtn} 
                disabled={currentPage === totalPages} 
                onClick={() => setCurrentPage(prev => prev + 1)}
              >
                Next <ChevronRight size={16} />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Global Overlays */}
      <Popup 
        isOpen={userToDelete !== null} 
        title="Confirm Deletion" 
        onClose={() => setUserToDelete(null)}
        footerActions={
          <>
            <button 
              onClick={() => setUserToDelete(null)}
              style={{ padding: '10px 15px', borderRadius: '10px', border: 'none', backgroundColor: 'var(--bg)', color: 'var(--text)', fontWeight: '600', cursor: 'pointer', boxShadow: '4px 4px 8px var(--shadow-dark), -4px -4px 8px var(--shadow-light)' }}
            >
              Cancel
            </button>
            <button 
              onClick={confirmDelete}
              style={{ padding: '10px 15px', borderRadius: '10px', border: 'none', backgroundColor: 'var(--danger)', color: '#fff', fontWeight: '600', cursor: 'pointer', boxShadow: '4px 4px 8px rgba(186, 59, 59, 0.3)' }}
            >
              Delete User
            </button>
          </>
        }
      >
        <p>Are you sure you want to permanently remove <strong>{userToDelete?.fullName}</strong> from the system?</p>
        <p style={{ marginTop: '10px', fontSize: '0.85rem', color: 'var(--danger)' }}>This action cannot be undone.</p>
      </Popup>

      <Toast 
        title={toast.title}
        message={toast.message}
        type={toast.type}
        isVisible={toast.isVisible}
        onClose={() => setToast(prev => ({ ...prev, isVisible: false }))}
      />

    </div>
  );
};

export default UsersList;
