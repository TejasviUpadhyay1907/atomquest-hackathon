import React, { useState } from 'react';
import { Card, Table, Tag, DatePicker, Select, Space, Button } from 'antd';
import { DownloadOutlined, ReloadOutlined } from '@ant-design/icons';
import { useQuery } from '@tanstack/react-query';
import { reportAPI, adminAPI } from '../../services/api';
import dayjs from 'dayjs';

const { RangePicker } = DatePicker;
const { Option } = Select;

const AdminAuditLogs = () => {
  const [dateRange, setDateRange] = useState(null);
  const [userFilter, setUserFilter] = useState(null);
  const [goalFilter, setGoalFilter] = useState(null);

  // Fetch audit logs
  const { data: logsData, isLoading, refetch } = useQuery({
    queryKey: ['auditLogs', userFilter, goalFilter],
    queryFn: () => reportAPI.getAuditLogs({
      user_id: userFilter,
      goal_id: goalFilter,
      limit: 200,
    }),
  });

  // Fetch users for filter
  const { data: usersData } = useQuery({
    queryKey: ['allUsers'],
    queryFn: () => adminAPI.getAllUsers(),
  });

  // Fetch goals for filter
  const { data: goalsData } = useQuery({
    queryKey: ['allGoals'],
    queryFn: () => adminAPI.getAllGoals(),
  });

  const logs = logsData?.data || [];
  const users = usersData?.data || [];
  const goals = goalsData?.data || [];

  // Filter by date range
  const filteredLogs = dateRange
    ? logs.filter(log => {
        const logDate = dayjs(log.timestamp);
        return logDate.isAfter(dateRange[0]) && logDate.isBefore(dateRange[1]);
      })
    : logs;

  const columns = [
    {
      title: 'Timestamp',
      dataIndex: 'timestamp',
      key: 'timestamp',
      width: 180,
      render: (timestamp) => dayjs(timestamp).format('YYYY-MM-DD HH:mm:ss'),
      sorter: (a, b) => dayjs(a.timestamp).unix() - dayjs(b.timestamp).unix(),
      defaultSortOrder: 'descend',
    },
    {
      title: 'User',
      dataIndex: 'user_id',
      key: 'user',
      width: 150,
      render: (userId) => {
        const user = users.find(u => u.id === userId);
        return user?.full_name || 'Unknown';
      },
    },
    {
      title: 'Goal',
      dataIndex: 'goal_id',
      key: 'goal',
      width: 200,
      render: (goalId) => {
        const goal = goals.find(g => g.id === goalId);
        return goal?.title || `Goal #${goalId}`;
      },
    },
    {
      title: 'Action',
      dataIndex: 'action',
      key: 'action',
      width: 200,
      render: (action) => {
        const colors = {
          'Approved goal': 'success',
          'Rejected goal': 'error',
          'Unlocked goal (Admin)': 'warning',
        };
        const color = Object.keys(colors).find(key => action.includes(key));
        return <Tag color={colors[color] || 'default'}>{action}</Tag>;
      },
    },
    {
      title: 'Field Changed',
      dataIndex: 'field_changed',
      key: 'field_changed',
      width: 120,
      render: (field) => field || '-',
    },
    {
      title: 'Old Value',
      dataIndex: 'old_value',
      key: 'old_value',
      width: 150,
      ellipsis: true,
      render: (val) => val || '-',
    },
    {
      title: 'New Value',
      dataIndex: 'new_value',
      key: 'new_value',
      width: 150,
      ellipsis: true,
      render: (val) => val || '-',
    },
  ];

  const handleExport = () => {
    // Convert to CSV
    const headers = ['Timestamp', 'User', 'Goal', 'Action', 'Field', 'Old Value', 'New Value'];
    const rows = filteredLogs.map(log => {
      const user = users.find(u => u.id === log.user_id);
      const goal = goals.find(g => g.id === log.goal_id);
      return [
        dayjs(log.timestamp).format('YYYY-MM-DD HH:mm:ss'),
        user?.full_name || 'Unknown',
        goal?.title || `Goal #${log.goal_id}`,
        log.action,
        log.field_changed || '',
        log.old_value || '',
        log.new_value || '',
      ];
    });

    const csv = [headers, ...rows].map(row => row.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `audit_logs_${dayjs().format('YYYY-MM-DD')}.csv`;
    a.click();
  };

  return (
    <div>
      {/* Metric Cards */}
      <div className="metrics-grid" style={{ marginBottom: 24 }}>
        <div className="metric-card">
          <div className="metric-icon" style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>
            📋
          </div>
          <div className="metric-content">
            <div className="metric-label">Total Logs</div>
            <div className="metric-value">{filteredLogs.length}</div>
            <div className="metric-trend neutral">All audit entries</div>
          </div>
        </div>

        <div className="metric-card">
          <div className="metric-icon" style={{ background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)' }}>
            ✅
          </div>
          <div className="metric-content">
            <div className="metric-label">Approvals</div>
            <div className="metric-value">{filteredLogs.filter(l => l.action.includes('Approved')).length}</div>
            <div className="metric-trend up">Goals approved</div>
          </div>
        </div>

        <div className="metric-card">
          <div className="metric-icon" style={{ background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)' }}>
            ❌
          </div>
          <div className="metric-content">
            <div className="metric-label">Rejections</div>
            <div className="metric-value">{filteredLogs.filter(l => l.action.includes('Rejected')).length}</div>
            <div className="metric-trend down">Goals rejected</div>
          </div>
        </div>

        <div className="metric-card">
          <div className="metric-icon" style={{ background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)' }}>
            🔓
          </div>
          <div className="metric-content">
            <div className="metric-label">Unlocks</div>
            <div className="metric-value">{filteredLogs.filter(l => l.action.includes('Unlocked')).length}</div>
            <div className="metric-trend neutral">Admin unlocks</div>
          </div>
        </div>
      </div>

      <Card title="Audit Logs" className="modern-card">
        {/* Filters */}
        <Space style={{ marginBottom: 16, width: '100%', justifyContent: 'space-between', flexWrap: 'wrap' }}>
          <Space wrap>
            <RangePicker
              value={dateRange}
              onChange={setDateRange}
              format="YYYY-MM-DD"
            />
            <Select
              placeholder="Filter by user"
              allowClear
              style={{ width: 200 }}
              value={userFilter}
              onChange={setUserFilter}
              showSearch
              filterOption={(input, option) =>
                option.children.toLowerCase().includes(input.toLowerCase())
              }
            >
              {users.map(user => (
                <Option key={user.id} value={user.id}>{user.full_name}</Option>
              ))}
            </Select>
            <Select
              placeholder="Filter by goal"
              allowClear
              style={{ width: 200 }}
              value={goalFilter}
              onChange={setGoalFilter}
              showSearch
              filterOption={(input, option) =>
                option.children.toLowerCase().includes(input.toLowerCase())
              }
            >
              {goals.map(goal => (
                <Option key={goal.id} value={goal.id}>{goal.title}</Option>
              ))}
            </Select>
          </Space>
          <Space>
            <Button icon={<ReloadOutlined />} onClick={() => refetch()}>
              Refresh
            </Button>
            <Button
              type="primary"
              icon={<DownloadOutlined />}
              onClick={handleExport}
            >
              Export CSV
            </Button>
          </Space>
        </Space>

        <Table
          columns={columns}
          dataSource={filteredLogs}
          rowKey="id"
          loading={isLoading}
          scroll={{ x: 1200 }}
          pagination={{ pageSize: 50, showSizeChanger: true, showTotal: (total) => `Total ${total} logs` }}
          className="enhanced-table"
        />
      </Card>
    </div>
  );
};

export default AdminAuditLogs;
