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

  return (
    <div>
      <Card
        title={
          <Space>
            <BellOutlined />
            <span>Notifications</span>
            <Tag color="blue">{notifications.length}</Tag>
          </Space>
        }
        extra={
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
            >
              Mark All Read
            </Button>
          </Space>
        }
      >
        {notifications.length === 0 ? (
          <Empty
            description={filter === 'unread' ? 'No unread notifications' : 'No notifications'}
            image={Empty.PRESENTED_IMAGE_SIMPLE}
          />
        ) : (
          <List
            itemLayout="horizontal"
            dataSource={notifications}
            loading={isLoading}
            renderItem={(item) => (
              <List.Item
                style={{
                  background: item.is_read ? '#fff' : '#e6f7ff',
                  padding: '16px',
                  borderRadius: '8px',
                  marginBottom: '8px',
                  border: item.is_read ? '1px solid #f0f0f0' : '1px solid #91d5ff',
                }}
                actions={[
                  !item.is_read && (
                    <Button
                      type="text"
                      size="small"
                      icon={<CheckOutlined />}
                      onClick={() => markAsReadMutation.mutate(item.id)}
                    >
                      Mark Read
                    </Button>
                  ),
                ]}
              >
                <List.Item.Meta
                  avatar={
                    <div style={{ fontSize: 32 }}>
                      {getNotificationIcon(item.type)}
                    </div>
                  }
                  title={
                    <Space>
                      <span style={{ fontWeight: item.is_read ? 'normal' : 'bold' }}>
                        {item.title}
                      </span>
                      <Tag color={getNotificationColor(item.type)} size="small">
                        {item.type.replace(/_/g, ' ')}
                      </Tag>
                    </Space>
                  }
                  description={
                    <div>
                      <div style={{ marginBottom: 8 }}>{item.message}</div>
                      <div style={{ fontSize: 12, color: '#999' }}>
                        {dayjs(item.created_at).fromNow()}
                      </div>
                    </div>
                  }
                />
              </List.Item>
            )}
          />
        )}
      </Card>
    </div>
  );
};

export default NotificationsPage;
