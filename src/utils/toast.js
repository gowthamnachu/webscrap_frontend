import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// Custom toast styles for black/grey theme
const toastConfig = {
  position: "top-right",
  autoClose: 3000,
  hideProgressBar: false,
  closeOnClick: true,
  pauseOnHover: true,
  draggable: true,
  theme: "dark",
  style: {
    background: '#1a1a1a',
    color: '#e0e0e0',
    border: '1px solid #2a2a2a',
    borderRadius: '8px',
    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.5)',
  },
};

// Success toast (green)
export const showSuccess = (message) => {
  toast.success(message, {
    ...toastConfig,
    progressStyle: { background: '#10b981' },
    icon: '✅',
  });
};

// Error toast (red)
export const showError = (message) => {
  toast.error(message, {
    ...toastConfig,
    progressStyle: { background: '#ef4444' },
    icon: '❌',
  });
};

// Warning toast (yellow)
export const showWarning = (message) => {
  toast.warning(message, {
    ...toastConfig,
    progressStyle: { background: '#f59e0b' },
    icon: '⚠️',
  });
};

// Info toast (blue)
export const showInfo = (message) => {
  toast.info(message, {
    ...toastConfig,
    progressStyle: { background: '#3b82f6' },
    icon: 'ℹ️',
  });
};

// Loading toast
export const showLoading = (message) => {
  return toast.loading(message, {
    ...toastConfig,
    autoClose: false,
  });
};

// Update existing toast
export const updateToast = (toastId, type, message) => {
  const config = { ...toastConfig };
  
  switch(type) {
    case 'success':
      config.progressStyle = { background: '#10b981' };
      config.icon = '✅';
      break;
    case 'error':
      config.progressStyle = { background: '#ef4444' };
      config.icon = '❌';
      break;
    case 'warning':
      config.progressStyle = { background: '#f59e0b' };
      config.icon = '⚠️';
      break;
    default:
      config.progressStyle = { background: '#3b82f6' };
      config.icon = 'ℹ️';
  }
  
  toast.update(toastId, {
    render: message,
    type: type,
    isLoading: false,
    ...config,
  });
};

export default toast;
