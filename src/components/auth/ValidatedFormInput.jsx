'use client'
import { useState } from 'react';
import { FaEye, FaEyeSlash, FaExclamationCircle } from 'react-icons/fa';
import { capitalizeFirst } from '@/lib/utils';
import { sanitizeInput, validateInput, inputValidators } from '@/utils/inputValidation';
import RestrictedCharTooltip from '@/components/ui/RestrictedCharTooltip';
import CharacterRestrictionIndicator from '@/components/ui/CharacterRestrictionIndicator';

const ValidatedFormInput = ({
  label,
  type = 'text',
  name,
  value,
  onChange,
  error,
  showPassword,
  onTogglePassword,
  placeholder,
  required = false,
  validationType = 'text',
  validationConfig = {},
  maxLength = null,
  onValidationChange = null
}) => {
  const hasError = error && (Array.isArray(error) ? error.length > 0 : error);
  const errorMessage = Array.isArray(error) ? error[0] : error;
  const [showTooltip, setShowTooltip] = useState(false);
  const [restrictedChar, setRestrictedChar] = useState('');

  // Handle input change with validation
  const handleInputChange = (e) => {
    const originalValue = e.target.value;
    
    // Apply sanitization based on input type
    let sanitizedValue = originalValue;
    
    if (type === 'email') {
      // For email, only allow alphanumeric, @, and .
      sanitizedValue = originalValue.replace(/[^a-zA-Z0-9@.]/g, '');
    } else if (type === 'tel') {
      // For phone, only allow digits and +
      sanitizedValue = originalValue.replace(/[^0-9+]/g, '');
    } else if (type === 'password') {
      // For password, use general sanitization
      sanitizedValue = sanitizeInput(originalValue, validationConfig);
    } else {
      // For other text inputs, use validation type
      const validator = inputValidators[validationType];
      if (validator) {
        sanitizedValue = sanitizeInput(originalValue, validationConfig);
      }
    }
    
    // Update the input value
    e.target.value = sanitizedValue;
    
    // Call the original onChange with the sanitized value
    if (onChange) {
      onChange(e);
    }
    
    // Validate and notify parent component
    if (onValidationChange) {
      const validator = inputValidators[validationType];
      if (validator) {
        const validation = validator(sanitizedValue, validationConfig);
        onValidationChange(validation);
      }
    }
  };

  // Handle key press to prevent forbidden characters
  const handleKeyPress = (e) => {
    const char = e.key;
    
    // Allow control keys (backspace, delete, arrow keys, etc.)
    if (e.ctrlKey || e.metaKey || e.altKey || 
        ['Backspace', 'Delete', 'ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', 'Tab', 'Enter'].includes(char)) {
      return;
    }
    
    let isRestricted = false;
    
    // For email inputs
    if (type === 'email') {
      if (!/[a-zA-Z0-9@.]/.test(char)) {
        isRestricted = true;
      }
    }
    // For phone inputs
    else if (type === 'tel') {
      if (!/[0-9+]/.test(char)) {
        isRestricted = true;
      }
    }
    // For other text inputs, check against forbidden characters
    else if (type === 'text' || type === 'textarea') {
      const forbiddenChars = /[<>{}[\]\\|`~]/;
      if (forbiddenChars.test(char)) {
        isRestricted = true;
      }
      
      // Check limited characters based on validation config
      if (!validationConfig.allowLimitedChars && /[&]/.test(char)) {
        isRestricted = true;
      }
    }
    
    if (isRestricted) {
      e.preventDefault();
      setRestrictedChar(char);
      setShowTooltip(true);
      return;
    }
  };

  return (
    <div className="mb-4">
      <label htmlFor={name} className="block text-sm font-medium text-gray-700 dark:text-gray-300">
        {capitalizeWords(label)} {required && <span className="text-red-500">*</span>}
      </label>
      <div className="relative">
        <RestrictedCharTooltip
          showTooltip={showTooltip}
          restrictedChar={restrictedChar}
          validationType={validationType}
          validationConfig={validationConfig}
          onTooltipChange={setShowTooltip}
        >
          {type === 'textarea' ? (
            <textarea
              id={name}
              name={name}
              value={value}
              onChange={handleInputChange}
              onKeyPress={handleKeyPress}
              placeholder={placeholder}
              maxLength={maxLength}
              rows={4}
              className={`block px-3 py-3 mt-1 w-full rounded-lg border shadow-sm focus:outline-none focus:ring-2 transition-all duration-200 dark:bg-gray-700 dark:text-white resize-vertical ${
                hasError 
                  ? 'bg-red-50 border-red-300 focus:ring-red-500 focus:border-red-500' 
                  : 'border-gray-300 dark:border-gray-600 focus:ring-blue-500 focus:border-blue-500'
              }`}
            />
          ) : (
            <input
              type={type === 'password' && showPassword ? 'text' : type}
              id={name}
              name={name}
              value={value}
              onChange={handleInputChange}
              onKeyPress={handleKeyPress}
              placeholder={placeholder}
              maxLength={maxLength}
              className={`block px-3 py-3 mt-1 w-full rounded-lg border shadow-sm focus:outline-none focus:ring-2 transition-all duration-200 dark:bg-gray-700 dark:text-white ${
                hasError 
                  ? 'bg-red-50 border-red-300 focus:ring-red-500 focus:border-red-500' 
                  : 'border-gray-300 dark:border-gray-600 focus:ring-blue-500 focus:border-blue-500'
              }`}
            />
          )}
        </RestrictedCharTooltip>
        
        {/* Password Toggle */}
        {type === 'password' && (
          <button
            type="button"
            onClick={onTogglePassword}
            className="flex absolute inset-y-0 right-0 items-center pr-3 text-gray-500 hover:text-gray-700 transition-colors duration-200"
          >
            {showPassword ? <FaEyeSlash /> : <FaEye />}
          </button>
        )}
        
        {/* Error Icon */}
        {hasError && type !== 'password' && (
          <div className="flex absolute inset-y-0 right-0 items-center pr-3">
            <FaExclamationCircle className="text-red-500" />
          </div>
        )}
      </div>
      
      {/* Error Message */}
      {hasError && (
        <div className="flex items-center mt-2">
          <FaExclamationCircle className="mr-2 text-red-500 text-sm flex-shrink-0" />
          <p className="text-sm text-red-600 leading-tight">{errorMessage}</p>
        </div>
      )}
      
      {/* Character Count */}
      {maxLength && (
        <div className="mt-1 text-xs text-gray-500 text-right">
          {value ? value.length : 0}/{maxLength}
        </div>
      )}
      
      {/* Character Restriction Indicator */}
      <CharacterRestrictionIndicator
        value={value}
        validationType={validationType}
        validationConfig={validationConfig}
        showIndicator={true}
      />
      
      {/* Password Strength Indicator */}
      {type === 'password' && value && name === 'password' && (
        <div className="mt-2">
          <div className="flex space-x-1">
            {[1, 2, 3, 4].map((level) => (
              <div
                key={level}
                className={`h-1 flex-1 rounded ${
                  getPasswordStrength(value) >= level
                    ? getPasswordStrength(value) === 1
                      ? 'bg-red-400'
                      : getPasswordStrength(value) === 2
                      ? 'bg-yellow-400'
                      : getPasswordStrength(value) === 3
                      ? 'bg-blue-400'
                      : 'bg-green-400'
                    : 'bg-gray-200'
                }`}
              />
            ))}
          </div>
          <p className="mt-1 text-xs text-gray-500">
            {getPasswordStrength(value) === 1 && 'Weak password'}
            {getPasswordStrength(value) === 2 && 'Fair password'}
            {getPasswordStrength(value) === 3 && 'Good password'}
            {getPasswordStrength(value) === 4 && 'Strong password'}
          </p>
        </div>
      )}
    </div>
  );
};

const getPasswordStrength = (password) => {
  let strength = 0;
  if (password.length >= 8) strength++;
  if (/[a-z]/.test(password) && /[A-Z]/.test(password)) strength++;
  if (/\d/.test(password)) strength++;
  if (/[^a-zA-Z\d]/.test(password)) strength++;
  return strength;
};

export default ValidatedFormInput;
