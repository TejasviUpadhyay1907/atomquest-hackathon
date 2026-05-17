import React, { useState } from 'react';
import { Card, Table, Button, Tag, Select, Input, Space, message, Modal } from 'antd';
import { UnlockOutlined, SearchOutlined, DownloadOutlined } from '@ant-design/icons';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { adminAPI } from '../../services/api';

const { Option } = Select;
const { Search } = Input;

const AdminGoals = () => {
  const [searchText, setSearchText] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [departmentFilter, setDepartmentFilter] = useState('all');
  const queryClient = useQueryClient();

  // Fetch all goals
  const { data: goalsData, isLoading } = useQuery({
    queryKey: ['allGoals'],
    queryFn: () => adminAPI.getAllGoals(),
  });

  // Fetch users for department filter
  const { data: usersData } = useQuery({
    queryKey: ['allUsers'],
    queryFn: () => adminAPI.getAllUsers(),
  });

  const goals = goalsData?.data || [];
  const users = usersData?.data || [];

  // Unlock goal mutation
  const unlockMutation = useMutation({
    mutationFn: (id) => adminAPI.unlockGoal(id),
    onSuccess: () => {
      message.success('Goal unlocked successfully!');
      queryClient.invalidateQueries(['allGoals']);
    },
    onError: (error) => {
      message.error(error.response?.data?.detail || 'Failed to unlock goal');
    },
  });

  const handleUnlock = (goal) => {
    Modal.confirm({
      title: 'Unlock Goal?',
      content: `Are you sure you want to unlock "${goal.title}"? The employee will be able to edit it again.`,
      onOk: () => unlockMutation.mutate(goal.id),
    });
  };

  // Get unique departments
  const departments = [...new Set(users.map(u => u.department).filter(Boolean))];

  // Filter goals
  const filteredGoals = goals.filter(goal => {
    const matchesSearch = goal.title.toLowerCase().includes(searchText.toLowerCase()) ||
                         goal.description?.toLowerCase().includes(searchText.toLowerCase());
    const matchesStatus = statusFilter === 'all' || goal.status === statusFilter;
    
    // Find user for department filter
    const user = users.find(u => u.id === goal.user_id);
    const matchesDepartment = departmentFilter === 'all' || user?.department === departmentFilter;
    
    return matchesSearch && matchesStatus && matchesDepartment;
  });

  const columns = [
    {
      title: 'Employee',
      dataIndex: 'user_id',
      key: 'employee',
      width: 150,
      render: (userId) => {
        const user = users.find(u => u.id === userId);
        return user?.full_name || 'Unknown';
      },
    },
    {
      title: 'Department',
      dataIndex: 'user_id',
      key: 'department',
      width: 120,
      render: (userId) => {
        const user = users.find(u => u.id === userId);
        return user?.department || '-';
      },
    },
    {
      title: 'Title',
      dataIndex: 'title',
      key: 'title',
      width: 250,
    },
    {
      title: 'UoM',
      dataIndex: 'uom_type',
      key: 'uom_type',
      width: 100,
    },
    {
      title: 'Target',
      dataIndex: 'target',
      key: 'target',
      width: 100,
    },
    {
      title: 'Weightage',
      dataIndex: 'weightage',
      key: 'weightage',
      width: 100,
      render: (weightage) => `${weightage}%`,
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      width: 150,
      render: (status) => {
        const styleMap = {
          'Draft':            { background: '#f3f4f6', color: '#374151' },
          'Pending Approval': { background: '#fef3c7', color: '#92400e' },
          'Approved':         { background: '#d1fae5', color: '#065f46' },
          'Rejected':         { background: '#fee2e2', color: '#991b1b' },
        };
        const s = styleMap[status] || styleMap['Draft'];
        return <span className="status-badge" style={s}>{status}</span>;
      },
    },
    {
      title: 'Locked',
      dataIndex: 'is_locked',
      key: 'is_locked',
      width: 80,
      render: (locked) => locked ? <Tag color="warning">Locked</Tag> : <Tag>Unlocked</Tag>,
    },
    {
      title: 'Shared',
      dataIndex: 'is_shared',
      key: 'is_shared',
      width: 80,
      render: (shared) => shared ? <Tag color="blue">Shared</Tag> : null,
    },
    {
      title: 'Actions',
      key: 'actions',
      width: 100,
      fixed: 'right',
      render: (_, record) => (
        record.is_locked && (
          <Button
            type="text"
            icon={<UnlockOutlined />}
            onClick={() => handleUnlock(record)}
          >
            Unlock
          </Button>
        )
      ),
    },
  ];

  // Stats
  const stats = {
    total: goals.length,
    draft: goals.filter(g => g.status === 'Draft').length,
    pending: goals.filter(g => g.status === 'Pending Approval').length,
    approved: goals.filter(g => g.status === 'Approved').length,
    rejected: goals.filter(g => g.status === 'Rejected').length,
    locked: goals.filter(g => g.is_locked).length,
    shared: goals.filter(g => g.is_shared).length,
  };

  return (
    <div>
      {/* Summary Cards */}
      <div className="summary-cards-row">
        <div className="metric-card">
          <div className="metric-card-icon blue"><span>🎯</span></div>
          <div className="stat-number">{stats.total}</div>
          <div className="stat-label">Total Goals</div>
          <div className="stat-trend neutral">All employees</div>
        </div>
        <div className="metric-card">
          <div className="metric-card-icon green"><span>✅</span></div>
          <div className="stat-number">{stats.approved}</div>
          <div className="stat-label">Approved</div>
          <div className="stat-trend up">Active goals</div>
        </div>
        <div className="metric-card">
          <div className="metric-card-icon orange"><span>⏳</span></div>
          <div className="stat-number">{stats.pending}</div>
          <div className="stat-label">Pending</div>
          <div className="stat-trend neutral">Awaiting approval</div>
        </div>
        <div className="metric-card">
          <div className="metric-card-icon red"><span>🔒</span></div>
          <div className="stat-number">{stats.locked}</div>
          <div className="stat-label">Locked</div>
          <div className="stat-trend neutral">{stats.shared} shared</div>
        </div>
      </div>

      {/* Main Card */}
      <div className="card-modern">
        <div className="card-modern-header">
          <h2 className="card-modern-title">🎯 All Goals</h2>
          <Space>
            <Input
              prefix={<SearchOutlined />}
              placeholder="Search goals..."
              allowClear
              style={{ width: 220, borderRadius: 8 }}
              onChange={(e) => setSearchText(e.target.value)}
            />
            <Select value={statusFilter} onChange={setStatusFilter} style={{ width: 150 }}>
              <Option value="all">All Status</Option>
              <Option value="Draft">Draft</Option>
              <Option value="Pending Approval">Pending</Option>
              <Option value="Approved">Approved</Option>
              <Option value="Rejected">Rejected</Option>
            </Select>
            <Select value={departmentFilter} onChange={setDepartmentFilter} style={{ width: 150 }}>
              <Option value="all">All Departments</Option>
              {departments.map(dept => (
                <Option key={dept} value={dept}>{dept}</Option>
              ))}
            </Select>
          </Space>
        </div>
        <div className="card-modern-body" style={{ padding: 0 }}>
          <Table
            className="table-enhanced"
            columns={columns}
            dataSource={filteredGoals}
            rowKey="id"
            loading={isLoading}
            scroll={{ x: 1400 }}
            pagination={{ pageSize: 20, showSizeChanger: true, showTotal: (total) => `Total ${total} goals` }}
          />
        </div>
      </div>
    </div>
  );
};

export default AdminGoals;
