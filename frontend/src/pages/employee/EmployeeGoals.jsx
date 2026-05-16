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
      <Card
        title="My Goals"
        extra={
          <Space>
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={handleCreate}
              disabled={goals.length >= 8}
            >
              Create Goal
            </Button>
            <Button
              type="default"
              icon={<SendOutlined />}
              onClick={handleSubmitAll}
              disabled={!validation.can_submit}
            >
              Submit All
            </Button>
          </Space>
        }
      >
        {/* Validation Status */}
        <div style={{ marginBottom: 16, padding: 16, background: '#f5f5f5', borderRadius: 8 }}>
          <Space direction="vertical" style={{ width: '100%' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span><strong>Total Weightage:</strong></span>
              <Progress
                percent={validation.total_weightage || 0}
                status={validation.total_weightage === 100 ? 'success' : 'active'}
                style={{ width: 200 }}
              />
            </div>
            <div>
              <strong>Goals:</strong> {validation.goal_count || 0} / 8
            </div>
            {validation.errors && validation.errors.length > 0 && (
              <div style={{ color: '#ff4d4f' }}>
                <strong>Issues:</strong>
                <ul style={{ margin: '8px 0', paddingLeft: 20 }}>
                  {validation.errors.map((error, idx) => (
                    <li key={idx}>{error}</li>
                  ))}
                </ul>
              </div>
            )}
          </Space>
        </div>

        <Table
          columns={columns}
          dataSource={goals}
          rowKey="id"
          loading={isLoading}
          pagination={false}
        />
      </Card>

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
