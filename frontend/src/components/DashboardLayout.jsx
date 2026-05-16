import React, { useState } from 'react';
import { Layout, Menu, Avatar, Dropdown, Badge, Button, Typography } from 'antd';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  DashboardOutlined,
  CheckSquareOutlined,
  TeamOutlined,
  BarChartOutlined,
  BellOutlined,
  UserOutlined,
  LogoutOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  AuditOutlined,
  ShareAltOutlined,
  FileTextOutlined,
} from '@ant-design/icons';
import { useAuth } from '../contexts/AuthContext';
import { useQuery } from '@tanstack/react-query';
import { notificationAPI } from '../services/api';

const { Header, Sider, Content } = Layout;
const { Text } = Typography;

const DashboardLayout = ({ children }) => {
  const [collapsed, setCollapsed] = useState(false);
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // Fetch unread notification count
  const { data: unreadData } = useQuery({
    queryKey: ['unreadCount'],
    queryFn: () => notificationAPI.getUnreadCount(),
    refetchInterval: 30000, // Poll every 30 seconds
  });

  const unreadCount = unreadData?.data?.unread_count || 0;

  // Menu items based on role
  const getMenuItems = () => {
    const items = [];

    if (user?.role === 'Employee' || user?.role === 'Manager' || user?.role === 'Admin') {
      items.push({
        key: '/employee/goals',
        icon: <CheckSquareOutlined />,
        label: 'My Goals',
      });
      items.push({
        key: '/employee/checkins',
        icon: <FileTextOutlined />,
        label: 'Check-ins',
      });
    }

    if (user?.role === 'Manager' || user?.role === 'Admin') {
      items.push({
        key: 'manager',
        icon: <TeamOutlined />,
        label: 'Manager',
        children: [
          {
            key: '/manager/approvals',
            label: 'Pending Approvals',
          },
          {
            key: '/manager/team-checkins',
            label: 'Team Check-ins',
          },
        ],
      });
    }

    if (user?.role === 'Admin') {
      items.push({
        key: 'admin',
        icon: <DashboardOutlined />,
        label: 'Admin',
        children: [
          {
            key: '/admin/goals',
            label: 'All Goals',
          },
          {
            key: '/admin/shared-goals',
            label: 'Shared Goals',
          },
          {
            key: '/admin/audit-logs',
            label: 'Audit Logs',
          },
        ],
      });
    }

    items.push({
      key: '/analytics',
      icon: <BarChartOutlined />,
      label: 'Analytics',
    });

    return items;
  };

  const handleMenuClick = ({ key }) => {
    navigate(key);
  };

  const userMenuItems = [
    {
      key: 'profile',
      icon: <UserOutlined />,
      label: 'Profile',
    },
    {
      key: 'logout',
      icon: <LogoutOutlined />,
      label: 'Logout',
      danger: true,
    },
  ];

  const handleUserMenuClick = ({ key }) => {
    if (key === 'logout') {
      logout();
      navigate('/login');
    }
  };

  return (
    <Layout style={{ minHeight: '100vh', background: '#f5f7fa' }}>
      <Sider
        trigger={null}
        collapsible
        collapsed={collapsed}
        breakpoint="lg"
        onBreakpoint={(broken) => {
          if (broken) setCollapsed(true);
        }}
        style={{
          overflow: 'auto',
          height: '100vh',
          position: 'fixed',
          left: 0,
          top: 0,
          bottom: 0,
          background: 'linear-gradient(180deg, #001529 0%, #002140 100%)',
          boxShadow: '2px 0 8px rgba(0,0,0,0.15)',
        }}
      >
        <div style={{
          height: 64,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'white',
          fontSize: collapsed ? 18 : 22,
          fontWeight: '600',
          letterSpacing: '0.5px',
          borderBottom: '1px solid rgba(255,255,255,0.1)',
          background: 'rgba(255,255,255,0.05)',
        }}>
          {collapsed ? '🎯' : '🎯 AtomQuest'}
        </div>

        <Menu
          theme="dark"
          mode="inline"
          selectedKeys={[location.pathname]}
          items={getMenuItems()}
          onClick={handleMenuClick}
          style={{ 
            marginTop: 16,
            background: 'transparent',
            border: 'none',
          }}
        />
      </Sider>

      <Layout style={{ marginLeft: collapsed ? 80 : 200, transition: 'all 0.3s ease' }}>
        <Header
          style={{
            padding: '0 32px',
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
            position: 'sticky',
            top: 0,
            zIndex: 10,
            height: 64,
          }}
        >
          <Button
            type="text"
            icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
            onClick={() => setCollapsed(!collapsed)}
            style={{ 
              fontSize: 18,
              color: 'white',
              transition: 'all 0.3s',
            }}
          />

          <div style={{ display: 'flex', alignItems: 'center', gap: 24 }}>
            <Badge count={unreadCount} offset={[-5, 5]}>
              <Button
                type="text"
                icon={<BellOutlined style={{ fontSize: 22 }} />}
                onClick={() => navigate('/notifications')}
                style={{ 
                  color: 'white',
                  transition: 'all 0.3s',
                }}
              />
            </Badge>

            <Dropdown
              menu={{ items: userMenuItems, onClick: handleUserMenuClick }}
              placement="bottomRight"
            >
              <div style={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: 12, 
                cursor: 'pointer',
                padding: '8px 16px',
                borderRadius: '8px',
                background: 'rgba(255,255,255,0.1)',
                transition: 'all 0.3s',
              }}
              onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.2)'}
              onMouseLeave={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.1)'}
              >
                <div style={{ textAlign: 'right' }}>
                  <Text strong style={{ display: 'block', color: 'white', fontSize: 14 }}>{user?.full_name}</Text>
                  <Text style={{ fontSize: 12, color: 'rgba(255,255,255,0.8)' }}>{user?.role}</Text>
                </div>
                <Avatar 
                  icon={<UserOutlined />} 
                  style={{ 
                    backgroundColor: '#fff',
                    color: '#667eea',
                    border: '2px solid rgba(255,255,255,0.3)',
                  }} 
                />
              </div>
            </Dropdown>
          </div>
        </Header>

        <Content
          style={{
            margin: '24px',
            padding: 0,
            minHeight: 280,
            background: 'transparent',
          }}
        >
          <div style={{
            animation: 'fadeIn 0.5s ease-in',
          }}>
            {children}
          </div>
        </Content>
      </Layout>

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        
        .ant-menu-dark .ant-menu-item-selected {
          background: linear-gradient(90deg, rgba(102,126,234,0.3) 0%, rgba(118,75,162,0.3) 100%) !important;
          border-right: 3px solid #667eea;
        }
        
        .ant-menu-dark .ant-menu-item:hover {
          background: rgba(255,255,255,0.1) !important;
        }
      `}</style>
    </Layout>
  );
};

export default DashboardLayout;
