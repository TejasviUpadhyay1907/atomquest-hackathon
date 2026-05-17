import React, { useState } from 'react';
import { Card, Button, Table, Tag, Space, Modal, Form, Input, Select, InputNumber, message, Progress, Tooltip, Popconfirm } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, SendOutlined, LockOutlined, BulbOutlined } from '@ant-design/icons';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { goalAPI, thrustAreaAPI, aiAPI } from '../../services/api';

const { TextArea } = Input;
const { Option } = Select;

const EmployeeGoals = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingGoal, setEditingGoal] = useState(null);
  const [aiLoading, setAiLoading] = useState(false);
  const [form] = Form.useForm();
  const queryClient = useQueryClient();

  // Fetch goals
  const { data: goalsData, isLoading } = useQuery({
    queryKey: ['myGoals'],
    queryFn: () => goalAPI.getMyGoals(),
  });

  // Fetch thrust areas
  const { data: thrustAreasData } = useQuery({
    queryKey: ['thrustAreas'],
    queryFn: () => thrustAreaAPI.getThrustAreas(),
  });

  // Fetch validation status
  const { data: validationData } = useQuery({
    queryKey: ['validation'],
    queryFn: () => goalAPI.checkValidation(),
    refetchInterval: 5000, // Refresh every 5 seconds
  });

  const goals = goalsData?.data || [];
  const thrustAreas = thrustAreasData?.data || [];
  const validation = validationData?.data || {};

  // Create goal mutation
  const createMutation = useMutation({
    mutationFn: (data) => goalAPI.createGoal(data),
    onSuccess: () => {
      message.success('Goal created successfully!');
      queryClient.invalidateQueries(['myGoals']);
      queryClient.invalidateQueries(['validation']);
      setIsModalOpen(false);
      form.resetFields();
    },
    onError: (error) => {
      message.error(error.response?.data?.detail || 'Failed to create goal');
    },
  });

  // Update goal mutation
  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => goalAPI.updateGoal(id, data),
    onSuccess: () => {
      message.success('Goal updated successfully!');
      queryClient.invalidateQueries(['myGoals']);
      queryClient.invalidateQueries(['validation']);
      setIsModalOpen(false);
      setEditingGoal(null);
      form.resetFields();
    },
    onError: (error) => {
      message.error(error.response?.data?.detail || 'Failed to update goal');
    },
  });

  // Delete goal mutation
  const deleteMutation = useMutation({
    mutationFn: (id) => goalAPI.deleteGoal(id),
    onSuccess: () => {
      message.success('Goal deleted successfully!');
      queryClient.invalidateQueries(['myGoals']);
      queryClient.invalidateQueries(['validation']);
    },
    onError: (error) => {
      message.error(error.response?.data?.detail || 'Failed to delete goal');
    },
  });

  // Submit goal mutation
  const submitMutation = useMutation({
    mutationFn: (id) => goalAPI.submitGoal(id),
    onSuccess: () => {
      message.success('Goal submitted for approval!');
      queryClient.invalidateQueries(['myGoals']);
      queryClient.invalidateQueries(['validation']);
    },
    onError: (error) => {
      message.error(error.response?.data?.detail || 'Failed to submit goal');
    },
  });

  const handleCreate = () => {
    setEditingGoal(null);
    form.resetFields();
    setIsModalOpen(true);
  };

  const handleEdit = (goal) => {
    setEditingGoal(goal);
    form.setFieldsValue(goal);
    setIsModalOpen(true);
  };

  const handleSubmit = (values) => {
    if (editingGoal) {
      updateMutation.mutate({ id: editingGoal.id, data: values });
    } else {
      createMutation.mutate(values);
    }
  };

  const handleAISuggest = async () => {
    setAiLoading(true);
    try {
      const response = await aiAPI.suggestGoals({
        role: 'Employee',
        department: 'Engineering',
      });
      
      const suggestions = response.data.suggestions;
      if (suggestions && suggestions.length > 0) {
        const firstSuggestion = suggestions[0];
        form.setFieldsValue({
          title: firstSuggestion.title,
          description: firstSuggestion.description,
          target: firstSuggestion.target,
          uom_type: firstSuggestion.uom_type,
          weightage: firstSuggestion.suggested_weightage,
        });
        message.success('AI suggestion applied! You can edit before saving.');
      }
    } catch (error) {
      message.warning('AI suggestions not available. Please fill manually.');
    } finally {
      setAiLoading(false);
    }
  };

  const handleSubmitAll = () => {
    const draftGoals = goals.filter(g => g.status === 'Draft');
    if (draftGoals.length === 0) {
      message.warning('No draft goals to submit');
      return;
    }

    if (!validation.can_submit) {
      message.error(validation.errors?.join(', ') || 'Cannot submit goals');
      return;
    }

    Modal.confirm({
      title: 'Submit All Goals?',
      content: `You are about to submit ${draftGoals.length} goals for approval. Once submitted, you cannot edit them.`,
      onOk: () => {
        draftGoals.forEach(goal => {
          submitMutation.mutate(goal.id);
        });
      },
    });
  };

  const draftCount = goals.filter(g => g.status === 'Draft').length;
  const approvedCount = goals.filter(g => g.status === 'Approved').length;
  const pendingCount = goals.filter(g => g.status === 'Pending Approval').length;
  const rejectedCount = goals.filter(g => g.status === 'Rejected').length;

  const columns = [
    {
      title: 'Title',
      dataIndex: 'title',
      key: 'title',
      width: 250,
    },
    {
      title: 'UoM Type',
      dataIndex: 'uom_type',
      key: 'uom_type',
      width: 120,
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
        return (
          <span className="status-badge" style={s}>
            {status === 'Approved' && '✅ '}
            {status === 'Rejected' && '❌ '}
            {status === 'Pending Approval' && '⏳ '}
            {status === 'Draft' && '📝 '}
            {status}
          </span>
        );
      },
    },
    {
      title: 'Locked',
      dataIndex: 'is_locked',
      key: 'is_locked',
      width: 80,
      render: (locked) => locked ? <LockOutlined style={{ color: '#faad14' }} /> : null,
    },
    {
      title: 'Actions',
      key: 'actions',
      width: 150,
      render: (_, record) => (
        <Space>
          {!record.is_locked && record.status === 'Draft' && (
            <>
              <Tooltip title="Edit">
                <Button
                  type="text"
                  icon={<EditOutlined />}
                  onClick={() => handleEdit(record)}
                />
              </Tooltip>
              <Tooltip title="Delete">
                <Popconfirm
                  title="Delete this goal?"
                  onConfirm={() => deleteMutation.mutate(record.id)}
                >
                  <Button
                    type="text"
                    danger
                    icon={<DeleteOutlined />}
                  />
                </Popconfirm>
              </Tooltip>
            </>
          )}
          {record.status === 'Rejected' && (
            <Tooltip title={record.rejection_reason}>
              <Tag color="error">View Feedback</Tag>
            </Tooltip>
          )}
        </Space>
      ),
    },
  ];

  return (
    <div>
      {/* Summary Cards */}
      <div className="summary-cards-row">
        <div className="metric-card">
          <div className="metric-card-icon blue"><span>🎯</span></div>
          <div className="stat-number">{goals.length}</div>
          <div className="stat-label">Total Goals</div>
          <div className="stat-trend neutral">{goals.length} / 8 max</div>
        </div>
        <div className="metric-card">
          <div className="metric-card-icon green"><span>✅</span></div>
          <div className="stat-number">{approvedCount}</div>
          <div className="stat-label">Approved</div>
          <div className="stat-trend up">Ready for check-ins</div>
        </div>
        <div className="metric-card">
          <div className="metric-card-icon orange"><span>⏳</span></div>
          <div className="stat-number">{pendingCount}</div>
          <div className="stat-label">Pending Approval</div>
          <div className="stat-trend neutral">Awaiting review</div>
        </div>
        <div className="metric-card">
          <div className="metric-card-icon blue" style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>
            <span>📊</span>
          </div>
          <div className="stat-number">{validation.total_weightage || 0}%</div>
          <div className="stat-label">Total Weightage</div>
          <div className={`stat-trend ${validation.total_weightage === 100 ? 'up' : 'neutral'}`}>
            {validation.total_weightage === 100 ? '✅ Ready to submit' : `${100 - (validation.total_weightage || 0)}% remaining`}
          </div>
        </div>
      </div>

      {/* Main Card */}
      <div className="card-modern">
        <div className="card-modern-header">
          <h2 className="card-modern-title">🎯 My Goals</h2>
          <Space>
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={handleCreate}
              disabled={goals.length >= 8}
              style={{ borderRadius: 8, fontWeight: 600 }}
            >
              Create Goal
            </Button>
            <Button
              icon={<SendOutlined />}
              onClick={handleSubmitAll}
              disabled={!validation.can_submit}
              style={{ borderRadius: 8, fontWeight: 600 }}
            >
              Submit All
            </Button>
          </Space>
        </div>

        <div className="card-modern-body">
          {/* Validation Status Bar */}
          <div style={{
            marginBottom: 20,
            padding: '16px 20px',
            background: validation.total_weightage === 100 ? '#f0fdf4' : '#fefce8',
            borderRadius: 10,
            border: `1px solid ${validation.total_weightage === 100 ? '#bbf7d0' : '#fde68a'}`,
            display: 'flex',
            alignItems: 'center',
            gap: 24,
            flexWrap: 'wrap',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, flex: 1, minWidth: 200 }}>
              <span style={{ fontWeight: 600, color: '#374151', whiteSpace: 'nowrap' }}>Total Weightage:</span>
              <div style={{ flex: 1 }}>
                <Progress
                  percent={validation.total_weightage || 0}
                  status={validation.total_weightage === 100 ? 'success' : 'active'}
                  strokeColor={validation.total_weightage === 100 ? '#10b981' : '#667eea'}
                />
              </div>
            </div>
            <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
              <span style={{ fontWeight: 600, color: '#374151' }}>
                Goals: <span style={{ color: '#667eea' }}>{validation.goal_count || 0} / 8</span>
              </span>
              <span style={{ fontWeight: 600, color: '#374151' }}>
                Draft: <span style={{ color: '#f59e0b' }}>{draftCount}</span>
              </span>
              <span style={{ fontWeight: 600, color: '#374151' }}>
                Rejected: <span style={{ color: '#ef4444' }}>{rejectedCount}</span>
              </span>
            </div>
            {validation.errors && validation.errors.length > 0 && (
              <div style={{ width: '100%', color: '#dc2626', fontSize: 13 }}>
                ⚠️ {validation.errors.join(' • ')}
              </div>
            )}
          </div>

          {/* Goals Table */}
          <Table
            className="table-enhanced"
            columns={columns}
            dataSource={goals}
            rowKey="id"
            loading={isLoading}
            pagination={false}
            style={{ borderRadius: 10, overflow: 'hidden' }}
          />
        </div>
      </div>

      {/* Create/Edit Modal */}
      <Modal
        title={editingGoal ? 'Edit Goal' : 'Create New Goal'}
        open={isModalOpen}
        onCancel={() => {
          setIsModalOpen(false);
          setEditingGoal(null);
          form.resetFields();
        }}
        footer={null}
        width={600}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
        >
          <Form.Item>
            <Button
              icon={<BulbOutlined />}
              onClick={handleAISuggest}
              loading={aiLoading}
              block
            >
              Get AI Suggestion
            </Button>
          </Form.Item>

          <Form.Item
            name="thrust_area_id"
            label="Thrust Area"
            rules={[{ required: true, message: 'Please select a thrust area' }]}
          >
            <Select placeholder="Select thrust area">
              {thrustAreas.map(ta => (
                <Option key={ta.id} value={ta.id}>{ta.name}</Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item
            name="title"
            label="Goal Title"
            rules={[{ required: true, message: 'Please enter goal title' }]}
          >
            <Input placeholder="Enter goal title" />
          </Form.Item>

          <Form.Item
            name="description"
            label="Description"
          >
            <TextArea rows={3} placeholder="Describe your goal" />
          </Form.Item>

          <Form.Item
            name="uom_type"
            label="Unit of Measurement"
            rules={[{ required: true, message: 'Please select UoM type' }]}
          >
            <Select placeholder="Select UoM type">
              <Option value="Numeric">Numeric</Option>
              <Option value="Percentage">Percentage</Option>
              <Option value="Timeline">Timeline</Option>
              <Option value="Zero">Zero</Option>
            </Select>
          </Form.Item>

          <Form.Item
            name="target"
            label="Target"
            rules={[{ required: true, message: 'Please enter target' }]}
          >
            <Input placeholder="Enter target value" />
          </Form.Item>

          <Form.Item
            name="weightage"
            label="Weightage (%)"
            rules={[
              { required: true, message: 'Please enter weightage' },
              { type: 'number', min: 10, max: 100, message: 'Weightage must be between 10-100%' }
            ]}
          >
            <InputNumber
              min={10}
              max={100}
              style={{ width: '100%' }}
              placeholder="Enter weightage (10-100)"
            />
          </Form.Item>

          <Form.Item>
            <Space>
              <Button type="primary" htmlType="submit" loading={createMutation.isPending || updateMutation.isPending}>
                {editingGoal ? 'Update' : 'Create'}
              </Button>
              <Button onClick={() => {
                setIsModalOpen(false);
                setEditingGoal(null);
                form.resetFields();
              }}>
                Cancel
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default EmployeeGoals;
