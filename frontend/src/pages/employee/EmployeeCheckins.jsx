import React, { useState, useEffect } from 'react';
import { Table, Button, Modal, Form, Input, Select, message, Progress } from 'antd';
import { PlusOutlined, EditOutlined } from '@ant-design/icons';
import { motion } from 'framer-motion';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { goalAPI, checkinAPI } from '../../services/api';

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
    'Not Started': { bg: 'rgba(255,255,255,0.06)', color: 'rgba(255,255,255,0.5)' },
    'On Track':    { bg: 'rgba(59,130,246,0.12)',  color: '#93c5fd' },
    'Completed':   { bg: 'rgba(16,185,129,0.12)',  color: '#6ee7b7' },
  };
  const s = map[status] || map['Not Started'];
  return (
    <span style={{ padding: '3px 10px', borderRadius: '20px', fontSize: '12px', fontWeight: 600, background: s.bg, color: s.color }}>
      {status === 'Completed' && '✅ '}
      {status === 'On Track' && '🔵 '}
      {status === 'Not Started' && '⚪ '}
      {status}
    </span>
  );
};

const EmployeeCheckins = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedGoal, setSelectedGoal] = useState(null);
  const [selectedQuarter, setSelectedQuarter] = useState('Q1');
  const [form] = Form.useForm();
  const queryClient = useQueryClient();

  useEffect(() => {
    console.log('EmployeeCheckins component mounted');
  }, []);

  const { data: goalsData, error: goalsError, isLoading: goalsLoading } = useQuery({
    queryKey: ['myGoals'],
    queryFn: async () => {
      console.log('Fetching goals...');
      try {
        const result = await goalAPI.getMyGoals();
        console.log('Goals fetched successfully:', result);
        return result;
      } catch (error) {
        console.error('Error fetching goals:', error);
        throw error;
      }
    },
  });

  const { data: checkinsData, isLoading: checkinsLoading, error: checkinsError } = useQuery({
    queryKey: ['myCheckins', selectedQuarter],
    queryFn: async () => {
      console.log('Fetching checkins for quarter:', selectedQuarter);
      try {
        const result = await checkinAPI.getMyCheckins(selectedQuarter);
        console.log('Checkins fetched successfully:', result);
        return result;
      } catch (error) {
        console.error('Error fetching checkins:', error);
        throw error;
      }
    },
  });

  let goals = [];
  let checkins = [];
  try {
    goals = goalsData?.data?.filter(g => g.status === 'Approved') || [];
    checkins = checkinsData?.data || [];
    console.log('Processed data - Goals:', goals.length, 'Checkins:', checkins.length);
  } catch (error) {
    console.error('Error processing data:', error);
    message.error('Error processing data. Please refresh the page.');
  }

  const createMutation = useMutation({
    mutationFn: (data) => checkinAPI.createCheckin(data),
    onSuccess: () => {
      message.success('Check-in created successfully!');
      queryClient.invalidateQueries(['myCheckins']);
      setIsModalOpen(false);
      form.resetFields();
    },
    onError: (error) => {
      console.error('Create checkin error:', error);
      message.error(error.response?.data?.detail || 'Failed to create check-in');
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => checkinAPI.updateCheckin(id, data),
    onSuccess: () => {
      message.success('Check-in updated successfully!');
      queryClient.invalidateQueries(['myCheckins']);
      setIsModalOpen(false);
      form.resetFields();
    },
    onError: (error) => {
      console.error('Update checkin error:', error);
      message.error(error.response?.data?.detail || 'Failed to update check-in');
    },
  });

  const handleAddCheckin = (goal) => {
    try {
      console.log('Adding checkin for goal:', goal);
      setSelectedGoal(goal);
      form.setFieldsValue({ goal_id: goal.id, quarter: selectedQuarter });
      setIsModalOpen(true);
    } catch (error) {
      console.error('Error in handleAddCheckin:', error);
      message.error('Error opening check-in form');
    }
  };

  const handleSubmit = (values) => {
    try {
      console.log('Submitting checkin:', values);
      const existingCheckin = checkins.find(c => c.goal_id === values.goal_id && c.quarter === values.quarter);
      if (existingCheckin) {
        updateMutation.mutate({ id: existingCheckin.id, data: values });
      } else {
        createMutation.mutate(values);
      }
    } catch (error) {
      console.error('Error in handleSubmit:', error);
      message.error('Error submitting check-in');
    }
  };

  const getProgressColor = (score) => {
    if (score >= 100) return '#10b981';
    if (score >= 75) return '#667eea';
    if (score >= 50) return '#f59e0b';
    return '#ef4444';
  };

  if (goalsLoading || checkinsLoading) {
    return (
      <div style={{ background: '#0d0d14', minHeight: '100vh', padding: '24px',
        display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: '16px' }}>Loading check-ins...</div>
      </div>
    );
  }

  if (goalsError || checkinsError) {
    return (
      <div style={{ background: '#0d0d14', minHeight: '100vh', padding: '24px' }}>
        <div style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)',
          borderRadius: '16px', padding: '24px', color: '#fca5a5' }}>
          <h3 style={{ color: '#fca5a5', marginBottom: '8px' }}>Error loading data:</h3>
          <p>Goals Error: {goalsError?.message}</p>
          <p>Checkins Error: {checkinsError?.message}</p>
          <button onClick={() => window.location.reload()}
            style={{ padding: '8px 16px', background: 'rgba(239,68,68,0.2)', border: '1px solid rgba(239,68,68,0.4)',
              borderRadius: '8px', color: '#fca5a5', cursor: 'pointer' }}>
            Reload Page
          </button>
        </div>
      </div>
    );
  }

  const completedCheckins = checkins.filter(c => c.status === 'Completed').length;
  const onTrackCheckins = checkins.filter(c => c.status === 'On Track').length;
  let goalsWithoutCheckins = [];
  try {
    goalsWithoutCheckins = goals.filter(goal =>
      !checkins.some(c => c.goal_id === goal.id && c.quarter === selectedQuarter)
    );
  } catch (error) {
    console.error('Error filtering goals:', error);
  }

  const columns = [
    {
      title: 'Goal',
      dataIndex: 'goal_id',
      key: 'goal',
      render: (goalId) => {
        try {
          const goal = goals.find(g => g.id === goalId);
          return <span style={{ color: 'white', fontWeight: 500 }}>{goal?.title || 'N/A'}</span>;
        } catch { return 'Error'; }
      },
    },
    {
      title: 'Quarter',
      dataIndex: 'quarter',
      key: 'quarter',
      render: (v) => <span style={{ color: 'rgba(255,255,255,0.6)' }}>{v}</span>,
    },
    {
      title: 'Planned Target',
      dataIndex: 'planned_target',
      key: 'planned_target',
      render: (v) => <span style={{ color: 'rgba(255,255,255,0.6)' }}>{v}</span>,
    },
    {
      title: 'Actual Achievement',
      dataIndex: 'actual_achievement',
      key: 'actual_achievement',
      render: (val) => <span style={{ color: val ? 'white' : 'rgba(255,255,255,0.3)' }}>{val || '-'}</span>,
    },
    {
      title: 'Progress',
      dataIndex: 'progress_score',
      key: 'progress_score',
      render: (score) => {
        try {
          if (!score) return <span style={{ color: 'rgba(255,255,255,0.3)' }}>-</span>;
          const pct = Math.round(score);
          return (
            <div style={{ width: '120px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                <span style={{ color: getProgressColor(score), fontSize: '12px', fontWeight: 600 }}>{pct}%</span>
              </div>
              <div style={{ height: '4px', background: 'rgba(255,255,255,0.08)', borderRadius: '2px', overflow: 'hidden' }}>
                <div style={{ height: '100%', width: `${Math.min(pct, 100)}%`,
                  background: getProgressColor(score), borderRadius: '2px', transition: 'width 0.4s ease' }} />
              </div>
            </div>
          );
        } catch { return 'Error'; }
      },
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status) => statusBadge(status),
    },
    {
      title: 'Manager Comment',
      dataIndex: 'manager_comment',
      key: 'manager_comment',
      render: (comment) => <span style={{ color: comment ? 'rgba(255,255,255,0.6)' : 'rgba(255,255,255,0.3)' }}>{comment || '-'}</span>,
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_, record) => {
        try {
          const goal = goals.find(g => g.id === record.goal_id);
          return (
            <button
              onClick={() => {
                setSelectedGoal(goal);
                form.setFieldsValue({
                  goal_id: record.goal_id,
                  quarter: record.quarter,
                  actual_achievement: record.actual_achievement,
                  status: record.status,
                });
                setIsModalOpen(true);
              }}
              style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '6px 12px',
                background: 'rgba(167,139,250,0.1)', border: '1px solid rgba(167,139,250,0.3)',
                borderRadius: '8px', color: '#a78bfa', fontWeight: 600, cursor: 'pointer', fontSize: '13px' }}>
              <EditOutlined /> Update
            </button>
          );
        } catch { return 'Error'; }
      },
    },
  ];

  return (
    <div style={{ background: '#0d0d14', minHeight: '100vh', padding: '24px' }}>
      {/* Page Header */}
      <motion.div initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} style={{ marginBottom: '24px' }}>
        <h1 style={{ color: 'white', fontSize: '1.6rem', fontWeight: 700, margin: '0 0 4px' }}>Quarterly Check-ins</h1>
        <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '14px', margin: 0 }}>Track your progress against approved goals each quarter</p>
      </motion.div>

      {/* KPI Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px', marginBottom: '24px' }}>
        <KpiCard icon="📋" label="Approved Goals" value={goals.length} sub="Eligible for check-ins"
          gradient="linear-gradient(135deg,#667eea,#764ba2)" delay={0} />
        <KpiCard icon="✅" label="Completed" value={completedCheckins} sub={`${selectedQuarter} Quarter`}
          gradient="linear-gradient(135deg,#10b981,#059669)" delay={0.08} />
        <KpiCard icon="🔵" label="On Track" value={onTrackCheckins} sub="In progress"
          gradient="linear-gradient(135deg,#3b82f6,#2563eb)" delay={0.16} />
        <KpiCard icon="⚪" label="Pending Check-in" value={goalsWithoutCheckins.length}
          sub={goalsWithoutCheckins.length > 0 ? 'Action needed' : 'All done!'}
          gradient={goalsWithoutCheckins.length > 0 ? 'linear-gradient(135deg,#ef4444,#dc2626)' : 'linear-gradient(135deg,#10b981,#059669)'}
          delay={0.24} />
      </div>

      {/* Main Card */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3, duration: 0.5 }}
        style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '16px' }}>

        {/* Card Header */}
        <div style={{ padding: '20px 24px', borderBottom: '1px solid rgba(255,255,255,0.06)',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <h2 style={{ color: 'white', fontSize: '1.1rem', fontWeight: 700, margin: 0 }}>📋 Quarterly Check-ins</h2>
          <Select value={selectedQuarter} onChange={setSelectedQuarter}
            style={{ width: 160 }}
            dropdownStyle={{ background: 'rgba(8,8,8,0.97)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px' }}>
            <Option value="Q1">Q1 (July)</Option>
            <Option value="Q2">Q2 (October)</Option>
            <Option value="Q3">Q3 (January)</Option>
            <Option value="Q4">Q4 (March/April)</Option>
          </Select>
        </div>

        <div style={{ padding: '20px 24px' }}>
          {/* Pending check-ins alert */}
          {goalsWithoutCheckins.length > 0 && (
            <div style={{ marginBottom: '20px', padding: '16px 20px',
              background: 'rgba(59,130,246,0.06)', borderRadius: '12px',
              border: '1px solid rgba(59,130,246,0.2)' }}>
              <div style={{ fontWeight: 600, color: '#93c5fd', marginBottom: '12px', fontSize: '14px' }}>
                📌 Goals pending check-in for {selectedQuarter}:
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {goalsWithoutCheckins.map(goal => (
                  <div key={goal.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                    padding: '10px 14px', background: 'rgba(255,255,255,0.03)', borderRadius: '8px',
                    border: '1px solid rgba(255,255,255,0.06)' }}>
                    <span style={{ fontWeight: 500, color: 'rgba(255,255,255,0.8)' }}>{goal.title}</span>
                    <button onClick={() => handleAddCheckin(goal)}
                      style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '6px 12px',
                        background: 'linear-gradient(135deg,#667eea,#764ba2)', border: 'none',
                        borderRadius: '8px', color: 'white', fontWeight: 600, cursor: 'pointer', fontSize: '13px' }}>
                      <PlusOutlined /> Add Check-in
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Check-ins Table */}
          <Table
            columns={columns}
            dataSource={checkins}
            rowKey="id"
            loading={checkinsLoading}
            pagination={false}
            style={{ background: 'transparent' }}
          />
        </div>
      </motion.div>

      {/* Check-in Modal */}
      <Modal
        title="Update Check-in"
        open={isModalOpen}
        onCancel={() => { setIsModalOpen(false); form.resetFields(); }}
        footer={null}
        width={600}
      >
        <Form form={form} layout="vertical" onFinish={handleSubmit}>
          <Form.Item name="goal_id" hidden><Input /></Form.Item>
          <Form.Item name="quarter" hidden><Input /></Form.Item>

          {selectedGoal && (
            <div style={{ marginBottom: '16px', padding: '12px 16px',
              background: 'rgba(255,255,255,0.04)', borderRadius: '10px',
              border: '1px solid rgba(255,255,255,0.08)' }}>
              <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: '12px', marginBottom: '4px' }}>Goal</div>
              <div style={{ color: 'white', fontWeight: 600, marginBottom: '8px' }}>{selectedGoal.title}</div>
              <div style={{ display: 'flex', gap: '16px' }}>
                <span style={{ color: 'rgba(255,255,255,0.4)', fontSize: '13px' }}>
                  Target: <span style={{ color: 'rgba(255,255,255,0.7)' }}>{selectedGoal.target}</span>
                </span>
                <span style={{ color: 'rgba(255,255,255,0.4)', fontSize: '13px' }}>
                  UoM: <span style={{ color: 'rgba(255,255,255,0.7)' }}>{selectedGoal.uom_type}</span>
                </span>
              </div>
            </div>
          )}

          <Form.Item name="actual_achievement" label="Actual Achievement"
            rules={[{ required: true, message: 'Please enter actual achievement' }]}>
            <Input placeholder="Enter actual achievement value" />
          </Form.Item>

          <Form.Item name="status" label="Status"
            rules={[{ required: true, message: 'Please select status' }]}>
            <Select placeholder="Select status">
              <Option value="Not Started">Not Started</Option>
              <Option value="On Track">On Track</Option>
              <Option value="Completed">Completed</Option>
            </Select>
          </Form.Item>

          <Form.Item>
            <Button type="primary" htmlType="submit" loading={createMutation.isPending || updateMutation.isPending}>
              Submit
            </Button>
            <Button style={{ marginLeft: 8 }} onClick={() => { setIsModalOpen(false); form.resetFields(); }}>
              Cancel
            </Button>
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
      `}</style>
    </div>
  );
};

export default EmployeeCheckins;
