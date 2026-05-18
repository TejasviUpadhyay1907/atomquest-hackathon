import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';

const NotFoundPage = () => {
  const navigate = useNavigate();

  return (
    <div style={{
      display: 'flex', justifyContent: 'center', alignItems: 'center',
      minHeight: '100vh', background: '#0d0d14', fontFamily: 'Inter, sans-serif',
      flexDirection: 'column', gap: '24px', textAlign: 'center', padding: '40px',
    }}>
      {/* Ambient orb */}
      <div style={{ position: 'fixed', top: '30%', left: '50%', transform: 'translateX(-50%)',
        width: '300px', height: '300px', borderRadius: '50%',
        background: 'radial-gradient(circle,rgba(102,126,234,0.15),transparent 70%)',
        filter: 'blur(40px)', pointerEvents: 'none' }} />

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}
        style={{ position: 'relative', zIndex: 1 }}>
        <div style={{ fontSize: '80px', fontWeight: 800, color: 'rgba(255,255,255,0.08)',
          lineHeight: 1, marginBottom: '8px', letterSpacing: '-4px' }}>404</div>
        <div style={{ color: 'white', fontSize: '22px', fontWeight: 700, marginBottom: '10px' }}>
          Page not found
        </div>
        <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: '15px', marginBottom: '32px', maxWidth: '360px' }}>
          The page you're looking for doesn't exist or has been moved.
        </div>
        <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
          <motion.button whileHover={{ scale: 1.03, y: -1 }} whileTap={{ scale: 0.97 }}
            onClick={() => navigate('/')}
            style={{ padding: '11px 24px', background: 'linear-gradient(135deg,#667eea,#764ba2)',
              border: 'none', borderRadius: '10px', color: 'white', fontWeight: 600,
              fontSize: '14px', cursor: 'pointer' }}>
            Go Home
          </motion.button>
          <motion.button whileHover={{ scale: 1.03, y: -1 }} whileTap={{ scale: 0.97 }}
            onClick={() => navigate(-1)}
            style={{ padding: '11px 24px', background: 'rgba(255,255,255,0.06)',
              border: '1px solid rgba(255,255,255,0.1)', borderRadius: '10px',
              color: 'rgba(255,255,255,0.7)', fontWeight: 600, fontSize: '14px', cursor: 'pointer' }}>
            Go Back
          </motion.button>
        </div>
      </motion.div>
    </div>
  );
};

export default NotFoundPage;
