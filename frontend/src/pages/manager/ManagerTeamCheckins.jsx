import React, { useState } from 'react';
import { Table, Select, Progress, Button, Modal, Form, Input, message, Tag } from 'antd';
import { CommentOutlined } from '@ant-design/icons';
import { motion } from 'framer-motion';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { checkinAPI } from '../../services/api';

const { TextArea } = Input;
const { Option } = Select;

/* ── shared dark card ── */
const DarkCard = ({ children, style = {} }) => (
  <div style={{
    background: 'rgba(255,255,255,0.04)',
    border: '1px solid rgba(255,255,255,0.08)',
    borderRadius: '16px', ...style
  }}>{children}</div>
);

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

const ManagerTeamCheckins = () => {
  const [selectedQuarter, setSelectedQuarter] = useState('Q1');
  const [commentModalOpen, setCommentModalOpen] = useState(false);
  const [selectedCheckin, setSelectedCheckin] = useState(null);
  const [form] = Form.useForm();
  const queryClient = useQueryClient();

  const { data: checkinsData, isLoading } = useQuery({
    queryKey: ['teamCheckins', selectedQuarter],
    queryFn: () => checkinAPI.getTeamCheckins(selectedQuarter),
  });

  const checkins = checkinsData?.data || [];

  const commentMutation = useMutation({
    mutationFn: ({ id, data }) => checkinAPI.updateCheckin(id, data),
    onSuccess: () => {
      message.success('Comment saved!');
      queryClient.invalidateQueries(['teamCheckins']);
      setCommentModalOpen(false);
      form.resetFields();
    },
    onError: (err) => message.error(err.response?.data?.detail || 'Failed to save comment'),
  });

  const handleAddComment = (checkin) => {
    setSelectedCheckin(checkin);
    form.setFieldsValue({ manager_comment: checkin.manager_comment || '' });
    setCommentModalOpen(true);
  };

  const handleCommentSubmit = (values) => {
    commentMutation.mutate({ id: selectedCheckin.check_in_id, data: values });
  };

  /* stats */
  const completed = checkins.filter(c => c.status === 'Completed').length;
  const onTrack = checkins.filter(c => c.status === 'On Track').length;
  const notStarted = checkins.filter(c => c.status === 'Not Started').length;
  const teamMembers = [...new Set(checkins.map(c => c.employee_id))].length;
  const completionPct = checkins.length > 0 ? Math.round((completed / checkins.length) * 100) : 0;

  const employeeStats = checkins.reduce((acc, c) => {
    if (!acc[c.employee_id]) acc[c.employee_id] = { name: c.employee_name, total: 0, completed: 0, onTrack: 0, notStarted: 0 };
    acc[c.employee_id].total++;
    if (c.status === 'Completed') acc[c.employee_id].completed++;
    if (c.status === 'On Track') acc[c.employee_id].onTrack++;
    if (c.status === 'Not Started') acc[c.employee_id].notStarted++;
    return acc;
  }, {});

  const statusBadge = (status) => {
    const map = {
      'Not Started': { bg: 'rgba(255,255,255,0.06)', color: 'rgba(255,255,255,0.5)', dot: '#6b7280' },
      'On Track':    { bg: 'rgba(59,130,246,0.12)',  color: '#93c5fd',               dot: '#3b82f6' },
      'Completed':   { bg: 'rgba(16,185,129,0.12)',  color: '#6ee7b7',               dot: '#10b981' },
    };
    const s = map[status] || map['Not Started'];
    return (
      <span style={{ display: 'inline-flex', alignItems: 'center', gap: '5px',
        padding: '3px 10px', borderRadius: '20px', fontSize: '12px', fontWeight: 600,
        background: s.bg, color: s.color }}>
        <span style={{ width: '5px', height: '5px', borderRadius: '50%', background: s.dot, display: 'inline-block' }} />
        {status}
      </span>
    );
  };

  const columns = [
    {
      title: 'Employee', dataIndex: 'employee_name', key: 'employee_name', width: 140,
      render: (name) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div style={{ width: '28px', height: '28px', borderRadius: '50%', flexShrink: 0,
            background: 'linear-gradient(135deg,#667eea,#a78bfa)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: 'white', fontWeight: 700, fontSize: '11px' }}>
            {name?.charAt(0)}
          </div>
          <span style={{ color: 'rgba(255,255,255,0.85)', fontSize: '13px', fontWeight: 500 }}>{name}</span>
        </div>
      ),
    },
    {
      title: 'Goal', dataIndex: 'goal_title', key: 'goal_title', width: 220,
      render: (v) => <span style={{ color: 'rgba(255,255,255,0.75)', fontSize: '13px' }}>{v}</span>,
    },
    {
      title: 'Quarter', dataIndex: 'quarter', key: 'quarter', width: 80,
      render: (v) => <span style={{ color: '#a78bfa', fontWeight: 600, fontSize: '12px' }}>{v}</span>,
    },
    {
      title: 'Planned', dataIndex: 'planned_target', key: 'planned_target', width: 100,
      render: (v) => <span style={{ color: 'rgba(255,255,255,0.6)', fontSize: '13px' }}>{v || '-'}</span>,
    },
    {
      title: 'Actual', dataIndex: 'actual_achievement', key: 'actual_achievement', width: 100,
      render: (v) => <span style={{ color: 'rgba(255,255,255,0.6)', fontSize: '13px' }}>{v || '-'}</span>,
    },
    {
      title: 'Progress', dataIndex: 'progress_score', key: 'progress_score', width: 160,
      render: (score) => score ? (
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div style={{ flex: 1, height: '5px', background: 'rgba(255,255,255,0.08)', borderRadius: '3px', overflow: 'hidden' }}>
            <div style={{ height: '100%', width: `${Math.min(Math.round(score), 100)}%`, borderRadius: '3px',
              background: score >= 100 ? '#10b981' : score >= 75 ? '#3b82f6' : '#f59e0b' }} />
          </div>
          <span style={{ color: 'rgba(255,255,255,0.6)', fontSize: '12px', minWidth: '32px' }}>{Math.round(score)}%</span>
        </div>
      ) : <span style={{ color: 'rgba(255,255,255,0.3)' }}>—</span>,
    },
    {
      title: 'Status', dataIndex: 'status', key: 'status', width: 120,
      render: (status) => statusBadge(status),
    },
    {
      title: 'Comment', dataIndex: 'manager_comment', key: 'manager_comment', width: 180, ellipsis: true,
      render: (c) => <span style={{ color: c ? 'rgba(255,255,255,0.6)' : 'rgba(255,255,255,0.2)', fontSize: '12px' }}>{c || 'No comment'}</span>,
    },
    {
      title: '', key: 'actions', width: 90, fixed: 'right',
      render: (_, record) => (
        <button onClick={() => handleAddComment(record)}
          style={{ background: 'rgba(102,126,234,0.12)', border: '1px solid rgba(102,126,234,0.25)',
            borderRadius: '8px', padding: '5px 10px', cursor: 'pointer',
            color: '#a78bfa', fontSize: '12px', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '4px' }}>
          <CommentOutlined /> Add
        </button>
      ),
    },
  ];

  return (
    <div style={{ color: 'white', fontFamily: 'Inter, sans-serif' }}>

      {/* Page header */}
      <motion.div initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}
        style={{ marginBottom: '24px' }}>
        <h1 style={{ color: 'white', fontSize: '1.6rem', fontWeight: 700, margin: '0 0 4px' }}>Team Check-ins</h1>
        <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '14px', margin: 0 }}>
          Monitor your team's quarterly progress and add feedback comments.
        </p>
      </motion.div>

      {/* KPI cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(160px,1fr))', gap: '14px', marginBottom: '24px' }}>
        <KpiCard icon="📊" label="Total Check-ins" value={checkins.length} sub={selectedQuarter} gradient="linear-gradient(135deg,#667eea,#764ba2)" delay={0} />
        <KpiCard icon="✅" label="Completed" value={completed} sub={`${completionPct}% done`} gradient="linear-gradient(135deg,#10b981,#059669)" delay={0.07} />
        <KpiCard icon="🔵" label="On Track" value={onTrack} sub="In progress" gradient="linear-gradient(135deg,#3b82f6,#2563eb)" delay={0.14} />
        <KpiCard icon="⚪" label="Not Started" value={notStarted} gradient="linear-gradient(135deg,#6b7280,#4b5563)" delay={0.21} />
        <KpiCard icon="👥" label="Team Members" value={teamMembers} sub="Active" gradient="linear-gradient(135deg,#f59e0b,#d97706)" delay={0.28} />
      </div>

      {/* Employee summary cards */}
      {Object.keys(employeeStats).length > 0 && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(200px,1fr))', gap: '12px', marginBottom: '24px' }}>
          {Object.values(employeeStats).map((stat, i) => (
            <motion.div key={i} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 + i * 0.05 }}
              style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)',
                borderRadius: '12px', padding: '16px' }}>
              <div style={{ color: 'white', fontWeight: 600, fontSize: '14px', marginBottom: '10px' }}>{stat.name}</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
                {[
                  { label: 'Total', value: stat.total, color: 'rgba(255,255,255,0.5)' },
                  { label: '✅ Completed', value: stat.completed, color: '#6ee7b7' },
                  { label: '🔵 On Track', value: stat.onTrack, color: '#93c5fd' },
                  { label: '⚪ Not Started', value: stat.notStarted, color: 'rgba(255,255,255,0.3)' },
                ].map((row, j) => (
                  <div key={j} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px' }}>
                    <span style={{ color: 'rgba(255,255,255,0.4)' }}>{row.label}</span>
                    <span style={{ color: row.color, fontWeight: 600 }}>{row.value}</span>
                  </div>
                ))}
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Main table */}
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
        <DarkCard>
          {/* Table header */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            padding: '18px 24px', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
            <div style={{ color: 'white', fontWeight: 600, fontSize: '15px' }}>Check-in Records</div>
            <select value={selectedQuarter} onChange={e => setSelectedQuarter(e.target.value)}
              style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: '8px', color: 'white', padding: '6px 12px', fontSize: '13px',
                cursor: 'pointer', outline: 'none' }}>
              <option value="Q1" style={{ background: '#111' }}>Q1 (July)</option>
              <option value="Q2" style={{ background: '#111' }}>Q2 (October)</option>
              <option value="Q3" style={{ background: '#111' }}>Q3 (January)</option>
              <option value="Q4" style={{ background: '#111' }}>Q4 (March/April)</option>
            </select>
          </div>

          <div style={{ padding: '0' }}>
            {false && (
              <div style={{ padding: '10px 20px', background: 'rgba(245,158,11,0.08)',
                borderBottom: '1px solid rgba(245,158,11,0.15)',
                display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ fontSize: '14px' }}>👁️</span>
                <span style={{ color: 'rgba(245,158,11,0.9)', fontSize: '12px', fontWeight: 500 }}>
                  Preview mode — showing sample data. Real check-ins appear here once your team submits them.
                </span>
              </div>
            )}
            <Table
              columns={columns}
              dataSource={checkins}
              rowKey="check_in_id"
              loading={isLoading}
              scroll={{ x: 1100 }}
              pagination={{ pageSize: 20, showTotal: (t) => <span style={{ color: 'rgba(255,255,255,0.4)' }}>Total {t} records</span> }}
              locale={{ emptyText: (
                <div style={{ padding: '40px', textAlign: 'center' }}>
                  <div style={{ fontSize: '32px', marginBottom: '10px' }}>📋</div>
                  <div style={{ color: 'rgba(255,255,255,0.5)', fontWeight: 600 }}>No check-ins for {selectedQuarter}</div>
                  <div style={{ color: 'rgba(255,255,255,0.3)', fontSize: '13px', marginTop: '4px' }}>
                    Team members haven't submitted check-ins for this quarter yet.
                  </div>
                </div>
              )}}
            />
          </div>
        </DarkCard>
      </motion.div>

      {/* Comment Modal */}
      {commentModalOpen && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)',
          backdropFilter: 'blur(4px)', zIndex: 200, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
          onClick={() => setCommentModalOpen(false)}>
          <motion.div initial={{ opacity: 0, scale: 0.93 }} animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.25 }}
            onClick={e => e.stopPropagation()}
            style={{ width: '480px', background: 'rgba(13,13,20,0.98)', backdropFilter: 'blur(24px)',
              border: '1px solid rgba(255,255,255,0.1)', borderRadius: '18px', padding: '28px',
              fontFamily: 'Inter, sans-serif' }}>
            <div style={{ color: 'white', fontWeight: 700, fontSize: '16px', marginBottom: '16px' }}>
              Add Manager Comment
            </div>

            {selectedCheckin && (
              <div style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)',
                borderRadius: '10px', padding: '14px', marginBottom: '16px' }}>
                {[
                  ['Employee', selectedCheckin.employee_name],
                  ['Goal', selectedCheckin.goal_title],
                  ['Quarter', selectedCheckin.quarter],
                  ['Progress', selectedCheckin.progress_score ? `${Math.round(selectedCheckin.progress_score)}%` : 'N/A'],
                ].map(([k, v]) => (
                  <div key={k} style={{ display: 'flex', gap: '8px', marginBottom: '6px', fontSize: '13px' }}>
                    <span style={{ color: 'rgba(255,255,255,0.4)', minWidth: '70px' }}>{k}:</span>
                    <span style={{ color: 'rgba(255,255,255,0.8)', fontWeight: 500 }}>{v}</span>
                  </div>
                ))}
              </div>
            )}

            <Form form={form} layout="vertical" onFinish={handleCommentSubmit}>
              <Form.Item name="manager_comment" rules={[{ required: true, message: 'Please enter a comment' }]}>
                <textarea
                  rows={4}
                  placeholder="Document your discussion with the employee..."
                  value={form.getFieldValue('manager_comment') || ''}
                  onChange={e => form.setFieldsValue({ manager_comment: e.target.value })}
                  style={{ width: '100%', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)',
                    borderRadius: '10px', color: 'white', padding: '12px', fontSize: '14px',
                    outline: 'none', resize: 'vertical', fontFamily: 'Inter, sans-serif', boxSizing: 'border-box' }}
                />
              </Form.Item>
              <div style={{ display: 'flex', gap: '10px', marginTop: '4px' }}>
                <button type="submit" disabled={commentMutation.isPending}
                  onClick={() => form.submit()}
                  style={{ flex: 1, padding: '11px', background: 'linear-gradient(135deg,#667eea,#764ba2)',
                    border: 'none', borderRadius: '10px', color: 'white', fontWeight: 600,
                    fontSize: '14px', cursor: 'pointer' }}>
                  {commentMutation.isPending ? 'Saving…' : 'Save Comment'}
                </button>
                <button type="button" onClick={() => setCommentModalOpen(false)}
                  style={{ padding: '11px 20px', background: 'rgba(255,255,255,0.06)',
                    border: '1px solid rgba(255,255,255,0.1)', borderRadius: '10px',
                    color: 'rgba(255,255,255,0.6)', fontWeight: 600, fontSize: '14px', cursor: 'pointer' }}>
                  Cancel
                </button>
              </div>
            </Form>
          </motion.div>
        </div>
      )}

      <style>{`
        .ant-table { background: transparent !important; }
        .ant-table-thead > tr > th {
          background: rgba(255,255,255,0.04) !important;
          color: rgba(255,255,255,0.5) !important;
          font-size: 11px !important; font-weight: 700 !important;
          letter-spacing: 0.8px !important; text-transform: uppercase !important;
          border-bottom: 1px solid rgba(255,255,255,0.06) !important;
          border-top: none !important;
        }
        .ant-table-tbody > tr > td {
          background: transparent !important;
          border-bottom: 1px solid rgba(255,255,255,0.04) !important;
          padding: 14px 16px !important;
        }
        .ant-table-tbody > tr:hover > td { background: rgba(255,255,255,0.03) !important; }
        .ant-table-wrapper .ant-spin-nested-loading { background: transparent !important; }
        .ant-pagination-item a { color: rgba(255,255,255,0.5) !important; }
        .ant-pagination-item-active { background: rgba(102,126,234,0.2) !important; border-color: rgba(102,126,234,0.4) !important; }
        .ant-pagination-item-active a { color: #a78bfa !important; }
        .ant-pagination-prev button, .ant-pagination-next button { color: rgba(255,255,255,0.4) !important; }
        .ant-empty-description { color: rgba(255,255,255,0.3) !important; }
      `}</style>
    </div>
  );
};

export default ManagerTeamCheckins;

