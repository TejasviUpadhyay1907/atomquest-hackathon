import React, { useState } from 'react';
import { Layout, Badge, Dropdown, Avatar } from 'antd';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  CheckSquareOutlined, TeamOutlined, BarChartOutlined,
  BellOutlined, UserOutlined, LogoutOutlined,
  AuditOutlined, ShareAltOutlined, FileTextOutlined,
  DashboardOutlined, MenuFoldOutlined, MenuUnfoldOutlined,
  HomeOutlined,
} from '@ant-design/icons';
import { useAuth } from '../contexts/AuthContext';
import { useQuery } from '@tanstack/react-query';
import { notificationAPI } from '../services/api';

const { Content } = Layout;

/* ── nav item ── */
const NavItem = ({ icon, label, path, active, collapsed, onClick, badge }) => (
  <motion.div
    onClick={onClick}
    whileHover={{ x: 4 }}
    whileTap={{ scale: 0.97 }}
    style={{
      display: 'flex', alignItems: 'center', gap: '12px',
      padding: collapsed ? '12px 0' : '11px 16px',
      justifyContent: collapsed ? 'center' : 'flex-start',
      borderRadius: '10px', cursor: 'pointer', marginBottom: '4px',
      background: active ? 'rgba(102,126,234,0.18)' : 'transparent',
      border: active ? '1px solid rgba(102,126,234,0.3)' : '1px solid transparent',
      color: active ? '#a78bfa' : 'rgba(255,255,255,0.6)',
      transition: 'all 0.2s ease', position: 'relative',
    }}
    onMouseEnter={e => { if (!active) e.currentTarget.style.background = 'rgba(255,255,255,0.06)'; }}
    onMouseLeave={e => { if (!active) e.currentTarget.style.background = 'transparent'; }}
  >
    {active && (
      <motion.div layoutId="activeIndicator"
        style={{ position: 'absolute', left: 0, top: '20%', bottom: '20%', width: '3px',
          background: 'linear-gradient(180deg,#667eea,#a78bfa)', borderRadius: '0 3px 3px 0' }}
      />
    )}
    <span style={{ fontSize: '16px', minWidth: '20px', textAlign: 'center' }}>{icon}</span>
    {!collapsed && (
      <span style={{ fontSize: '13.5px', fontWeight: active ? 600 : 400, flex: 1, whiteSpace: 'nowrap' }}>
        {label}
      </span>
    )}
    {!collapsed && badge > 0 && (
      <span style={{ background: '#ef4444', color: 'white', fontSize: '10px', fontWeight: 700,
        padding: '1px 6px', borderRadius: '10px', minWidth: '18px', textAlign: 'center' }}>
        {badge}
      </span>
    )}
  </motion.div>
);

/* ── section label ── */
const SectionLabel = ({ label, collapsed }) => !collapsed ? (
  <div style={{ color: 'rgba(255,255,255,0.25)', fontSize: '10px', fontWeight: 700,
    letterSpacing: '1.2px', padding: '16px 16px 6px', textTransform: 'uppercase' }}>
    {label}
  </div>
) : <div style={{ height: '16px' }} />;

