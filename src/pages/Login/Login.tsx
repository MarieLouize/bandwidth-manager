import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, Lock, LogIn, Loader2, Mail } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import Toast from '../../components/Toast/Toast';
import Popup from '../../components/Popup/Popup';
import Tooltip from '../../components/Tooltip/Tooltip';
import styles from './Login.module.css';

const Login: React.FC = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  // Validation States
  const [userError, setUserError] = useState(false);
  const [passError, setPassError] = useState(false);

  // Component States
  const [toast, setToast] = useState({ isVisible: false, title: '', message: '', type: 'default' as 'success' | 'error' | 'default' });
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setUserError(false);
    setPassError(false);

    // Trigger Tooltips for validation
    if (!username.trim() || !password.trim()) {
      if (!username.trim()) setUserError(true);
      if (!password.trim()) setPassError(true);
      return;
    }

    setIsLoading(true);

    // Mock API call
    setTimeout(() => {
      setIsLoading(false);
      if (username === 'admin' && password === 'admin123') {
        setToast({
          isVisible: true,
          title: 'Authentication Successful',
          message: 'Redirecting to your dashboard...',
          type: 'success'
        });
        
        setTimeout(() => {
          login(username);
          navigate('/dashboard');
        }, 1500);

      } else {
        setToast({
          isVisible: true,
          title: 'Access Denied',
          message: 'Invalid administrator credentials. Please try again.',
          type: 'error'
        });
        setPassword('');
      }
    }, 1500);
  };

  return (
    <>
      <div className={styles.loginWrapper}>
        <div className={styles.loginCard}>
          <div className={styles.logoArea}>
            <span className={styles.uniText}>University of Ibadan</span>
            <h1 className={styles.title}>Bandwidth Management System</h1>
          </div>

          <form onSubmit={handleLogin}>
            <div className={styles.formGroup}>
              <label htmlFor="username" className={styles.label}>Administrator ID</label>
              <Tooltip content="Username is required" type="error" forceVisible={userError}>
                <div className={styles.inputWrapper}>
                  <User size={20} className={styles.inputIcon} />
                  <input
                    type="text"
                    id="username"
                    className={`${styles.inputField} ${userError ? styles.error : ''}`}
                    placeholder="Enter username"
                    value={username}
                    onChange={(e) => { setUsername(e.target.value); setUserError(false); }}
                    disabled={isLoading}
                  />
                </div>
              </Tooltip>
            </div>

            <div className={styles.formGroup}>
              <label htmlFor="password" className={styles.label}>Password</label>
              <Tooltip content="Password is required" type="error" forceVisible={passError}>
                <div className={styles.inputWrapper}>
                  <Lock size={20} className={styles.inputIcon} />
                  <input
                    type="password"
                    id="password"
                    className={`${styles.inputField} ${passError ? styles.error : ''}`}
                    placeholder="Enter password"
                    value={password}
                    onChange={(e) => { setPassword(e.target.value); setPassError(false); }}
                    disabled={isLoading}
                  />
                </div>
              </Tooltip>
            </div>

            <button type="submit" className={styles.btnLogin} disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 size={20} className={styles.spinAnimation} />
                  <span>Authenticating...</span>
                </>
              ) : (
                <>
                  <LogIn size={20} />
                  <span>Log In</span>
                </>
              )}
            </button>
          </form>

          <a href="#" onClick={(e) => { e.preventDefault(); setIsPopupOpen(true); }} className={styles.forgotLink}>
            Forgot password?
          </a>
        </div>
      </div>

      {/* Global Overlays */}
      <Toast 
        title={toast.title}
        message={toast.message}
        type={toast.type}
        isVisible={toast.isVisible}
        onClose={() => setToast({ ...toast, isVisible: false })}
      />

      <Popup 
        isOpen={isPopupOpen} 
        title="Reset Password" 
        onClose={() => setIsPopupOpen(false)}
      >
        <p style={{ marginBottom: '15px' }}>
          Administrator accounts are managed locally. To reset your credentials, please contact the lead network engineer at the IT department.
        </p>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: 'var(--text-light)' }}>
          <Mail size={18} />
          <span>it-support@ui.edu.ng</span>
        </div>
      </Popup>
    </>
  );
};

export default Login;
