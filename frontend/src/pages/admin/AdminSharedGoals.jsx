import React, { useState } from 'react';
import { Select, message } from 'antd';
import { LinkOutlined, UserOutlined, CheckCircleOutlined } from '@ant-design/icons';
import { motion, AnimatePresence } from 'framer-motion';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { adminAPI, thrustAreaAPI } from '../../services/api';

const { Option } = Select;

/* ── KPI card ── */
const KpiCard = ({ icon, label, value, sub, gradient, delay = 0 }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
    transition={{ delay, duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
    whileHover={{ y: -4, transition: { duration: 0.2 } }}
    style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '16px', padding: '22px' }}
  >
    <div style={{ width: '42px', height: '42px', borderRadius: '11px', background: gradient,
      display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px', marginBottom: '14px' }}>{icon}</div>
    <div style={{ color: 'white', fontSize: '1.9rem', fontWeight: 700, lineHeight: 1, marginBottom: '5px' }}>{value}</div>
    <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: '13px' }}>{label}</div>
    {sub && <div style={{ color: 'rgba(255,255,255,0.3)', fontSize: '11px', marginTop: '3px' }}>{sub}</div>}
  </motion.div>
);

/* ── Styled field row ── */
const FieldRow = ({ label, required, hint, children, icon }) => (
  <div style={{ marginBottom: '20px' }}>
    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
      {icon && <span style={{ fontSize: '14px', opacity: 0.6 }}>{icon}</span>}
      <span style={{ color: 'rgba(255,255,255,0.75)', fontSize: '13px', fontWeight: 600 }}>
        {label} {required && <span style={{ color: '#ef4444' }}>*</span>}
      </span>
      {hint && <span style={{ color: 'rgba(255,255,255,0.25)', fontSize: '11px', marginLeft: 'auto' }}>{hint}</span>}
    </div>
    {children}
  </div>
);

const inputBase = {
  width: '100%', boxSizing: 'border-box',
  background: 'rgba(255,255,255,0.05)',
  border: '1px solid rgba(255,255,255,0.1)',
  borderRadius: '10px', color: 'white',
  fontSize: '14px', outline: 'none',
  fontFamily: 'Inter, sans-serif',
  transition: 'all 0.2s ease',
};

const FocusInput = ({ multiline, type, ...props }) => {
  const [focused, setFocused] = useState(false);
  const style = {
    ...inputBase,
    height: multiline ? 'auto' : '44px',
    padding: multiline ? '12px 14px' : '0 14px',
    border: `1px solid ${focused ? 'rgba(99,102,241,0.5)' : 'rgba(255,255,255,0.1)'}`,
    boxShadow: focused ? '0 0 0 3px rgba(99,102,241,0.12)' : 'none',
  };
  if (multiline) return (
    <textarea {...props} rows={3} onFocus={() => setFocused(true)} onBlur={() => setFocused(false)} style={{ ...style, resize: 'vertical' }} />
  );
  return <input type={type || 'text'} {...props} onFocus={() => setFocused(true)} onBlur={() => setFocused(false)} style={style} />;
};

const FocusSelect = ({ children, value, onChange, placeholder }) => {
  const [focused, setFocused] = useState(false);
  return (
    <select value={value} onChange={onChange} onFocus={() => setFocused(true)} onBlur={() => setFocused(false)}
      style={{ ...inputBase, height: '44px', padding: '0 14px', cursor: 'pointer', appearance: 'none',
        border: `1px solid ${focused ? 'rgba(99,102,241,0.5)' : 'rgba(255,255,255,0.1)'}`,
        boxShadow: focused ? '0 0 0 3px rgba(99,102,241,0.12)' : 'none' }}>
      <option value="" disabled style={{ background: '#111' }}>{placeholder}</option>
      {children}
    </select>
  );
};

