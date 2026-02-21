import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Home} from 'lucide-react';
import styles from './NotFound.module.css';

const NotFound: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className={styles.container}>
      <div className={styles.errorCode}>404</div>
      
      <div className={styles.animationWrapper}>
        <div className={`${styles.cable} styles.cableLeft`}></div>
        <div className={`${styles.cable} styles.cableRight`}></div>
      </div>

      <h1 className={styles.title}>Packet Loss Detected!</h1>
      <p className={styles.message}>
        The route you're looking for seems to be down or moved to a restricted subnet. 
        Don't worry, the rest of the network is functioning normally.
      </p>

      <button className={styles.homeBtn} onClick={() => navigate('/dashboard')}>
        <Home size={20} />
        Back to Central Console
      </button>
    </div>
  );
};

export default NotFound;
