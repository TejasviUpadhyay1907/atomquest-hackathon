import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  PieChart, Pie, Cell, BarChart, Bar, LineChart, Line, RadarChart, Radar,
  PolarGrid, PolarAngleAxis,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts';
import { useQuery } from '@tanstack/react-query';
import { reportAPI, checkinAPI, adminAPI } from '../services/api';
import { useAuth } from '../contexts/AuthContext';

const COLORS = ['#667eea','#10b981','#f59e0b','#ef4444','#a78bfa','#06b6d4','#f97316','#84cc16'];

/* ── reusable card ── */
const GlassCard = ({ children, style = {} }) => (
  <div style={{
    background: 'rgba(255,255,255,0.04)', backdropFilter: 'blur(12px)',
    border: '1px solid rgba(255,255,255,0.08)', borderRadius: '16px',
    ...style
  }}>{children}</div>
);

/* ── KPI card ── */
const KpiCard = ({ icon, label, value, sub, gradient, delay = 0 }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
    transition={{ delay, duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
    whileHover={{ y: -4, transition: { duration: 0.2 } }}
    style={{
      background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)',
      borderRadius: '16px', padding: '24px', cursor: 'default',
      transition: 'box-shadow 0.2s',
    }}
    onMouseEnter={e => e.currentTarget.style.boxShadow = '0 8px 32px rgba(0,0,0,0.3)'}
    onMouseLeave={e => e.currentTarget.style.boxShadow = 'none'}
  >
    <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '16px' }}>
      <div style={{ width: '44px', height: '44px', borderRadius: '12px',
        background: gradient, display: 'flex', alignItems: 'center',
        justifyContent: 'center', fontSize: '20px' }}>{icon}</div>
    </div>
    <div style={{ color: 'white', fontSize: '2rem', fontWeight: 700, lineHeight: 1, marginBottom: '6px' }}>{value}</div>
    <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: '13px', marginBottom: '4px' }}>{label}</div>
    {sub && <div style={{ color: 'rgba(255,255,255,0.3)', fontSize: '12px' }}>{sub}</div>}
  </motion.div>
);

/* ── custom tooltip ── */
const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{ background: 'rgba(13,13,20,0.95)', border: '1px solid rgba(255,255,255,0.1)',
      borderRadius: '10px', padding: '10px 14px', fontSize: '13px', color: 'white' }}>
      {label && <div style={{ color: 'rgba(255,255,255,0.5)', marginBottom: '6px' }}>{label}</div>}
      {payload.map((p, i) => (
        <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: p.color }} />
          <span style={{ color: 'rgba(255,255,255,0.7)' }}>{p.name}:</span>
          <span style={{ fontWeight: 600 }}>{p.value}</span>
        </div>
      ))}
    </div>
  );
};

const quarters = ['Q1', 'Q2', 'Q3', 'Q4'];

