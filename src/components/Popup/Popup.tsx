import React, { ReactNode } from 'react';
import { X } from 'lucide-react';
import styles from './Popup.module.css';

interface PopupProps {
  isOpen: boolean;
  title: string;
  onClose: () => void;
  children: ReactNode;
  footerActions?: ReactNode;
}

const Popup: React.FC<PopupProps> = ({ isOpen, title, onClose, children, footerActions }) => {
  return (
    <div className={`${styles.overlay} ${isOpen ? styles.show : ''}`} onClick={onClose}>
      <div className={styles.popupCard} onClick={(e) => e.stopPropagation()}>
        <div className={styles.header}>
          <h3 className={styles.title}>{title}</h3>
          <button className={styles.closeBtn} onClick={onClose}>
            <X size={24} />
          </button>
        </div>
        
        <div className={styles.content}>
          {children}
        </div>

        {footerActions && (
          <div className={styles.footer}>
            {footerActions}
          </div>
        )}
      </div>
    </div>
  );
};

export default Popup;
