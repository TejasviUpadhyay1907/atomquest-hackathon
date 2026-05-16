import React, { useState } from 'react';
import { Card, Button, Form, Input, Select, message, Table, Tag } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { adminAPI, thrustAreaAPI } from '../../services/api';

const { TextArea } = Input;
const { Option } = Select;

const AdminSharedGoals = () => {
  const [form] = Form.useForm();
  const queryClient = useQueryClient();

  // Fetch users
  const { data: usersData } = useQuery({
    queryKey: ['allUsers'],
    queryFn: () => adminAPI.getAllUsers(),
  });

  // Fetch thrust areas
  const { data: thrustAreasData } = useQuery({
    queryKey: ['thrustAreas'],
    queryFn: () => thrustAreaAPI.getThrustAreas(),
  });

  // Fetch all goals to show shared ones
  const { data: goalsData } = useQuery({
    queryKey: ['allGoals'],
    queryFn: () => adminAPI.getAllGoals(),
  });

  const users = usersData?.data || [];
  const thrustAreas = thrustAreasData?.data || [];
  const goals = goalsData?.data || [];

  // Filter employees only
  const employees = users.filter(u => u.role === 'Employee');

  // Filter shared goals
  const sharedGoals = goals.filter(g => g.is_shared);

  // Create shared goal mutation
  const createMutation = useMutation({
    mutationFn: (data) => adminAPI.createSharedGoal(data),
    onSuccess: () => {
      message.success('Shared goal created and assigned successfully!');
      queryClient.invalidateQueries(['allGoals']);
      form.resetFields();
    },
    onError: (error) => {
      message.error(error.response?.data?.detail || 'Failed to create shared goal');
    },
  });

  const handleSubmit = (values) => {
    createMutation.mutate(values);
  };

  const columns = [
    {
      title: 'Title',
      dataIndex: 'title',
      key: 'title',
      width: 250,
    },
    {
      title: 'Primary Owner',
      dataIndex: 'primary_owner_id',
      key: 'primary_owner',
      width: 150,
      render: (ownerId) => {
        const owner = users.find(u => u.id === ownerId);
        return owner?.full_name || 'N/A';
      },
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
      title: 'Assigned To',
      key: 'assigned',
      render: (_, record) => {
        // Count linked goals
        const linkedCount = goals.filter(g => g.shared_goal_id === record.id).length;
        return <Tag color="blue">{linkedCount} employees</Tag>;
      },
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      width: 120,
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
  ];

  return (
    <div>
      <Card title="Create Shared Goal" style={{ marginBottom: 24 }}>
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
        >
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
            <Input placeholder="Enter departmental goal title" />
          </Form.Item>

          <Form.Item
            name="description"
            label="Description"
          >
            <TextArea rows={3} placeholder="Describe the shared goal" />
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
            name="primary_owner_id"
            label="Primary Owner"
            rules={[{ required: true, message: 'Please select primary owner' }]}
            tooltip="The primary owner's achievement updates will sync to all recipients"
          >
            <Select
              placeholder="Select primary owner"
              showSearch
              filterOption={(input, option) =>
                option.children.toLowerCase().includes(input.toLowerCase())
              }
            >
              {employees.map(emp => (
                <Option key={emp.id} value={emp.id}>
                  {emp.full_name} ({emp.department})
                </Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item
            name="recipient_ids"
            label="Assign To Employees"
            rules={[{ required: true, message: 'Please select at least one employee' }]}
            tooltip="Recipients can only adjust weightage, not the goal title or target"
          >
            <Select
              mode="multiple"
              placeholder="Select employees to assign this goal"
              showSearch
              filterOption={(input, option) =>
                option.children.toLowerCase().includes(input.toLowerCase())
              }
            >
              {employees.map(emp => (
                <Option key={emp.id} value={emp.id}>
                  {emp.full_name} ({emp.department})
                </Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item>
            <Button
              type="primary"
              htmlType="submit"
              icon={<PlusOutlined />}
              loading={createMutation.isPending}
            >
              Create Shared Goal
            </Button>
          </Form.Item>
        </Form>
      </Card>

      <Card title="Existing Shared Goals">
        <Table
          columns={columns}
          dataSource={sharedGoals.filter(g => g.primary_owner_id !== null)}
          rowKey="id"
          pagination={false}
        />
      </Card>
    </div>
  );
};

export default AdminSharedGoals;
