import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';
import { message } from 'antd';

/* ─────────────────────────────────────────────
   Styled input — plain <input>, no wrappers
───────────────────────────────────────────── */
const Field = ({ icon, ...props }) => {
  const [focused, setFocused] = useState(false);
  return (
    <div style={{ position: 'relative', marginBottom: '12px' }}>
      <span style={{
        position: 'absolute', left: '14px', top: '50%',
        transform: 'translateY(-50%)', fontSize: '15px',
        color: focused ? '#a78bfa' : 'rgba(255,255,255,0.4)',
        pointerEvents: 'none', transition: 'color 0.2s', zIndex: 1,
      }}>{icon}</span>
      <input
        {...props}
        onFocus={e => { setFocused(true); props.onFocus?.(e); }}
        onBlur={e => { setFocused(false); props.onBlur?.(e); }}
        style={{
          width: '100%', height: '50px', boxSizing: 'border-box',
          background: focused ? 'rgba(255,255,255,0.08)' : 'rgba(255,255,255,0.05)',
          border: `1px solid ${focused ? 'rgba(99,102,241,0.6)' : 'rgba(255,255,255,0.1)'}`,
          borderRadius: '12px', color: 'white', fontSize: '15px',
          padding: '0 16px 0 44px', outline: 'none',
          transition: 'all 0.25s ease', fontFamily: 'Inter, sans-serif',
          boxShadow: focused ? '0 0 0 3px rgba(99,102,241,0.15)' : 'none',
        }}
      />
    </div>
  );
};

