import React, { useState, useEffect } from 'react';
import { Card, Table, Button, Modal, Form, Input, Select, message, Tag, Progress } from 'antd';
import { PlusOutlined, EditOutlined } from '@ant-design/icons';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { goalAPI, checkinAPI } from '../../services/api';

const { TextArea } = Input;
const { Option } = Select;

const EmployeeCheckins = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedGoal, setSelectedGoal] = useState(null);
  const [selectedQuarter, setSelectedQuarter] = useState('Q1');
  const [form] = Form.useForm();
  const queryClient = useQueryClient();

  // Add error handling and logging
  useEffect(() => {
    console.log('EmployeeCheckins component mounted');
  }, []);

  // Fetch approved goals with error handling
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

  // Fetch check-ins with error handling
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

  // Safe data extraction with error handling
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

  // Create check-in mutation
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

  // Update check-in mutation
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
      form.setFieldsValue({
        goal_id: goal.id,
        quarter: selectedQuarter,
      });
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
    if (score >= 100) return 'success';
    if (score >= 75) return 'normal';
    if (score >= 50) return 'exception';
    return 'exception';
  };

  // Show loading state
  if (goalsLoading || checkinsLoading) {
    return (
      <Card title="Quarterly Check-ins" loading={true}>
        <div>Loading check-ins...</div>
      </Card>
    );
  }

  // Show error state
  if (goalsError || checkinsError) {
    return (
      <Card title="Quarterly Check-ins">
        <div style={{ color: 'red', padding: 20 }}>
          <h3>Error loading data:</h3>
          <p>Goals Error: {goalsError?.message}</p>
          <p>Checkins Error: {checkinsError?.message}</p>
          <Button onClick={() => window.location.reload()}>Reload Page</Button>
        </div>
      </Card>
    );
  }

  const totalCheckins = checkins.length;
  const completedCheckins = checkins.filter(c => c.status === 'Completed').length;
  const onTrackCheckins = checkins.filter(c => c.status === 'On Track').length;
  const notStartedCheckins = checkins.filter(c => c.status === 'Not Started').length;

  const columns = [
    {
      title: 'Goal',
      dataIndex: 'goal_id',
      key: 'goal',
      render: (goalId) => {
        try {
          const goal = goals.find(g => g.id === goalId);
          return goal?.title || 'N/A';
        } catch (error) {
          console.error('Error rendering goal:', error);
          return 'Error';
        }
      },
    },
    {
      title: 'Quarter',
      dataIndex: 'quarter',
      key: 'quarter',
    },
    {
      title: 'Planned Target',
      dataIndex: 'planned_target',
      key: 'planned_target',
    },
    {
      title: 'Actual Achievement',
      dataIndex: 'actual_achievement',
      key: 'actual_achievement',
      render: (val) => val || '-',
    },
    {
      title: 'Progress',
      dataIndex: 'progress_score',
      key: 'progress_score',
      render: (score) => {
        try {
          return score ? (
            <Progress
              percent={Math.round(score)}
              status={getProgressColor(score)}
              style={{ width: 120 }}
            />
          ) : '-';
        } catch (error) {
          console.error('Error rendering progress:', error);
          return 'Error';
        }
      },
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status) => {
        try {
          const styleMap = {
            'Not Started': { background: '#f3f4f6', color: '#374151' },
            'On Track':    { background: '#dbeafe', color: '#1e40af' },
            'Completed':   { background: '#d1fae5', color: '#065f46' },
          };
          const s = styleMap[status] || styleMap['Not Started'];
          return (
            <span className="status-badge" style={s}>
              {status === 'Completed' && '✅ '}
              {status === 'On Track' && '🔵 '}
              {status === 'Not Started' && '⚪ '}
              {status}
            </span>
          );
        } catch (error) {
          return status;
        }
      },
    },
    {
      title: 'Manager Comment',
      dataIndex: 'manager_comment',
      key: 'manager_comment',
      render: (comment) => comment || '-',
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_, record) => {
        try {
          const goal = goals.find(g => g.id === record.goal_id);
          return (
            <Button
              type="text"
              icon={<EditOutlined />}
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
            >
              Update
            </Button>
          );
        } catch (error) {
          console.error('Error rendering actions:', error);
          return 'Error';
        }
      },
    },
  ];

  // Goals without check-ins for selected quarter
  let goalsWithoutCheckins = [];
  try {
    goalsWithoutCheckins = goals.filter(goal => 
      !checkins.some(c => c.goal_id === goal.id && c.quarter === selectedQuarter)
    );
  } catch (error) {
    console.error('Error filtering goals:', error);
  }

  return (
    <div>
      {/* Summary Cards */}
      <div className="summary-cards-row">
        <div className="metric-card">
          <div className="metric-card-icon blue"><span>📋</span></div>
          <div className="stat-number">{goals.length}</div>
          <div className="stat-label">Approved Goals</div>
          <div className="stat-trend neutral">Eligible for check-ins</div>
        </div>
        <div className="metric-card">
          <div className="metric-card-icon green"><span>✅</span></div>
          <div className="stat-number">{completedCheckins}</div>
          <div className="stat-label">Completed</div>
          <div className="stat-trend up">{selectedQuarter} Quarter</div>
        </div>
        <div className="metric-card">
          <div className="metric-card-icon orange"><span>🔵</span></div>
          <div className="stat-number">{onTrackCheckins}</div>
          <div className="stat-label">On Track</div>
          <div className="stat-trend neutral">In progress</div>
        </div>
        <div className="metric-card">
          <div className="metric-card-icon red"><span>⚪</span></div>
          <div className="stat-number">{goalsWithoutCheckins.length}</div>
          <div className="stat-label">Pending Check-in</div>
          <div className={`stat-trend ${goalsWithoutCheckins.length > 0 ? 'down' : 'up'}`}>
            {goalsWithoutCheckins.length > 0 ? 'Action needed' : 'All done!'}
          </div>
        </div>
      </div>

      {/* Main Card */}
      <div className="card-modern">
        <div className="card-modern-header">
          <h2 className="card-modern-title">📋 Quarterly Check-ins</h2>
          <Select
            value={selectedQuarter}
            onChange={setSelectedQuarter}
            style={{ width: 150 }}
            size="large"
          >
            <Option value="Q1">Q1 (July)</Option>
            <Option value="Q2">Q2 (October)</Option>
            <Option value="Q3">Q3 (January)</Option>
            <Option value="Q4">Q4 (March/April)</Option>
          </Select>
        </div>

        <div className="card-modern-body">
          {/* Pending check-ins alert */}
          {goalsWithoutCheckins.length > 0 && (
            <div style={{
              marginBottom: 20,
              padding: '16px 20px',
              background: '#eff6ff',
              borderRadius: 10,
              border: '1px solid #bfdbfe',
            }}>
              <div style={{ fontWeight: 600, color: '#1e40af', marginBottom: 12 }}>
                📌 Goals pending check-in for {selectedQuarter}:
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {goalsWithoutCheckins.map(goal => (
                  <div key={goal.id} style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    padding: '10px 14px',
                    background: 'white',
                    borderRadius: 8,
                    border: '1px solid #e0e7ff',
                  }}>
                    <span style={{ fontWeight: 500, color: '#374151' }}>{goal.title}</span>
                    <Button
                      size="small"
                      type="primary"
                      icon={<PlusOutlined />}
                      onClick={() => handleAddCheckin(goal)}
                      style={{ borderRadius: 6, fontWeight: 600 }}
                    >
                      Add Check-in
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Check-ins Table */}
          <Table
            className="table-enhanced"
            columns={columns}
            dataSource={checkins}
            rowKey="id"
            loading={checkinsLoading}
            pagination={false}
            style={{ borderRadius: 10, overflow: 'hidden' }}
          />
        </div>
      </div>

      {/* Check-in Modal */}
      <Modal
        title="Update Check-in"
        open={isModalOpen}
        onCancel={() => {
          setIsModalOpen(false);
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
          <Form.Item name="goal_id" hidden>
            <Input />
          </Form.Item>

          <Form.Item name="quarter" hidden>
            <Input />
          </Form.Item>

          {selectedGoal && (
            <div style={{ marginBottom: 16, padding: 12, background: '#f5f5f5', borderRadius: 8 }}>
              <div><strong>Goal:</strong> {selectedGoal.title}</div>
              <div><strong>Target:</strong> {selectedGoal.target}</div>
              <div><strong>UoM:</strong> {selectedGoal.uom_type}</div>
            </div>
          )}

          <Form.Item
            name="actual_achievement"
            label="Actual Achievement"
            rules={[{ required: true, message: 'Please enter actual achievement' }]}
          >
            <Input placeholder="Enter actual achievement value" />
          </Form.Item>

          <Form.Item
            name="status"
            label="Status"
            rules={[{ required: true, message: 'Please select status' }]}
          >
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
            <Button style={{ marginLeft: 8 }} onClick={() => {
              setIsModalOpen(false);
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

export default EmployeeCheckins;
