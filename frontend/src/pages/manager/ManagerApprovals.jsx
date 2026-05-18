import React, { useState } from 'react';
import { Table, Button, Space, Modal, Form, Input, InputNumber, message, Tooltip } from 'antd';
import { CheckOutlined, CloseOutlined, EditOutlined, CheckCircleOutlined } from '@ant-design/icons';
import { motion } from 'framer-motion';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { managerAPI } from '../../services/api';

const { TextArea } = Input;

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

const ManagerApprovals = () => {
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [rejectModalOpen, setRejectModalOpen] = useState(false);
  const [selectedGoal, setSelectedGoal] = useState(null);
  const [form] = Form.useForm();
  const [rejectForm] = Form.useForm();
  const queryClient = useQueryClient();

  const { data: approvalsData, isLoading } = useQuery({
    queryKey: ['pendingApprovals'],
    queryFn: () => managerAPI.getPendingApprovals(),
  });

  const approvals = approvalsData?.data || [];

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
    form.setFieldsValue({ target: goal.target, weightage: goal.weightage });
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

  const groupedGoals = approvals.reduce((acc, goal) => {
    const employeeId = goal.user_id;
    if (!acc[employeeId]) {
      acc[employeeId] = { employeeName: goal.user?.full_name || 'Unknown', goals: [] };
    }
    acc[employeeId].goals.push(goal);
    return acc;
  }, {});

  const readyCount = Object.values(groupedGoals).filter(d => {
    const tw = d.goals.reduce((s, g) => s + g.weightage, 0);
    return tw === 100 && d.goals.length <= 8;
  }).length;

  const needAttentionCount = Object.values(groupedGoals).filter(d => {
    const tw = d.goals.reduce((s, g) => s + g.weightage, 0);
    return tw !== 100 || d.goals.length > 8;
  }).length;

  const columns = [
    {
      title: 'Title',
      dataIndex: 'title',
      key: 'title',
      width: 250,
      render: (v) => <span style={{ color: 'white', fontWeight: 500 }}>{v}</span>,
    },
    {
      title: 'Description',
      dataIndex: 'description',
      key: 'description',
      ellipsis: true,
      render: (v) => <span style={{ color: 'rgba(255,255,255,0.5)' }}>{v}</span>,
    },
    {
      title: 'UoM',
      dataIndex: 'uom_type',
      key: 'uom_type',
      width: 100,
      render: (v) => <span style={{ color: 'rgba(255,255,255,0.5)' }}>{v}</span>,
    },
    {
      title: 'Target',
      dataIndex: 'target',
      key: 'target',
      width: 100,
      render: (v) => <span style={{ color: 'rgba(255,255,255,0.6)' }}>{v}</span>,
    },
    {
      title: 'Weightage',
      dataIndex: 'weightage',
      key: 'weightage',
      width: 100,
      render: (v) => <span style={{ color: '#a78bfa', fontWeight: 600 }}>{v}%</span>,
    },
    {
      title: 'Actions',
      key: 'actions',
      width: 140,
      render: (_, record) => (
        <Space>
          <Tooltip title="Edit Target/Weightage">
            <button onClick={() => handleEdit(record)}
              style={{ width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center',
                background: 'rgba(167,139,250,0.1)', border: '1px solid rgba(167,139,250,0.3)',
                borderRadius: '8px', color: '#a78bfa', cursor: 'pointer' }}>
              <EditOutlined />
            </button>
          </Tooltip>
          <Tooltip title="Approve">
            <button onClick={() => handleApprove(record)}
              style={{ width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center',
                background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.3)',
                borderRadius: '8px', color: '#10b981', cursor: 'pointer' }}>
              <CheckOutlined />
            </button>
          </Tooltip>
          <Tooltip title="Return for Rework">
            <button onClick={() => handleReject(record)}
              style={{ width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center',
                background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)',
                borderRadius: '8px', color: '#ef4444', cursor: 'pointer' }}>
              <CloseOutlined />
            </button>
          </Tooltip>
        </Space>
      ),
    },
  ];

  return (
    <div style={{ background: '#0d0d14', minHeight: '100vh', padding: '24px' }}>
      {/* Page Header */}
      <motion.div initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} style={{ marginBottom: '24px' }}>
        <h1 style={{ color: 'white', fontSize: '1.6rem', fontWeight: 700, margin: '0 0 4px' }}>Pending Approvals</h1>
        <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '14px', margin: 0 }}>Review and approve employee goal submissions</p>
      </motion.div>

      {/* KPI Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px', marginBottom: '24px' }}>
        <KpiCard icon="⏳" label="Pending Approvals" value={approvals.length} sub="Awaiting review"
          gradient="linear-gradient(135deg,#f59e0b,#d97706)" delay={0} />
        <KpiCard icon="👥" label="Employees" value={Object.keys(groupedGoals).length} sub="With pending goals"
          gradient="linear-gradient(135deg,#667eea,#764ba2)" delay={0.08} />
        <KpiCard icon="✅" label="Ready to Approve" value={readyCount} sub="Valid submissions"
          gradient="linear-gradient(135deg,#10b981,#059669)" delay={0.16} />
        <KpiCard icon="⚠️" label="Need Attention" value={needAttentionCount} sub="Invalid weightage"
          gradient="linear-gradient(135deg,#ef4444,#dc2626)" delay={0.24} />
      </div>

      {/* Main Card */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3, duration: 0.5 }}
        style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '16px' }}>

        <div style={{ padding: '20px 24px', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
          <h2 style={{ color: 'white', fontSize: '1.1rem', fontWeight: 700, margin: 0 }}>⏳ Pending Approvals</h2>
        </div>

        <div style={{ padding: '20px 24px' }}>
          {Object.entries(groupedGoals).map(([employeeId, data]) => {
            const totalWeightage = data.goals.reduce((sum, g) => sum + g.weightage, 0);
            const isValid = totalWeightage === 100 && data.goals.length <= 8;

            return (
              <div key={employeeId} style={{ marginBottom: '20px',
                border: `1px solid ${isValid ? 'rgba(16,185,129,0.25)' : 'rgba(245,158,11,0.25)'}`,
                borderRadius: '12px', overflow: 'hidden' }}>

                {/* Employee Header */}
                <div style={{ padding: '14px 20px',
                  background: isValid ? 'rgba(16,185,129,0.06)' : 'rgba(245,158,11,0.06)',
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{ width: '36px', height: '36px', borderRadius: '50%',
                      background: 'linear-gradient(135deg,#667eea,#764ba2)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      color: 'white', fontWeight: 700, fontSize: '16px' }}>
                      {data.employeeName.charAt(0)}
                    </div>
                    <span style={{ fontWeight: 600, fontSize: '15px', color: 'white' }}>{data.employeeName}</span>
                    <span style={{ padding: '3px 10px', borderRadius: '20px', fontSize: '12px', fontWeight: 600,
                      background: isValid ? 'rgba(16,185,129,0.15)' : 'rgba(245,158,11,0.15)',
                      color: isValid ? '#6ee7b7' : '#fcd34d' }}>
                      {data.goals.length} goals · {totalWeightage}% total
                    </span>
                  </div>
                  <button
                    onClick={() => handleApproveAll(parseInt(employeeId), data.employeeName)}
                    disabled={!isValid}
                    style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '8px 16px',
                      background: isValid ? 'linear-gradient(135deg,#10b981,#059669)' : 'rgba(255,255,255,0.06)',
                      border: 'none', borderRadius: '8px',
                      color: isValid ? 'white' : 'rgba(255,255,255,0.3)',
                      fontWeight: 600, fontSize: '13px', cursor: isValid ? 'pointer' : 'not-allowed' }}>
                    <CheckCircleOutlined /> Approve All
                  </button>
                </div>

                {!isValid && (
                  <div style={{ padding: '10px 20px',
                    background: 'rgba(245,158,11,0.04)',
                    color: '#fcd34d', fontSize: '13px',
                    borderBottom: '1px solid rgba(245,158,11,0.15)' }}>
                    ⚠️ Total weightage must equal 100% and max 8 goals before approval
                  </div>
                )}

                <Table
                  columns={columns}
                  dataSource={data.goals}
                  rowKey="id"
                  pagination={false}
                  size="small"
                  style={{ background: 'transparent' }}
                />
              </div>
            );
          })}

          {approvals.length === 0 && !isLoading && (
            <div style={{ textAlign: 'center', padding: '60px 20px' }}>
              <div style={{ fontSize: '48px', marginBottom: '16px' }}>✅</div>
              <div style={{ color: 'white', fontSize: '18px', fontWeight: 600, marginBottom: '8px' }}>All caught up!</div>
              <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: '14px' }}>No pending approvals at this time</div>
            </div>
          )}
        </div>
      </motion.div>

      {/* Edit Modal */}
      <Modal
        title="Edit Goal"
        open={editModalOpen}
        onCancel={() => { setEditModalOpen(false); form.resetFields(); }}
        footer={null}
      >
        {selectedGoal && (
          <div style={{ marginBottom: '16px', padding: '12px 16px',
            background: 'rgba(255,255,255,0.04)', borderRadius: '10px',
            border: '1px solid rgba(255,255,255,0.08)' }}>
            <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: '12px', marginBottom: '4px' }}>Goal</div>
            <div style={{ color: 'white', fontWeight: 600, marginBottom: '4px' }}>{selectedGoal.title}</div>
            <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: '13px' }}>Employee: {selectedGoal.user?.full_name}</div>
          </div>
        )}
        <Form form={form} layout="vertical" onFinish={handleEditSubmit}>
          <Form.Item name="target" label="Target"
            rules={[{ required: true, message: 'Please enter target' }]}>
            <Input placeholder="Enter target value" />
          </Form.Item>
          <Form.Item name="weightage" label="Weightage (%)"
            rules={[
              { required: true, message: 'Please enter weightage' },
              { type: 'number', min: 10, max: 100, message: 'Weightage must be between 10-100%' },
            ]}>
            <InputNumber min={10} max={100} style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item>
            <Space>
              <Button type="primary" htmlType="submit" loading={editMutation.isPending}>Update</Button>
              <Button onClick={() => { setEditModalOpen(false); form.resetFields(); }}>Cancel</Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>

      {/* Reject Modal */}
      <Modal
        title="Return for Rework"
        open={rejectModalOpen}
        onCancel={() => { setRejectModalOpen(false); rejectForm.resetFields(); }}
        footer={null}
      >
        {selectedGoal && (
          <div style={{ marginBottom: '16px', padding: '12px 16px',
            background: 'rgba(239,68,68,0.06)', borderRadius: '10px',
            border: '1px solid rgba(239,68,68,0.2)' }}>
            <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: '12px', marginBottom: '4px' }}>Goal</div>
            <div style={{ color: 'white', fontWeight: 600, marginBottom: '4px' }}>{selectedGoal.title}</div>
            <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: '13px' }}>Employee: {selectedGoal.user?.full_name}</div>
          </div>
        )}
        <Form form={rejectForm} layout="vertical" onFinish={handleRejectSubmit}>
          <Form.Item name="reason" label="Reason for Rejection"
            rules={[{ required: true, message: 'Please provide a reason' }]}>
            <TextArea rows={4} placeholder="Explain why this goal needs to be revised..." />
          </Form.Item>
          <Form.Item>
            <Space>
              <Button danger htmlType="submit" loading={rejectMutation.isPending}>Return for Rework</Button>
              <Button onClick={() => { setRejectModalOpen(false); rejectForm.resetFields(); }}>Cancel</Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>

      <style>{`
        .ant-table { background: transparent !important; }
        .ant-table-thead > tr > th { background: rgba(255,255,255,0.04) !important; color: rgba(255,255,255,0.45) !important; font-size: 11px !important; font-weight: 700 !important; letter-spacing: 0.8px !important; text-transform: uppercase !important; border-bottom: 1px solid rgba(255,255,255,0.06) !important; }
        .ant-table-tbody > tr > td { background: transparent !important; border-bottom: 1px solid rgba(255,255,255,0.04) !important; padding: 13px 16px !important; }
        .ant-table-tbody > tr:hover > td { background: rgba(255,255,255,0.03) !important; }
        .ant-pagination-item a { color: rgba(255,255,255,0.5) !important; }
        .ant-pagination-item-active { background: rgba(102,126,234,0.2) !important; border-color: rgba(102,126,234,0.4) !important; }
        .ant-pagination-item-active a { color: #a78bfa !important; }
        .ant-pagination-prev button, .ant-pagination-next button { color: rgba(255,255,255,0.4) !important; }
        .ant-modal-content { background: rgba(13,13,20,0.98) !important; border: 1px solid rgba(255,255,255,0.1) !important; border-radius: 18px !important; }
        .ant-modal-header { background: transparent !important; border-bottom: 1px solid rgba(255,255,255,0.06) !important; }
        .ant-modal-title { color: white !important; }
        .ant-modal-close { color: rgba(255,255,255,0.4) !important; }
        .ant-form-item-label > label { color: rgba(255,255,255,0.7) !important; }
        .ant-input, .ant-input-number, .ant-select-selector, .ant-input-affix-wrapper { background: rgba(255,255,255,0.05) !important; border: 1px solid rgba(255,255,255,0.1) !important; border-radius: 8px !important; color: white !important; }
        .ant-input::placeholder { color: rgba(255,255,255,0.3) !important; }
        .ant-input-number-input { color: white !important; background: transparent !important; }
        .ant-select-selection-placeholder { color: rgba(255,255,255,0.3) !important; }
        .ant-select-selection-item { color: white !important; }
        .ant-select-arrow { color: rgba(255,255,255,0.4) !important; }
        .ant-select-dropdown { background: rgba(8,8,8,0.97) !important; border: 1px solid rgba(255,255,255,0.1) !important; border-radius: 12px !important; }
        .ant-select-item-option { color: rgba(255,255,255,0.8) !important; }
        .ant-select-item-option:hover { background: rgba(99,102,241,0.15) !important; }
        .ant-select-item-option-selected { background: rgba(99,102,241,0.25) !important; color: white !important; }
        .ant-form-item-explain-error { color: #f87171 !important; }
        .ant-spin-dot-item { background: #a78bfa !important; }
        .ant-modal-confirm-title { color: white !important; }
        .ant-modal-confirm-content { color: rgba(255,255,255,0.6) !important; }
      `}</style>
    </div>
  );
};

export default ManagerApprovals;
