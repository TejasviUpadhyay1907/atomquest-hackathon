import React, { useState } from 'react';
import { Card, Table, Select, Tag, Progress, Button, Modal, Form, Input, message } from 'antd';
import { CommentOutlined } from '@ant-design/icons';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { checkinAPI } from '../../services/api';

const { TextArea } = Input;
const { Option } = Select;

const ManagerTeamCheckins = () => {
  const [selectedQuarter, setSelectedQuarter] = useState('Q1');
  const [commentModalOpen, setCommentModalOpen] = useState(false);
  const [selectedCheckin, setSelectedCheckin] = useState(null);
  const [form] = Form.useForm();
  const queryClient = useQueryClient();

  // Fetch team check-ins
  const { data: checkinsData, isLoading } = useQuery({
    queryKey: ['teamCheckins', selectedQuarter],
    queryFn: () => checkinAPI.getTeamCheckins(selectedQuarter),
  });

  const checkins = checkinsData?.data || [];

  // Add comment mutation
  const commentMutation = useMutation({
    mutationFn: ({ id, data }) => checkinAPI.updateCheckin(id, data),
    onSuccess: () => {
      message.success('Comment added successfully!');
      queryClient.invalidateQueries(['teamCheckins']);
      setCommentModalOpen(false);
      form.resetFields();
    },
    onError: (error) => {
      message.error(error.response?.data?.detail || 'Failed to add comment');
    },
  });

  const handleAddComment = (checkin) => {
    setSelectedCheckin(checkin);
    form.setFieldsValue({
      manager_comment: checkin.manager_comment || '',
    });
    setCommentModalOpen(true);
  };

  const handleCommentSubmit = (values) => {
    commentMutation.mutate({
      id: selectedCheckin.check_in_id,
      data: values,
    });
  };

  const getProgressColor = (score) => {
    if (score >= 100) return 'success';
    if (score >= 75) return 'normal';
    if (score >= 50) return 'exception';
    return 'exception';
  };

  const columns = [
    {
      title: 'Employee',
      dataIndex: 'employee_name',
      key: 'employee_name',
      width: 150,
      fixed: 'left',
    },
    {
      title: 'Goal',
      dataIndex: 'goal_title',
      key: 'goal_title',
      width: 250,
    },
    {
      title: 'Quarter',
      dataIndex: 'quarter',
      key: 'quarter',
      width: 80,
    },
    {
      title: 'Planned',
      dataIndex: 'planned_target',
      key: 'planned_target',
      width: 100,
    },
    {
      title: 'Actual',
      dataIndex: 'actual_achievement',
      key: 'actual_achievement',
      width: 100,
      render: (val) => val || '-',
    },
    {
      title: 'Progress',
      dataIndex: 'progress_score',
      key: 'progress_score',
      width: 150,
      render: (score) => score ? (
        <Progress
          percent={Math.round(score)}
          status={getProgressColor(score)}
          size="small"
        />
      ) : '-',
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      width: 120,
      render: (status) => {
        const colors = {
          'Not Started': 'default',
          'On Track': 'processing',
          'Completed': 'success',
        };
        return <Tag color={colors[status]}>{status}</Tag>;
      },
    },
    {
      title: 'Manager Comment',
      dataIndex: 'manager_comment',
      key: 'manager_comment',
      width: 200,
      ellipsis: true,
      render: (comment) => comment || <span style={{ color: '#999' }}>No comment</span>,
    },
    {
      title: 'Actions',
      key: 'actions',
      width: 100,
      fixed: 'right',
      render: (_, record) => (
        <Button
          type="text"
          icon={<CommentOutlined />}
          onClick={() => handleAddComment(record)}
        >
          Comment
        </Button>
      ),
    },
  ];

  // Group by employee
  const employeeStats = checkins.reduce((acc, checkin) => {
    const empId = checkin.employee_id;
    if (!acc[empId]) {
      acc[empId] = {
        name: checkin.employee_name,
        total: 0,
        completed: 0,
        onTrack: 0,
        notStarted: 0,
      };
    }
    acc[empId].total++;
    if (checkin.status === 'Completed') acc[empId].completed++;
    if (checkin.status === 'On Track') acc[empId].onTrack++;
    if (checkin.status === 'Not Started') acc[empId].notStarted++;
    return acc;
  }, {});

  return (
    <div>
      {/* Metric Cards */}
      <div className="metrics-grid" style={{ marginBottom: 24 }}>
        <div className="metric-card">
          <div className="metric-icon" style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>
            📊
          </div>
          <div className="metric-content">
            <div className="metric-label">Total Check-ins</div>
            <div className="metric-value">{checkins.length}</div>
            <div className="metric-trend neutral">{selectedQuarter}</div>
          </div>
        </div>

        <div className="metric-card">
          <div className="metric-icon" style={{ background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)' }}>
            ✅
          </div>
          <div className="metric-content">
            <div className="metric-label">Completed</div>
            <div className="metric-value">{checkins.filter(c => c.status === 'Completed').length}</div>
            <div className="metric-trend up">
              {checkins.length > 0 ? Math.round((checkins.filter(c => c.status === 'Completed').length / checkins.length) * 100) : 0}% done
            </div>
          </div>
        </div>

        <div className="metric-card">
          <div className="metric-icon" style={{ background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)' }}>
            🎯
          </div>
          <div className="metric-content">
            <div className="metric-label">On Track</div>
            <div className="metric-value">{checkins.filter(c => c.status === 'On Track').length}</div>
            <div className="metric-trend neutral">In progress</div>
          </div>
        </div>

        <div className="metric-card">
          <div className="metric-icon" style={{ background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)' }}>
            👥
          </div>
          <div className="metric-content">
            <div className="metric-label">Team Members</div>
            <div className="metric-value">{Object.keys(employeeStats).length}</div>
            <div className="metric-trend neutral">Active employees</div>
          </div>
        </div>
      </div>

      <Card
        title="Team Check-ins"
        extra={
          <Select
            value={selectedQuarter}
            onChange={setSelectedQuarter}
            style={{ width: 120 }}
          >
            <Option value="Q1">Q1 (July)</Option>
            <Option value="Q2">Q2 (October)</Option>
            <Option value="Q3">Q3 (January)</Option>
            <Option value="Q4">Q4 (March/April)</Option>
          </Select>
        }
        className="modern-card"
      >
        {/* Summary Cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16, marginBottom: 24 }}>
          {Object.values(employeeStats).map((stat, idx) => (
            <Card key={idx} size="small" className="employee-summary-card">
              <div style={{ fontWeight: 'bold', marginBottom: 8, fontSize: 16 }}>{stat.name}</div>
              <div style={{ fontSize: 12, color: '#666' }}>
                <div style={{ marginBottom: 4 }}>Total: <strong>{stat.total}</strong></div>
                <div style={{ color: '#52c41a', marginBottom: 4 }}>✅ Completed: <strong>{stat.completed}</strong></div>
                <div style={{ color: '#1890ff', marginBottom: 4 }}>🎯 On Track: <strong>{stat.onTrack}</strong></div>
                <div style={{ color: '#999' }}>⏳ Not Started: <strong>{stat.notStarted}</strong></div>
              </div>
            </Card>
          ))}
        </div>

        <Table
          columns={columns}
          dataSource={checkins}
          rowKey="check_in_id"
          loading={isLoading}
          scroll={{ x: 1200 }}
          pagination={{ pageSize: 20 }}
          className="enhanced-table"
        />
      </Card>

      {/* Comment Modal */}
      <Modal
        title="Add Manager Comment"
        open={commentModalOpen}
        onCancel={() => {
          setCommentModalOpen(false);
          form.resetFields();
        }}
        footer={null}
        width={600}
      >
        {selectedCheckin && (
          <div style={{ marginBottom: 16, padding: 12, background: '#f5f7fa', borderRadius: 8 }}>
            <div style={{ marginBottom: 8 }}><strong>Employee:</strong> {selectedCheckin.employee_name}</div>
            <div style={{ marginBottom: 8 }}><strong>Goal:</strong> {selectedCheckin.goal_title}</div>
            <div style={{ marginBottom: 8 }}><strong>Quarter:</strong> {selectedCheckin.quarter}</div>
            <div><strong>Progress:</strong> {selectedCheckin.progress_score ? `${Math.round(selectedCheckin.progress_score)}%` : 'N/A'}</div>
          </div>
        )}

        <Form
          form={form}
          layout="vertical"
          onFinish={handleCommentSubmit}
        >
          <Form.Item
            name="manager_comment"
            label="Your Comment"
            rules={[{ required: true, message: 'Please enter a comment' }]}
          >
            <TextArea
              rows={4}
              placeholder="Document your discussion with the employee..."
            />
          </Form.Item>

          <Form.Item>
            <Button type="primary" htmlType="submit" loading={commentMutation.isPending}>
              Save Comment
            </Button>
            <Button style={{ marginLeft: 8 }} onClick={() => {
              setCommentModalOpen(false);
              form.resetFields();
            }}>
              Cancel
            </Button>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default ManagerTeamCheckins;
