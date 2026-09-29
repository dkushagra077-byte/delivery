import React, { useState, useEffect } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import { Navbar } from '../components/navbar/Navbar';
import { Sidebar } from '../components/sidebar/Sidebar';
import { VoiceAssistantModal } from '../components/voice/VoiceAssistantModal';
import { NotificationPanel } from '../components/notifications/NotificationPanel';
import { notificationsApi } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { Mic } from 'lucide-react';

export const AppLayout = () => {
  const [isVoiceOpen, setIsVoiceOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const { user } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();

  const fetchNotifications = async () => {
    try {
      const res = await notificationsApi.getAll();
      if (res.success && res.data) {
        setNotifications(res.data);
      }
    } catch (e) {}
  };

  useEffect(() => {
    if (user) {
      fetchNotifications();
      const interval = setInterval(fetchNotifications, 15000);
      return () => clearInterval(interval);
    }
  }, [user]);

  const handleMarkRead = async (id) => {
    try {
      await notificationsApi.markAsRead(id);
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, is_read: true } : n))
      );
    } catch (e) {}
  };

  const handleMarkAllRead = async () => {
    try {
      await notificationsApi.markAllAsRead();
      setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
      toast.success('All notifications marked as read.');
    } catch (e) {}
  };

  const handleVoiceCommand = (cmd) => {
    switch (cmd.type) {
      case 'SHOW_ACTIVE_DELIVERIES':
      case 'NAVIGATE_DASHBOARD':
        navigate('/');
        break;
      case 'NAVIGATE_HISTORY':
        navigate(user?.role === 'DRIVER' ? '/driver/history' : '/orders/history');
        break;
      case 'TRACK_DELIVERY':
        navigate('/tracking/active');
        break;
      default:
        break;
    }
  };

  const unreadCount = notifications.filter((n) => !n.is_read).length;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', background: 'var(--bg-app)' }}>
      <Navbar
        onOpenVoice={() => setIsVoiceOpen(true)}
        onOpenNotifications={() => setIsNotificationsOpen(true)}
        unreadCount={unreadCount}
      />

      <div style={{ display: 'flex', flex: 1 }}>
        <Sidebar />

        <main style={{ flex: 1, padding: '24px', overflowY: 'auto' }}>
          <Outlet />
        </main>
      </div>

      {/* Floating Microphone Orb in bottom right for quick voice access */}
      <button
        onClick={() => setIsVoiceOpen(true)}
        title="Voice Assistant"
        style={{
          position: 'fixed',
          bottom: '24px',
          left: '24px',
          width: '54px',
          height: '54px',
          borderRadius: '50%',
          background: 'linear-gradient(135deg, #2563eb, #06b6d4)',
          color: '#ffffff',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: '0 6px 20px rgba(37, 99, 235, 0.45)',
          zIndex: 900,
          border: '2px solid rgba(255, 255, 255, 0.2)',
          transition: 'transform 0.2s cubic-bezier(0.16, 1, 0.3, 1)'
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.transform = 'scale(1.1)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = 'scale(1)';
        }}
      >
        <Mic size={24} />
      </button>

      {/* Voice Assistant Modal */}
      <VoiceAssistantModal
        isOpen={isVoiceOpen}
        onClose={() => setIsVoiceOpen(false)}
        onCommandExecute={handleVoiceCommand}
      />

      {/* Notifications Drawer */}
      <NotificationPanel
        isOpen={isNotificationsOpen}
        onClose={() => setIsNotificationsOpen(false)}
        notifications={notifications}
        onMarkRead={handleMarkRead}
        onMarkAllRead={handleMarkAllRead}
      />
    </div>
  );
};
