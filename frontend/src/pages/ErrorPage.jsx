import { Result, Button } from 'antd';
import { HomeOutlined, ReloadOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';

const ErrorPage = () => {
  const navigate = useNavigate();

  const handleReload = () => {
    window.location.reload();
  };

  return (
    <div style={{ 
      display: 'flex', 
      justifyContent: 'center', 
      alignItems: 'center', 
      minHeight: '100vh',
      background: '#f0f2f5'
    }}>
      <Result
        status="500"
        title="500"
        subTitle="Sorry, something went wrong on our end."
        extra={[
          <Button 
            type="primary" 
            key="home" 
            icon={<HomeOutlined />}
            onClick={() => navigate('/')}
          >
            Go Home
          </Button>,
          <Button 
            key="reload" 
            icon={<ReloadOutlined />}
            onClick={handleReload}
          >
            Try Again
          </Button>,
        ]}
      />
    </div>
  );
};

export default ErrorPage;
