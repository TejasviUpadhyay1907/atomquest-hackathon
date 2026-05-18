import React, { useState } from 'react';
import { Button, Table, Space, Modal, Form, Input, Select, InputNumber, message, Tooltip, Popconfirm } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, SendOutlined, LockOutlined, BulbOutlined } from '@ant-design/icons';
import { motion } from 'framer-motion';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { goalAPI, thrustAreaAPI, aiAPI } from '../../services/api';

const { TextArea } = Input;
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
  return (
    <span style={{ padding: '3px 10px', borderRadius: '20px', fontSize: '12px', fontWeight: 600, background: s.bg, color: s.color }}>
      {status === 'Approved' && '✅ '}{status === 'Rejected' && '❌ '}{status === 'Pending Approval' && '⏳ '}{status === 'Draft' && '📝 '}{status}
    </span>
  );
};

const EmployeeGoals = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingGoal, setEditingGoal] = useState(null);
  const [aiLoading, setAiLoading] = useState(false);
  const [form] = Form.useForm();
  const queryClient = useQueryClient();

  const { data: goalsData, isLoading } = useQuery({ queryKey: ['myGoals'], queryFn: () => goalAPI.getMyGoals() });
  const { data: thrustAreasData } = useQuery({ queryKey: ['thrustAreas'], queryFn: () => thrustAreaAPI.getThrustAreas() });
  const { data: validationData } = useQuery({ queryKey: ['validation'], queryFn: () => goalAPI.checkValidation(), refetchInterval: 5000 });

  const goals = goalsData?.data || [];
  const thrustAreas = thrustAreasData?.data || [];
  const validation = validationData?.data || {};

  const createMutation = useMutation({
    mutationFn: (data) => goalAPI.createGoal(data),
    onSuccess: () => { message.success('Goal created!'); queryClient.invalidateQueries(['myGoals']); queryClient.invalidateQueries(['validation']); setIsModalOpen(false); form.resetFields(); },
    onError: (err) => message.error(err.response?.data?.detail || 'Failed to create goal'),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => goalAPI.updateGoal(id, data),
    onSuccess: () => { message.success('Goal updated!'); queryClient.invalidateQueries(['myGoals']); queryClient.invalidateQueries(['validation']); setIsModalOpen(false); setEditingGoal(null); form.resetFields(); },
    onError: (err) => message.error(err.response?.data?.detail || 'Failed to update goal'),
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => goalAPI.deleteGoal(id),
    onSuccess: () => { message.success('Goal deleted!'); queryClient.invalidateQueries(['myGoals']); queryClient.invalidateQueries(['validation']); },
    onError: (err) => message.error(err.response?.data?.detail || 'Failed to delete goal'),
  });

  const submitMutation = useMutation({
    mutationFn: (id) => goalAPI.submitGoal(id),
    onSuccess: () => { message.success('Goal submitted!'); queryClient.invalidateQueries(['myGoals']); queryClient.invalidateQueries(['validation']); },
    onError: (err) => message.error(err.response?.data?.detail || 'Failed to submit goal'),
  });

  const handleCreate = () => { setEditingGoal(null); form.resetFields(); setIsModalOpen(true); };
  const handleEdit = (goal) => { setEditingGoal(goal); form.setFieldsValue(goal); setIsModalOpen(true); };
  const handleSubmit = (values) => { if (editingGoal) { updateMutation.mutate({ id: editingGoal.id, data: values }); } else { createMutation.mutate(values); } };

  const handleAISuggest = async () => {
    setAiLoading(true);
    try {
      const response = await aiAPI.suggestGoals({ role: 'Employee', department: 'Engineering' });
      const suggestions = response.data.suggestions;
      if (suggestions && suggestions.length > 0) {
        const s = suggestions[0];
        form.setFieldsValue({ title: s.title, description: s.description, target: s.target, uom_type: s.uom_type, weightage: s.suggested_weightage });
        message.success('AI suggestion applied!');
      }
    } catch { message.warning('AI suggestions not available.'); }
    finally { setAiLoading(false); }
  };

  const handleSubmitAll = () => {
    const draftGoals = goals.filter(g => g.status === 'Draft');
    if (draftGoals.length === 0) { message.warning('No draft goals to submit'); return; }
    if (!validation.can_submit) { message.error(validation.errors?.join(', ') || 'Cannot submit goals'); return; }
    Modal.confirm({
      title: 'Submit All Goals?',
      content: `Submit ${draftGoals.length} goals for approval? Once submitted, you cannot edit them.`,
      onOk: () => { draftGoals.forEach(goal => submitMutation.mutate(goal.id)); },
    });
  };

  const draftCount = goals.filter(g => g.status === 'Draft').length;
  const approvedCount = goals.filter(g => g.status === 'Approved').length;
  const pendingCount = goals.filter(g => g.status === 'Pending Approval').length;
  const rejectedCount = goals.filter(g => g.status === 'Rejected').length;
  const totalWeightage = validation.total_weightage || 0;

  const columns = [
    { title: 'Title', dataIndex: 'title', key: 'title', width: 250, render: (v) => <span style={{ color: 'white', fontWeight: 500 }}>{v}</span> },
    { title: 'UoM Type', dataIndex: 'uom_type', key: 'uom_type', width: 120, render: (v) => <span style={{ color: 'rgba(255,255,255,0.6)' }}>{v}</span> },
    { title: 'Target', dataIndex: 'target', key: 'target', width: 100, render: (v) => <span style={{ color: 'rgba(255,255,255,0.6)' }}>{v}</span> },
    { title: 'Weightage', dataIndex: 'weightage', key: 'weightage', width: 100, render: (v) => <span style={{ color: '#a78bfa', fontWeight: 600 }}>{v}%</span> },
    { title: 'Status', dataIndex: 'status', key: 'status', width: 160, render: (status) => statusBadge(status) },
    { title: 'Locked', dataIndex: 'is_locked', key: 'is_locked', width: 70, render: (locked) => locked ? <LockOutlined style={{ color: '#f59e0b' }} /> : null },
    {
      title: 'Actions', key: 'actions', width: 160,
      render: (_, record) => (
        <Space>
          {!record.is_locked && record.status === 'Draft' && (
            <>
              <Tooltip title="Edit"><Button type="text" icon={<EditOutlined style={{ color: '#a78bfa' }} />} onClick={() => handleEdit(record)} /></Tooltip>
              <Tooltip title="Delete">
                <Popconfirm title="Delete this goal?" onConfirm={() => deleteMutation.mutate(record.id)}>
                  <Button type="text" icon={<DeleteOutlined style={{ color: '#ef4444' }} />} />
                </Popconfirm>
              </Tooltip>
            </>
          )}
          {record.status === 'Rejected' && (
            <Tooltip title={record.rejection_reason}>
              <span style={{ padding: '3px 10px', borderRadius: '20px', fontSize: '12px', fontWeight: 600, background: 'rgba(239,68,68,0.12)', color: '#fca5a5', cursor: 'pointer' }}>View Feedback</span>
            </Tooltip>
          )}
        </Space>
      ),
    },
  ];

  return (
    <div style={{ fontFamily: 'Inter, sans-serif' }}>
      <motion.div initial={{ opacity:0, y:-12 }} animate={{ opacity:1, y:0 }} transition={{ duration:0.5 }} style={{ marginBottom:'24px' }}>
        <h1 style={{ color:'white', fontSize:'1.6rem', fontWeight:700, margin:'0 0 4px' }}>My Goals</h1>
        <p style={{ color:'rgba(255,255,255,0.4)', fontSize:'14px', margin:0 }}>Create, manage and submit your performance goals</p>
      </motion.div>

      <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(160px,1fr))', gap:'16px', marginBottom:'24px' }}>
        <KpiCard icon="🎯" label="Total Goals" value={goals.length} sub={`${goals.length} / 8 max`} gradient="linear-gradient(135deg,#667eea,#764ba2)" delay={0} />
        <KpiCard icon="✅" label="Approved" value={approvedCount} sub="Ready for check-ins" gradient="linear-gradient(135deg,#10b981,#059669)" delay={0.08} />
        <KpiCard icon="⏳" label="Pending Approval" value={pendingCount} sub="Awaiting review" gradient="linear-gradient(135deg,#f59e0b,#d97706)" delay={0.16} />
        <KpiCard icon="📊" label="Total Weightage" value={`${totalWeightage}%`} sub={totalWeightage === 100 ? '✅ Ready to submit' : `${100 - totalWeightage}% remaining`} gradient="linear-gradient(135deg,#667eea,#a78bfa)" delay={0.24} />
      </div>

      <motion.div initial={{ opacity:0, y:20 }} animate={{ opacity:1, y:0 }} transition={{ delay:0.3, duration:0.5 }}
        style={{ background:'rgba(255,255,255,0.04)', border:'1px solid rgba(255,255,255,0.08)', borderRadius:'16px' }}>
        <div style={{ padding:'20px 24px', borderBottom:'1px solid rgba(255,255,255,0.06)', display:'flex', alignItems:'center', justifyContent:'space-between' }}>
          <h2 style={{ color:'white', fontSize:'1.1rem', fontWeight:700, margin:0 }}>🎯 My Goals</h2>
          <Space>
            <button onClick={handleCreate} disabled={goals.length >= 8}
              style={{ display:'flex', alignItems:'center', gap:'6px', padding:'8px 16px',
                background: goals.length >= 8 ? 'rgba(255,255,255,0.06)' : 'linear-gradient(135deg,#667eea,#764ba2)',
                border:'none', borderRadius:'8px', color: goals.length >= 8 ? 'rgba(255,255,255,0.3)' : 'white',
                fontWeight:600, fontSize:'14px', cursor: goals.length >= 8 ? 'not-allowed' : 'pointer' }}>
              <PlusOutlined /> Create Goal
            </button>
            <button onClick={handleSubmitAll} disabled={!validation.can_submit}
              style={{ display:'flex', alignItems:'center', gap:'6px', padding:'8px 16px',
                background: validation.can_submit ? 'rgba(16,185,129,0.15)' : 'rgba(255,255,255,0.04)',
                border: `1px solid ${validation.can_submit ? 'rgba(16,185,129,0.4)' : 'rgba(255,255,255,0.08)'}`,
                borderRadius:'8px', color: validation.can_submit ? '#6ee7b7' : 'rgba(255,255,255,0.3)',
                fontWeight:600, fontSize:'14px', cursor: validation.can_submit ? 'pointer' : 'not-allowed' }}>
              <SendOutlined /> Submit All
            </button>
          </Space>
        </div>

        <div style={{ padding:'16px 24px', borderBottom:'1px solid rgba(255,255,255,0.06)',
          background: totalWeightage === 100 ? 'rgba(16,185,129,0.06)' : 'rgba(245,158,11,0.06)',
          display:'flex', alignItems:'center', gap:'24px', flexWrap:'wrap' }}>
          <div style={{ display:'flex', alignItems:'center', gap:'12px', flex:1, minWidth:'200px' }}>
            <span style={{ color:'rgba(255,255,255,0.6)', fontWeight:600, whiteSpace:'nowrap', fontSize:'13px' }}>Total Weightage:</span>
            <div style={{ flex:1, height:'6px', background:'rgba(255,255,255,0.08)', borderRadius:'3px', overflow:'hidden' }}>
              <div style={{ height:'100%', width:`${Math.min(totalWeightage, 100)}%`,
                background: totalWeightage === 100 ? '#10b981' : 'linear-gradient(90deg,#667eea,#a78bfa)',
                borderRadius:'3px', transition:'width 0.4s ease' }} />
            </div>
            <span style={{ color: totalWeightage === 100 ? '#10b981' : '#a78bfa', fontWeight:700, fontSize:'14px' }}>{totalWeightage}%</span>
          </div>
          <div style={{ display:'flex', gap:'16px', flexWrap:'wrap' }}>
            <span style={{ color:'rgba(255,255,255,0.5)', fontSize:'13px' }}>Goals: <span style={{ color:'#a78bfa', fontWeight:600 }}>{validation.goal_count || 0} / 8</span></span>
            <span style={{ color:'rgba(255,255,255,0.5)', fontSize:'13px' }}>Draft: <span style={{ color:'#f59e0b', fontWeight:600 }}>{draftCount}</span></span>
            <span style={{ color:'rgba(255,255,255,0.5)', fontSize:'13px' }}>Rejected: <span style={{ color:'#ef4444', fontWeight:600 }}>{rejectedCount}</span></span>
          </div>
          {validation.errors && validation.errors.length > 0 && (
            <div style={{ width:'100%', color:'#fca5a5', fontSize:'13px' }}>⚠️ {validation.errors.join(' • ')}</div>
          )}
        </div>

        <Table columns={columns} dataSource={goals} rowKey="id" loading={isLoading} pagination={false} />
      </motion.div>

      <Modal title={editingGoal ? 'Edit Goal' : 'Create New Goal'} open={isModalOpen}
        onCancel={() => { setIsModalOpen(false); setEditingGoal(null); form.resetFields(); }} footer={null} width={600}>
        <Form form={form} layout="vertical" onFinish={handleSubmit}>
          <Form.Item>
            <button type="button" onClick={handleAISuggest} disabled={aiLoading}
              style={{ width:'100%', padding:'10px', background:'rgba(167,139,250,0.1)', border:'1px solid rgba(167,139,250,0.3)',
                borderRadius:'8px', color:'#a78bfa', fontWeight:600, cursor:'pointer',
                display:'flex', alignItems:'center', justifyContent:'center', gap:'8px', fontSize:'14px' }}>
              <BulbOutlined /> {aiLoading ? 'Getting suggestions...' : '✨ Get AI Suggestion'}
            </button>
          </Form.Item>
          <Form.Item name="thrust_area_id" label="Thrust Area" rules={[{ required: true, message: 'Please select a thrust area' }]}>
            <Select placeholder="Select thrust area">{thrustAreas.map(ta => <Option key={ta.id} value={ta.id}>{ta.name}</Option>)}</Select>
          </Form.Item>
          <Form.Item name="title" label="Goal Title" rules={[{ required: true, message: 'Please enter goal title' }]}>
            <Input placeholder="Enter goal title" />
          </Form.Item>
          <Form.Item name="description" label="Description"><TextArea rows={3} placeholder="Describe your goal" /></Form.Item>
          <Form.Item name="uom_type" label="Unit of Measurement" rules={[{ required: true, message: 'Please select UoM type' }]}>
            <Select placeholder="Select UoM type">
              <Option value="Numeric">Numeric</Option><Option value="Percentage">Percentage</Option>
              <Option value="Timeline">Timeline</Option><Option value="Zero">Zero</Option>
            </Select>
          </Form.Item>
          <Form.Item name="target" label="Target" rules={[{ required: true, message: 'Please enter target' }]}>
            <Input placeholder="Enter target value" />
          </Form.Item>
          <Form.Item name="weightage" label="Weightage (%)" rules={[{ required: true, message: 'Please enter weightage' }, { type: 'number', min: 10, max: 100, message: 'Weightage must be between 10-100%' }]}>
            <InputNumber min={10} max={100} style={{ width: '100%' }} placeholder="Enter weightage (10-100)" />
          </Form.Item>
          <Form.Item>
            <Space>
              <Button type="primary" htmlType="submit" loading={createMutation.isPending || updateMutation.isPending}>{editingGoal ? 'Update' : 'Create'}</Button>
              <Button onClick={() => { setIsModalOpen(false); setEditingGoal(null); form.resetFields(); }}>Cancel</Button>
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
        .ant-btn-default { background: rgba(255,255,255,0.06) !important; border: 1px solid rgba(255,255,255,0.15) !important; color: rgba(255,255,255,0.7) !important; border-radius: 8px !important; }
        .ant-btn-default:hover { background: rgba(255,255,255,0.1) !important; border-color: rgba(255,255,255,0.25) !important; color: white !important; }
        .ant-btn-primary { background: linear-gradient(135deg,#667eea,#764ba2) !important; border: none !important; border-radius: 8px !important; }
        .ant-spin-dot-item { background: #a78bfa !important; }
        .ant-modal-confirm-title { color: white !important; }
        .ant-modal-confirm-content { color: rgba(255,255,255,0.6) !important; }
        .ant-table-wrapper .ant-spin-nested-loading, .ant-table-wrapper .ant-spin-container { background: transparent !important; }
      `}</style>
    </div>
  );
};

export default EmployeeGoals;
