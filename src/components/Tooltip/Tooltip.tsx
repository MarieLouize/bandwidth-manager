import React, { type ReactNode } from 'react';
import { AlertCircle } from 'lucide-react';
import styles from './Tooltip.module.css';

interface TooltipProps {
  content: string;
  children: ReactNode;
  type?: 'default' | 'error';
  forceVisible?: boolean;
}

const Tooltip: React.FC<TooltipProps> = ({ 
  content, 
  children, 
  type = 'default',
  forceVisible = false
}) => {
  return (
    <div className={styles.tooltipContainer}>
      {children}
      <div className={`
        ${styles.tooltipBubble} 
        ${styles[type]} 
        ${forceVisible ? styles.forceVisible : ''}
      `}>
        {type === 'error' && <AlertCircle size={14} />}
        {content}
      </div>
    </div>
  );
};

export default Tooltip;
