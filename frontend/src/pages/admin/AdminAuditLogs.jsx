import React, { useState } from 'react';
import { Table, Select, DatePicker, Button, Space } from 'antd';
import { DownloadOutlined, ReloadOutlined } from '@ant-design/icons';
import { motion } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import { reportAPI, adminAPI } from '../../services/api';
import dayjs from 'dayjs';

const { RangePicker } = DatePicker;
const { Option } = Select;

/* ── KPI card ── */
const KpiCard = ({ icon, label, value, sub, gradient, delay = 0 }) => (
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
    <div style={{ color: 'white', fontSize: '1.9rem', fontWeight: 700, lineHeight: 1, marginBottom: '5px' }}>{value}</div>
    <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: '13px' }}>{label}</div>
    {sub && <div style={{ color: 'rgba(255,255,255,0.3)', fontSize: '11px', marginTop: '3px' }}>{sub}</div>}
  </motion.div>
);

const actionBadge = (action) => {
  let bg, color;
  if (action?.includes('Approved'))      { bg = 'rgba(16,185,129,0.12)';  color = '#6ee7b7'; }
  else if (action?.includes('Rejected')) { bg = 'rgba(239,68,68,0.12)';   color = '#fca5a5'; }
  else if (action?.includes('Unlocked')) { bg = 'rgba(245,158,11,0.12)';  color = '#fcd34d'; }
  else if (action?.includes('Created'))  { bg = 'rgba(102,126,234,0.12)'; color = '#a78bfa'; }
  else if (action?.includes('Updated'))  { bg = 'rgba(6,182,212,0.12)';   color = '#67e8f9'; }
  else                                   { bg = 'rgba(255,255,255,0.06)'; color = 'rgba(255,255,255,0.5)'; }
  return (
    <span style={{ padding: '3px 10px', borderRadius: '20px', fontSize: '12px',
      fontWeight: 600, background: bg, color, whiteSpace: 'nowrap' }}>
      {action}
    </span>
  );
};

