import React, { useState } from 'react';
import { Card, Table, Button, Space, Modal, Form, Input, InputNumber, message, Tag, Tooltip } from 'antd';
import { CheckOutlined, CloseOutlined, EditOutlined, CheckCircleOutlined } from '@ant-design/icons';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { managerAPI } from '../../services/api';

const { TextArea } = Input;

const ManagerApprovals = () => {
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [rejectModalOpen, setRejectModalOpen] = useState(false);
  const [selectedGoal, setSelectedGoal] = useState(null);
  const [form] = Form.useForm();
  const [rejectForm] = Form.useForm();
  const queryClient = useQueryClient();

  // Fetch pending approvals
  const { data: approvalsData, isLoading } = useQuery({
    queryKey: ['pendingApprovals'],
    queryFn: () => managerAPI.getPendingApprovals(),
  });

  const approvals = approvalsData?.data || [];

  // Inline edit mutation
  const editMutation = useMutation({
    mutationFn: ({ id, data }) => managerAPI.inlineEdit(id, data),
    onSuccess: () => {
      message.success('Goal updated successfully!');
      queryClient.invalidateQueries(['pendingApprovals']);
      setEditModalOpen(false);
      form.resetFields();
    },
    onError: (error) => {
      message.error(error.response?.data?.detail || 'Failed to update goal');
    },
  });

  // Approve mutation
  const approveMutation = useMutation({
    mutationFn: (id) => managerAPI.approveGoal(id),
    onSuccess: () => {
      message.success('Goal approved!');
      queryClient.invalidateQueries(['pendingApprovals']);
    },
    onError: (error) => {
      message.error(error.response?.data?.detail || 'Failed to approve goal');
    },
  });

  // Reject mutation
  const rejectMutation = useMutation({
    mutationFn: ({ id, reason }) => managerAPI.rejectGoal(id, reason),
    onSuccess: () => {
      message.success('Goal returned for rework');
      queryClient.invalidateQueries(['pendingApprovals']);
      setRejectModalOpen(false);
      rejectForm.resetFields();
    },
    onError: (error) => {
      message.error(error.response?.data?.detail || 'Failed to reject goal');
    },
  });

  // Approve all mutation
  const approveAllMutation = useMutation({
    mutationFn: (employeeId) => managerAPI.approveAll(employeeId),
    onSuccess: () => {
      message.success('All goals approved!');
      queryClient.invalidateQueries(['pendingApprovals']);
    },
    onError: (error) => {
      message.error(error.response?.data?.detail || 'Failed to approve all goals');
    },
  });

  const handleEdit = (goal) => {
    setSelectedGoal(goal);
    form.setFieldsValue({
      target: goal.target,
      weightage: goal.weightage,
    });
    setEditModalOpen(true);
  };

  const handleEditSubmit = (values) => {
    editMutation.mutate({ id: selectedGoal.id, data: values });
  };

  const handleApprove = (goal) => {
    Modal.confirm({
      title: 'Approve Goal?',
      content: `Are you sure you want to approve "${goal.title}"? The goal will be locked after approval.`,
      onOk: () => approveMutation.mutate(goal.id),
    });
  };

  const handleReject = (goal) => {
    setSelectedGoal(goal);
    setRejectModalOpen(true);
  };

  const handleRejectSubmit = (values) => {
    rejectMutation.mutate({ id: selectedGoal.id, reason: values.reason });
  };

  const handleApproveAll = (employeeId, employeeName) => {
    Modal.confirm({
      title: 'Approve All Goals?',
      content: `Are you sure you want to approve all goals for ${employeeName}? All goals will be locked.`,
      onOk: () => approveAllMutation.mutate(employeeId),
    });
  };

  // Group goals by employee
  const groupedGoals = approvals.reduce((acc, goal) => {
    const employeeId = goal.user_id;
    if (!acc[employeeId]) {
      acc[employeeId] = {
        employeeName: goal.user?.full_name || 'Unknown',
        goals: [],
      };
    }
    acc[employeeId].goals.push(goal);
    return acc;
  }, {});

  const columns = [
    {
      title: 'Title',
      dataIndex: 'title',
      key: 'title',
      width: 250,
    },
    {
      title: 'Description',
      dataIndex: 'description',
      key: 'description',
      ellipsis: true,
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
      title: 'Actions',
      key: 'actions',
      width: 200,
      render: (_, record) => (
        <Space>
          <Tooltip title="Edit Target/Weightage">
            <Button
              type="text"
              icon={<EditOutlined />}
              onClick={() => handleEdit(record)}
            />
          </Tooltip>
          <Tooltip title="Approve">
            <Button
              type="text"
              icon={<CheckOutlined />}
              style={{ color: '#52c41a' }}
              onClick={() => handleApprove(record)}
            />
          </Tooltip>
          <Tooltip title="Return for Rework">
            <Button
              type="text"
              danger
              icon={<CloseOutlined />}
              onClick={() => handleReject(record)}
            />
          </Tooltip>
        </Space>
      ),
    },
  ];

  return (
    <div>
      {/* Summary Cards */}
      <div className="summary-cards-row">
        <div className="metric-card">
          <div className="metric-card-icon orange"><span>⏳</span></div>
          <div className="stat-number">{approvals.length}</div>
          <div className="stat-label">Pending Approvals</div>
          <div className="stat-trend neutral">Awaiting review</div>
        </div>
        <div className="metric-card">
          <div className="metric-card-icon blue"><span>👥</span></div>
          <div className="stat-number">{Object.keys(groupedGoals).length}</div>
          <div className="stat-label">Employees</div>
          <div className="stat-trend neutral">With pending goals</div>
        </div>
        <div className="metric-card">
          <div className="metric-card-icon green"><span>✅</span></div>
          <div className="stat-number">
            {Object.values(groupedGoals).filter(d => {
              const tw = d.goals.reduce((s, g) => s + g.weightage, 0);
              return tw === 100 && d.goals.length <= 8;
            }).length}
          </div>
          <div className="stat-label">Ready to Approve</div>
          <div className="stat-trend up">Valid submissions</div>
        </div>
        <div className="metric-card">
          <div className="metric-card-icon red"><span>⚠️</span></div>
          <div className="stat-number">
            {Object.values(groupedGoals).filter(d => {
              const tw = d.goals.reduce((s, g) => s + g.weightage, 0);
              return tw !== 100 || d.goals.length > 8;
            }).length}
          </div>
          <div className="stat-label">Need Attention</div>
          <div className="stat-trend down">Invalid weightage</div>
        </div>
      </div>

      {/* Main Card */}
      <div className="card-modern">
        <div className="card-modern-header">
          <h2 className="card-modern-title">⏳ Pending Approvals</h2>
        </div>
        <div className="card-modern-body">
          {Object.entries(groupedGoals).map(([employeeId, data]) => {
            const totalWeightage = data.goals.reduce((sum, g) => sum + g.weightage, 0);
            const isValid = totalWeightage === 100 && data.goals.length <= 8;

            return (
              <div key={employeeId} style={{
                marginBottom: 20,
                border: `1px solid ${isValid ? '#bbf7d0' : '#fde68a'}`,
                borderRadius: 12,
                overflow: 'hidden',
              }}>
                <div style={{
                  padding: '14px 20px',
                  background: isValid ? '#f0fdf4' : '#fefce8',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                }}>
                  <Space>
                    <div style={{
                      width: 36, height: 36, borderRadius: '50%',
                      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      color: 'white', fontWeight: 700, fontSize: 16,
                    }}>
                      {data.employeeName.charAt(0)}
                    </div>
                    <span style={{ fontWeight: 600, fontSize: 16 }}>{data.employeeName}</span>
                    <span className={`status-badge ${isValid ? 'success' : 'warning'}`}>
                      {data.goals.length} goals | {totalWeightage}% total
                    </span>
                  </Space>
                  <Button
                    type="primary"
                    icon={<CheckCircleOutlined />}
                    onClick={() => handleApproveAll(parseInt(employeeId), data.employeeName)}
                    disabled={!isValid}
                    style={{ borderRadius: 8, fontWeight: 600 }}
                  >
                    Approve All
                  </Button>
                </div>
                {!isValid && (
                  <div style={{ padding: '10px 20px', background: '#fffbeb', color: '#92400e', fontSize: 13 }}>
                    ⚠️ Total weightage must equal 100% and max 8 goals before approval
                  </div>
                )}
                <Table
                  className="table-enhanced"
                  columns={columns}
                  dataSource={data.goals}
                  rowKey="id"
                  pagination={false}
                  size="small"
                />
              </div>
            );
          })}

          {approvals.length === 0 && !isLoading && (
            <div className="empty-state">
              <div className="empty-state-icon">✅</div>
              <div className="empty-state-title">All caught up!</div>
              <div className="empty-state-description">No pending approvals at this time</div>
            </div>
          )}
        </div>
      </div>

      {/* Edit Modal */}
      <Modal
        title="Edit Goal"
        open={editModalOpen}
        onCancel={() => {
          setEditModalOpen(false);
          form.resetFields();
        }}
        footer={null}
      >
        {selectedGoal && (
          <div style={{ marginBottom: 16, padding: 12, background: '#f5f5f5', borderRadius: 8 }}>
            <div><strong>Goal:</strong> {selectedGoal.title}</div>
            <div><strong>Employee:</strong> {selectedGoal.user?.full_name}</div>
          </div>
        )}

        <Form
          form={form}
          layout="vertical"
          onFinish={handleEditSubmit}
        >
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
            />
          </Form.Item>

          <Form.Item>
            <Space>
              <Button type="primary" htmlType="submit" loading={editMutation.isPending}>
                Update
              </Button>
              <Button onClick={() => {
                setEditModalOpen(false);
                form.resetFields();
              }}>
                Cancel
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>

      {/* Reject Modal */}
      <Modal
        title="Return for Rework"
        open={rejectModalOpen}
        onCancel={() => {
          setRejectModalOpen(false);
          rejectForm.resetFields();
        }}
        footer={null}
      >
        {selectedGoal && (
          <div style={{ marginBottom: 16, padding: 12, background: '#fff1f0', borderRadius: 8 }}>
            <div><strong>Goal:</strong> {selectedGoal.title}</div>
            <div><strong>Employee:</strong> {selectedGoal.user?.full_name}</div>
          </div>
        )}

        <Form
          form={rejectForm}
          layout="vertical"
          onFinish={handleRejectSubmit}
        >
          <Form.Item
            name="reason"
            label="Reason for Rejection"
            rules={[{ required: true, message: 'Please provide a reason' }]}
          >
            <TextArea
              rows={4}
              placeholder="Explain why this goal needs to be revised..."
            />
          </Form.Item>

          <Form.Item>
            <Space>
              <Button type="primary" danger htmlType="submit" loading={rejectMutation.isPending}>
                Return for Rework
              </Button>
              <Button onClick={() => {
                setRejectModalOpen(false);
                rejectForm.resetFields();
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

export default ManagerApprovals;