const AdminSharedGoals = () => {
  const [vals, setVals] = useState({ thrust_area_id:'', title:'', description:'', uom_type:'', target:'', primary_owner_id:'', recipient_ids:[] });
  const [step, setStep] = useState(1); // 1=goal details, 2=assignment
  const queryClient = useQueryClient();

  const { data: usersData } = useQuery({ queryKey: ['allUsers'], queryFn: adminAPI.getAllUsers });
  const { data: thrustAreasData } = useQuery({ queryKey: ['thrustAreas'], queryFn: thrustAreaAPI.getThrustAreas });
  const { data: goalsData } = useQuery({ queryKey: ['allGoals'], queryFn: adminAPI.getAllGoals });

  const users = usersData?.data || [];
  const thrustAreas = thrustAreasData?.data || [];
  const goals = goalsData?.data || [];
  const employees = users.filter(u => u.role === 'Employee');
  const sharedGoals = goals.filter(g => g.is_shared && g.primary_owner_id);

  const set = (f, v) => setVals(p => ({ ...p, [f]: v }));

  const createMutation = useMutation({
    mutationFn: (data) => adminAPI.createSharedGoal(data),
    onSuccess: () => {
      message.success('Shared goal created and assigned!');
      queryClient.invalidateQueries(['allGoals']);
      setVals({ thrust_area_id:'', title:'', description:'', uom_type:'', target:'', primary_owner_id:'', recipient_ids:[] });
      setStep(1);
    },
    onError: (err) => message.error(err.response?.data?.detail || 'Failed to create shared goal'),
  });

  const handleNext = () => {
    if (!vals.thrust_area_id || !vals.title || !vals.uom_type || !vals.target) {
      message.error('Please fill all required fields in Step 1'); return;
    }
    setStep(2);
  };

  const handleSubmit = () => {
    if (!vals.primary_owner_id || vals.recipient_ids.length === 0) {
      message.error('Please select a primary owner and at least one recipient'); return;
    }
    createMutation.mutate(vals);
  };

  const uomOptions = [
    { value: 'Numeric', icon: '🔢', desc: 'A countable number (e.g. 100 tickets)' },
    { value: 'Percentage', icon: '📊', desc: 'A percentage target (e.g. 95%)' },
    { value: 'Timeline', icon: '📅', desc: 'A date or deadline target' },
    { value: 'Zero', icon: '⭕', desc: 'Zero-defect or binary goal' },
  ];

  const statusBadge = (status) => {
    const map = {
      'Draft':            { bg:'rgba(255,255,255,0.06)', color:'rgba(255,255,255,0.5)' },
      'Pending Approval': { bg:'rgba(245,158,11,0.12)',  color:'#fcd34d' },
      'Approved':         { bg:'rgba(16,185,129,0.12)',  color:'#6ee7b7' },
      'Rejected':         { bg:'rgba(239,68,68,0.12)',   color:'#fca5a5' },
    };
    const s = map[status] || map['Draft'];
    return <span style={{ padding:'3px 10px', borderRadius:'20px', fontSize:'12px', fontWeight:600, background:s.bg, color:s.color }}>{status}</span>;
  };

  return (
    <div style={{ color:'white', fontFamily:'Inter, sans-serif' }}>

      {/* Header */}
      <motion.div initial={{ opacity:0, y:-12 }} animate={{ opacity:1, y:0 }} transition={{ duration:0.5 }} style={{ marginBottom:'24px' }}>
        <h1 style={{ color:'white', fontSize:'1.6rem', fontWeight:700, margin:'0 0 4px' }}>Shared Goals</h1>
        <p style={{ color:'rgba(255,255,255,0.4)', fontSize:'14px', margin:0 }}>
          Create org-wide goals and assign them to multiple employees simultaneously.
        </p>
      </motion.div>

      {/* KPIs */}
      <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(160px,1fr))', gap:'14px', marginBottom:'28px' }}>
        <KpiCard icon="🔗" label="Shared Goals" value={sharedGoals.length} sub="Total created" gradient="linear-gradient(135deg,#667eea,#764ba2)" delay={0} />
        <KpiCard icon="✅" label="Approved" value={sharedGoals.filter(g=>g.status==='Approved').length} sub="Active goals" gradient="linear-gradient(135deg,#10b981,#059669)" delay={0.07} />
        <KpiCard icon="⏳" label="Pending" value={sharedGoals.filter(g=>g.status==='Pending Approval').length} sub="Awaiting approval" gradient="linear-gradient(135deg,#f59e0b,#d97706)" delay={0.14} />
        <KpiCard icon="👥" label="Employees" value={employees.length} sub="Available to assign" gradient="linear-gradient(135deg,#8b5cf6,#7c3aed)" delay={0.21} />
      </div>

      <div style={{ display:'grid', gridTemplateColumns:'1fr 1.1fr', gap:'20px' }}>

        {/* ── CREATE FORM ── */}
        <motion.div initial={{ opacity:0, x:-16 }} animate={{ opacity:1, x:0 }} transition={{ delay:0.15, duration:0.5 }}>
          <div style={{ background:'rgba(255,255,255,0.04)', border:'1px solid rgba(255,255,255,0.08)', borderRadius:'18px', overflow:'hidden' }}>

            {/* Form header with step indicator */}
            <div style={{ padding:'20px 24px', borderBottom:'1px solid rgba(255,255,255,0.06)',
              background:'linear-gradient(135deg,rgba(102,126,234,0.1),rgba(118,75,162,0.08))' }}>
              <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between' }}>
                <div>
                  <div style={{ color:'white', fontWeight:700, fontSize:'15px' }}>
                    {step === 1 ? '🎯 Define the Goal' : '👥 Assign to Team'}
                  </div>
                  <div style={{ color:'rgba(255,255,255,0.4)', fontSize:'12px', marginTop:'3px' }}>
                    {step === 1 ? 'Set the goal details and measurement criteria' : 'Choose who owns and receives this goal'}
                  </div>
                </div>
                {/* Step pills */}
                <div style={{ display:'flex', gap:'6px' }}>
                  {[1,2].map(s => (
                    <div key={s} style={{ width:'28px', height:'28px', borderRadius:'50%', display:'flex', alignItems:'center', justifyContent:'center',
                      fontSize:'12px', fontWeight:700, cursor: s < step ? 'pointer' : 'default',
                      background: s === step ? 'linear-gradient(135deg,#667eea,#764ba2)' : s < step ? 'rgba(16,185,129,0.3)' : 'rgba(255,255,255,0.08)',
                      color: s === step ? 'white' : s < step ? '#6ee7b7' : 'rgba(255,255,255,0.3)',
                      border: `1px solid ${s === step ? 'rgba(102,126,234,0.5)' : s < step ? 'rgba(16,185,129,0.3)' : 'rgba(255,255,255,0.1)'}` }}
                      onClick={() => s < step && setStep(s)}>
                      {s < step ? '✓' : s}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div style={{ padding:'24px' }}>
              <AnimatePresence mode="wait">
                {step === 1 ? (
                  <motion.div key="step1" initial={{ opacity:0, x:-20 }} animate={{ opacity:1, x:0 }} exit={{ opacity:0, x:20 }} transition={{ duration:0.3 }}>

                    <FieldRow label="Thrust Area" required icon="🏷️">
                      <FocusSelect value={vals.thrust_area_id} onChange={e => set('thrust_area_id', e.target.value)} placeholder="Select thrust area">
                        {thrustAreas.map(ta => <option key={ta.id} value={ta.id} style={{ background:'#111' }}>{ta.name}</option>)}
                      </FocusSelect>
                    </FieldRow>

                    <FieldRow label="Goal Title" required icon="✏️">
                      <FocusInput type="text" placeholder="e.g. Achieve 95% Customer Satisfaction" value={vals.title} onChange={e => set('title', e.target.value)} />
                    </FieldRow>

                    <FieldRow label="Description" icon="📝">
                      <FocusInput multiline placeholder="Describe the objective and expected outcome..." value={vals.description} onChange={e => set('description', e.target.value)} />
                    </FieldRow>

                    {/* UoM as visual cards */}
                    <FieldRow label="Unit of Measurement" required icon="📐">
                      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'8px' }}>
                        {uomOptions.map(opt => (
                          <motion.div key={opt.value} whileHover={{ scale:1.02 }} whileTap={{ scale:0.98 }}
                            onClick={() => set('uom_type', opt.value)}
                            style={{ padding:'12px', borderRadius:'10px', cursor:'pointer',
                              background: vals.uom_type === opt.value ? 'rgba(102,126,234,0.2)' : 'rgba(255,255,255,0.04)',
                              border: `1px solid ${vals.uom_type === opt.value ? 'rgba(102,126,234,0.5)' : 'rgba(255,255,255,0.08)'}`,
                              transition:'all 0.2s' }}>
                            <div style={{ fontSize:'18px', marginBottom:'4px' }}>{opt.icon}</div>
                            <div style={{ color: vals.uom_type === opt.value ? '#a78bfa' : 'white', fontWeight:600, fontSize:'13px' }}>{opt.value}</div>
                            <div style={{ color:'rgba(255,255,255,0.35)', fontSize:'11px', marginTop:'2px' }}>{opt.desc}</div>
                          </motion.div>
                        ))}
                      </div>
                    </FieldRow>

                    <FieldRow label="Target Value" required icon="🎯">
                      <FocusInput type="text" placeholder={vals.uom_type === 'Percentage' ? 'e.g. 95' : vals.uom_type === 'Numeric' ? 'e.g. 100' : 'Enter target'} value={vals.target} onChange={e => set('target', e.target.value)} />
                    </FieldRow>

                    <motion.button whileHover={{ scale:1.02, y:-1 }} whileTap={{ scale:0.98 }}
                      onClick={handleNext}
                      style={{ width:'100%', padding:'13px', background:'linear-gradient(135deg,#667eea,#764ba2)',
                        border:'none', borderRadius:'10px', color:'white', fontSize:'14px', fontWeight:600,
                        cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', gap:'8px' }}>
                      Continue to Assignment →
                    </motion.button>
                  </motion.div>
                ) : (
                  <motion.div key="step2" initial={{ opacity:0, x:20 }} animate={{ opacity:1, x:0 }} exit={{ opacity:0, x:-20 }} transition={{ duration:0.3 }}>

                    {/* Goal summary */}
                    <div style={{ background:'rgba(102,126,234,0.08)', border:'1px solid rgba(102,126,234,0.2)',
                      borderRadius:'10px', padding:'14px', marginBottom:'20px' }}>
                      <div style={{ color:'#a78bfa', fontSize:'11px', fontWeight:600, letterSpacing:'0.5px', marginBottom:'6px' }}>GOAL SUMMARY</div>
                      <div style={{ color:'white', fontWeight:600, fontSize:'14px', marginBottom:'4px' }}>{vals.title}</div>
                      <div style={{ color:'rgba(255,255,255,0.45)', fontSize:'12px' }}>{vals.uom_type} · Target: {vals.target}</div>
                    </div>

                    <FieldRow label="Primary Owner" required icon="👑" hint="Their achievement syncs to all recipients">
                      <FocusSelect value={vals.primary_owner_id} onChange={e => set('primary_owner_id', e.target.value)} placeholder="Select primary owner">
                        {employees.map(emp => <option key={emp.id} value={emp.id} style={{ background:'#111' }}>{emp.full_name}{emp.department ? ` (${emp.department})` : ''}</option>)}
                      </FocusSelect>
                    </FieldRow>

                    <FieldRow label="Assign To Employees" required icon="👥" hint="Recipients adjust weightage only">
                      <Select mode="multiple" placeholder="Select employees to assign"
                        value={vals.recipient_ids} onChange={v => set('recipient_ids', v)}
                        style={{ width:'100%' }}
                        dropdownStyle={{ background:'rgba(8,8,8,0.97)', backdropFilter:'blur(20px)', border:'1px solid rgba(255,255,255,0.1)', borderRadius:'12px' }}>
                        {employees.map(emp => (
                          <Option key={emp.id} value={emp.id}>{emp.full_name}{emp.department ? ` · ${emp.department}` : ''}</Option>
                        ))}
                      </Select>
                    </FieldRow>

                    {vals.recipient_ids.length > 0 && (
                      <div style={{ background:'rgba(16,185,129,0.06)', border:'1px solid rgba(16,185,129,0.15)',
                        borderRadius:'10px', padding:'12px', marginBottom:'16px' }}>
                        <div style={{ color:'#6ee7b7', fontSize:'12px', fontWeight:600 }}>
                          ✅ This goal will be assigned to {vals.recipient_ids.length} employee{vals.recipient_ids.length > 1 ? 's' : ''}
                        </div>
                      </div>
                    )}

                    <div style={{ display:'flex', gap:'10px' }}>
                      <button onClick={() => setStep(1)}
                        style={{ padding:'13px 20px', background:'rgba(255,255,255,0.06)', border:'1px solid rgba(255,255,255,0.1)',
                          borderRadius:'10px', color:'rgba(255,255,255,0.6)', fontSize:'14px', fontWeight:600, cursor:'pointer' }}>
                        ← Back
                      </button>
                      <motion.button whileHover={{ scale:1.02, y:-1 }} whileTap={{ scale:0.98 }}
                        onClick={handleSubmit} disabled={createMutation.isPending}
                        style={{ flex:1, padding:'13px', background:'linear-gradient(135deg,#10b981,#059669)',
                          border:'none', borderRadius:'10px', color:'white', fontSize:'14px', fontWeight:600,
                          cursor:'pointer', opacity: createMutation.isPending ? 0.7 : 1 }}>
                        {createMutation.isPending ? 'Creating…' : '🚀 Create & Assign Shared Goal'}
                      </motion.button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </motion.div>

        {/* ── EXISTING SHARED GOALS ── */}
        <motion.div initial={{ opacity:0, x:16 }} animate={{ opacity:1, x:0 }} transition={{ delay:0.2, duration:0.5 }}>
          <div style={{ background:'rgba(255,255,255,0.04)', border:'1px solid rgba(255,255,255,0.08)', borderRadius:'18px', overflow:'hidden' }}>
            <div style={{ padding:'18px 24px', borderBottom:'1px solid rgba(255,255,255,0.06)',
              display:'flex', alignItems:'center', gap:'8px' }}>
              <span style={{ fontSize:'16px' }}>🔗</span>
              <span style={{ color:'white', fontWeight:700, fontSize:'15px' }}>Existing Shared Goals</span>
              <span style={{ marginLeft:'auto', background:'rgba(102,126,234,0.15)', color:'#a78bfa',
                fontSize:'12px', fontWeight:600, padding:'2px 10px', borderRadius:'20px' }}>{sharedGoals.length}</span>
            </div>
            <div style={{ padding:'16px', maxHeight:'520px', overflowY:'auto' }}>
              {sharedGoals.length === 0 ? (
                <div style={{ textAlign:'center', padding:'48px 20px' }}>
                  <div style={{ fontSize:'40px', marginBottom:'14px', opacity:0.5 }}>🔗</div>
                  <div style={{ color:'rgba(255,255,255,0.5)', fontWeight:600, marginBottom:'6px' }}>No shared goals yet</div>
                  <div style={{ color:'rgba(255,255,255,0.3)', fontSize:'13px' }}>Create your first shared goal using the form.</div>
                </div>
              ) : sharedGoals.map((goal, i) => {
                const owner = users.find(u => u.id === goal.primary_owner_id);
                const linkedCount = goals.filter(g => g.shared_goal_id === goal.id).length;
                return (
                  <motion.div key={goal.id} initial={{ opacity:0, y:10 }} animate={{ opacity:1, y:0 }}
                    transition={{ delay:0.1 + i*0.05 }}
                    style={{ background:'rgba(255,255,255,0.03)', border:'1px solid rgba(255,255,255,0.06)',
                      borderRadius:'12px', padding:'16px', marginBottom:'10px', position:'relative', overflow:'hidden' }}>
                    {/* accent line */}
                    <div style={{ position:'absolute', left:0, top:0, bottom:0, width:'3px',
                      background: goal.status === 'Approved' ? '#10b981' : goal.status === 'Pending Approval' ? '#f59e0b' : '#667eea',
                      borderRadius:'3px 0 0 3px' }} />
                    <div style={{ paddingLeft:'8px' }}>
                      <div style={{ display:'flex', alignItems:'flex-start', justifyContent:'space-between', marginBottom:'10px' }}>
                        <div style={{ flex:1, minWidth:0, marginRight:'10px' }}>
                          <div style={{ color:'white', fontWeight:600, fontSize:'14px', marginBottom:'3px' }}>{goal.title}</div>
                          <div style={{ color:'rgba(255,255,255,0.35)', fontSize:'12px' }}>{goal.uom_type} · Target: {goal.target}</div>
                        </div>
                        {statusBadge(goal.status)}
                      </div>
                      <div style={{ display:'flex', gap:'14px', flexWrap:'wrap' }}>
                        <div style={{ display:'flex', alignItems:'center', gap:'5px' }}>
                          <span style={{ fontSize:'12px' }}>👑</span>
                          <span style={{ color:'rgba(255,255,255,0.45)', fontSize:'12px' }}>
                            <span style={{ color:'rgba(255,255,255,0.7)', fontWeight:500 }}>{owner?.full_name || 'N/A'}</span>
                          </span>
                        </div>
                        <div style={{ display:'flex', alignItems:'center', gap:'5px' }}>
                          <span style={{ fontSize:'12px' }}>👥</span>
                          <span style={{ color:'rgba(255,255,255,0.45)', fontSize:'12px' }}>
                            <span style={{ color:'#a78bfa', fontWeight:600 }}>{linkedCount}</span> assigned
                          </span>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>
        </motion.div>
      </div>

      <style>{`
        input::placeholder, textarea::placeholder { color: rgba(255,255,255,0.3) !important; }
        .ant-select-selector { background: rgba(255,255,255,0.05) !important; border: 1px solid rgba(255,255,255,0.1) !important; border-radius: 10px !important; color: white !important; min-height: 44px !important; }
        .ant-select-focused .ant-select-selector { border-color: rgba(99,102,241,0.5) !important; box-shadow: 0 0 0 3px rgba(99,102,241,0.12) !important; }
        .ant-select-selection-placeholder { color: rgba(255,255,255,0.3) !important; }
        .ant-select-selection-item { color: white !important; }
        .ant-select-arrow { color: rgba(255,255,255,0.4) !important; }
        .ant-select-dropdown { background: rgba(8,8,8,0.97) !important; border: 1px solid rgba(255,255,255,0.1) !important; border-radius: 12px !important; }
        .ant-select-item-option { color: rgba(255,255,255,0.8) !important; }
        .ant-select-item-option:hover, .ant-select-item-option-active { background: rgba(99,102,241,0.15) !important; }
        .ant-select-item-option-selected { background: rgba(99,102,241,0.25) !important; color: white !important; }
        .ant-select-multiple .ant-select-selection-item { background: rgba(102,126,234,0.2) !important; border: 1px solid rgba(102,126,234,0.3) !important; color: #a78bfa !important; border-radius: 6px !important; }
        .ant-select-multiple .ant-select-selection-item-remove { color: rgba(167,139,250,0.6) !important; }
      `}</style>
    </div>
  );
};

export default AdminSharedGoals;
