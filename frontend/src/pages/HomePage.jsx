import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '../contexts/AuthContext';
import {
  goalAPI, checkinAPI, managerAPI, adminAPI,
  notificationAPI, reportAPI
} from '../services/api';

/* ─── helpers ─────────────────────────────────────────── */
const hour = new Date().getHours();
const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';

/* animated counter */
const Counter = ({ target, suffix = '' }) => {
  const [val, setVal] = useState(0);
  useEffect(() => {
    let c = 0; const steps = 50; const inc = target / steps; const ms = 1200 / steps;
    const id = setInterval(() => {
      c = Math.min(c + inc, target);
      setVal(Math.floor(c));
      if (c >= target) clearInterval(id);
    }, ms);
    return () => clearInterval(id);
  }, [target]);
  return <>{val}{suffix}</>;
};

/* KPI card */
const KpiCard = ({ icon, label, value, suffix = '', gradient, sub, delay = 0 }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
    transition={{ delay, duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
    whileHover={{ y: -4, transition: { duration: 0.2 } }}
    style={{
      background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)',
      borderRadius: '16px', padding: '22px',
    }}
  >
    <div style={{ width: '42px', height: '42px', borderRadius: '11px', background: gradient,
      display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px', marginBottom: '14px' }}>
      {icon}
    </div>
    <div style={{ color: 'white', fontSize: '1.9rem', fontWeight: 700, lineHeight: 1, marginBottom: '5px' }}>
      <Counter target={typeof value === 'number' ? value : 0} suffix={suffix} />
    </div>
    <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: '13px' }}>{label}</div>
    {sub && <div style={{ color: 'rgba(255,255,255,0.3)', fontSize: '11px', marginTop: '3px' }}>{sub}</div>}
  </motion.div>
);

/* contextual action card — only renders when there's something to act on */
const ActionCard = ({ icon, title, description, cta, urgency = 'normal', onClick, delay = 0 }) => {
  const urgencyConfig = {
    high:   { border: 'rgba(239,68,68,0.3)',   bg: 'rgba(239,68,68,0.06)',   dot: '#ef4444', label: 'Needs attention' },
    medium: { border: 'rgba(245,158,11,0.3)',  bg: 'rgba(245,158,11,0.06)',  dot: '#f59e0b', label: 'Action needed' },
    normal: { border: 'rgba(102,126,234,0.25)', bg: 'rgba(102,126,234,0.05)', dot: '#667eea', label: 'Pending' },
    good:   { border: 'rgba(16,185,129,0.3)',  bg: 'rgba(16,185,129,0.06)',  dot: '#10b981', label: 'Ready' },
  };
  const cfg = urgencyConfig[urgency];

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
      whileHover={{ y: -3, transition: { duration: 0.2 } }}
      onClick={onClick}
      style={{
        background: cfg.bg, border: `1px solid ${cfg.border}`,
        borderRadius: '14px', padding: '18px 20px', cursor: 'pointer',
        display: 'flex', alignItems: 'center', gap: '16px',
      }}
    >
      <div style={{ fontSize: '26px', flexShrink: 0 }}>{icon}</div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ color: 'white', fontWeight: 600, fontSize: '14px', marginBottom: '3px' }}>{title}</div>
        <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: '12px', lineHeight: 1.4 }}>{description}</div>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '6px', flexShrink: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
          <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: cfg.dot }} />
          <span style={{ color: cfg.dot, fontSize: '10px', fontWeight: 600 }}>{cfg.label}</span>
        </div>
        <div style={{ color: 'rgba(255,255,255,0.6)', fontSize: '12px', fontWeight: 600,
          background: 'rgba(255,255,255,0.08)', padding: '3px 10px', borderRadius: '20px' }}>
          {cta} →
        </div>
      </div>
    </motion.div>
  );
};

/* activity item */
const ActivityItem = ({ icon, text, time, delay = 0 }) => (
  <motion.div
    initial={{ opacity: 0, x: 12 }} animate={{ opacity: 1, x: 0 }}
    transition={{ delay, duration: 0.4 }}
    style={{ display: 'flex', alignItems: 'flex-start', gap: '12px',
      padding: '11px 0', borderBottom: '1px solid rgba(255,255,255,0.05)' }}
  >
    <div style={{ width: '32px', height: '32px', borderRadius: '50%', flexShrink: 0,
      background: 'rgba(102,126,234,0.12)', display: 'flex', alignItems: 'center',
      justifyContent: 'center', fontSize: '15px' }}>{icon}</div>
    <div style={{ flex: 1 }}>
      <div style={{ color: 'rgba(255,255,255,0.75)', fontSize: '13px', lineHeight: 1.4 }}>{text}</div>
      <div style={{ color: 'rgba(255,255,255,0.28)', fontSize: '11px', marginTop: '3px' }}>{time}</div>
    </div>
  </motion.div>
);

