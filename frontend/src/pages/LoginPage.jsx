import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Form, Input, Button, Card, message, Typography } from 'antd';
import { UserOutlined, LockOutlined } from '@ant-design/icons';
import { useAuth } from '../contexts/AuthContext';

const { Title, Text } = Typography;

const LoginPage = () => {
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const onFinish = async (values) => {
    setLoading(true);
    try {
      const user = await login(values);
      message.success(`Welcome back, ${user.full_name}!`);
      
      // Longer delay to ensure token is fully set in axios
      await new Promise(resolve => setTimeout(resolve, 300));
      
      // Determine redirect path based on role
      let redirectPath;
      if (user.role === 'Admin') {
        redirectPath = '/admin/goals';
      } else if (user.role === 'Manager') {
        redirectPath = '/manager/approvals';
      } else {
        redirectPath = '/employee/goals';
      }
      
      // Use window.location for hard navigation to ensure clean state
      window.location.href = redirectPath;
    } catch (error) {
      message.error(error.response?.data?.detail || 'Login failed. Please check your credentials.');
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      padding: '20px',
      position: 'relative',
      overflow: 'hidden',
    }}>
      {/* Animated background circles */}
      <div style={{
        position: 'absolute',
        width: '500px',
        height: '500px',
        borderRadius: '50%',
        background: 'rgba(255,255,255,0.1)',
        top: '-250px',
        right: '-250px',
        animation: 'float 6s ease-in-out infinite',
      }} />
      <div style={{
        position: 'absolute',
        width: '300px',
        height: '300px',
        borderRadius: '50%',
        background: 'rgba(255,255,255,0.1)',
        bottom: '-150px',
        left: '-150px',
        animation: 'float 8s ease-in-out infinite',
      }} />

      <Card
        style={{
          width: '100%',
          maxWidth: 450,
          boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
          borderRadius: '16px',
          border: 'none',
          position: 'relative',
          zIndex: 1,
          animation: 'slideUp 0.6s ease-out',
        }}
      >
        <div style={{ textAlign: 'center', marginBottom: 40 }}>
          <div style={{ 
            fontSize: 48, 
            marginBottom: 16,
            animation: 'bounce 2s ease-in-out infinite',
          }}>
            🎯
          </div>
          <Title level={2} style={{ marginBottom: 8, color: '#667eea', fontWeight: 700 }}>
            AtomQuest Portal
          </Title>
          <Text type="secondary" style={{ fontSize: 16 }}>
            Goal Tracking & Performance Management
          </Text>
        </div>

        <Form
          name="login"
          onFinish={onFinish}
          layout="vertical"
          size="large"
        >
          <Form.Item
            name="email"
            rules={[
              { required: true, message: 'Please input your email!' },
              { type: 'email', message: 'Please enter a valid email!' }
            ]}
          >
            <Input
              prefix={<UserOutlined style={{ color: '#667eea' }} />}
              placeholder="Email Address"
              style={{ 
                borderRadius: '8px',
                padding: '12px 16px',
              }}
            />
          </Form.Item>

          <Form.Item
            name="password"
            rules={[{ required: true, message: 'Please input your password!' }]}
          >
            <Input.Password
              prefix={<LockOutlined style={{ color: '#667eea' }} />}
              placeholder="Password"
              style={{ 
                borderRadius: '8px',
                padding: '12px 16px',
              }}
            />
          </Form.Item>

          <Form.Item>
            <Button
              type="primary"
              htmlType="submit"
              loading={loading}
              block
              style={{
                height: '48px',
                borderRadius: '8px',
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                border: 'none',
                fontSize: '16px',
                fontWeight: 600,
                boxShadow: '0 4px 15px rgba(102,126,234,0.4)',
                transition: 'all 0.3s',
              }}
            >
              Sign In
            </Button>
          </Form.Item>

          <div style={{ textAlign: 'center' }}>
            <Text type="secondary">
              Don't have an account? <Link to="/register" style={{ color: '#667eea', fontWeight: 600 }}>Register here</Link>
            </Text>
          </div>
        </Form>

        <div style={{ 
          marginTop: 32, 
          padding: 20, 
          background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)', 
          borderRadius: 12,
          border: '1px solid rgba(102,126,234,0.1)',
        }}>
          <Text strong style={{ display: 'block', marginBottom: 12, color: '#667eea', fontSize: 14 }}>
            🔑 Demo Credentials:
          </Text>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            <div style={{ padding: '8px 12px', background: 'white', borderRadius: '6px' }}>
              <Text style={{ fontSize: 13, fontWeight: 600 }}>👨‍💼 Admin:</Text>
              <Text style={{ fontSize: 13, marginLeft: 8 }}>admin@demo.com / password123</Text>
            </div>
            <div style={{ padding: '8px 12px', background: 'white', borderRadius: '6px' }}>
              <Text style={{ fontSize: 13, fontWeight: 600 }}>👔 Manager:</Text>
              <Text style={{ fontSize: 13, marginLeft: 8 }}>manager1@demo.com / password123</Text>
            </div>
            <div style={{ padding: '8px 12px', background: 'white', borderRadius: '6px' }}>
              <Text style={{ fontSize: 13, fontWeight: 600 }}>👤 Employee:</Text>
              <Text style={{ fontSize: 13, marginLeft: 8 }}>emp1@demo.com / password123</Text>
            </div>
          </div>
        </div>
      </Card>

      <style>{`
        @keyframes slideUp {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes float {
          0%, 100% {
            transform: translateY(0px);
          }
          50% {
            transform: translateY(-20px);
          }
        }

        @keyframes bounce {
          0%, 100% {
            transform: translateY(0);
          }
          50% {
            transform: translateY(-10px);
          }
        }

        .ant-btn-primary:hover {
          transform: translateY(-2px);
          box-shadow: 0 6px 20px rgba(102,126,234,0.6) !important;
        }

        .ant-input:focus, .ant-input-password:focus {
          border-color: #667eea !important;
          box-shadow: 0 0 0 2px rgba(102,126,234,0.1) !important;
        }
      `}</style>
    </div>
  );
};

export default LoginPage;
