import React, { useState } from 'react';
import { Card, List, Tag, Button, Space, Empty, Segmented } from 'antd';
import { BellOutlined, CheckOutlined, DeleteOutlined } from '@ant-design/icons';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { notificationAPI } from '../services/api';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';

dayjs.extend(relativeTime);

const NotificationsPage = () => {
  const [filter, setFilter] = useState('all');
  const queryClient = useQueryClient();

  // Fetch notifications
  const { data: notificationsData, isLoading } = useQuery({
    queryKey: ['notifications', filter === 'unread'],
    queryFn: () => notificationAPI.getNotifications(filter === 'unread'),
  });

  const notifications = notificationsData?.data || [];

  // Mark as read mutation
  const markAsReadMutation = useMutation({
    mutationFn: (id) => notificationAPI.markAsRead(id),
    onSuccess: () => {
      queryClient.invalidateQueries(['notifications']);
      queryClient.invalidateQueries(['unreadCount']);
    },
  });

  // Mark all as read mutation
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

  const getNotificationColor = (type) => {
    const colors = {
      'goal_submitted': 'blue',
      'goal_approved': 'success',
      'goal_rejected': 'error',
      'shared_goal_assigned': 'purple',
      'check_in_due': 'warning',
    };
    return colors[type] || 'default';
  };

  const unreadCount = notifications.filter(n => !n.is_read).length;

  return (
    <div>
      {/* Summary Cards */}
      <div className="summary-cards-row">
        <div className="metric-card">
          <div className="metric-card-icon blue"><span>🔔</span></div>
          <div className="stat-number">{notifications.length}</div>
          <div className="stat-label">Total Notifications</div>
          <div className="stat-trend neutral">All time</div>
        </div>
        <div className="metric-card">
          <div className="metric-card-icon red"><span>📬</span></div>
          <div className="stat-number">{unreadCount}</div>
          <div className="stat-label">Unread</div>
          <div className={`stat-trend ${unreadCount > 0 ? 'down' : 'up'}`}>
            {unreadCount > 0 ? 'Needs attention' : 'All read!'}
          </div>
        </div>
        <div className="metric-card">
          <div className="metric-card-icon green"><span>✅</span></div>
          <div className="stat-number">{notifications.filter(n => n.is_read).length}</div>
          <div className="stat-label">Read</div>
          <div className="stat-trend up">Completed</div>
        </div>
        <div className="metric-card">
          <div className="metric-card-icon orange"><span>🎯</span></div>
          <div className="stat-number">{notifications.filter(n => n.type === 'goal_approved').length}</div>
          <div className="stat-label">Goal Updates</div>
          <div className="stat-trend neutral">Approvals & rejections</div>
        </div>
      </div>

      {/* Main Card */}
      <div className="card-modern">
        <div className="card-modern-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <h2 className="card-modern-title">🔔 Notifications</h2>
            {unreadCount > 0 && (
              <span className="badge-custom">{unreadCount}</span>
            )}
          </div>
          <Space>
            <Segmented
              value={filter}
              onChange={setFilter}
              options={[
                { label: 'All', value: 'all' },
                { label: 'Unread', value: 'unread' },
              ]}
            />
            <Button
              icon={<CheckOutlined />}
              onClick={() => markAllAsReadMutation.mutate()}
              loading={markAllAsReadMutation.isPending}
              style={{ borderRadius: 8, fontWeight: 600 }}
            >
              Mark All Read
            </Button>
          </Space>
        </div>
        <div className="card-modern-body">
          {notifications.length === 0 ? (
            <div className="empty-state">
              <div className="empty-state-icon">🔔</div>
              <div className="empty-state-title">
                {filter === 'unread' ? 'No unread notifications' : 'No notifications yet'}
              </div>
              <div className="empty-state-description">
                You'll see goal updates, approvals, and reminders here
              </div>
            </div>
          ) : (
            <List
              itemLayout="horizontal"
              dataSource={notifications}
              loading={isLoading}
              renderItem={(item) => (
                <List.Item
                  style={{
                    background: item.is_read ? '#fafafa' : '#eff6ff',
                    padding: '16px 20px',
                    borderRadius: 10,
                    marginBottom: 10,
                    border: item.is_read ? '1px solid #f0f0f0' : '1px solid #bfdbfe',
                    transition: 'all 0.2s ease',
                  }}
                  actions={[
                    !item.is_read && (
                      <Button
                        type="text"
                        size="small"
                        icon={<CheckOutlined />}
                        onClick={() => markAsReadMutation.mutate(item.id)}
                        style={{ color: '#667eea', fontWeight: 600 }}
                      >
                        Mark Read
                      </Button>
                    ),
                  ]}
                >
                  <List.Item.Meta
                    avatar={
                      <div style={{
                        width: 48, height: 48, borderRadius: '50%',
                        background: item.is_read ? '#f3f4f6' : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: 22,
                      }}>
                        {getNotificationIcon(item.type)}
                      </div>
                    }
                    title={
                      <Space>
                        <span style={{ fontWeight: item.is_read ? 500 : 700, color: '#1f2937' }}>
                          {item.title}
                        </span>
                        <span className="status-badge info" style={{ fontSize: 11 }}>
                          {item.type.replace(/_/g, ' ')}
                        </span>
                      </Space>
                    }
                    description={
                      <div>
                        <div style={{ marginBottom: 6, color: '#4b5563' }}>{item.message}</div>
                        <div style={{ fontSize: 12, color: '#9ca3af' }}>
                          🕐 {dayjs(item.created_at).fromNow()}
                        </div>
                      </div>
                    }
                  />
                </List.Item>
              )}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default NotificationsPage;
