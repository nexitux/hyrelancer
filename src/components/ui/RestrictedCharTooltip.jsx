'use client'
import { useState, useEffect } from 'react';
import { Tooltip } from 'antd';
import { FaExclamationTriangle } from 'react-icons/fa';

const RestrictedCharTooltip = ({ 
  children, 
  restrictedChar, 
  validationType = 'text',
  validationConfig = {},
  showTooltip = false,
  onTooltipChange = null
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (showTooltip && restrictedChar) {
      setIsVisible(true);
      
      // Generate appropriate message based on validation type and character
      let tooltipMessage = '';
      
      if (validationType === 'email') {
        tooltipMessage = 'Email can only contain letters, numbers, @ and . characters';
      } else if (validationType === 'phone') {
        tooltipMessage = 'Phone number can only contain digits and + character';
      } else if (validationType === 'name') {
        tooltipMessage = 'Name cannot contain special characters like < > { } [ ] \\ | ` ~ &';
      } else if (validationType === 'title') {
        tooltipMessage = 'Title cannot contain < > { } [ ] \\ | ` ~ characters';
      } else if (validationType === 'description') {
        tooltipMessage = 'Description cannot contain < > { } [ ] \\ | ` ~ characters';
      } else if (validationType === 'message') {
        tooltipMessage = 'Message cannot contain < > { } [ ] \\ | ` ~ characters';
      } else {
        tooltipMessage = `Character '${restrictedChar}' is not allowed in this field`;
      }
      
      setMessage(tooltipMessage);
      
      // Auto-hide after 3 seconds
      const timer = setTimeout(() => {
        setIsVisible(false);
        if (onTooltipChange) {
          onTooltipChange(false);
        }
      }, 3000);
      
      return () => clearTimeout(timer);
    } else {
      setIsVisible(false);
    }
  }, [showTooltip, restrictedChar, validationType, onTooltipChange]);

  const tooltipProps = {
    title: (
      <div className="flex items-center space-x-2">
        <FaExclamationTriangle className="text-yellow-500" />
        <span className="text-sm">{message}</span>
      </div>
    ),
    open: isVisible,
    placement: 'top',
    color: '#fef3c7', // yellow-100
    overlayStyle: {
      maxWidth: '300px'
    }
  };

  return (
    <Tooltip {...tooltipProps}>
      {children}
    </Tooltip>
  );
};

export default RestrictedCharTooltip;
