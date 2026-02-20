import React, { useEffect } from 'react';
import { CheckCircle, AlertCircle, Info, X } from 'lucide-react';
import styles from './Toast.module.css';

interface ToastProps {
  title: string;
  message: string;
  type?: 'default' | 'success' | 'error';
  isVisible: boolean;
  onClose: () => void;
  duration?: number;
}

const Toast: React.FC<ToastProps> = ({ 
  title, 
  message, 
  type = 'default', 
  isVisible, 
  onClose, 
  duration = 3000 
}) => {
  useEffect(() => {
    if (isVisible) {
      const timer = setTimeout(() => {
        onClose();
      }, duration);
      return () => clearTimeout(timer);
    }
  }, [isVisible, duration, onClose]);

  const IconMap = {
    default: <Info size={20} className={`${styles.icon} ${styles.default}`} />,
    success: <CheckCircle size={20} className={`${styles.icon} ${styles.success}`} />,
    error: <AlertCircle size={20} className={`${styles.icon} ${styles.error}`} />
  };

  return (
    <div className={`${styles.toastWrapper} ${styles[type]} ${isVisible ? styles.show : ''}`}>
      {IconMap[type]}
      <div className={styles.toastContent}>
        <span className={styles.toastTitle}>{title}</span>
        <span className={styles.toastMessage}>{message}</span>
      </div>
      <button className={styles.closeBtn} onClick={onClose}>
        <X size={18} />
      </button>
    </div>
  );
};

export default Toast;