const GlassPanel = ({ children, style = {} }) => (
  <div style={{
    background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)',
    borderRadius: '16px', ...style
  }}>{children}</div>
);

const SectionLabel = ({ children }) => (
  <div style={{ color: 'rgba(255,255,255,0.35)', fontSize: '10px', fontWeight: 700,
    letterSpacing: '1.2px', textTransform: 'uppercase', marginBottom: '12px' }}>
    {children}
  </div>
);

/* ─── EMPLOYEE HOME ─────────────────────────────────────── */
const EmployeeHome = ({ navigate }) => {
  const { data: goalsData } = useQuery({ queryKey: ['myGoals'], queryFn: goalAPI.getMyGoals });
  const { data: validationData } = useQuery({ queryKey: ['validation'], queryFn: goalAPI.checkValidation });
  const { data: checkinsData } = useQuery({ queryKey: ['myCheckins', 'Q1'], queryFn: () => checkinAPI.getMyCheckins('Q1') });
  const { data: notifData } = useQuery({ queryKey: ['notifications', false], queryFn: () => notificationAPI.getNotifications(false) });

  const goals = goalsData?.data || [];
  const validation = validationData?.data || {};
  const checkins = checkinsData?.data || [];
  const notifications = (notifData?.data || []).slice(0, 5);

  const approved = goals.filter(g => g.status === 'Approved').length;
  const pending = goals.filter(g => g.status === 'Pending Approval').length;
  const rejected = goals.filter(g => g.status === 'Rejected').length;
  const draft = goals.filter(g => g.status === 'Draft').length;
  const pendingCheckins = goals.filter(g => g.status === 'Approved' && !checkins.some(c => c.goal_id === g.id)).length;
  const completionPct = goals.length > 0 ? Math.round((approved / goals.length) * 100) : 0;
  const weightage = validation.total_weightage || 0;
  const canSubmit = validation.can_submit;

  /* build contextual actions — only show what's relevant */
  const actions = [
    rejected > 0 && {
      icon: '❌', title: `${rejected} goal${rejected > 1 ? 's' : ''} returned for rework`,
      description: 'Your manager has sent back goals with feedback. Review and resubmit.',
      cta: 'Fix now', urgency: 'high', path: '/employee/goals',
    },
    pendingCheckins > 0 && {
      icon: '📋', title: `${pendingCheckins} check-in${pendingCheckins > 1 ? 's' : ''} pending for Q1`,
      description: 'You have approved goals without a Q1 check-in. Submit your progress.',
      cta: 'Submit', urgency: 'high', path: '/employee/checkins',
    },
    draft > 0 && weightage < 100 && {
      icon: '⚖️', title: `Weightage at ${weightage}% — ${100 - weightage}% remaining`,
      description: `Add ${100 - weightage}% more weightage across your goals to reach 100% and submit.`,
      cta: 'Complete', urgency: 'medium', path: '/employee/goals',
    },
    draft > 0 && canSubmit && {
      icon: '🚀', title: 'Goals ready to submit for approval',
      description: `You have ${draft} draft goal${draft > 1 ? 's' : ''} with 100% weightage. Submit for manager review.`,
      cta: 'Submit all', urgency: 'good', path: '/employee/goals',
    },
    pending > 0 && {
      icon: '⏳', title: `${pending} goal${pending > 1 ? 's' : ''} awaiting manager approval`,
      description: 'Your goals are under review. No action needed — check back soon.',
      cta: 'View status', urgency: 'normal', path: '/employee/goals',
    },
    goals.length === 0 && {
      icon: '🎯', title: 'No goals created yet',
      description: 'Start by creating your quarterly goals. You can add up to 8 goals with a total weightage of 100%.',
      cta: 'Create goal', urgency: 'medium', path: '/employee/goals',
    },
  ].filter(Boolean);

  return (
    <>
      {/* KPIs */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(160px,1fr))', gap: '14px', marginBottom: '28px' }}>
        <KpiCard icon="🎯" label="Total Goals" value={goals.length} sub={`${goals.length}/8 max`} gradient="linear-gradient(135deg,#667eea,#764ba2)" delay={0} />
        <KpiCard icon="✅" label="Approved" value={approved} gradient="linear-gradient(135deg,#10b981,#059669)" delay={0.06} />
        <KpiCard icon="⏳" label="Pending" value={pending} gradient="linear-gradient(135deg,#f59e0b,#d97706)" delay={0.12} />
        <KpiCard icon="📋" label="Check-ins Due" value={pendingCheckins} gradient="linear-gradient(135deg,#ef4444,#dc2626)" delay={0.18} />
        <KpiCard icon="📈" label="Completion" value={completionPct} suffix="%" gradient="linear-gradient(135deg,#06b6d4,#3b82f6)" delay={0.24} />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: '20px' }}>
        {/* Contextual Actions */}
        <div>
          <SectionLabel>What needs your attention</SectionLabel>
          {actions.length > 0
            ? actions.map((a, i) => (
                <div key={i} style={{ marginBottom: '10px' }}>
                  <ActionCard {...a} onClick={() => navigate(a.path)} delay={0.05 + i * 0.07} />
                </div>
              ))
            : (
              <GlassPanel style={{ padding: '32px', textAlign: 'center' }}>
                <div style={{ fontSize: '32px', marginBottom: '10px' }}>🎉</div>
                <div style={{ color: 'white', fontWeight: 600, marginBottom: '6px' }}>All caught up!</div>
                <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: '13px' }}>No pending actions right now.</div>
              </GlassPanel>
            )
          }
        </div>

        {/* Activity + Weightage */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {/* Weightage progress */}
          <GlassPanel style={{ padding: '20px' }}>
            <SectionLabel>Goal weightage</SectionLabel>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
              <span style={{ color: 'white', fontWeight: 700, fontSize: '1.6rem' }}>{weightage}%</span>
              <span style={{ color: weightage === 100 ? '#10b981' : 'rgba(255,255,255,0.4)', fontSize: '12px', fontWeight: 600 }}>
                {weightage === 100 ? '✅ Ready to submit' : `${100 - weightage}% remaining`}
              </span>
            </div>
            <div style={{ height: '8px', background: 'rgba(255,255,255,0.08)', borderRadius: '4px', overflow: 'hidden' }}>
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${weightage}%` }}
                transition={{ duration: 1, ease: [0.16, 1, 0.3, 1], delay: 0.3 }}
                style={{ height: '100%', borderRadius: '4px',
                  background: weightage === 100 ? 'linear-gradient(90deg,#10b981,#059669)' : 'linear-gradient(90deg,#667eea,#a78bfa)' }}
              />
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '8px' }}>
              <span style={{ color: 'rgba(255,255,255,0.3)', fontSize: '11px' }}>0%</span>
              <span style={{ color: 'rgba(255,255,255,0.3)', fontSize: '11px' }}>100%</span>
            </div>
          </GlassPanel>

          {/* Recent activity */}
          <GlassPanel style={{ padding: '20px', flex: 1 }}>
            <SectionLabel>Recent activity</SectionLabel>
            {notifications.length > 0
              ? notifications.map((n, i) => (
                  <ActivityItem key={n.id}
                    icon={n.type === 'goal_approved' ? '✅' : n.type === 'goal_rejected' ? '❌' : n.type === 'check_in_due' ? '⏰' : '🔔'}
                    text={n.message}
                    time={new Date(n.created_at).toLocaleDateString()}
                    delay={0.1 + i * 0.06}
                  />
                ))
              : <div style={{ color: 'rgba(255,255,255,0.3)', fontSize: '13px', textAlign: 'center', padding: '16px 0' }}>No recent activity</div>
            }
          </GlassPanel>
        </div>
      </div>
    </>
  );
};

/* ─── MANAGER HOME ─────────────────────────────────────── */
const ManagerHome = ({ navigate }) => {
  const { data: approvalsData } = useQuery({ queryKey: ['pendingApprovals'], queryFn: managerAPI.getPendingApprovals });
  const { data: teamCheckinsData } = useQuery({ queryKey: ['teamCheckins', 'Q1'], queryFn: () => checkinAPI.getTeamCheckins('Q1') });
  const { data: notifData } = useQuery({ queryKey: ['notifications', false], queryFn: () => notificationAPI.getNotifications(false) });

  const approvals = approvalsData?.data || [];
  const teamCheckins = teamCheckinsData?.data || [];
  const notifications = (notifData?.data || []).slice(0, 5);

  const grouped = approvals.reduce((acc, g) => {
    if (!acc[g.user_id]) acc[g.user_id] = { name: g.user?.full_name || 'Unknown', goals: [] };
    acc[g.user_id].goals.push(g);
    return acc;
  }, {});

  const readyToApprove = Object.values(grouped).filter(d => {
    const tw = d.goals.reduce((s, g) => s + g.weightage, 0);
    return tw === 100 && d.goals.length <= 8;
  }).length;
  const invalidWeightage = Object.values(grouped).filter(d => {
    const tw = d.goals.reduce((s, g) => s + g.weightage, 0);
    return tw !== 100;
  }).length;

  const teamMembers = [...new Set(teamCheckins.map(c => c.employee_id))].length;
  const completedCheckins = teamCheckins.filter(c => c.status === 'Completed').length;
  const missingCheckins = teamMembers - [...new Set(teamCheckins.filter(c => c.status !== 'Not Started').map(c => c.employee_id))].length;
  const completionPct = teamCheckins.length > 0 ? Math.round((completedCheckins / teamCheckins.length) * 100) : 0;

  const actions = [
    readyToApprove > 0 && {
      icon: '✅', title: `${readyToApprove} employee${readyToApprove > 1 ? 's' : ''} ready for approval`,
      description: 'Goals with valid 100% weightage are waiting for your approval.',
      cta: 'Approve now', urgency: 'good', path: '/manager/approvals',
    },
    approvals.length > 0 && readyToApprove < Object.keys(grouped).length && {
      icon: '⏳', title: `${approvals.length} goal${approvals.length > 1 ? 's' : ''} pending your review`,
      description: 'Review submitted goals, edit targets if needed, then approve or return for rework.',
      cta: 'Review', urgency: 'medium', path: '/manager/approvals',
    },
    invalidWeightage > 0 && {
      icon: '⚠️', title: `${invalidWeightage} employee${invalidWeightage > 1 ? 's' : ''} have invalid weightage`,
      description: 'These submissions cannot be approved until weightage totals 100%.',
      cta: 'View', urgency: 'high', path: '/manager/approvals',
    },
    missingCheckins > 0 && {
      icon: '📋', title: `${missingCheckins} team member${missingCheckins > 1 ? 's' : ''} missing Q1 check-ins`,
      description: 'Some employees have not submitted their quarterly progress update.',
      cta: 'View team', urgency: 'medium', path: '/manager/team-checkins',
    },
    approvals.length === 0 && {
      icon: '🎉', title: 'No pending approvals',
      description: 'Your team has no goals waiting for review right now.',
      cta: 'View team', urgency: 'normal', path: '/manager/team-checkins',
    },
  ].filter(Boolean);

  return (
    <>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(160px,1fr))', gap: '14px', marginBottom: '28px' }}>
        <KpiCard icon="⏳" label="Pending Approvals" value={approvals.length} gradient="linear-gradient(135deg,#f59e0b,#d97706)" delay={0} />
        <KpiCard icon="✅" label="Ready to Approve" value={readyToApprove} gradient="linear-gradient(135deg,#10b981,#059669)" delay={0.06} />
        <KpiCard icon="⚠️" label="Invalid Weightage" value={invalidWeightage} gradient="linear-gradient(135deg,#ef4444,#dc2626)" delay={0.12} />
        <KpiCard icon="👥" label="Team Members" value={teamMembers} gradient="linear-gradient(135deg,#667eea,#764ba2)" delay={0.18} />
        <KpiCard icon="📈" label="Team Completion" value={completionPct} suffix="%" gradient="linear-gradient(135deg,#06b6d4,#3b82f6)" delay={0.24} />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: '20px' }}>
        <div>
          <SectionLabel>What needs your attention</SectionLabel>
          {actions.map((a, i) => (
            <div key={i} style={{ marginBottom: '10px' }}>
              <ActionCard {...a} onClick={() => navigate(a.path)} delay={0.05 + i * 0.07} />
            </div>
          ))}
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {/* Team snapshot */}
          <GlassPanel style={{ padding: '20px' }}>
            <SectionLabel>Team snapshot</SectionLabel>
            {Object.values(grouped).slice(0, 5).map((emp, i) => {
              const tw = emp.goals.reduce((s, g) => s + g.weightage, 0);
              const valid = tw === 100 && emp.goals.length <= 8;
              return (
                <motion.div key={i} initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.1 + i * 0.06 }}
                  style={{ display: 'flex', alignItems: 'center', gap: '10px',
                    padding: '9px 0', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                  <div style={{ width: '30px', height: '30px', borderRadius: '50%', flexShrink: 0,
                    background: 'linear-gradient(135deg,#667eea,#a78bfa)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    color: 'white', fontWeight: 700, fontSize: '12px' }}>
                    {emp.name.charAt(0)}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ color: 'white', fontSize: '13px', fontWeight: 600 }}>{emp.name}</div>
                    <div style={{ color: 'rgba(255,255,255,0.35)', fontSize: '11px' }}>{emp.goals.length} goals · {tw}%</div>
                  </div>
                  <div style={{ width: '7px', height: '7px', borderRadius: '50%',
                    background: valid ? '#10b981' : '#f59e0b', flexShrink: 0 }} />
                </motion.div>
              );
            })}
            {Object.keys(grouped).length === 0 && (
              <div style={{ color: 'rgba(255,255,255,0.3)', fontSize: '13px', textAlign: 'center', padding: '16px 0' }}>
                No pending submissions
              </div>
            )}
          </GlassPanel>

          {/* Activity */}
          <GlassPanel style={{ padding: '20px', flex: 1 }}>
            <SectionLabel>Recent activity</SectionLabel>
            {notifications.length > 0
              ? notifications.map((n, i) => (
                  <ActivityItem key={n.id}
                    icon={n.type === 'goal_approved' ? '✅' : n.type === 'goal_rejected' ? '❌' : '🔔'}
                    text={n.message} time={new Date(n.created_at).toLocaleDateString()}
                    delay={0.1 + i * 0.06} />
                ))
              : <div style={{ color: 'rgba(255,255,255,0.3)', fontSize: '13px', textAlign: 'center', padding: '16px 0' }}>No recent activity</div>
            }
          </GlassPanel>
        </div>
      </div>
    </>
  );
};

/* ─── ADMIN HOME ─────────────────────────────────────── */
const AdminHome = ({ navigate }) => {
  const { data: goalsData } = useQuery({ queryKey: ['allGoals'], queryFn: adminAPI.getAllGoals });
  const { data: usersData } = useQuery({ queryKey: ['allUsers'], queryFn: adminAPI.getAllUsers });
  const { data: notifData } = useQuery({ queryKey: ['notifications', false], queryFn: () => notificationAPI.getNotifications(false) });
  const { data: statusData } = useQuery({ queryKey: ['statusOverview'], queryFn: reportAPI.getStatusOverview });
  const { data: escalationData } = useQuery({ queryKey: ['escalationStatus'], queryFn: () => adminAPI.getEscalationStatus('Q1') });
  const [sendingReminders, setSendingReminders] = useState(false);
  const [reminderResult, setReminderResult] = useState(null);

  const goals = goalsData?.data || [];
  const users = usersData?.data || [];
  const notifications = (notifData?.data || []).slice(0, 5);

  const totalGoals = goals.length;
  const activeEmployees = users.filter(u => u.role === 'Employee').length;
  const sharedGoals = goals.filter(g => g.is_shared && g.primary_owner_id).length;
  const pendingReviews = goals.filter(g => g.status === 'Pending Approval').length;
  const approvedGoals = goals.filter(g => g.status === 'Approved').length;
  const lockedGoals = goals.filter(g => g.is_locked).length;
  const rejectedGoals = goals.filter(g => g.status === 'Rejected').length;
  const draftGoals = goals.filter(g => g.status === 'Draft').length;

  const actions = [
    pendingReviews > 0 && {
      icon: '⏳', title: `${pendingReviews} goal${pendingReviews > 1 ? 's' : ''} pending manager approval`,
      description: 'Goals submitted by employees are awaiting manager review across the organization.',
      cta: 'View all goals', urgency: 'medium', path: '/admin/goals',
    },
    rejectedGoals > 0 && {
      icon: '❌', title: `${rejectedGoals} goal${rejectedGoals > 1 ? 's' : ''} rejected — awaiting rework`,
      description: 'Employees have goals returned for revision. Monitor if they need support.',
      cta: 'Review', urgency: 'normal', path: '/admin/goals',
    },
    lockedGoals > 0 && {
      icon: '🔒', title: `${lockedGoals} locked goal${lockedGoals > 1 ? 's' : ''} in the system`,
      description: 'Approved goals are locked. Use admin unlock if an employee needs to make corrections.',
      cta: 'Manage', urgency: 'normal', path: '/admin/goals',
    },
    sharedGoals > 0 && {
      icon: '🔗', title: `${sharedGoals} shared goal${sharedGoals > 1 ? 's' : ''} active`,
      description: 'Organization-wide shared goals are assigned and being tracked across departments.',
      cta: 'View', urgency: 'good', path: '/admin/shared-goals',
    },
    draftGoals > 0 && {
      icon: '📝', title: `${draftGoals} goal${draftGoals > 1 ? 's' : ''} still in draft`,
      description: 'Employees have unsaved or unsubmitted goals. They may need a reminder.',
      cta: 'View all', urgency: 'normal', path: '/admin/goals',
    },
  ].filter(Boolean);

  /* status breakdown for mini chart */
  const statusBreakdown = [
    { label: 'Approved', value: approvedGoals, color: '#10b981' },
    { label: 'Pending', value: pendingReviews, color: '#f59e0b' },
    { label: 'Draft', value: draftGoals, color: '#667eea' },
    { label: 'Rejected', value: rejectedGoals, color: '#ef4444' },
  ].filter(s => s.value > 0);

  return (
    <>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(160px,1fr))', gap: '14px', marginBottom: '28px' }}>
        <KpiCard icon="🎯" label="Total Goals" value={totalGoals} gradient="linear-gradient(135deg,#667eea,#764ba2)" delay={0} />
        <KpiCard icon="👥" label="Active Employees" value={activeEmployees} gradient="linear-gradient(135deg,#10b981,#059669)" delay={0.06} />
        <KpiCard icon="✅" label="Approved Goals" value={approvedGoals} gradient="linear-gradient(135deg,#10b981,#059669)" delay={0.12} />
        <KpiCard icon="⏳" label="Pending Reviews" value={pendingReviews} gradient="linear-gradient(135deg,#f59e0b,#d97706)" delay={0.18} />
        <KpiCard icon="🔗" label="Shared Goals" value={sharedGoals} gradient="linear-gradient(135deg,#06b6d4,#3b82f6)" delay={0.24} />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: '20px' }}>
        <div>
          <SectionLabel>Organization priorities</SectionLabel>
          {actions.length > 0
            ? actions.map((a, i) => (
                <div key={i} style={{ marginBottom: '10px' }}>
                  <ActionCard {...a} onClick={() => navigate(a.path)} delay={0.05 + i * 0.07} />
                </div>
              ))
            : (
              <GlassPanel style={{ padding: '32px', textAlign: 'center' }}>
                <div style={{ fontSize: '32px', marginBottom: '10px' }}>✅</div>
                <div style={{ color: 'white', fontWeight: 600, marginBottom: '6px' }}>System running smoothly</div>
                <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: '13px' }}>No critical actions required.</div>
              </GlassPanel>
            )
          }
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {/* Goal status breakdown */}
          <GlassPanel style={{ padding: '20px' }}>
            <SectionLabel>Goal status breakdown</SectionLabel>
            {statusBreakdown.map((s, i) => (
              <motion.div key={i} initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 + i * 0.06 }}
                style={{ marginBottom: '12px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px' }}>
                  <span style={{ color: 'rgba(255,255,255,0.65)', fontSize: '12px' }}>{s.label}</span>
                  <span style={{ color: 'white', fontSize: '12px', fontWeight: 600 }}>{s.value}</span>
                </div>
                <div style={{ height: '5px', background: 'rgba(255,255,255,0.07)', borderRadius: '3px', overflow: 'hidden' }}>
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: totalGoals > 0 ? `${(s.value / totalGoals) * 100}%` : '0%' }}
                    transition={{ duration: 0.8, delay: 0.2 + i * 0.06, ease: [0.16, 1, 0.3, 1] }}
                    style={{ height: '100%', borderRadius: '3px', background: s.color }}
                  />
                </div>
              </motion.div>
            ))}
          </GlassPanel>

          {/* Escalation Module */}
          <GlassPanel style={{ padding: '20px' }}>
            <SectionLabel>Escalation Module</SectionLabel>
            {escalationData?.data && (
              <div style={{ marginBottom: '14px' }}>
                <div style={{ display: 'flex', gap: '10px', marginBottom: '12px', flexWrap: 'wrap' }}>
                  <div style={{ flex: 1, background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)',
                    borderRadius: '10px', padding: '10px 14px', textAlign: 'center' }}>
                    <div style={{ color: '#fca5a5', fontSize: '1.4rem', fontWeight: 700 }}>
                      {escalationData.data.employees_missing_checkins || 0}
                    </div>
                    <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: '11px' }}>Missing check-ins</div>
                  </div>
                  <div style={{ flex: 1, background: 'rgba(245,158,11,0.08)', border: '1px solid rgba(245,158,11,0.2)',
                    borderRadius: '10px', padding: '10px 14px', textAlign: 'center' }}>
                    <div style={{ color: '#fcd34d', fontSize: '1.4rem', fontWeight: 700 }}>
                      {escalationData.data.pending_approvals || 0}
                    </div>
                    <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: '11px' }}>Pending approvals</div>
                  </div>
                </div>
              </div>
            )}
            {reminderResult && (
              <div style={{ background: 'rgba(16,185,129,0.08)', border: '1px solid rgba(16,185,129,0.2)',
                borderRadius: '8px', padding: '10px 12px', marginBottom: '12px' }}>
                <div style={{ color: '#6ee7b7', fontSize: '13px', fontWeight: 600 }}>
                  ✅ {reminderResult.emails_sent} reminder email{reminderResult.emails_sent !== 1 ? 's' : ''} sent
                </div>
              </div>
            )}
            <motion.button
              whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
              disabled={sendingReminders}
              onClick={async () => {
                setSendingReminders(true);
                try {
                  const res = await adminAPI.sendEscalationReminders('Q1');
                  setReminderResult(res.data);
                } catch (e) {
                  setReminderResult({ emails_sent: 0 });
                }
                setSendingReminders(false);
              }}
              style={{ width: '100%', padding: '11px', border: 'none', borderRadius: '10px', cursor: sendingReminders ? 'not-allowed' : 'pointer',
                background: sendingReminders ? 'rgba(255,255,255,0.06)' : 'linear-gradient(135deg,#667eea,#764ba2)',
                color: sendingReminders ? 'rgba(255,255,255,0.4)' : 'white', fontWeight: 600, fontSize: '13px',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
              {sendingReminders ? (
                <><span className="auth-spinner" style={{ width: '14px', height: '14px' }} /> Sending…</>
              ) : '📧 Send Escalation Reminders'}
            </motion.button>
            <div style={{ color: 'rgba(255,255,255,0.25)', fontSize: '11px', marginTop: '8px', textAlign: 'center' }}>
              Sends email reminders to employees missing check-ins and managers with pending approvals
            </div>
          </GlassPanel>

          {/* System activity */}
          <GlassPanel style={{ padding: '20px', flex: 1 }}>
            <SectionLabel>System activity</SectionLabel>
            {notifications.length > 0
              ? notifications.map((n, i) => (
                  <ActivityItem key={n.id}
                    icon={n.type === 'goal_approved' ? '✅' : n.type === 'goal_rejected' ? '❌' : n.type === 'shared_goal_assigned' ? '🔗' : '🔔'}
                    text={n.message} time={new Date(n.created_at).toLocaleDateString()}
                    delay={0.1 + i * 0.06} />
                ))
              : <div style={{ color: 'rgba(255,255,255,0.3)', fontSize: '13px', textAlign: 'center', padding: '16px 0' }}>No recent activity</div>
            }
          </GlassPanel>
        </div>
      </div>
    </>
  );
};

/* ─── MAIN PAGE ─────────────────────────────────────── */
const HomePage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const roleConfig = {
    Employee: { badge: 'Employee Workspace', sub: 'Track your goals, submit check-ins, and stay on top of your quarterly performance.' },
    Manager:  { badge: 'Manager Command Center', sub: 'Review team submissions, approve goals, and monitor your team\'s quarterly progress.' },
    Admin:    { badge: 'Admin Intelligence Hub', sub: 'Oversee organization-wide performance, manage shared goals, and review system activity.' },
  };
  const cfg = roleConfig[user?.role] || roleConfig.Employee;

  return (
    <div style={{ color: 'white', fontFamily: 'Inter, sans-serif' }}>

      {/* ── HERO ── */}
      <motion.div
        initial={{ opacity: 0, y: -16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.65, ease: [0.16, 1, 0.3, 1] }}
        style={{
          position: 'relative', borderRadius: '20px', padding: '36px 44px',
          marginBottom: '28px', overflow: 'hidden',
          background: 'linear-gradient(135deg,rgba(102,126,234,0.16) 0%,rgba(118,75,162,0.16) 50%,rgba(6,182,212,0.07) 100%)',
          border: '1px solid rgba(102,126,234,0.18)',
        }}
      >
        {/* ambient orbs */}
        <div style={{ position:'absolute', top:'-50px', right:'-30px', width:'200px', height:'200px', borderRadius:'50%', background:'radial-gradient(circle,rgba(102,126,234,0.22),transparent 70%)', filter:'blur(40px)', pointerEvents:'none' }} />
        <div style={{ position:'absolute', bottom:'-30px', left:'30%', width:'150px', height:'150px', borderRadius:'50%', background:'radial-gradient(circle,rgba(16,185,129,0.12),transparent 70%)', filter:'blur(30px)', pointerEvents:'none' }} />

        <div style={{ position: 'relative', zIndex: 1 }}>
          {/* role badge */}
          <motion.div initial={{ opacity:0, x:-12 }} animate={{ opacity:1, x:0 }} transition={{ delay:0.2 }}
            style={{ display:'inline-flex', alignItems:'center', gap:'6px', padding:'4px 12px',
              borderRadius:'20px', marginBottom:'14px', background:'rgba(102,126,234,0.18)',
              border:'1px solid rgba(102,126,234,0.28)', color:'#a78bfa', fontSize:'11px', fontWeight:600, letterSpacing:'0.5px' }}>
            <span style={{ width:'5px', height:'5px', borderRadius:'50%', background:'#a78bfa', display:'inline-block' }} />
            {cfg.badge}
          </motion.div>

          <motion.h1 initial={{ opacity:0, y:10 }} animate={{ opacity:1, y:0 }} transition={{ delay:0.3, duration:0.55 }}
            style={{ fontSize:'2rem', fontWeight:800, margin:'0 0 8px',
              background:'linear-gradient(135deg,#fff 0%,rgba(255,255,255,0.7) 100%)',
              WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent' }}>
            {greeting}, {user?.full_name?.split(' ')[0]} 👋
          </motion.h1>

          <motion.p initial={{ opacity:0, y:8 }} animate={{ opacity:1, y:0 }} transition={{ delay:0.4 }}
            style={{ color:'rgba(255,255,255,0.5)', fontSize:'14px', margin:'0 0 20px', maxWidth:'520px' }}>
            {cfg.sub}
          </motion.p>

          <motion.div initial={{ opacity:0, y:8 }} animate={{ opacity:1, y:0 }} transition={{ delay:0.5 }}
            style={{ display:'flex', gap:'24px', flexWrap:'wrap' }}>
            {[
              { label: 'Quarter', value: 'Q1 2024' },
              { label: 'Role', value: user?.role },
              { label: 'Department', value: user?.department || 'AtomQuest' },
            ].map((item, i) => (
              <div key={i} style={{ display:'flex', flexDirection:'column', gap:'2px' }}>
                <span style={{ color:'rgba(255,255,255,0.3)', fontSize:'10px', fontWeight:600, letterSpacing:'0.5px' }}>{item.label.toUpperCase()}</span>
                <span style={{ color:'rgba(255,255,255,0.8)', fontSize:'13px', fontWeight:600 }}>{item.value}</span>
              </div>
            ))}
          </motion.div>
        </div>
      </motion.div>

      {/* ── ROLE CONTENT ── */}
      <AnimatePresence mode="wait">
        <motion.div key={user?.role}
          initial={{ opacity:0, y:16 }} animate={{ opacity:1, y:0 }} exit={{ opacity:0, y:-16 }}
          transition={{ duration:0.45 }}>
          {user?.role === 'Admin'    && <AdminHome    navigate={navigate} />}
          {user?.role === 'Manager'  && <ManagerHome  navigate={navigate} />}
          {user?.role === 'Employee' && <EmployeeHome navigate={navigate} />}
        </motion.div>
      </AnimatePresence>
    </div>
  );
};

export default HomePage;