/* ─────────────────────────────────────────────
   Main component
───────────────────────────────────────────── */
const PremiumAuth = () => {
  const [mode, setMode] = useState('login');
  const [loading, setLoading] = useState(false);
  const [email, setEmail]         = useState('');
  const [password, setPassword]   = useState('');
  const [fullName, setFullName]   = useState('');
  const [role, setRole]           = useState('');
  const [department, setDept]     = useState('');
  const { login, register } = useAuth();

  /* animated counters */
  const [counts, setCounts] = useState([0, 0, 0, 0]);
  useEffect(() => {
    const targets = mode === 'login'
      ? [847, 23, 94, 127]
      : [1247, 5832, 97, 156];
    const steps = 50, ms = 1200 / steps;
    const ids = targets.map((t, i) => {
      let c = 0; const inc = t / steps;
      const id = setInterval(() => {
        c = Math.min(c + inc, t);
        setCounts(p => { const n = [...p]; n[i] = Math.floor(c); return n; });
        if (c >= t) clearInterval(id);
      }, ms);
      return id;
    });
    return () => ids.forEach(clearInterval);
  }, [mode]);

  const switchMode = (next) => {
    setMode(next);
    setEmail(''); setPassword(''); setFullName(''); setRole(''); setDept('');
  };

  const doLogin = async (em, pw) => {
    if (!em || !pw) { message.error('Enter email and password'); return; }
    setLoading(true);
    try {
      const user = await login({ email: em, password: pw });
      message.success(`Welcome, ${user.full_name}!`);
      window.location.href = '/home';
    } catch (err) {
      message.error(err.response?.data?.detail || 'Login failed');
      setLoading(false);
    }
  };

  const doRegister = async (e) => {
    e.preventDefault();
    if (!fullName || !email || !password || !role) {
      message.error('Please fill all required fields'); return;
    }
    setLoading(true);
    try {
      await register({ full_name: fullName, email, password, role, department });
      message.success('Account created! Please sign in.');
      switchMode('login');
    } catch (err) {
      message.error(err.response?.data?.detail || 'Registration failed');
    }
    setLoading(false);
  };

  /* ── widget data ── */
  const loginWidgets = [
    { icon: '📊', label: 'Goals Completed', val: counts[0], g: '#10b981,#059669' },
    { icon: '👥', label: 'Active Users',    val: counts[1], g: '#06b6d4,#3b82f6' },
    { icon: '🎯', label: 'Success Rate',    val: `${counts[2]}%`, g: '#667eea,#764ba2' },
    { icon: '⚡', label: 'Productivity',    val: `+${counts[3]}%`, g: '#f59e0b,#d97706' },
  ];

  /* Signup: same box design, feature text instead of numbers */
  const signupWidgets = [
    { icon: '🎯', label: 'Set & track quarterly goals', val: 'Goal Tracking', g: '#10b981,#059669' },
    { icon: '✅', label: 'Manager approval workflows', val: 'Approvals', g: '#06b6d4,#3b82f6' },
    { icon: '🤖', label: 'AI-powered suggestions', val: 'AI Assist', g: '#667eea,#764ba2' },
    { icon: '📊', label: 'Real-time analytics', val: 'Analytics', g: '#f59e0b,#d97706' },
  ];
  const widgets = mode === 'login' ? loginWidgets : signupWidgets;

  const loginFeatures = [
    'Real-time performance analytics',
    'AI-powered goal recommendations',
    'Collaborative team workflows',
    'Executive intelligence dashboard',
  ];
  const signupFeatures = [
    'AI-powered goal optimization',
    'Real-time performance dashboards',
    'Advanced team analytics',
    'Enterprise-grade security',
  ];

  const demoAccounts = [
    { role: 'Admin',    email: 'admin@demo.com',   icon: '👨‍💼', desc: 'Full system access' },
    { role: 'Manager',  email: 'manager@demo.com', icon: '👔',  desc: 'Team management' },
    { role: 'Employee', email: 'emp1@demo.com',    icon: '👤',  desc: 'Goal tracking' },
  ];

  /* ── shared styles ── */
  const btnPrimary = {
    width: '100%', height: '50px', marginTop: '6px',
    background: 'linear-gradient(135deg,#667eea,#764ba2)',
    border: 'none', borderRadius: '12px', color: 'white',
    fontSize: '15px', fontWeight: 600, cursor: loading ? 'not-allowed' : 'pointer',
    opacity: loading ? 0.7 : 1, transition: 'transform 0.15s, box-shadow 0.15s',
  };

  return (
    <div style={{
      minHeight: '100vh', fontFamily: 'Inter, sans-serif',
      background: 'linear-gradient(135deg,#0a0a0a 0%,#0f0f1a 50%,#0a0a14 100%)',
      display: 'flex', overflow: 'hidden', position: 'relative',
    }}>
      {/* Background orbs — pointer-events:none so they NEVER block clicks */}
      <div style={{ position:'fixed', inset:0, pointerEvents:'none', zIndex:0 }}>
        <motion.div animate={{ x:[0,40,0], y:[0,-30,0] }} transition={{ duration:18, repeat:Infinity, ease:'easeInOut' }}
          style={{ position:'absolute', top:'8%', left:'8%', width:'350px', height:'350px', borderRadius:'50%',
            background:'radial-gradient(circle,rgba(102,126,234,0.25),transparent 70%)', filter:'blur(40px)' }} />
        <motion.div animate={{ x:[0,-30,0], y:[0,25,0] }} transition={{ duration:22, repeat:Infinity, ease:'easeInOut', delay:3 }}
          style={{ position:'absolute', bottom:'15%', right:'10%', width:'280px', height:'280px', borderRadius:'50%',
            background:'radial-gradient(circle,rgba(118,75,162,0.25),transparent 70%)', filter:'blur(40px)' }} />
        <motion.div animate={{ x:[0,20,0], y:[0,-20,0] }} transition={{ duration:15, repeat:Infinity, ease:'easeInOut', delay:6 }}
          style={{ position:'absolute', top:'50%', left:'40%', width:'200px', height:'200px', borderRadius:'50%',
            background:'radial-gradient(circle,rgba(6,182,212,0.15),transparent 70%)', filter:'blur(40px)' }} />
      </div>

      {/* ── LEFT PANEL ── */}
      <div style={{
        flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: '60px 40px', position: 'relative', zIndex: 1,
      }} className="auth-left-hide">
        <div style={{ maxWidth: '480px', width: '100%' }}>

          {/* Brand */}
          <motion.div initial={{ opacity:0, y:30 }} animate={{ opacity:1, y:0 }} transition={{ duration:0.7 }}
            style={{ textAlign:'center', marginBottom:'48px' }}>
            <motion.div whileHover={{ scale:1.05, rotate:5 }}
              style={{ width:'72px', height:'72px', margin:'0 auto 20px',
                background:'linear-gradient(135deg,#667eea,#764ba2)', borderRadius:'20px',
                display:'flex', alignItems:'center', justifyContent:'center', fontSize:'32px',
                boxShadow:'0 8px 32px rgba(102,126,234,0.4)' }}>🎯</motion.div>
            <h1 style={{ color:'white', fontSize:'2.8rem', fontWeight:800, margin:'0 0 12px',
              background:'linear-gradient(135deg,#667eea,#a78bfa)', WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent' }}>
              AtomQuest
            </h1>
            <AnimatePresence mode="wait">
              <motion.p key={mode} initial={{ opacity:0, y:10 }} animate={{ opacity:1, y:0 }} exit={{ opacity:0, y:-10 }}
                transition={{ duration:0.4 }}
                style={{ color:'rgba(255,255,255,0.6)', fontSize:'1.05rem', margin:0 }}>
                {mode === 'login' ? 'Enterprise Performance Intelligence Platform' : 'Join the Enterprise Performance Revolution'}
              </motion.p>
            </AnimatePresence>
          </motion.div>

          {/* Widgets */}
          <AnimatePresence mode="wait">
            <motion.div key={`widgets-${mode}`}
              initial={{ opacity:0, x: mode==='login' ? -40 : 40 }}
              animate={{ opacity:1, x:0 }}
              exit={{ opacity:0, x: mode==='login' ? 40 : -40 }}
              transition={{ duration:0.5, ease:[0.16,1,0.3,1] }}
              style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'16px', marginBottom:'40px' }}>
              {widgets.map((w, i) => (
                <motion.div key={w.label}
                  initial={{ opacity:0, y:20 }} animate={{ opacity:1, y:0 }}
                  transition={{ delay: i * 0.08 }}
                  whileHover={{ y:-4, transition:{ duration:0.2 } }}
                  style={{ background:'rgba(255,255,255,0.05)', border:'1px solid rgba(255,255,255,0.08)',
                    borderRadius:'16px', padding:'20px', backdropFilter:'blur(10px)' }}>
                  <div style={{ width:'40px', height:'40px', borderRadius:'10px', marginBottom:'12px',
                    background:`linear-gradient(135deg,${w.g})`,
                    display:'flex', alignItems:'center', justifyContent:'center', fontSize:'20px' }}>{w.icon}</div>
                  <div style={{ color:'white', fontSize: mode === 'signup' ? '1rem' : '1.6rem', fontWeight:700, lineHeight:1.2, marginBottom:'4px' }}>{w.val}</div>
                  <div style={{ color:'rgba(255,255,255,0.5)', fontSize:'12px', marginTop:'4px' }}>{w.label}</div>
                </motion.div>
              ))}
            </motion.div>
          </AnimatePresence>

          {/* Features */}
          <AnimatePresence mode="wait">
            <motion.div key={`feat-${mode}`}
              initial={{ opacity:0, x:-20 }} animate={{ opacity:1, x:0 }} exit={{ opacity:0, x:20 }}
              transition={{ duration:0.45 }}
              style={{ display:'flex', flexDirection:'column', gap:'12px' }}>
              {(mode === 'login' ? loginFeatures : signupFeatures).map((f, i) => (
                <motion.div key={f} initial={{ opacity:0, x:-16 }} animate={{ opacity:1, x:0 }}
                  transition={{ delay: i * 0.07 }}
                  style={{ display:'flex', alignItems:'center', gap:'10px', color:'rgba(255,255,255,0.75)', fontSize:'0.95rem' }}>
                  <span style={{ color:'#10b981', fontSize:'16px' }}>✓</span> {f}
                </motion.div>
              ))}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>

      {/* ── RIGHT PANEL (auth card) ── */}
      <div style={{
        width: '100%', maxWidth: '480px', display:'flex', alignItems:'center',
        justifyContent:'center', padding:'40px 32px', position:'relative', zIndex:1,
        overflowY: 'auto',
      }}>
        <motion.div
          initial={{ opacity:0, y:30 }} animate={{ opacity:1, y:0 }} transition={{ duration:0.6 }}
          style={{ width:'100%', background:'rgba(255,255,255,0.05)',
            backdropFilter:'blur(24px)', border:'1px solid rgba(255,255,255,0.1)',
            borderRadius:'24px', padding:'40px 36px',
            boxShadow:'0 24px 64px rgba(0,0,0,0.5)' }}>

          {/* Card header */}
          <div style={{ textAlign:'center', marginBottom:'28px' }}>
            <motion.div whileHover={{ scale:1.08, rotate:8 }}
              style={{ width:'56px', height:'56px', margin:'0 auto 14px',
                background:'linear-gradient(135deg,#667eea,#764ba2)', borderRadius:'14px',
                display:'flex', alignItems:'center', justifyContent:'center', fontSize:'26px',
                boxShadow:'0 6px 20px rgba(102,126,234,0.4)' }}>🎯</motion.div>
            <AnimatePresence mode="wait">
              <motion.h2 key={`h-${mode}`} initial={{ opacity:0, y:12 }} animate={{ opacity:1, y:0 }}
                exit={{ opacity:0, y:-12 }} transition={{ duration:0.35 }}
                style={{ color:'white', fontSize:'22px', fontWeight:700, margin:'0 0 6px' }}>
                {mode === 'login' ? 'Welcome back' : 'Create Account'}
              </motion.h2>
            </AnimatePresence>
            <AnimatePresence mode="wait">
              <motion.p key={`p-${mode}`} initial={{ opacity:0, y:10 }} animate={{ opacity:1, y:0 }}
                exit={{ opacity:0, y:-10 }} transition={{ duration:0.35, delay:0.05 }}
                style={{ color:'rgba(255,255,255,0.5)', fontSize:'14px', margin:0 }}>
                {mode === 'login' ? 'Sign in to your enterprise account' : 'Join thousands of teams achieving excellence'}
              </motion.p>
            </AnimatePresence>
          </div>

          {/* Form with slide transition */}
          <AnimatePresence mode="wait">
            <motion.div key={`form-${mode}`}
              initial={{ opacity:0, x: mode==='login' ? -30 : 30 }}
              animate={{ opacity:1, x:0 }}
              exit={{ opacity:0, x: mode==='login' ? 30 : -30 }}
              transition={{ duration:0.4, ease:[0.16,1,0.3,1] }}>

              {mode === 'login' ? (
                <form onSubmit={e => { e.preventDefault(); doLogin(email, password); }} noValidate>
                  <Field type="email" placeholder="Email address" value={email}
                    onChange={e => setEmail(e.target.value)} autoComplete="email" icon="✉" />
                  <Field type="password" placeholder="Password" value={password}
                    onChange={e => setPassword(e.target.value)} autoComplete="current-password" icon="🔒" />
                  <button type="submit" disabled={loading} style={btnPrimary}
                    onMouseEnter={e => { if(!loading){ e.currentTarget.style.transform='translateY(-2px)'; e.currentTarget.style.boxShadow='0 8px 24px rgba(102,126,234,0.4)'; }}}
                    onMouseLeave={e => { e.currentTarget.style.transform='none'; e.currentTarget.style.boxShadow='none'; }}>
                    {loading ? 'Signing in…' : 'Sign In'}
                  </button>
                </form>
              ) : (
                <form onSubmit={doRegister} noValidate>
                  <Field type="text" placeholder="Full name *" value={fullName}
                    onChange={e => setFullName(e.target.value)} autoComplete="name" icon="👤" />
                  <Field type="email" placeholder="Email address *" value={email}
                    onChange={e => setEmail(e.target.value)} autoComplete="email" icon="✉" />
                  <Field type="password" placeholder="Password *" value={password}
                    onChange={e => setPassword(e.target.value)} autoComplete="new-password" icon="🔒" />
                  <div style={{ marginBottom:'12px' }}>
                    <select value={role} onChange={e => setRole(e.target.value)}
                      style={{ width:'100%', height:'50px', boxSizing:'border-box',
                        background:'rgba(255,255,255,0.05)', border:'1px solid rgba(255,255,255,0.1)',
                        borderRadius:'12px', color: role ? 'white' : 'rgba(255,255,255,0.4)',
                        fontSize:'15px', padding:'0 16px', outline:'none', cursor:'pointer',
                        fontFamily:'Inter,sans-serif', appearance:'none' }}>
                      <option value="" disabled style={{ background:'#111' }}>Select role *</option>
                      <option value="Employee" style={{ background:'#111', color:'white' }}>👤 Employee</option>
                      <option value="Manager"  style={{ background:'#111', color:'white' }}>👔 Manager</option>
                      <option value="Admin"    style={{ background:'#111', color:'white' }}>👨‍💼 Admin</option>
                    </select>
                  </div>
                  <Field type="text" placeholder="Department (optional)" value={department}
                    onChange={e => setDept(e.target.value)} icon="🏢" />
                  <button type="submit" disabled={loading} style={btnPrimary}
                    onMouseEnter={e => { if(!loading){ e.currentTarget.style.transform='translateY(-2px)'; e.currentTarget.style.boxShadow='0 8px 24px rgba(102,126,234,0.4)'; }}}
                    onMouseLeave={e => { e.currentTarget.style.transform='none'; e.currentTarget.style.boxShadow='none'; }}>
                    {loading ? 'Creating…' : 'Create Account'}
                  </button>
                </form>
              )}
            </motion.div>
          </AnimatePresence>

          {/* Demo cards — login only */}
          <AnimatePresence>
            {mode === 'login' && (
              <motion.div initial={{ opacity:0, y:16 }} animate={{ opacity:1, y:0 }}
                exit={{ opacity:0, y:-16 }} transition={{ duration:0.4, delay:0.15 }}
                style={{ marginTop:'24px', paddingTop:'20px', borderTop:'1px solid rgba(255,255,255,0.08)' }}>
                <p style={{ color:'rgba(255,255,255,0.45)', fontSize:'11px', fontWeight:600,
                  letterSpacing:'1px', marginBottom:'12px' }}>⚡ QUICK DEMO ACCESS</p>
                {demoAccounts.map((a, i) => (
                  <motion.button key={a.role} type="button"
                    initial={{ opacity:0, x:-16 }} animate={{ opacity:1, x:0 }}
                    transition={{ delay: 0.2 + i * 0.07 }}
                    whileHover={{ x:4, backgroundColor:'rgba(255,255,255,0.1)' }}
                    whileTap={{ scale:0.98 }}
                    disabled={loading}
                    onClick={() => doLogin(a.email, 'password123')}
                    style={{ width:'100%', background:'rgba(255,255,255,0.05)',
                      border:'1px solid rgba(255,255,255,0.1)', borderRadius:'12px',
                      padding:'12px 16px', cursor: loading ? 'not-allowed' : 'pointer',
                      display:'flex', alignItems:'center', gap:'12px',
                      marginBottom:'8px', color:'white', textAlign:'left' }}>
                    <span style={{ fontSize:'22px' }}>{a.icon}</span>
                    <div>
                      <div style={{ fontWeight:600, fontSize:'14px' }}>{a.role}</div>
                      <div style={{ color:'rgba(255,255,255,0.45)', fontSize:'12px' }}>{a.desc}</div>
                    </div>
                  </motion.button>
                ))}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Switch mode */}
          <div style={{ textAlign:'center', marginTop:'20px', paddingTop:'18px',
            borderTop:'1px solid rgba(255,255,255,0.08)' }}>
            <span style={{ color:'rgba(255,255,255,0.5)', fontSize:'14px' }}>
              {mode === 'login' ? "Don't have an account? " : 'Already have an account? '}
            </span>
            <motion.button type="button" whileHover={{ scale:1.05 }} whileTap={{ scale:0.95 }}
              onClick={() => switchMode(mode === 'login' ? 'signup' : 'login')}
              style={{ color:'#a78bfa', fontWeight:600, background:'none',
                border:'none', cursor:'pointer', fontSize:'14px', padding:0 }}>
              {mode === 'login' ? 'Create account' : 'Sign in'}
            </motion.button>
          </div>

        </motion.div>
      </div>

      <style>{`
        .auth-left-hide { display: flex; }
        @media (max-width: 900px) { .auth-left-hide { display: none !important; } }
        input::placeholder { color: rgba(255,255,255,0.35) !important; }
        input:-webkit-autofill, input:-webkit-autofill:focus {
          -webkit-box-shadow: 0 0 0 30px #0f0f1a inset !important;
          -webkit-text-fill-color: white !important;
        }
        * { box-sizing: border-box; }
      `}</style>
    </div>
  );
};

export default PremiumAuth;
