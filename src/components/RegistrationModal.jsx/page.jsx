// components/ModalWrapper.jsx
import React from 'react';
import { Modal, Button } from 'antd';
import { CheckCircleOutlined } from '@ant-design/icons';

const RegistrationModal = ({ 
  isVisible, 
  onClose, 
  title = "Step Completed!", 
  message = "Great! You've completed this step.", 
  buttonText = "Continue" 
}) => {
  return (
    <Modal
      title={null}
      open={isVisible}
      onCancel={onClose}
      footer={null}
      centered
      width={400}
      className="completion-modal"
    >
      <div className="text-center py-6">
        {/* Success Icon */}
        <div className="flex justify-center mb-4">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
            <CheckCircleOutlined className="text-3xl text-green-600" />
          </div>
        </div>
        
        {/* Title */}
        <h3 className="text-xl font-semibold text-gray-900 mb-2">
          {title}
        </h3>
        
        {/* Message */}
        <p className="text-gray-600 mb-6">
          {message}
        </p>
        
        {/* Continue Button */}
        <Button
          type="primary"
          size="large"
          onClick={onClose}
          className="px-8 py-2 bg-blue-600 hover:bg-blue-700"
        >
          {buttonText}
        </Button>
      </div>
    </Modal>
  );
};

export default RegistrationModal;