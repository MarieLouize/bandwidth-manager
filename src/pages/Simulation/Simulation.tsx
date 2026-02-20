import React, { useState, useEffect } from 'react';
import { 
  Play, Square, RefreshCw, Activity, Users, 
  Download, BarChart2, ShieldAlert, CheckCircle2 
} from 'lucide-react';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip as ChartTooltip, Legend, ArcElement } from 'chart.js';
import { Bar, Pie } from 'react-chartjs-2';
import Toast from '../../components/Toast/Toast';
import Tooltip from '../../components/Tooltip/Tooltip';
import styles from './Simulation.module.css';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, ChartTooltip, Legend, ArcElement);

// --- Types ---
type SimMode = 'prebuilt' | 'custom';
type SimState = 'idle' | 'running' | 'completed';

const SCENARIOS = [
  { id: 's1', name: 'Normal Academic Day', desc: 'Balanced load (3000 users) with standard Web and Academic traffic.', baseUsers: 3000, baseDemand: 5 },
  { id: 's2', name: 'Final Exam Period', desc: 'High academic traffic, rigorous LMS usage, disabled recreational policies.', baseUsers: 4500, baseDemand: 8 },
  { id: 's3', name: 'Semester Registration', desc: 'Massive spike in concurrent connections to the university portal.', baseUsers: 5000, baseDemand: 12 },
  { id: 's4', name: 'Evening Peak Hours', desc: 'High video streaming and file transfer loads from student dormitories.', baseUsers: 3500, baseDemand: 15 },
];

