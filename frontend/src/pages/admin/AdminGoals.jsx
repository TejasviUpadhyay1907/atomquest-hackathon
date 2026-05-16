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
        const colors = {
          'Draft': 'default',
          'Pending Approval': 'processing',
          'Approved': 'success',
          'Rejected': 'error',
        };
        return <Tag color={colors[status]}>{status}</Tag>;
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
      <Card title="All Goals">
        {/* Stats */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: 16, marginBottom: 24 }}>
          <Card size="small">
            <div style={{ fontSize: 24, fontWeight: 'bold', color: '#1890ff' }}>{stats.total}</div>
            <div style={{ color: '#666' }}>Total Goals</div>
          </Card>
          <Card size="small">
            <div style={{ fontSize: 24, fontWeight: 'bold', color: '#52c41a' }}>{stats.approved}</div>
            <div style={{ color: '#666' }}>Approved</div>
          </Card>
          <Card size="small">
            <div style={{ fontSize: 24, fontWeight: 'bold', color: '#faad14' }}>{stats.pending}</div>
            <div style={{ color: '#666' }}>Pending</div>
          </Card>
          <Card size="small">
            <div style={{ fontSize: 24, fontWeight: 'bold', color: '#ff4d4f' }}>{stats.rejected}</div>
            <div style={{ color: '#666' }}>Rejected</div>
          </Card>
          <Card size="small">
            <div style={{ fontSize: 24, fontWeight: 'bold', color: '#722ed1' }}>{stats.locked}</div>
            <div style={{ color: '#666' }}>Locked</div>
          </Card>
          <Card size="small">
            <div style={{ fontSize: 24, fontWeight: 'bold', color: '#13c2c2' }}>{stats.shared}</div>
            <div style={{ color: '#666' }}>Shared</div>
          </Card>
        </div>

        {/* Filters */}
        <Space style={{ marginBottom: 16, width: '100%', justifyContent: 'space-between' }}>
          <Space>
            <Search
              placeholder="Search goals..."
              allowClear
              style={{ width: 250 }}
              onChange={(e) => setSearchText(e.target.value)}
            />
            <Select
              value={statusFilter}
              onChange={setStatusFilter}
              style={{ width: 150 }}
            >
              <Option value="all">All Status</Option>
              <Option value="Draft">Draft</Option>
              <Option value="Pending Approval">Pending</Option>
              <Option value="Approved">Approved</Option>
              <Option value="Rejected">Rejected</Option>
            </Select>
            <Select
              value={departmentFilter}
              onChange={setDepartmentFilter}
              style={{ width: 150 }}
            >
              <Option value="all">All Departments</Option>
              {departments.map(dept => (
                <Option key={dept} value={dept}>{dept}</Option>
              ))}
            </Select>
          </Space>
        </Space>

        <Table
          columns={columns}
          dataSource={filteredGoals}
          rowKey="id"
          loading={isLoading}
          scroll={{ x: 1400 }}
          pagination={{ pageSize: 20, showSizeChanger: true, showTotal: (total) => `Total ${total} goals` }}
        />
      </Card>
    </div>
  );
};

export default AdminGoals;
