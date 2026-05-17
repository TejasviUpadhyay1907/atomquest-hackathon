import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Form, Input, Button, message, Typography, Select } from 'antd';
import { UserOutlined, LockOutlined, MailOutlined, TeamOutlined } from '@ant-design/icons';
import { useAuth } from '../contexts/AuthContext';

const { Title, Text } = Typography;
const { Option } = Select;

const RegisterPage = () => {
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const onFinish = async (values) => {
    setLoading(true);
    try {
      await register(values);
      message.success('Registration successful! Please login.');
      navigate('/login');
    } catch (error) {
      message.error(error.response?.data?.detail || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="split-screen-container">
      {/* Left Panel - Form */}
      <div className="split-screen-left">
        <div className="login-form-container">
          <div style={{ textAlign: 'center', marginBottom: 30 }}>
            <Title level={2} style={{ marginBottom: 8, color: '#1f2937' }}>Create Account</Title>
            <Text type="secondary" style={{ fontSize: 16 }}>Join the Goal Tracking Portal</Text>
          </div>

          <Form
            name="register"
            onFinish={onFinish}
            layout="vertical"
            size="large"
          >
            <Form.Item
              name="full_name"
              rules={[{ required: true, message: 'Please input your full name!' }]}
            >
              <Input
                prefix={<UserOutlined />}
                placeholder="Full Name"
              />
            </Form.Item>

            <Form.Item
              name="email"
              rules={[
                { required: true, message: 'Please input your email!' },
                { type: 'email', message: 'Please enter a valid email!' }
              ]}
            >
              <Input
                prefix={<MailOutlined />}
                placeholder="Email"
              />
            </Form.Item>

            <Form.Item
              name="password"
              rules={[
                { required: true, message: 'Please input your password!' },
                { min: 6, message: 'Password must be at least 6 characters!' }
              ]}
            >
              <Input.Password
                prefix={<LockOutlined />}
                placeholder="Password"
              />
            </Form.Item>

            <Form.Item
              name="role"
              rules={[{ required: true, message: 'Please select your role!' }]}
            >
              <Select placeholder="Select Role">
                <Option value="Employee">Employee</Option>
                <Option value="Manager">Manager</Option>
                <Option value="Admin">Admin</Option>
              </Select>
            </Form.Item>

            <Form.Item
              name="department"
            >
              <Input
                prefix={<TeamOutlined />}
                placeholder="Department (Optional)"
              />
            </Form.Item>

            <Form.Item>
              <Button
                type="primary"
                htmlType="submit"
                loading={loading}
                block
                style={{ height: 48, fontSize: 16, fontWeight: 600 }}
              >
                Create Account
              </Button>
            </Form.Item>

            <div style={{ textAlign: 'center' }}>
              <Text type="secondary">
                Already have an account? <Link to="/login" style={{ color: '#667eea', fontWeight: 600 }}>Login here</Link>
              </Text>
            </div>
          </Form>
        </div>
      </div>

      {/* Right Panel - Visual */}
      <div className="split-screen-right">
        <div className="login-visual-content">
          <div className="animated-bg-circle circle-1"></div>
          <div className="animated-bg-circle circle-2"></div>
          <div className="animated-bg-circle circle-3"></div>
          
          <div style={{ position: 'relative', zIndex: 2 }}>
            <Title level={1} style={{ color: 'white', marginBottom: 24, fontSize: 48 }}>
              Welcome to AtomQuest
            </Title>
            <Text style={{ color: 'rgba(255,255,255,0.9)', fontSize: 18, display: 'block', marginBottom: 48 }}>
              Join thousands of teams achieving their goals with our powerful tracking platform
            </Text>

            <div className="feature-list">
              <div className="feature-item">
                <div className="feature-icon">📊</div>
                <div>
                  <div className="feature-title">Smart Analytics</div>
                  <div className="feature-desc">Track progress with real-time insights</div>
                </div>
              </div>
              <div className="feature-item">
                <div className="feature-icon">🎯</div>
                <div>
                  <div className="feature-title">Goal Management</div>
                  <div className="feature-desc">Set, track, and achieve your objectives</div>
                </div>
              </div>
              <div className="feature-item">
                <div className="feature-icon">👥</div>
                <div>
                  <div className="feature-title">Team Collaboration</div>
                  <div className="feature-desc">Work together towards common goals</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;