const Simulation: React.FC = () => {
  // Navigation & Core States
  const [mode, setMode] = useState<SimMode>('prebuilt');
  const [simState, setSimState] = useState<SimState>('idle');
  const [toast, setToast] = useState({ isVisible: false, title: '', message: '', type: 'error' as 'success'|'error' });

  // Custom Form States
  const [customUsers, setCustomUsers] = useState('1000');
  const [customDemand, setCustomDemand] = useState('10');
  const [customDuration, setCustomDuration] = useState('5');
  const [trafficTypes, setTrafficTypes] = useState({ web: true, video: true, academic: true, file: false });
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  // Running States
  const [progress, setProgress] = useState(0);
  const [phase, setPhase] = useState('');

  // Results State (Mocked upon completion)
  const [results, setResults] = useState<any>(null);

  // --- Running Logic ---
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (simState === 'running') {
      setProgress(0);
      setPhase('Initializing Virtual Network...');
      
      interval = setInterval(() => {
        setProgress(p => {
          const next = p + 2; // 2% per tick (50 ticks = approx 2.5 seconds total at 50ms)
          
          if (next === 20) setPhase('Injecting Simulated Traffic...');
          if (next === 50) setPhase('Applying QoS Policies...');
          if (next === 80) setPhase('Aggregating Analytics...');
          
          if (next >= 100) {
            clearInterval(interval);
            generateResults();
            setSimState('completed');
            return 100;
          }
          return next;
        });
      }, 50);
    }
    return () => clearInterval(interval);
  }, [simState]);

  const handleToggleTraffic = (type: keyof typeof trafficTypes) => {
    setTrafficTypes(prev => ({ ...prev, [type]: !prev[type] }));
    setFormErrors(prev => ({ ...prev, traffic: '' }));
  };

  const validateAndRunCustom = () => {
    const errors: Record<string, string> = {};
    const u = Number(customUsers);
    const d = Number(customDemand);
    
    if (!u || u < 50 || u > 5000) errors.users = "Must be between 50 and 5000";
    if (!d || d <= 0) errors.demand = "Must be > 0";
    if (!Object.values(trafficTypes).some(Boolean)) errors.traffic = "Select at least one traffic type";

    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      setToast({ isVisible: true, title: 'Validation Failed', message: 'Please correct the highlighted inputs.', type: 'error' });
      return;
    }

    setFormErrors({});
    startSimulation(u, d);
  };

  const startSimulation = (users: number, demand: number) => {
    // We store the parameters temporarily so generateResults can use them deterministically
    window.sessionStorage.setItem('sim_params', JSON.stringify({ users, demand }));
    setSimState('running');
  };

  const cancelSimulation = () => {
    setSimState('idle');
    setProgress(0);
  };

  const generateResults = () => {
    // Read params to make results semi-deterministic
    const params = JSON.parse(window.sessionStorage.getItem('sim_params') || '{"users": 1000, "demand": 10}');
    const baseBandwidth = (params.users * params.demand);
    
    // Simulate QoS reduction
    const beforeData = [baseBandwidth * 0.4, baseBandwidth * 0.5, baseBandwidth * 0.8, baseBandwidth * 0.9, baseBandwidth];
    const afterData = beforeData.map(v => v > 10000 ? 10000 : v * (Math.random() * 0.2 + 0.8)); // Cap at 10Gbps, minor shaping below

    const droppedPackets = Math.floor(Math.max(0, baseBandwidth - 10000) * 0.15); // Drop % if over capacity
    const score = droppedPackets > 1000 ? Math.floor(Math.random() * 20 + 40) : Math.floor(Math.random() * 15 + 85); // 40-60 if congested, 85-100 if good

    setResults({
      peakBefore: (Math.max(...beforeData) / 1000).toFixed(2), // Gbps
      peakAfter: (Math.max(...afterData) / 1000).toFixed(2), // Gbps
      dropped: droppedPackets.toLocaleString(),
      satisfaction: score,
      barChart: {
        labels: ['Minute 1', 'Minute 2', 'Minute 3', 'Minute 4', 'Minute 5'],
        datasets: [
          { label: 'Unmanaged Demand (Mbps)', data: beforeData, backgroundColor: 'rgba(186, 59, 59, 0.7)', borderRadius: 4 },
          { label: 'Shaped Traffic (Mbps)', data: afterData, backgroundColor: 'rgba(40, 140, 100, 0.9)', borderRadius: 4 }
        ]
      },
      pieChart: {
        labels: ['Web', 'Video', 'Academic', 'File/Other'],
        datasets: [{
          data: [params.users * 0.4, params.users * 0.3, params.users * 0.2, params.users * 0.1],
          backgroundColor: ['#1B3B6F', '#D98C14', '#288C64', '#528072'],
          borderWidth: 0
        }]
      },
      events: droppedPackets > 0 
        ? [
            { time: '0m:45s', msg: 'System capacity (10 Gbps) breached by raw demand.' },
            { time: '0m:48s', msg: 'Triggered Emergency Policy: Video traffic throttled by 30%.' },
            { time: '2m:15s', msg: 'Academic traffic prioritized over P2P/File Sharing.' }
          ]
        : [
            { time: '1m:00s', msg: 'Traffic scaling gracefully. All policies dormant.' },
            { time: '3m:30s', msg: 'Minor spike in academic traffic, successfully routed.' }
          ]
    });
  };

  const handleExport = () => {
    setToast({ isVisible: true, title: 'Export Generated', message: 'Simulation results downloaded as PDF.', type: 'success' });
  };

  // --- Renders ---
  if (simState === 'running') {
    return (
      <div className={styles.pageWrapper} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '70vh' }}>
        <div className={styles.progressSection}>
          <Activity size={48} color="var(--accent)" className={styles.pulse} />
          <h2 className={styles.pageTitle}>Executing Simulation</h2>
          <span className={styles.progressPhase}>{phase}</span>
          
          <div className={styles.progressBarContainer}>
            <div className={styles.progressBarFill} style={{ width: `${progress}%` }}></div>
          </div>
          <span className={styles.progressPercent}>{progress}%</span>
          
          <button className={styles.secondaryBtn} onClick={cancelSimulation} style={{ marginTop: '20px' }}>
            <Square size={16} /> Abort Simulation
          </button>
        </div>
      </div>
    );
  }

  if (simState === 'completed' && results) {
    return (
      <div className={styles.pageWrapper}>
        <div className={styles.header}>
          <h1 className={styles.pageTitle}>Simulation Results</h1>
          <span className={styles.pageSub}>Analysis of QoS policy effectiveness against simulated demand.</span>
        </div>

        <div className={styles.resultsSection}>
          {/* Stats */}
          <div className={styles.statsGrid}>
            <div className={styles.statCard}>
              <span className={styles.statValue}>{results.peakBefore} <small style={{fontSize:'0.6em'}}>Gbps</small></span>
              <span className={styles.statLabel}>Raw Demand Peak</span>
            </div>
            <div className={styles.statCard}>
              <span className={styles.statValue}>{results.peakAfter} <small style={{fontSize:'0.6em'}}>Gbps</small></span>
              <span className={styles.statLabel}>Shaped Peak (Actual)</span>
            </div>
            <div className={styles.statCard}>
              <span className={styles.statValue} style={{ color: results.dropped !== '0' ? 'var(--danger)' : 'var(--success)'}}>{results.dropped}</span>
              <span className={styles.statLabel}>Packets Dropped</span>
            </div>
            <div className={styles.statCard}>
              <span className={styles.statValue} style={{ color: results.satisfaction < 70 ? 'var(--warning)' : 'var(--accent)'}}>{results.satisfaction}/100</span>
              <span className={styles.statLabel}>Est. User Satisfaction</span>
            </div>
          </div>

          {/* Charts */}
          <div className={styles.chartsGrid}>
            <div className={styles.chartCard}>
              <h3 className={styles.chartTitle}><BarChart2 size={18} style={{display:'inline', verticalAlign:'bottom'}}/> Policy Effectiveness</h3>
              <div className={styles.chartContainer}>
                <Bar data={results.barChart} options={{ responsive: true, maintainAspectRatio: false, scales: { y: { beginAtZero: true } } }} />
              </div>
            </div>
            
            <div className={styles.chartCard}>
              <h3 className={styles.chartTitle}>Traffic Composition</h3>
              <div className={styles.chartContainer}>
                <Pie data={results.pieChart} options={{ responsive: true, maintainAspectRatio: false, plugins: { legend: { position: 'bottom' } } }} />
              </div>
            </div>
          </div>

          {/* Timeline */}
          <div className={styles.chartCard}>
            <h3 className={styles.chartTitle}><ShieldAlert size={18} style={{display:'inline', verticalAlign:'bottom'}}/> Congestion Events Log</h3>
            <div className={styles.timelineList}>
              {results.events.map((ev: any, idx: number) => (
                <div key={idx} className={styles.timelineItem}>
                  <span className={styles.timelineTime}>{ev.time}</span>
                  <span className={styles.timelineText}>{ev.msg}</span>
                </div>
              ))}
            </div>
          </div>

          <div className={styles.resultsActions}>
            <button className={styles.secondaryBtn} onClick={() => setSimState('idle')}>
              <RefreshCw size={18} /> New Simulation
            </button>
            <button className={styles.runBtn} onClick={handleExport}>
              <Download size={18} /> Export Report
            </button>
          </div>
        </div>
        <Toast title={toast.title} message={toast.message} type={toast.type} isVisible={toast.isVisible} onClose={() => setToast(prev => ({ ...prev, isVisible: false }))} />
      </div>
    );
  }

  // IDLE STATE (Inputs)
  return (
    <div className={styles.pageWrapper}>
      
      <div className={styles.header}>
        <h1 className={styles.pageTitle}>Network Simulation</h1>
        <span className={styles.pageSub}>Stress test your bandwidth policies safely before live deployment.</span>
      </div>

      <div className={styles.modeToggle}>
        <button className={`${styles.toggleBtn} ${mode === 'prebuilt' ? styles.active : ''}`} onClick={() => setMode('prebuilt')}>Pre-built Scenarios</button>
        <button className={`${styles.toggleBtn} ${mode === 'custom' ? styles.active : ''}`} onClick={() => setMode('custom')}>Custom Simulation</button>
      </div>

      {mode === 'prebuilt' && (
        <div className={`${styles.inputSection} ${styles.scenarioGrid}`}>
          {SCENARIOS.map(scen => (
            <div key={scen.id} className={styles.scenarioCard}>
              <h3 className={styles.cardTitle}><Activity size={20} color="var(--accent)" /> {scen.name}</h3>
              <p className={styles.cardDesc}>{scen.desc}</p>
              <div style={{ display: 'flex', gap: '15px', fontSize: '0.85rem', color: 'var(--text-light)', fontWeight: 600 }}>
                <span><Users size={14} style={{verticalAlign:'middle'}}/> {scen.baseUsers.toLocaleString()} Users</span>
                <span>Demand: {scen.baseDemand} Mbps/user</span>
              </div>
              <button className={styles.runBtn} onClick={() => startSimulation(scen.baseUsers, scen.baseDemand)} style={{ marginTop: '10px' }}>
                <Play size={16} /> Run Scenario
              </button>
            </div>
          ))}
        </div>
      )}

      {mode === 'custom' && (
        <div className={`${styles.inputSection} ${styles.customCard}`}>
          <h3 className={styles.cardTitle} style={{ borderBottom: '2px solid var(--shadow-dark)', paddingBottom: '10px' }}>Configure Parameters</h3>
          
          <div className={styles.inputRow}>
            <div className={styles.inputGroup}>
              <label className={styles.label}>Simulated Users (50 - 5000) *</label>
              <Tooltip content={formErrors.users || ''} type="error" forceVisible={!!formErrors.users}>
                <input type="number" value={customUsers} onChange={e => setCustomUsers(e.target.value)} className={`${styles.inputField} ${formErrors.users ? styles.error : ''}`} />
              </Tooltip>
            </div>
            <div className={styles.inputGroup}>
              <label className={styles.label}>Avg. Demand per User (Mbps) *</label>
              <Tooltip content={formErrors.demand || ''} type="error" forceVisible={!!formErrors.demand}>
                <input type="number" value={customDemand} onChange={e => setCustomDemand(e.target.value)} className={`${styles.inputField} ${formErrors.demand ? styles.error : ''}`} />
              </Tooltip>
            </div>
          </div>

          <div className={styles.inputGroup}>
            <label className={styles.label}>Simulation Duration</label>
            <select value={customDuration} onChange={e => setCustomDuration(e.target.value)} className={styles.selectField}>
              <option value="1">1 Minute (Quick Test)</option>
              <option value="5">5 Minutes (Standard)</option>
              <option value="10">10 Minutes (Deep Analysis)</option>
            </select>
          </div>

          <div className={styles.inputGroup}>
            <label className={styles.label}>Traffic Composition *</label>
            {formErrors.traffic && <span style={{ color: 'var(--danger)', fontSize: '0.8rem', fontWeight: 600 }}>{formErrors.traffic}</span>}
            <div className={styles.checkboxGrid}>
              {(Object.keys(trafficTypes) as Array<keyof typeof trafficTypes>).map(type => (
                <label key={type} className={styles.toggleContainer}>
                  <input type="checkbox" checked={trafficTypes[type]} onChange={() => handleToggleTraffic(type)} />
                  <div className={styles.toggleTrack}><div className={styles.toggleKnob}></div></div>
                  <span className={styles.toggleLabel} style={{ textTransform: 'capitalize' }}>{type}</span>
                </label>
              ))}
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '10px' }}>
            <button className={styles.runBtn} onClick={validateAndRunCustom}>
              <Play size={18} /> Execute Simulation
            </button>
          </div>
        </div>
      )}

      <Toast title={toast.title} message={toast.message} type={toast.type} isVisible={toast.isVisible} onClose={() => setToast(prev => ({ ...prev, isVisible: false }))} />

    </div>
  );
};

export default Simulation;