const AnalyticsDashboard = () => {
  const [selectedQuarter, setSelectedQuarter] = useState('Q1');
  const { user } = useAuth();

  const { data: distributionData, isLoading: d1 } = useQuery({
    queryKey: ['goalDistribution'],
    queryFn: () => reportAPI.getGoalDistribution(),
  });
  const { data: statusData, isLoading: d2 } = useQuery({
    queryKey: ['statusOverview'],
    queryFn: () => reportAPI.getStatusOverview(),
  });
  const { data: completionData, isLoading: d3 } = useQuery({
    queryKey: ['completionDashboard', selectedQuarter],
    queryFn: () => reportAPI.getCompletionDashboard(selectedQuarter),
  });
  const { data: achievementData, isLoading: d4 } = useQuery({
    queryKey: ['achievementReport'],
    queryFn: () => reportAPI.getAchievementReport(),
  });

  // Manager effectiveness — team check-in completion per manager
  const { data: usersData } = useQuery({
    queryKey: ['allUsers'],
    queryFn: () => adminAPI.getAllUsers(),
    enabled: user?.role === 'Admin',
  });

  const { data: teamCheckinsQ1 } = useQuery({
    queryKey: ['teamCheckinsAll'],
    queryFn: () => checkinAPI.getTeamCheckins(selectedQuarter),
    enabled: user?.role === 'Admin' || user?.role === 'Manager',
  });

  const distribution = distributionData?.data || [];
  const statusOverview = statusData?.data || [];
  const completion = completionData?.data || {};
  const achievements = achievementData?.data || [];

  const goalDistributionData = distribution.map(item => ({ name: item.thrust_area, value: item.count }));
  const statusOverviewData = statusOverview.map(item => ({ name: item.status, value: item.count }));
  const completionRatesData = (completion.employees || []).map(emp => ({
    name: emp.employee_name.split(' ')[0],
    completion: emp.completion_percentage,
  }));
  const progressByQuarter = quarters.map(q => {
    const qa = achievements.filter(a => a.quarter === q);
    const avg = qa.length ? qa.reduce((s, a) => s + (a.progress_score || 0), 0) / qa.length : 0;
    return { quarter: q, progress: Math.round(avg) };
  });

  const totalGoals = goalDistributionData.reduce((s, i) => s + i.value, 0);
  const isLoading = d1 || d2 || d3 || d4;

  // UoM distribution
  const uomDistribution = achievements.reduce((acc, item) => {
    const uom = item.uom_type || 'Unknown';
    acc[uom] = (acc[uom] || 0) + 1;
    return acc;
  }, {});
  const uomData = Object.entries(uomDistribution).map(([name, value]) => ({ name, value }));

  // Manager effectiveness — check-in completion rate per manager
  const allUsers = usersData?.data || [];
  const teamCheckins = teamCheckinsQ1?.data || [];
  const managers = allUsers.filter(u => u.role === 'MANAGER' || u.role === 'Manager');
  const managerEffectiveness = managers.map(mgr => {
    const teamMembers = allUsers.filter(u => u.manager_id === mgr.id);
    const teamIds = teamMembers.map(m => m.id);
    const teamCheckinsDone = teamCheckins.filter(c => teamIds.includes(c.employee_id));
    const completed = teamCheckinsDone.filter(c => c.status === 'Completed').length;
    const total = teamCheckinsDone.length;
    return {
      name: mgr.full_name.split(' ')[0],
      completion: total > 0 ? Math.round((completed / total) * 100) : 0,
      total,
      completed,
    };
  }).filter(m => m.total > 0);

  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';

  if (isLoading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh' }}>
        <div style={{ textAlign: 'center' }}>
          <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
            style={{ width: '40px', height: '40px', border: '3px solid rgba(102,126,234,0.3)',
              borderTop: '3px solid #667eea', borderRadius: '50%', margin: '0 auto 16px' }} />
          <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: '14px' }}>Loading analytics…</div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ color: 'white', fontFamily: 'Inter, sans-serif' }}>

      {/* ── HERO ── */}
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}
        style={{ position: 'relative', borderRadius: '20px', padding: '36px 40px', marginBottom: '28px', overflow: 'hidden',
          background: 'linear-gradient(135deg,rgba(102,126,234,0.2) 0%,rgba(118,75,162,0.2) 50%,rgba(6,182,212,0.1) 100%)',
          border: '1px solid rgba(102,126,234,0.2)' }}>
        {/* bg orbs */}
        <div style={{ position: 'absolute', top: '-40px', right: '-40px', width: '200px', height: '200px',
          borderRadius: '50%', background: 'radial-gradient(circle,rgba(102,126,234,0.3),transparent 70%)',
          filter: 'blur(30px)', pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', bottom: '-20px', left: '30%', width: '150px', height: '150px',
          borderRadius: '50%', background: 'radial-gradient(circle,rgba(16,185,129,0.2),transparent 70%)',
          filter: 'blur(30px)', pointerEvents: 'none' }} />
        <div style={{ position: 'relative', zIndex: 1 }}>
          <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: '13px', marginBottom: '8px', fontWeight: 500 }}>
            Analytics Dashboard
          </div>
          <h1 style={{ color: 'white', fontSize: '2rem', fontWeight: 700, margin: '0 0 8px',
            background: 'linear-gradient(135deg,#fff,rgba(255,255,255,0.7))',
            WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
            {greeting}, {user?.full_name?.split(' ')[0]} 👋
          </h1>
          <p style={{ color: 'rgba(255,255,255,0.55)', fontSize: '15px', margin: 0 }}>
            Here's your performance intelligence overview. {totalGoals} goals tracked across all thrust areas.
          </p>
        </div>
      </motion.div>

      {/* ── KPI CARDS ── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(200px,1fr))', gap: '16px', marginBottom: '28px' }}>
        <KpiCard icon="👥" label="Total Employees" value={completion.total_employees || 0}
          sub="Active in system" gradient="linear-gradient(135deg,#667eea,#764ba2)" delay={0} />
        <KpiCard icon="✅" label="Completed Check-ins" value={completion.fully_completed || 0}
          sub={`${selectedQuarter} Quarter`} gradient="linear-gradient(135deg,#10b981,#059669)" delay={0.08} />
        <KpiCard icon="🎯" label="Total Goals" value={totalGoals}
          sub="All thrust areas" gradient="linear-gradient(135deg,#f59e0b,#d97706)" delay={0.16} />
        <KpiCard icon="📊" label="Total Check-ins" value={achievements.length}
          sub="All quarters" gradient="linear-gradient(135deg,#06b6d4,#3b82f6)" delay={0.24} />
      </div>

      {/* ── QUARTER SELECTOR ── */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
        <h2 style={{ color: 'white', fontSize: '18px', fontWeight: 600, margin: 0 }}>Performance Charts</h2>
        <div style={{ display: 'flex', gap: '6px', background: 'rgba(255,255,255,0.04)',
          border: '1px solid rgba(255,255,255,0.08)', borderRadius: '10px', padding: '4px' }}>
          {quarters.map(q => (
            <button key={q} onClick={() => setSelectedQuarter(q)}
              style={{ padding: '6px 16px', borderRadius: '7px', border: 'none', cursor: 'pointer',
                fontSize: '13px', fontWeight: 600, transition: 'all 0.2s',
                background: selectedQuarter === q ? 'linear-gradient(135deg,#667eea,#764ba2)' : 'transparent',
                color: selectedQuarter === q ? 'white' : 'rgba(255,255,255,0.4)' }}>
              {q}
            </button>
          ))}
        </div>
      </div>

      {/* ── CHARTS GRID ── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(420px,1fr))', gap: '20px', marginBottom: '20px' }}>

        {/* Goal Distribution */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <GlassCard style={{ padding: '24px' }}>
            <div style={{ marginBottom: '20px' }}>
              <div style={{ color: 'white', fontWeight: 600, fontSize: '15px' }}>Goal Distribution</div>
              <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: '12px', marginTop: '2px' }}>By thrust area</div>
            </div>
            <ResponsiveContainer width="100%" height={260}>
              <PieChart>
                <Pie data={goalDistributionData} cx="50%" cy="50%" outerRadius={90}
                  dataKey="value" label={({ name, percent }) => `${name}: ${(percent*100).toFixed(0)}%`}
                  labelLine={{ stroke: 'rgba(255,255,255,0.2)' }}>
                  {goalDistributionData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
              </PieChart>
            </ResponsiveContainer>
          </GlassCard>
        </motion.div>

        {/* Status Overview */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}>
          <GlassCard style={{ padding: '24px' }}>
            <div style={{ marginBottom: '20px' }}>
              <div style={{ color: 'white', fontWeight: 600, fontSize: '15px' }}>Goal Status Overview</div>
              <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: '12px', marginTop: '2px' }}>Current status distribution</div>
            </div>
            <ResponsiveContainer width="100%" height={260}>
              <PieChart>
                <Pie data={statusOverviewData} cx="50%" cy="50%" outerRadius={90}
                  dataKey="value" label={({ name, percent }) => `${name}: ${(percent*100).toFixed(0)}%`}
                  labelLine={{ stroke: 'rgba(255,255,255,0.2)' }}>
                  {statusOverviewData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
              </PieChart>
            </ResponsiveContainer>
          </GlassCard>
        </motion.div>

        {/* Completion Rates */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
          <GlassCard style={{ padding: '24px' }}>
            <div style={{ marginBottom: '20px' }}>
              <div style={{ color: 'white', fontWeight: 600, fontSize: '15px' }}>Completion Rates — {selectedQuarter}</div>
              <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: '12px', marginTop: '2px' }}>Employee performance this quarter</div>
            </div>
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={completionRatesData} barSize={28}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                <XAxis dataKey="name" tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 12 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 12 }} axisLine={false} tickLine={false} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="completion" name="Completion %" radius={[6,6,0,0]}
                  fill="url(#barGrad)" />
                <defs>
                  <linearGradient id="barGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#667eea" />
                    <stop offset="100%" stopColor="#764ba2" />
                  </linearGradient>
                </defs>
              </BarChart>
            </ResponsiveContainer>
          </GlassCard>
        </motion.div>

        {/* Progress Trends */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}>
          <GlassCard style={{ padding: '24px' }}>
            <div style={{ marginBottom: '20px' }}>
              <div style={{ color: 'white', fontWeight: 600, fontSize: '15px' }}>Quarterly Progress Trend</div>
              <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: '12px', marginTop: '2px' }}>Average progress score by quarter</div>
            </div>
            <ResponsiveContainer width="100%" height={260}>
              <LineChart data={progressByQuarter}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                <XAxis dataKey="quarter" tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 12 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 12 }} axisLine={false} tickLine={false} />
                <Tooltip content={<CustomTooltip />} />
                <defs>
                  <linearGradient id="lineGrad" x1="0" y1="0" x2="1" y2="0">
                    <stop offset="0%" stopColor="#667eea" />
                    <stop offset="100%" stopColor="#10b981" />
                  </linearGradient>
                </defs>
                <Line type="monotone" dataKey="progress" name="Progress %" stroke="url(#lineGrad)"
                  strokeWidth={3} dot={{ fill: '#667eea', r: 5, strokeWidth: 2, stroke: '#0d0d14' }}
                  activeDot={{ r: 7, fill: '#a78bfa' }} />
              </LineChart>
            </ResponsiveContainer>
          </GlassCard>
        </motion.div>
      </div>

      {/* ── UoM DISTRIBUTION + MANAGER EFFECTIVENESS ── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(420px,1fr))', gap: '20px', marginBottom: '20px' }}>

        {/* UoM Distribution */}
        {uomData.length > 0 && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.28 }}>
            <GlassCard style={{ padding: '24px' }}>
              <div style={{ marginBottom: '20px' }}>
                <div style={{ color: 'white', fontWeight: 600, fontSize: '15px' }}>Goals by UoM Type</div>
                <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: '12px', marginTop: '2px' }}>Measurement type distribution</div>
              </div>
              <ResponsiveContainer width="100%" height={260}>
                <BarChart data={uomData} barSize={36}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                  <XAxis dataKey="name" tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 12 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 12 }} axisLine={false} tickLine={false} />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar dataKey="value" name="Goals" radius={[6,6,0,0]} fill="url(#uomGrad)" />
                  <defs>
                    <linearGradient id="uomGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#06b6d4" />
                      <stop offset="100%" stopColor="#3b82f6" />
                    </linearGradient>
                  </defs>
                </BarChart>
              </ResponsiveContainer>
            </GlassCard>
          </motion.div>
        )}

        {/* Manager Effectiveness */}
        {managerEffectiveness.length > 0 && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.32 }}>
            <GlassCard style={{ padding: '24px' }}>
              <div style={{ marginBottom: '20px' }}>
                <div style={{ color: 'white', fontWeight: 600, fontSize: '15px' }}>Manager Effectiveness</div>
                <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: '12px', marginTop: '2px' }}>Check-in completion rate by manager — {selectedQuarter}</div>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                {managerEffectiveness.map((mgr, i) => (
                  <motion.div key={i} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.35 + i * 0.06 }}
                    style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                    <div style={{ width: '36px', height: '36px', borderRadius: '50%', flexShrink: 0,
                      background: `linear-gradient(135deg,${COLORS[i % COLORS.length]},${COLORS[(i+2) % COLORS.length]})`,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      color: 'white', fontWeight: 700, fontSize: '13px' }}>
                      {mgr.name.charAt(0)}
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px' }}>
                        <span style={{ color: 'white', fontWeight: 600, fontSize: '13px' }}>{mgr.name}</span>
                        <span style={{ color: mgr.completion >= 80 ? '#10b981' : mgr.completion >= 50 ? '#f59e0b' : '#ef4444',
                          fontSize: '13px', fontWeight: 700 }}>{mgr.completion}%</span>
                      </div>
                      <div style={{ height: '6px', background: 'rgba(255,255,255,0.08)', borderRadius: '3px', overflow: 'hidden' }}>
                        <motion.div initial={{ width: 0 }} animate={{ width: `${mgr.completion}%` }}
                          transition={{ delay: 0.4 + i * 0.06, duration: 0.8, ease: [0.16,1,0.3,1] }}
                          style={{ height: '100%', borderRadius: '3px',
                            background: mgr.completion >= 80 ? 'linear-gradient(90deg,#10b981,#059669)'
                              : mgr.completion >= 50 ? 'linear-gradient(90deg,#f59e0b,#d97706)'
                              : 'linear-gradient(90deg,#ef4444,#dc2626)' }} />
                      </div>
                      <div style={{ color: 'rgba(255,255,255,0.3)', fontSize: '11px', marginTop: '3px' }}>
                        {mgr.completed}/{mgr.total} check-ins completed
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </GlassCard>
          </motion.div>
        )}
      </div>

      {/* ── TEAM PERFORMANCE ── */}
      {completionRatesData.length > 0 && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
          <GlassCard style={{ padding: '24px' }}>
            <div style={{ marginBottom: '20px' }}>
              <div style={{ color: 'white', fontWeight: 600, fontSize: '15px' }}>Team Performance</div>
              <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: '12px', marginTop: '2px' }}>Individual completion rates — {selectedQuarter}</div>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(280px,1fr))', gap: '12px' }}>
              {completionRatesData.map((emp, i) => (
                <motion.div key={i} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.35 + i * 0.05 }}
                  style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '14px 16px',
                    background: 'rgba(255,255,255,0.03)', borderRadius: '12px',
                    border: '1px solid rgba(255,255,255,0.06)' }}>
                  <div style={{ width: '38px', height: '38px', borderRadius: '50%', flexShrink: 0,
                    background: `linear-gradient(135deg,${COLORS[i % COLORS.length]},${COLORS[(i+1) % COLORS.length]})`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    color: 'white', fontWeight: 700, fontSize: '14px' }}>
                    {emp.name.charAt(0)}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ color: 'white', fontWeight: 600, fontSize: '13px', marginBottom: '6px' }}>{emp.name}</div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <div style={{ flex: 1, height: '6px', background: 'rgba(255,255,255,0.08)', borderRadius: '3px', overflow: 'hidden' }}>
                        <motion.div initial={{ width: 0 }} animate={{ width: `${emp.completion}%` }}
                          transition={{ delay: 0.4 + i * 0.05, duration: 0.8, ease: [0.16,1,0.3,1] }}
                          style={{ height: '100%', borderRadius: '3px',
                            background: `linear-gradient(90deg,${COLORS[i % COLORS.length]},${COLORS[(i+1) % COLORS.length]})` }} />
                      </div>
                      <span style={{ color: 'rgba(255,255,255,0.6)', fontSize: '12px', fontWeight: 600, minWidth: '36px' }}>
                        {emp.completion}%
                      </span>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </GlassCard>
        </motion.div>
      )}
    </div>
  );
};

export default AnalyticsDashboard;
