import React, { useState } from 'react';
import { Table, Button, Select, Input, Space, message, Modal, Tag } from 'antd';
import { UnlockOutlined, SearchOutlined, CheckOutlined } from '@ant-design/icons';
import { motion } from 'framer-motion';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { adminAPI } from '../../services/api';

const { Option } = Select;

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

const statusBadge = (status) => {
  const map = {
    'Draft':            { bg: 'rgba(255,255,255,0.06)', color: 'rgba(255,255,255,0.5)' },
    'Pending Approval': { bg: 'rgba(245,158,11,0.12)',  color: '#fcd34d' },
    'Approved':         { bg: 'rgba(16,185,129,0.12)',  color: '#6ee7b7' },
    'Rejected':         { bg: 'rgba(239,68,68,0.12)',   color: '#fca5a5' },
  };
  const s = map[status] || map['Draft'];
  return <span style={{ padding: '3px 10px', borderRadius: '20px', fontSize: '12px', fontWeight: 600, background: s.bg, color: s.color }}>{status}</span>;
};

const AdminGoals = () => {
  const [searchText, setSearchText] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [departmentFilter, setDepartmentFilter] = useState('all');
  const queryClient = useQueryClient();

  const { data: goalsData, isLoading } = useQuery({ queryKey: ['allGoals'], queryFn: () => adminAPI.getAllGoals() });
  const { data: usersData } = useQuery({ queryKey: ['allUsers'], queryFn: () => adminAPI.getAllUsers() });

  const goals = goalsData?.data || [];
  const users = usersData?.data || [];

  const unlockMutation = useMutation({
    mutationFn: (id) => adminAPI.unlockGoal(id),
    onSuccess: () => { message.success('Goal unlocked!'); queryClient.invalidateQueries(['allGoals']); },
    onError: (err) => message.error(err.response?.data?.detail || 'Failed to unlock goal'),
  });

  const approveMutation = useMutation({
    mutationFn: (id) => adminAPI.approveGoal(id),
    onSuccess: () => { message.success('Goal approved!'); queryClient.invalidateQueries(['allGoals']); },
    onError: (err) => message.error(err.response?.data?.detail || 'Failed to approve goal'),
  });

  const handleUnlock = (goal) => {
    Modal.confirm({
      title: 'Unlock Goal?',
      content: `Are you sure you want to unlock "${goal.title}"? The employee will be able to edit it again.`,
      onOk: () => unlockMutation.mutate(goal.id),
    });
  };

  const handleAdminApprove = (goal) => {
    Modal.confirm({
      title: 'Approve Goal?',
      content: `Approve "${goal.title}" directly as Admin? This is used for manager-level goals that need skip-level approval.`,
      onOk: () => approveMutation.mutate(goal.id),
    });
  };

  const departments = [...new Set(users.map(u => u.department).filter(Boolean))];

  const filteredGoals = goals.filter(goal => {
    const matchesSearch = goal.title.toLowerCase().includes(searchText.toLowerCase()) ||
                         goal.description?.toLowerCase().includes(searchText.toLowerCase());
    const matchesStatus = statusFilter === 'all' || goal.status === statusFilter;
    const user = users.find(u => u.id === goal.user_id);
    const matchesDepartment = departmentFilter === 'all' || user?.department === departmentFilter;
    return matchesSearch && matchesStatus && matchesDepartment;
  });

  const stats = {
    total: goals.length,
    pending: goals.filter(g => g.status === 'Pending Approval').length,
    approved: goals.filter(g => g.status === 'Approved').length,
    locked: goals.filter(g => g.is_locked).length,
    shared: goals.filter(g => g.is_shared).length,
  };

  const columns = [
    { title: 'Employee', dataIndex: 'user_id', key: 'employee', width: 150,
      render: (userId) => { const user = users.find(u => u.id === userId); return <span style={{ color: 'white', fontWeight: 500 }}>{user?.full_name || 'Unknown'}</span>; } },
    { title: 'Department', dataIndex: 'user_id', key: 'department', width: 130,
      render: (userId) => { const user = users.find(u => u.id === userId); return <span style={{ color: 'rgba(255,255,255,0.5)' }}>{user?.department || '-'}</span>; } },
    { title: 'Title', dataIndex: 'title', key: 'title', width: 250,
      render: (v) => <span style={{ color: 'rgba(255,255,255,0.85)' }}>{v}</span> },
    { title: 'UoM', dataIndex: 'uom_type', key: 'uom_type', width: 100,
      render: (v) => <span style={{ color: 'rgba(255,255,255,0.5)' }}>{v}</span> },
    { title: 'Target', dataIndex: 'target', key: 'target', width: 100,
      render: (v) => <span style={{ color: 'rgba(255,255,255,0.6)' }}>{v}</span> },
    { title: 'Weightage', dataIndex: 'weightage', key: 'weightage', width: 100,
      render: (v) => <span style={{ color: '#a78bfa', fontWeight: 600 }}>{v}%</span> },
    { title: 'Status', dataIndex: 'status', key: 'status', width: 150, render: (status) => statusBadge(status) },
    { title: 'Locked', dataIndex: 'is_locked', key: 'is_locked', width: 90,
      render: (locked) => locked
        ? <span style={{ padding:'3px 10px', borderRadius:'20px', fontSize:'12px', fontWeight:600, background:'rgba(245,158,11,0.12)', color:'#fcd34d' }}>🔒 Locked</span>
        : <span style={{ padding:'3px 10px', borderRadius:'20px', fontSize:'12px', fontWeight:600, background:'rgba(255,255,255,0.06)', color:'rgba(255,255,255,0.4)' }}>Unlocked</span> },
    { title: 'Shared', dataIndex: 'is_shared', key: 'is_shared', width: 80,
      render: (shared) => shared ? <span style={{ padding:'3px 10px', borderRadius:'20px', fontSize:'12px', fontWeight:600, background:'rgba(59,130,246,0.12)', color:'#93c5fd' }}>Shared</span> : null },
    { title: 'Actions', key: 'actions', width: 200, fixed: 'right',
      render: (_, record) => (
        <Space size={8} wrap>
          {(record.status === 'Pending Approval' || record.status === 'Draft') && (
            <button type="button" onClick={() => handleAdminApprove(record)}
              style={{ display:'flex', alignItems:'center', gap:'6px', padding:'6px 12px',
                background:'rgba(16,185,129,0.12)', border:'1px solid rgba(16,185,129,0.35)',
                borderRadius:'8px', color:'#6ee7b7', fontWeight:600, cursor:'pointer', fontSize:'13px' }}>
              <CheckOutlined /> Approve
            </button>
          )}
          {record.is_locked && (
            <button type="button" onClick={() => handleUnlock(record)}
              style={{ display:'flex', alignItems:'center', gap:'6px', padding:'6px 12px',
                background:'rgba(245,158,11,0.1)', border:'1px solid rgba(245,158,11,0.3)',
                borderRadius:'8px', color:'#fcd34d', fontWeight:600, cursor:'pointer', fontSize:'13px' }}>
              <UnlockOutlined /> Unlock
            </button>
          )}
        </Space>
      ) },
  ];

  return (
    <div style={{ fontFamily: 'Inter, sans-serif' }}>
      <motion.div initial={{ opacity:0, y:-12 }} animate={{ opacity:1, y:0 }} transition={{ duration:0.5 }} style={{ marginBottom:'24px' }}>
        <h1 style={{ color:'white', fontSize:'1.6rem', fontWeight:700, margin:'0 0 4px' }}>All Goals</h1>
        <p style={{ color:'rgba(255,255,255,0.4)', fontSize:'14px', margin:0 }}>System-wide goal overview and management</p>
      </motion.div>

      <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(160px,1fr))', gap:'16px', marginBottom:'24px' }}>
        <KpiCard icon="🎯" label="Total Goals" value={stats.total} sub="All employees" gradient="linear-gradient(135deg,#667eea,#764ba2)" delay={0} />
        <KpiCard icon="✅" label="Approved" value={stats.approved} sub="Active goals" gradient="linear-gradient(135deg,#10b981,#059669)" delay={0.08} />
        <KpiCard icon="⏳" label="Pending" value={stats.pending} sub="Awaiting approval" gradient="linear-gradient(135deg,#f59e0b,#d97706)" delay={0.16} />
        <KpiCard icon="🔒" label="Locked" value={stats.locked} sub={`${stats.shared} shared`} gradient="linear-gradient(135deg,#ef4444,#dc2626)" delay={0.24} />
      </div>

      <motion.div initial={{ opacity:0, y:20 }} animate={{ opacity:1, y:0 }} transition={{ delay:0.3, duration:0.5 }}
        style={{ background:'rgba(255,255,255,0.04)', border:'1px solid rgba(255,255,255,0.08)', borderRadius:'16px' }}>
        <div style={{ padding:'20px 24px', borderBottom:'1px solid rgba(255,255,255,0.06)',
          display:'flex', alignItems:'center', justifyContent:'space-between', flexWrap:'wrap', gap:'12px' }}>
          <h2 style={{ color:'white', fontSize:'1.1rem', fontWeight:700, margin:0 }}>🎯 All Goals</h2>
          <Space wrap>
            <Input prefix={<SearchOutlined style={{ color:'rgba(255,255,255,0.3)' }} />}
              placeholder="Search goals..." allowClear style={{ width:220, borderRadius:'8px' }}
              onChange={(e) => setSearchText(e.target.value)} />
            <Select value={statusFilter} onChange={setStatusFilter} style={{ width:150 }}>
              <Option value="all">All Status</Option>
              <Option value="Draft">Draft</Option>
              <Option value="Pending Approval">Pending</Option>
              <Option value="Approved">Approved</Option>
              <Option value="Rejected">Rejected</Option>
            </Select>
            <Select value={departmentFilter} onChange={setDepartmentFilter} style={{ width:160 }}>
              <Option value="all">All Departments</Option>
              {departments.map(dept => <Option key={dept} value={dept}>{dept}</Option>)}
            </Select>
          </Space>
        </div>
        <Table columns={columns} dataSource={filteredGoals} rowKey="id" loading={isLoading}
          scroll={{ x:1400 }} pagination={{ pageSize:20, showSizeChanger:true,
            showTotal:(total) => <span style={{ color:'rgba(255,255,255,0.4)' }}>Total {total} goals</span> }} />
      </motion.div>

      <style>{`
        .ant-table { background: transparent !important; }
        .ant-table-thead > tr > th { background: rgba(255,255,255,0.04) !important; color: rgba(255,255,255,0.45) !important; font-size: 11px !important; font-weight: 700 !important; letter-spacing: 0.8px !important; text-transform: uppercase !important; border-bottom: 1px solid rgba(255,255,255,0.06) !important; }
        .ant-table-tbody > tr > td { background: transparent !important; border-bottom: 1px solid rgba(255,255,255,0.04) !important; padding: 13px 16px !important; }
        .ant-table-tbody > tr:hover > td { background: rgba(255,255,255,0.03) !important; }
        .ant-pagination-item a { color: rgba(255,255,255,0.5) !important; }
        .ant-pagination-item-active { background: rgba(102,126,234,0.2) !important; border-color: rgba(102,126,234,0.4) !important; }
        .ant-pagination-item-active a { color: #a78bfa !important; }
        .ant-pagination-prev button, .ant-pagination-next button { color: rgba(255,255,255,0.4) !important; }
        .ant-pagination { padding: 16px 24px !important; }
        .ant-modal-content { background: rgba(13,13,20,0.98) !important; border: 1px solid rgba(255,255,255,0.1) !important; border-radius: 18px !important; }
        .ant-modal-header { background: transparent !important; border-bottom: 1px solid rgba(255,255,255,0.06) !important; }
        .ant-modal-title { color: white !important; }
        .ant-modal-close { color: rgba(255,255,255,0.4) !important; }
        .ant-modal-confirm-title { color: white !important; }
        .ant-modal-confirm-content { color: rgba(255,255,255,0.6) !important; }
        .ant-input, .ant-input-affix-wrapper { background: rgba(255,255,255,0.05) !important; border: 1px solid rgba(255,255,255,0.1) !important; border-radius: 8px !important; color: white !important; }
        .ant-input::placeholder { color: rgba(255,255,255,0.3) !important; }
        .ant-input-affix-wrapper .ant-input { background: transparent !important; border: none !important; }
        .ant-select-selector { background: rgba(255,255,255,0.05) !important; border: 1px solid rgba(255,255,255,0.1) !important; border-radius: 8px !important; color: white !important; }
        .ant-select-selection-placeholder { color: rgba(255,255,255,0.3) !important; }
        .ant-select-selection-item { color: white !important; }
        .ant-select-arrow { color: rgba(255,255,255,0.4) !important; }
        .ant-select-dropdown { background: rgba(8,8,8,0.97) !important; border: 1px solid rgba(255,255,255,0.1) !important; border-radius: 12px !important; }
        .ant-select-item-option { color: rgba(255,255,255,0.8) !important; }
        .ant-select-item-option:hover { background: rgba(99,102,241,0.15) !important; }
        .ant-select-item-option-selected { background: rgba(99,102,241,0.25) !important; color: white !important; }
        .ant-spin-dot-item { background: #a78bfa !important; }
        .ant-input-clear-icon { color: rgba(255,255,255,0.3) !important; }
        .ant-table-wrapper .ant-spin-nested-loading, .ant-table-wrapper .ant-spin-container { background: transparent !important; }
      `}</style>
    </div>
  );
};

export default AdminGoals;