const AdminAuditLogs = () => {
  const [dateRange, setDateRange] = useState(null);
  const [userFilter, setUserFilter] = useState(null);
  const [goalFilter, setGoalFilter] = useState(null);

  const { data: logsData, isLoading, refetch } = useQuery({
    queryKey: ['auditLogs', userFilter, goalFilter],
    queryFn: () => reportAPI.getAuditLogs({ user_id: userFilter, goal_id: goalFilter, limit: 200 }),
  });
  const { data: usersData } = useQuery({ queryKey: ['allUsers'], queryFn: adminAPI.getAllUsers });
  const { data: goalsData } = useQuery({ queryKey: ['allGoals'], queryFn: adminAPI.getAllGoals });

  const logs = logsData?.data || [];
  const users = usersData?.data || [];
  const goals = goalsData?.data || [];

  const filteredLogs = dateRange
    ? logs.filter(log => {
        const d = dayjs(log.timestamp);
        return d.isAfter(dateRange[0]) && d.isBefore(dateRange[1]);
      })
    : logs;

  const approvals  = filteredLogs.filter(l => l.action?.includes('Approved')).length;
  const rejections = filteredLogs.filter(l => l.action?.includes('Rejected')).length;
  const unlocks    = filteredLogs.filter(l => l.action?.includes('Unlocked')).length;

  const handleExport = () => {
    const headers = ['Timestamp', 'User', 'Goal', 'Action', 'Field', 'Old Value', 'New Value'];
    const rows = filteredLogs.map(log => {
      const user = users.find(u => u.id === log.user_id);
      const goal = goals.find(g => g.id === log.goal_id);
      return [
        dayjs(log.timestamp).format('YYYY-MM-DD HH:mm:ss'),
        user?.full_name || 'Unknown',
        goal?.title || `Goal #${log.goal_id}`,
        log.action, log.field_changed || '', log.old_value || '', log.new_value || '',
      ];
    });
    const csv = [headers, ...rows].map(r => r.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `audit_logs_${dayjs().format('YYYY-MM-DD')}.csv`;
    a.click();
  };

  const columns = [
    {
      title: 'Timestamp', dataIndex: 'timestamp', key: 'timestamp', width: 170,
      sorter: (a, b) => dayjs(a.timestamp).unix() - dayjs(b.timestamp).unix(),
      defaultSortOrder: 'descend',
      render: (ts) => (
        <span style={{ color: 'rgba(255,255,255,0.55)', fontSize: '12px', fontFamily: 'monospace' }}>
          {dayjs(ts).format('YYYY-MM-DD HH:mm:ss')}
        </span>
      ),
    },
    {
      title: 'User', dataIndex: 'user_id', key: 'user', width: 150,
      render: (userId) => {
        const user = users.find(u => u.id === userId);
        return (
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div style={{ width: '26px', height: '26px', borderRadius: '50%', flexShrink: 0,
              background: 'linear-gradient(135deg,#667eea,#a78bfa)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: 'white', fontWeight: 700, fontSize: '10px' }}>
              {user?.full_name?.charAt(0) || '?'}
            </div>
            <span style={{ color: 'rgba(255,255,255,0.8)', fontSize: '13px' }}>{user?.full_name || 'Unknown'}</span>
          </div>
        );
      },
    },
    {
      title: 'Goal', dataIndex: 'goal_id', key: 'goal', width: 200, ellipsis: true,
      render: (goalId) => {
        const goal = goals.find(g => g.id === goalId);
        return <span style={{ color: 'rgba(255,255,255,0.65)', fontSize: '13px' }}>{goal?.title || `Goal #${goalId}`}</span>;
      },
    },
    {
      title: 'Action', dataIndex: 'action', key: 'action', width: 180,
      render: (action) => actionBadge(action),
    },
    {
      title: 'Field', dataIndex: 'field_changed', key: 'field_changed', width: 110,
      render: (v) => <span style={{ color: 'rgba(255,255,255,0.4)', fontSize: '12px' }}>{v || '—'}</span>,
    },
    {
      title: 'Old Value', dataIndex: 'old_value', key: 'old_value', width: 130, ellipsis: true,
      render: (v) => <span style={{ color: '#fca5a5', fontSize: '12px' }}>{v || '—'}</span>,
    },
    {
      title: 'New Value', dataIndex: 'new_value', key: 'new_value', width: 130, ellipsis: true,
      render: (v) => <span style={{ color: '#6ee7b7', fontSize: '12px' }}>{v || '—'}</span>,
    },
  ];

  return (
    <div style={{ color: 'white', fontFamily: 'Inter, sans-serif' }}>

      {/* Page header */}
      <motion.div initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}
        style={{ marginBottom: '24px' }}>
        <h1 style={{ color: 'white', fontSize: '1.6rem', fontWeight: 700, margin: '0 0 4px' }}>Audit Logs</h1>
        <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '14px', margin: 0 }}>
          Complete history of every action taken in the system.
        </p>
      </motion.div>

      {/* KPI cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(160px,1fr))', gap: '14px', marginBottom: '24px' }}>
        <KpiCard icon="📋" label="Total Logs" value={filteredLogs.length} sub="All audit entries" gradient="linear-gradient(135deg,#667eea,#764ba2)" delay={0} />
        <KpiCard icon="✅" label="Approvals" value={approvals} sub="Goals approved" gradient="linear-gradient(135deg,#10b981,#059669)" delay={0.07} />
        <KpiCard icon="❌" label="Rejections" value={rejections} sub="Goals rejected" gradient="linear-gradient(135deg,#ef4444,#dc2626)" delay={0.14} />
        <KpiCard icon="🔓" label="Unlocks" value={unlocks} sub="Admin unlocks" gradient="linear-gradient(135deg,#f59e0b,#d97706)" delay={0.21} />
      </div>

      {/* Table card */}
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
        style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '16px' }}>

        {/* Filters bar */}
        <div style={{ padding: '16px 20px', borderBottom: '1px solid rgba(255,255,255,0.06)',
          display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap',
          justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', alignItems: 'center' }}>
            <RangePicker value={dateRange} onChange={setDateRange} format="YYYY-MM-DD"
              style={{ background: 'rgba(255,255,255,0.05)', borderColor: 'rgba(255,255,255,0.1)', borderRadius: '8px' }} />
            <Select placeholder="Filter by user" allowClear value={userFilter} onChange={setUserFilter}
              style={{ width: 180 }} showSearch
              filterOption={(input, option) => option.children?.toLowerCase().includes(input.toLowerCase())}
              dropdownStyle={{ background: 'rgba(8,8,8,0.97)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px' }}>
              {users.map(u => <Option key={u.id} value={u.id}>{u.full_name}</Option>)}
            </Select>
            <Select placeholder="Filter by goal" allowClear value={goalFilter} onChange={setGoalFilter}
              style={{ width: 200 }} showSearch
              filterOption={(input, option) => option.children?.toLowerCase().includes(input.toLowerCase())}
              dropdownStyle={{ background: 'rgba(8,8,8,0.97)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px' }}>
              {goals.map(g => <Option key={g.id} value={g.id}>{g.title}</Option>)}
            </Select>
          </div>
          <div style={{ display: 'flex', gap: '8px' }}>
            <motion.button whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
              onClick={() => refetch()}
              style={{ padding: '7px 14px', background: 'rgba(255,255,255,0.06)',
                border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px',
                color: 'rgba(255,255,255,0.7)', fontSize: '13px', cursor: 'pointer',
                display: 'flex', alignItems: 'center', gap: '6px' }}>
              <ReloadOutlined /> Refresh
            </motion.button>
            <motion.button whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
              onClick={handleExport}
              style={{ padding: '7px 14px', background: 'linear-gradient(135deg,#667eea,#764ba2)',
                border: 'none', borderRadius: '8px', color: 'white',
                fontSize: '13px', fontWeight: 600, cursor: 'pointer',
                display: 'flex', alignItems: 'center', gap: '6px' }}>
              <DownloadOutlined /> Export CSV
            </motion.button>
          </div>
        </div>

        {/* Table */}
        <Table
          columns={columns}
          dataSource={filteredLogs}
          rowKey="id"
          loading={isLoading}
          scroll={{ x: 1100 }}
          pagination={{
            pageSize: 50, showSizeChanger: true,
            showTotal: (total) => <span style={{ color: 'rgba(255,255,255,0.4)' }}>Total {total} logs</span>,
          }}
          locale={{ emptyText: (
            <div style={{ padding: '40px', textAlign: 'center' }}>
              <div style={{ fontSize: '32px', marginBottom: '10px' }}>📋</div>
              <div style={{ color: 'rgba(255,255,255,0.5)', fontWeight: 600 }}>No audit logs found</div>
              <div style={{ color: 'rgba(255,255,255,0.3)', fontSize: '13px', marginTop: '4px' }}>
                Actions will appear here as users interact with the system.
              </div>
            </div>
          )}}
        />
      </motion.div>

      <style>{`
        .ant-table { background: transparent !important; }
        .ant-table-thead > tr > th {
          background: rgba(255,255,255,0.04) !important;
          color: rgba(255,255,255,0.45) !important;
          font-size: 11px !important; font-weight: 700 !important;
          letter-spacing: 0.8px !important; text-transform: uppercase !important;
          border-bottom: 1px solid rgba(255,255,255,0.06) !important;
        }
        .ant-table-tbody > tr > td {
          background: transparent !important;
          border-bottom: 1px solid rgba(255,255,255,0.04) !important;
          padding: 13px 16px !important;
        }
        .ant-table-tbody > tr:hover > td { background: rgba(255,255,255,0.03) !important; }
        .ant-table-column-sorter { color: rgba(255,255,255,0.3) !important; }
        .ant-table-column-sorter-up.active, .ant-table-column-sorter-down.active { color: #a78bfa !important; }
        .ant-pagination-item a { color: rgba(255,255,255,0.5) !important; }
        .ant-pagination-item-active { background: rgba(102,126,234,0.2) !important; border-color: rgba(102,126,234,0.4) !important; }
        .ant-pagination-item-active a { color: #a78bfa !important; }
        .ant-pagination-prev button, .ant-pagination-next button { color: rgba(255,255,255,0.4) !important; }
        .ant-select-selector {
          background: rgba(255,255,255,0.05) !important;
          border: 1px solid rgba(255,255,255,0.1) !important;
          border-radius: 8px !important; color: white !important;
        }
        .ant-select-selection-placeholder { color: rgba(255,255,255,0.3) !important; }
        .ant-select-selection-item { color: white !important; }
        .ant-select-arrow { color: rgba(255,255,255,0.4) !important; }
        .ant-select-item-option { color: rgba(255,255,255,0.8) !important; }
        .ant-select-item-option:hover { background: rgba(99,102,241,0.15) !important; }
        .ant-select-item-option-selected { background: rgba(99,102,241,0.25) !important; color: white !important; }
        .ant-picker { background: rgba(255,255,255,0.05) !important; border-color: rgba(255,255,255,0.1) !important; border-radius: 8px !important; }
        .ant-picker input { color: white !important; }
        .ant-picker-suffix, .ant-picker-separator { color: rgba(255,255,255,0.3) !important; }
        .ant-picker-dropdown { background: rgba(8,8,8,0.97) !important; border: 1px solid rgba(255,255,255,0.1) !important; border-radius: 12px !important; }
        .ant-picker-panel-container { background: rgba(8,8,8,0.97) !important; }
        .ant-picker-header, .ant-picker-header button { color: rgba(255,255,255,0.7) !important; }
        .ant-picker-cell-in-view .ant-picker-cell-inner { color: white !important; }
        .ant-picker-cell .ant-picker-cell-inner { color: rgba(255,255,255,0.4) !important; }
        .ant-picker-cell-selected .ant-picker-cell-inner { background: #667eea !important; }
        .ant-spin-dot-item { background: #667eea !important; }
      `}</style>
    </div>
  );
};

export default AdminAuditLogs;
