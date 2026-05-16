import React, { useState } from 'react';
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

  // Fetch approved goals
  const { data: goalsData } = useQuery({
    queryKey: ['myGoals'],
    queryFn: () => goalAPI.getMyGoals(),
  });

  // Fetch check-ins
  const { data: checkinsData, isLoading } = useQuery({
    queryKey: ['myCheckins', selectedQuarter],
    queryFn: () => checkinAPI.getMyCheckins(selectedQuarter),
  });

  const goals = goalsData?.data?.filter(g => g.status === 'Approved') || [];
  const checkins = checkinsData?.data || [];

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
      message.error(error.response?.data?.detail || 'Failed to update check-in');
    },
  });

  const handleAddCheckin = (goal) => {
    setSelectedGoal(goal);
    form.setFieldsValue({
      goal_id: goal.id,
      quarter: selectedQuarter,
    });
    setIsModalOpen(true);
  };

  const handleSubmit = (values) => {
    const existingCheckin = checkins.find(c => c.goal_id === values.goal_id && c.quarter === values.quarter);
    
    if (existingCheckin) {
      updateMutation.mutate({ id: existingCheckin.id, data: values });
    } else {
      createMutation.mutate(values);
    }
  };

  const getProgressColor = (score) => {
    if (score >= 100) return 'success';
    if (score >= 75) return 'normal';
    if (score >= 50) return 'exception';
    return 'exception';
  };

  const columns = [
    {
      title: 'Goal',
      dataIndex: 'goal_id',
      key: 'goal',
      render: (goalId) => {
        const goal = goals.find(g => g.id === goalId);
        return goal?.title || 'N/A';
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
      render: (score) => score ? (
        <Progress
          percent={Math.round(score)}
          status={getProgressColor(score)}
          style={{ width: 120 }}
        />
      ) : '-',
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
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
      render: (comment) => comment || '-',
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_, record) => {
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
      },
    },
  ];

  // Goals without check-ins for selected quarter
  const goalsWithoutCheckins = goals.filter(goal => 
    !checkins.some(c => c.goal_id === goal.id && c.quarter === selectedQuarter)
  );

  return (
    <div>
      <Card
        title="Quarterly Check-ins"
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
      >
        {goalsWithoutCheckins.length > 0 && (
          <div style={{ marginBottom: 16, padding: 16, background: '#e6f7ff', borderRadius: 8 }}>
            <strong>Goals pending check-in for {selectedQuarter}:</strong>
            <div style={{ marginTop: 8 }}>
              {goalsWithoutCheckins.map(goal => (
                <div key={goal.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 8 }}>
                  <span>{goal.title}</span>
                  <Button
                    size="small"
                    type="primary"
                    icon={<PlusOutlined />}
                    onClick={() => handleAddCheckin(goal)}
                  >
                    Add Check-in
                  </Button>
                </div>
              ))}
            </div>
          </div>
        )}

        <Table
          columns={columns}
          dataSource={checkins}
          rowKey="id"
          loading={isLoading}
          pagination={false}
        />
      </Card>

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
