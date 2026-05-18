import React, { useState } from 'react';
import { List, Button } from 'antd';
import { CheckOutlined } from '@ant-design/icons';
import { motion } from 'framer-motion';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { notificationAPI } from '../services/api';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';

dayjs.extend(relativeTime);

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

const NotificationsPage = () => {
  const [filter, setFilter] = useState('all');
  const queryClient = useQueryClient();

  const { data: notificationsData, isLoading } = useQuery({
    queryKey: ['notifications', filter === 'unread'],
    queryFn: () => notificationAPI.getNotifications(filter === 'unread'),
  });

  const notifications = notificationsData?.data || [];

  const markAsReadMutation = useMutation({
    mutationFn: (id) => notificationAPI.markAsRead(id),
    onSuccess: () => {
      queryClient.invalidateQueries(['notifications']);
      queryClient.invalidateQueries(['unreadCount']);
    },
  });

  const markAllAsReadMutation = useMutation({
    mutationFn: () => notificationAPI.markAllAsRead(),
    onSuccess: () => {
      queryClient.invalidateQueries(['notifications']);
      queryClient.invalidateQueries(['unreadCount']);
    },
  });

  const getNotificationIcon = (type) => {
    const icons = {
      'goal_submitted': '📝',
      'goal_approved': '✅',
      'goal_rejected': '❌',
      'shared_goal_assigned': '🔗',
      'check_in_due': '⏰',
    };
    return icons[type] || '🔔';
  };

  const getTypeColor = (type) => {
    const map = {
      'goal_submitted':       { bg: 'rgba(59,130,246,0.12)',  color: '#93c5fd' },
      'goal_approved':        { bg: 'rgba(16,185,129,0.12)',  color: '#6ee7b7' },
      'goal_rejected':        { bg: 'rgba(239,68,68,0.12)',   color: '#fca5a5' },
      'shared_goal_assigned': { bg: 'rgba(167,139,250,0.12)', color: '#c4b5fd' },
      'check_in_due':         { bg: 'rgba(245,158,11,0.12)',  color: '#fcd34d' },
    };
    return map[type] || { bg: 'rgba(255,255,255,0.06)', color: 'rgba(255,255,255,0.5)' };
  };

  const unreadCount = notifications.filter(n => !n.is_read).length;
  const readCount = notifications.filter(n => n.is_read).length;
  const goalUpdateCount = notifications.filter(n => n.type === 'goal_approved' || n.type === 'goal_rejected').length;

  return (
    <div style={{ background: '#0d0d14', minHeight: '100vh', padding: '24px' }}>
      {/* Page Header */}
      <motion.div initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} style={{ marginBottom: '24px' }}>
        <h1 style={{ color: 'white', fontSize: '1.6rem', fontWeight: 700, margin: '0 0 4px' }}>Notifications</h1>
        <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '14px', margin: 0 }}>Goal updates, approvals, and reminders</p>
      </motion.div>

      {/* KPI Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px', marginBottom: '24px' }}>
        <KpiCard icon="🔔" label="Total Notifications" value={notifications.length} sub="All time"
          gradient="linear-gradient(135deg,#667eea,#764ba2)" delay={0} />
        <KpiCard icon="📬" label="Unread" value={unreadCount}
          sub={unreadCount > 0 ? 'Needs attention' : 'All read!'}
          gradient={unreadCount > 0 ? 'linear-gradient(135deg,#ef4444,#dc2626)' : 'linear-gradient(135deg,#10b981,#059669)'}
          delay={0.08} />
        <KpiCard icon="✅" label="Read" value={readCount} sub="Completed"
          gradient="linear-gradient(135deg,#10b981,#059669)" delay={0.16} />
        <KpiCard icon="🎯" label="Goal Updates" value={goalUpdateCount} sub="Approvals & rejections"
          gradient="linear-gradient(135deg,#f59e0b,#d97706)" delay={0.24} />
      </div>

      {/* Main Card */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3, duration: 0.5 }}
        style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '16px' }}>

        {/* Card Header */}
        <div style={{ padding: '20px 24px', borderBottom: '1px solid rgba(255,255,255,0.06)',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <h2 style={{ color: 'white', fontSize: '1.1rem', fontWeight: 700, margin: 0 }}>🔔 Notifications</h2>
            {unreadCount > 0 && (
              <span style={{ padding: '2px 8px', borderRadius: '20px', fontSize: '12px', fontWeight: 700,
                background: 'rgba(239,68,68,0.2)', color: '#fca5a5' }}>
                {unreadCount}
              </span>
            )}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            {/* Filter Toggle */}
            <div style={{ display: 'flex', background: 'rgba(255,255,255,0.06)', borderRadius: '8px', padding: '3px' }}>
              {['all', 'unread'].map(f => (
                <button key={f} onClick={() => setFilter(f)}
                  style={{ padding: '6px 14px', borderRadius: '6px', border: 'none', cursor: 'pointer',
                    fontWeight: 600, fontSize: '13px', transition: 'all 0.2s',
                    background: filter === f ? 'rgba(102,126,234,0.3)' : 'transparent',
                    color: filter === f ? '#a78bfa' : 'rgba(255,255,255,0.4)' }}>
                  {f === 'all' ? 'All' : 'Unread'}
                </button>
              ))}
            </div>
            <button
              onClick={() => markAllAsReadMutation.mutate()}
              disabled={markAllAsReadMutation.isPending}
              style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '8px 16px',
                background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.3)',
                borderRadius: '8px', color: '#6ee7b7', fontWeight: 600, cursor: 'pointer', fontSize: '13px' }}>
              <CheckOutlined /> Mark All Read
            </button>
          </div>
        </div>

        <div style={{ padding: '20px 24px' }}>
          {notifications.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '60px 20px' }}>
              <div style={{ fontSize: '48px', marginBottom: '16px' }}>🔔</div>
              <div style={{ color: 'white', fontSize: '18px', fontWeight: 600, marginBottom: '8px' }}>
                {filter === 'unread' ? 'No unread notifications' : 'No notifications yet'}
              </div>
              <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: '14px' }}>
                You'll see goal updates, approvals, and reminders here
              </div>
            </div>
          ) : (
            <List
              itemLayout="horizontal"
              dataSource={notifications}
              loading={isLoading}
              renderItem={(item) => {
                const typeStyle = getTypeColor(item.type);
                return (
                  <motion.div
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3 }}
                    style={{
                      display: 'flex', alignItems: 'flex-start', gap: '14px',
                      padding: '16px 18px', borderRadius: '12px', marginBottom: '10px',
                      background: item.is_read ? 'rgba(255,255,255,0.02)' : 'rgba(102,126,234,0.06)',
                      border: item.is_read ? '1px solid rgba(255,255,255,0.05)' : '1px solid rgba(102,126,234,0.15)',
                      transition: 'all 0.2s ease',
                    }}>
                    {/* Icon */}
                    <div style={{ width: '44px', height: '44px', borderRadius: '50%', flexShrink: 0,
                      background: item.is_read ? 'rgba(255,255,255,0.06)' : 'linear-gradient(135deg,#667eea,#764ba2)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px' }}>
                      {getNotificationIcon(item.type)}
                    </div>

                    {/* Content */}
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px', flexWrap: 'wrap' }}>
                        <span style={{ fontWeight: item.is_read ? 500 : 700, color: 'white', fontSize: '14px' }}>
                          {item.title}
                        </span>
                        <span style={{ padding: '2px 8px', borderRadius: '20px', fontSize: '11px', fontWeight: 600,
                          background: typeStyle.bg, color: typeStyle.color }}>
                          {item.type.replace(/_/g, ' ')}
                        </span>
                        {!item.is_read && (
                          <span style={{ width: '7px', height: '7px', borderRadius: '50%',
                            background: '#667eea', display: 'inline-block' }} />
                        )}
                      </div>
                      <div style={{ color: 'rgba(255,255,255,0.55)', fontSize: '13px', marginBottom: '6px', lineHeight: 1.5 }}>
                        {item.message}
                      </div>
                      <div style={{ color: 'rgba(255,255,255,0.3)', fontSize: '12px' }}>
                        🕐 {dayjs(item.created_at).fromNow()}
                      </div>
                    </div>

                    {/* Mark Read Button */}
                    {!item.is_read && (
                      <button
                        onClick={() => markAsReadMutation.mutate(item.id)}
                        style={{ flexShrink: 0, display: 'flex', alignItems: 'center', gap: '5px',
                          padding: '6px 12px', background: 'rgba(102,126,234,0.1)',
                          border: '1px solid rgba(102,126,234,0.3)', borderRadius: '8px',
                          color: '#a78bfa', fontWeight: 600, cursor: 'pointer', fontSize: '12px',
                          whiteSpace: 'nowrap' }}>
                        <CheckOutlined /> Mark Read
                      </button>
                    )}
                  </motion.div>
                );
              }}
            />
          )}
        </div>
      </motion.div>

      <style>{`
        .ant-spin-dot-item { background: #a78bfa !important; }
        .ant-list-item { border: none !important; padding: 0 !important; }
      `}</style>
    </div>
  );
};

export default NotificationsPage;