const DashboardLayout = ({ children }) => {
  const [collapsed, setCollapsed] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const { data: unreadData } = useQuery({
    queryKey: ['unreadCount'],
    queryFn: () => notificationAPI.getUnreadCount(),
    refetchInterval: 30000,
  });
  const unreadCount = unreadData?.data?.unread_count || 0;

  const isActive = (path) => location.pathname === path;
  const sidebarW = collapsed ? 72 : 220;
  const getInitials = (name) => name ? name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) : 'U';

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#0d0d14', fontFamily: 'Inter, sans-serif' }}>

      {/* ── SIDEBAR ── */}
      <motion.div
        animate={{ width: sidebarW }}
        transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
        style={{
          width: sidebarW, minHeight: '100vh', position: 'fixed', left: 0, top: 0, bottom: 0,
          background: 'rgba(13,13,20,0.95)', backdropFilter: 'blur(20px)',
          borderRight: '1px solid rgba(255,255,255,0.06)',
          display: 'flex', flexDirection: 'column', zIndex: 100, overflow: 'hidden',
        }}
      >
        {/* Logo — click to go home */}
        <div onClick={() => navigate('/home')} style={{ height: '64px', display: 'flex', alignItems: 'center',
          justifyContent: collapsed ? 'center' : 'flex-start',
          padding: collapsed ? '0' : '0 20px', cursor: 'pointer',
          borderBottom: '1px solid rgba(255,255,255,0.06)', flexShrink: 0 }}>
          <motion.div whileHover={{ scale: 1.05 }}
            style={{ width: '34px', height: '34px', borderRadius: '10px', flexShrink: 0,
              background: 'linear-gradient(135deg,#667eea,#764ba2)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '18px', boxShadow: '0 4px 12px rgba(102,126,234,0.4)' }}>
            🎯
          </motion.div>
          <AnimatePresence>
            {!collapsed && (
              <motion.span initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }} transition={{ duration: 0.2 }}
                style={{ marginLeft: '12px', color: 'white', fontWeight: 700, fontSize: '16px',
                  background: 'linear-gradient(135deg,#a78bfa,#667eea)',
                  WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                AtomQuest
              </motion.span>
            )}
          </AnimatePresence>
        </div>

        {/* Nav */}
        <div style={{ flex: 1, overflowY: 'auto', overflowX: 'hidden', padding: '8px 10px' }}>

          <SectionLabel label="Workspace" collapsed={collapsed} />
          <NavItem icon={<HomeOutlined />} label="Home" path="/home"
            active={isActive('/home')} collapsed={collapsed}
            onClick={() => navigate('/home')} />
          <NavItem icon={<CheckSquareOutlined />} label="My Goals" path="/employee/goals"
            active={isActive('/employee/goals')} collapsed={collapsed}
            onClick={() => navigate('/employee/goals')} />
          <NavItem icon={<FileTextOutlined />} label="Check-ins" path="/employee/checkins"
            active={isActive('/employee/checkins')} collapsed={collapsed}
            onClick={() => navigate('/employee/checkins')} />

          {(user?.role === 'Manager' || user?.role === 'Admin') && (
            <>
              <SectionLabel label="Management" collapsed={collapsed} />
              <NavItem icon={<TeamOutlined />} label="Approvals" path="/manager/approvals"
                active={isActive('/manager/approvals')} collapsed={collapsed}
                onClick={() => navigate('/manager/approvals')} />
              <NavItem icon={<DashboardOutlined />} label="Team Check-ins" path="/manager/team-checkins"
                active={isActive('/manager/team-checkins')} collapsed={collapsed}
                onClick={() => navigate('/manager/team-checkins')} />
            </>
          )}

          {user?.role === 'Admin' && (
            <>
              <SectionLabel label="Admin" collapsed={collapsed} />
              <NavItem icon={<DashboardOutlined />} label="All Goals" path="/admin/goals"
                active={isActive('/admin/goals')} collapsed={collapsed}
                onClick={() => navigate('/admin/goals')} />
              <NavItem icon={<ShareAltOutlined />} label="Shared Goals" path="/admin/shared-goals"
                active={isActive('/admin/shared-goals')} collapsed={collapsed}
                onClick={() => navigate('/admin/shared-goals')} />
              <NavItem icon={<AuditOutlined />} label="Audit Logs" path="/admin/audit-logs"
                active={isActive('/admin/audit-logs')} collapsed={collapsed}
                onClick={() => navigate('/admin/audit-logs')} />
            </>
          )}

          <SectionLabel label="Insights" collapsed={collapsed} />
          <NavItem icon={<BarChartOutlined />} label="Analytics" path="/analytics"
            active={isActive('/analytics')} collapsed={collapsed}
            onClick={() => navigate('/analytics')} />
          <NavItem icon={<BellOutlined />} label="Notifications" path="/notifications"
            active={isActive('/notifications')} collapsed={collapsed}
            onClick={() => navigate('/notifications')} badge={unreadCount} />
        </div>

        {/* User profile at bottom — click to open account panel */}
        <div style={{ padding: '10px', borderTop: '1px solid rgba(255,255,255,0.06)', flexShrink: 0 }}>
          <motion.div
            whileHover={{ background: 'rgba(255,255,255,0.07)' }}
            onClick={() => setProfileOpen(true)}
            style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '10px',
              borderRadius: '10px', cursor: 'pointer', transition: 'background 0.2s',
              justifyContent: collapsed ? 'center' : 'flex-start' }}>
            <div style={{ width: '34px', height: '34px', borderRadius: '50%', flexShrink: 0,
              background: 'linear-gradient(135deg,#667eea,#a78bfa)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: 'white', fontWeight: 700, fontSize: '13px',
              boxShadow: '0 2px 8px rgba(102,126,234,0.3)' }}>
              {getInitials(user?.full_name)}
            </div>
            <AnimatePresence>
              {!collapsed && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                  style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ color: 'white', fontSize: '13px', fontWeight: 600, lineHeight: 1.3,
                    overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {user?.full_name}
                  </div>
                  <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: '11px' }}>{user?.role}</div>
                </motion.div>
              )}
            </AnimatePresence>
            {!collapsed && (
              <div style={{ color: 'rgba(255,255,255,0.25)', fontSize: '12px', flexShrink: 0 }}>⋯</div>
            )}
          </motion.div>
        </div>
      </motion.div>

      {/* ── MAIN AREA ── */}
      <motion.div
        animate={{ marginLeft: sidebarW }}
        transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
        style={{ flex: 1, display: 'flex', flexDirection: 'column', minHeight: '100vh' }}
      >
        {/* Top Header */}
        <div style={{
          height: '64px', position: 'sticky', top: 0, zIndex: 50,
          background: 'rgba(13,13,20,0.9)', backdropFilter: 'blur(20px)',
          borderBottom: '1px solid rgba(255,255,255,0.06)',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '0 28px',
        }}>
          {/* Left: collapse + breadcrumb */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <motion.button
              whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}
              onClick={() => setCollapsed(!collapsed)}
              style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: '8px', width: '36px', height: '36px', cursor: 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: 'rgba(255,255,255,0.7)', fontSize: '16px' }}>
              {collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
            </motion.button>
            <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: '13px' }}>
              <span style={{ color: 'rgba(255,255,255,0.2)' }}>AtomQuest</span>
              <span style={{ margin: '0 6px', color: 'rgba(255,255,255,0.15)' }}>/</span>
              <span style={{ color: 'rgba(255,255,255,0.7)', fontWeight: 500 }}>
                {location.pathname.split('/').filter(Boolean).map(s => s.charAt(0).toUpperCase() + s.slice(1)).join(' › ')}
              </span>
            </div>
          </div>

          {/* Right: nothing — clean */}
          <div />
        </div>

        {/* Page Content */}
        <div style={{ flex: 1, padding: '28px', overflowY: 'auto' }}>
          <motion.div
            key={location.pathname}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
          >
            {children}
          </motion.div>
        </div>
      </motion.div>

      <style>{`
        * { box-sizing: border-box; }
        ::-webkit-scrollbar { width: 4px; height: 4px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.1); border-radius: 2px; }
        .ant-dropdown-menu { background: rgba(13,13,20,0.97) !important; border: 1px solid rgba(255,255,255,0.1) !important; border-radius: 12px !important; backdrop-filter: blur(20px) !important; }
        .ant-dropdown-menu-item { color: rgba(255,255,255,0.8) !important; }
        .ant-dropdown-menu-item:hover { background: rgba(255,255,255,0.08) !important; }
        .ant-dropdown-menu-item-danger { color: #f87171 !important; }
      `}</style>

      {/* ── ACCOUNT PANEL ── */}
      <AnimatePresence>
        {profileOpen && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setProfileOpen(false)}
              style={{ position: 'fixed', inset: 0, zIndex: 200 }} />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 8 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 8 }}
              transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
              style={{
                position: 'fixed', bottom: '76px', left: '12px',
                width: collapsed ? '220px' : '240px', zIndex: 201,
                background: 'rgba(18,18,28,0.98)', backdropFilter: 'blur(24px)',
                border: '1px solid rgba(255,255,255,0.1)', borderRadius: '14px',
                fontFamily: 'Inter, sans-serif',
                boxShadow: '0 16px 40px rgba(0,0,0,0.6)',
                overflow: 'hidden',
              }}
            >
              {/* User info */}
              <div style={{ padding: '16px', borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div style={{ width: '40px', height: '40px', borderRadius: '50%', flexShrink: 0,
                    background: 'linear-gradient(135deg,#667eea,#a78bfa)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    color: 'white', fontWeight: 700, fontSize: '15px' }}>
                    {getInitials(user?.full_name)}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ color: 'white', fontWeight: 600, fontSize: '14px',
                      overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {user?.full_name}
                    </div>
                    <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: '12px',
                      overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {user?.email}
                    </div>
                  </div>
                </div>
                <div style={{ marginTop: '10px', display: 'flex', gap: '6px' }}>
                  <span style={{ padding: '2px 8px', borderRadius: '6px', fontSize: '11px', fontWeight: 600,
                    background: 'rgba(102,126,234,0.2)', color: '#a78bfa' }}>
                    {user?.role}
                  </span>
                  {user?.department && (
                    <span style={{ padding: '2px 8px', borderRadius: '6px', fontSize: '11px', fontWeight: 500,
                      background: 'rgba(255,255,255,0.06)', color: 'rgba(255,255,255,0.5)' }}>
                      {user?.department}
                    </span>
                  )}
                </div>
              </div>

              {/* Sign out */}
              <div style={{ padding: '8px' }}>
                <motion.div whileHover={{ background: 'rgba(239,68,68,0.1)' }}
                  onClick={() => { logout(); navigate('/login'); }}
                  style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '10px 12px',
                    borderRadius: '8px', cursor: 'pointer', transition: 'background 0.15s' }}>
                  <LogoutOutlined style={{ color: '#f87171', fontSize: '14px' }} />
                  <span style={{ color: '#f87171', fontSize: '13px', fontWeight: 600 }}>Sign out</span>
                </motion.div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};

export default DashboardLayout;
