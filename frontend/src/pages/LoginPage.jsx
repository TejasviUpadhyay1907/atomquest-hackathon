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
      overflow: 'hidden',
    }}>
      {/* Left Panel - Form */}
      <div style={{
        flex: '0 0 45%',
        background: 'white',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '40px',
        position: 'relative',
      }}>
        <div style={{
          width: '100%',
          maxWidth: 400,
          animation: 'slideInLeft 0.8s ease-out',
        }}>
        <div style={{
          width: '100%',
          maxWidth: 400,
          animation: 'slideInLeft 0.8s ease-out',
        }}>
          {/* Logo and Title */}
          <div style={{ textAlign: 'center', marginBottom: 40 }}>
            <div style={{ 
              fontSize: 48, 
              marginBottom: 16,
              animation: 'bounce 2s ease-in-out infinite',
            }}>
              🎯
            </div>
            <Title level={2} style={{ marginBottom: 8, color: '#1f2937', fontWeight: 700 }}>
              Welcome Back
            </Title>
            <Text type="secondary" style={{ fontSize: 16 }}>
              Sign in to your AtomQuest account
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
                  border: '1px solid #e5e7eb',
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
                  border: '1px solid #e5e7eb',
                }}
              />
            </Form.Item>

            <Form.Item>
              <Button
                type="primary"
                htmlType="submit"
                loading={loading}
                block
                className="btn-modern primary"
                style={{
                  height: '48px',
                  fontSize: '16px',
                  fontWeight: 600,
                }}
              >
                Sign In
              </Button>
            </Form.Item>

            <div style={{ textAlign: 'center', marginBottom: 32 }}>
              <Text type="secondary">
                Don't have an account? <Link to="/register" style={{ color: '#667eea', fontWeight: 600 }}>Register here</Link>
              </Text>
            </div>
          </Form>

          {/* Demo Credentials */}
          <div style={{ 
            padding: 20, 
            background: '#f8fafc', 
            borderRadius: 12,
            border: '1px solid #e2e8f0',
          }}>
            <Text strong style={{ display: 'block', marginBottom: 12, color: '#374151', fontSize: 14 }}>
              🔑 Demo Credentials:
            </Text>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              <div style={{ padding: '8px 12px', background: 'white', borderRadius: '6px', border: '1px solid #e5e7eb' }}>
                <Text style={{ fontSize: 13, fontWeight: 600 }}>👨‍💼 Admin:</Text>
                <Text style={{ fontSize: 13, marginLeft: 8 }}>admin@demo.com / password123</Text>
              </div>
              <div style={{ padding: '8px 12px', background: 'white', borderRadius: '6px', border: '1px solid #e5e7eb' }}>
                <Text style={{ fontSize: 13, fontWeight: 600 }}>👔 Manager:</Text>
                <Text style={{ fontSize: 13, marginLeft: 8 }}>manager1@demo.com / password123</Text>
              </div>
              <div style={{ padding: '8px 12px', background: 'white', borderRadius: '6px', border: '1px solid #e5e7eb' }}>
                <Text style={{ fontSize: 13, fontWeight: 600 }}>👤 Employee:</Text>
                <Text style={{ fontSize: 13, marginLeft: 8 }}>emp1@demo.com / password123</Text>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Right Panel - Visual */}
      <div style={{
        flex: '1',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative',
        overflow: 'hidden',
      }}>
        {/* Animated background elements */}
        <div style={{
          position: 'absolute',
          width: '400px',
          height: '400px',
          borderRadius: '50%',
          background: 'rgba(255,255,255,0.1)',
          top: '-200px',
          right: '-200px',
          animation: 'float 8s ease-in-out infinite',
        }} />
        <div style={{
          position: 'absolute',
          width: '300px',
          height: '300px',
          borderRadius: '50%',
          background: 'rgba(255,255,255,0.05)',
          bottom: '-150px',
          left: '-150px',
          animation: 'float 6s ease-in-out infinite reverse',
        }} />

        {/* Content */}
        <div style={{
          textAlign: 'center',
          color: 'white',
          zIndex: 2,
          animation: 'slideInRight 0.8s ease-out',
          maxWidth: 500,
          padding: '0 40px',
        }}>
          <div style={{ fontSize: 72, marginBottom: 24 }}>🎯</div>
          <Title level={1} style={{ color: 'white', marginBottom: 16, fontSize: 42, fontWeight: 700 }}>
            AtomQuest Portal
          </Title>
          <Text style={{ fontSize: 18, color: 'rgba(255,255,255,0.9)', lineHeight: 1.6, display: 'block', marginBottom: 32 }}>
            Streamline your goal tracking and performance management with our comprehensive dashboard
          </Text>
          
          {/* Feature highlights */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16, alignItems: 'flex-start', maxWidth: 400, margin: '0 auto' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{ 
                width: 40, 
                height: 40, 
                borderRadius: '50%', 
                background: 'rgba(255,255,255,0.2)', 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center',
                fontSize: 18
              }}>📊</div>
              <Text style={{ color: 'rgba(255,255,255,0.9)', fontSize: 16 }}>Real-time Analytics Dashboard</Text>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{ 
                width: 40, 
                height: 40, 
                borderRadius: '50%', 
                background: 'rgba(255,255,255,0.2)', 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center',
                fontSize: 18
              }}>🎯</div>
              <Text style={{ color: 'rgba(255,255,255,0.9)', fontSize: 16 }}>Goal Tracking & Management</Text>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{ 
                width: 40, 
                height: 40, 
                borderRadius: '50%', 
                background: 'rgba(255,255,255,0.2)', 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center',
                fontSize: 18
              }}>👥</div>
              <Text style={{ color: 'rgba(255,255,255,0.9)', fontSize: 16 }}>Team Performance Insights</Text>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes slideInLeft {
          from {
            opacity: 0;
            transform: translateX(-30px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }

        @keyframes slideInRight {
          from {
            opacity: 0;
            transform: translateX(30px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
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

        .ant-input:focus, .ant-input-password:focus {
          border-color: #667eea !important;
          box-shadow: 0 0 0 2px rgba(102,126,234,0.1) !important;
        }

        /* Responsive design */
        @media (max-width: 768px) {
          .login-container {
            flex-direction: column;
          }
          
          .login-left-panel {
            flex: none !important;
            padding: 20px !important;
          }
          
          .login-right-panel {
            flex: 0 0 200px !important;
          }
        }
      `}</style>
    </div>
  );
};

export default LoginPage;
