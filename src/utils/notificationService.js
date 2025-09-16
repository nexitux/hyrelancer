// utils/notificationService.js
import { toast } from 'react-toastify';

export const showErrorNotification = (message, options = {}) => {
  toast.error(message, {
    position: "top-right",
    autoClose: 9000,
    hideProgressBar: false,
    closeOnClick: true,
    pauseOnHover: true,
    draggable: true,
    style: {
      backgroundColor: '#FEF2F2',
      color: '#DC2626',
      border: '1px solid #FECACA',
    },
    ...options
  });
};

export const showSuccessNotification = (message, options = {}) => {
  toast.success(message, {
    position: "top-right",
    autoClose: 9000,
    hideProgressBar: false,
    closeOnClick: true,
    pauseOnHover: true,
    draggable: true,
    style: {
      backgroundColor: '#F0FDF4',
      color: '#059669',
      border: '1px solid #BBF7D0',
    },
    ...options
  });
};

export const showWarningNotification = (message, options = {}) => {
  toast.warning(message, {
    position: "top-right",
    autoClose: 9000,
    hideProgressBar: false,
    closeOnClick: true,
    pauseOnHover: true,
    draggable: true,
    style: {
      backgroundColor: '#FFFBEB',
      color: '#D97706',
      border: '1px solid #FED7AA',
    },
    ...options
  });
};

export const showInfoNotification = (message, options = {}) => {
  toast.info(message, {
    position: "top-right",
    autoClose: 9000,
    hideProgressBar: false,
    closeOnClick: true,
    pauseOnHover: true,
    draggable: true,
    style: {
      backgroundColor: '#EFF6FF',
      color: '#2563EB',
      border: '1px solid #DBEAFE',
    },
    ...options
  });
};

// Specific error handlers for common scenarios
export const handleAuthErrors = (error) => {
  if (!error.response) {
    showErrorNotification('Network error. Please check your connection and try again.');
    return;
  }

  const { status, data } = error.response;
  const message = data?.message || 'An error occurred';

  switch (status) {
    case 400:
      if (message.toLowerCase().includes('email not verified')) {
        showErrorNotification('Please verify your email before logging in. Check your inbox for the verification link.', {
          autoClose: 8000
        });
      } else if (message.toLowerCase().includes('password')) {
        showErrorNotification('Invalid password. Please check your password and try again.');
      } else if (message.toLowerCase().includes('email')) {
        showErrorNotification('Invalid email address or email not found.');
      } else {
        showErrorNotification(message);
      }
      break;
    
    case 401:
      showErrorNotification('Invalid credentials. Please check your email and password.');
      break;
    
    case 422:
      if (data?.errors) {
        // Handle validation errors
        Object.keys(data.errors).forEach(field => {
          const fieldErrors = data.errors[field];
          if (Array.isArray(fieldErrors) && fieldErrors.length > 0) {
            if (field === 'email' && fieldErrors[0].toLowerCase().includes('already')) {
              showErrorNotification('This email is already registered. Please use a different email or try logging in.', {
                autoClose: 7000
              });
            } else if (field === 'mobile' && fieldErrors[0].toLowerCase().includes('already')) {
              showErrorNotification('This phone number is already registered. Please use a different number.', {
                autoClose: 7000
              });
            } else {
              showErrorNotification(`${field}: ${fieldErrors[0]}`);
            }
          }
        });
      } else {
        showErrorNotification(message);
      }
      break;
    
    case 500:
      showErrorNotification('Server error. Please try again later or contact support if the problem persists.');
      break;
    
    default:
      showErrorNotification(message || 'An unexpected error occurred. Please try again.');
  }
};

export const handleRegistrationErrors = (error) => {
  if (!error.response) {
    showErrorNotification('Network error. Please check your connection and try again.');
    return;
  }

  const { data } = error.response;
  const message = data?.message || 'Registration failed';

  // Handle specific registration error scenarios
  if (message.toLowerCase().includes('email already exists') || 
      message.toLowerCase().includes('email already taken')) {
    showErrorNotification('This email is already registered. Please use a different email or try logging in.', {
      autoClose: 7000
    });
  } else if (message.toLowerCase().includes('phone') && 
             message.toLowerCase().includes('already')) {
    showErrorNotification('This phone number is already registered. Please use a different number.', {
      autoClose: 7000
    });
  } else if (message.toLowerCase().includes('password') && 
             message.toLowerCase().includes('mismatch')) {
    showErrorNotification('Passwords do not match. Please check and try again.');
  } else {
    handleAuthErrors(error);
  }
};