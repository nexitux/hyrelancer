/**
 * Input validation utilities for character restrictions
 * Allows only common special characters used for writing: . , ' " - ( ) [ ] { } : ; ! ? @ # $ % ^ & * + = | \ / < > ~ ` 
 * Restricts dangerous or problematic characters
 */

// Allowed special characters for general text input
const ALLOWED_SPECIAL_CHARS = /[.,'"\-()\[\]{}:!?@#%*+=|\\\/<>~`\s]/g;

// Characters that are completely forbidden
const FORBIDDEN_CHARS = /[<>{}[\]\\|`~;$\^]/g;

// Characters that are allowed but should be limited
const LIMITED_CHARS = /[]/g;

/**
 * Sanitizes input by removing forbidden characters and limiting problematic ones
 * @param {string} input - The input string to sanitize
 * @param {Object} options - Configuration options
 * @param {boolean} options.allowLimitedChars - Whether to allow limited characters (default: true)
 * @param {boolean} options.preserveSpaces - Whether to preserve spaces (default: true)
 * @param {boolean} options.strict - Whether to use strict mode (removes more characters)
 * @returns {string} - Sanitized input
 */
export const sanitizeInput = (input, options = {}) => {
  if (!input || typeof input !== 'string') return '';
  
  const {
    allowLimitedChars = true,
    preserveSpaces = true,
    strict = false
  } = options;
  
  let sanitized = input;
  
  // Remove forbidden characters
  sanitized = sanitized.replace(FORBIDDEN_CHARS, '');
  
  // In strict mode, remove more characters
  if (strict) {
    sanitized = sanitized.replace(/[&]/g, '');
  } else if (!allowLimitedChars) {
    // Remove limited characters if not allowed
    sanitized = sanitized.replace(LIMITED_CHARS, '');
  }
  
  // Preserve spaces if requested
  if (!preserveSpaces) {
    sanitized = sanitized.replace(/\s/g, '');
  }
  
  return sanitized;
};

/**
 * Validates if input contains only allowed characters
 * @param {string} input - The input string to validate
 * @param {Object} options - Configuration options
 * @returns {Object} - Validation result with isValid and message
 */
export const validateInput = (input, options = {}) => {
  if (!input || typeof input !== 'string') {
    return { isValid: true, message: '' };
  }
  
  const {
    allowLimitedChars = true,
    strict = false
  } = options;
  
  // Check for forbidden characters
  const hasForbiddenChars = FORBIDDEN_CHARS.test(input);
  if (hasForbiddenChars) {
    return {
      isValid: false,
      message: 'Input contains forbidden characters. Please remove < > { } [ ] \\ | ` ~ characters.'
    };
  }
  
  // Check for limited characters in strict mode or when not allowed
  if (strict || !allowLimitedChars) {
    const hasLimitedChars = LIMITED_CHARS.test(input);
    if (hasLimitedChars) {
      return {
        isValid: false,
        message: 'Input contains restricted characters. Please remove & characters.'
      };
    }
  }
  
  return { isValid: true, message: '' };
};

/**
 * Real-time input sanitization for form inputs
 * @param {Event} event - The input event
 * @param {Object} options - Configuration options
 * @returns {string} - Sanitized value
 */
export const handleInputChange = (event, options = {}) => {
  const { value } = event.target;
  const sanitizedValue = sanitizeInput(value, options);
  
  // Update the input value
  event.target.value = sanitizedValue;
  
  return sanitizedValue;
};

/**
 * Specialized validation for different input types
 */
export const inputValidators = {
  // General text input (names, titles, descriptions)
  text: (input, options = {}) => {
    return validateInput(input, { allowLimitedChars: true, strict: false, ...options });
  },
  
  // Strict text input (removes more characters)
  strictText: (input, options = {}) => {
    return validateInput(input, { allowLimitedChars: false, strict: true, ...options });
  },
  
  // Email input (allows @ and . only)
  email: (input) => {
    if (!input) return { isValid: true, message: '' };
    const sanitized = input.replace(/[^a-zA-Z0-9@.]/g, '');
    return {
      isValid: sanitized === input,
      message: sanitized !== input ? 'Email can only contain letters, numbers, @ and . characters.' : ''
    };
  },
  
  // Phone number input (digits and + only)
  phone: (input) => {
    if (!input) return { isValid: true, message: '' };
    const sanitized = input.replace(/[^0-9+]/g, '');
    return {
      isValid: sanitized === input,
      message: sanitized !== input ? 'Phone number can only contain digits and + character.' : ''
    };
  },
  
  // Password input (allows most characters but restricts some)
  password: (input) => {
    if (!input) return { isValid: true, message: '' };
    const sanitized = sanitizeInput(input, { allowLimitedChars: true, strict: false });
    return {
      isValid: sanitized === input,
      message: sanitized !== input ? 'Password contains forbidden characters.' : ''
    };
  },
  
  // URL input (allows URL-safe characters)
  url: (input) => {
    if (!input) return { isValid: true, message: '' };
    const urlPattern = /^https?:\/\/[^\s<>{}[\]\\|`~]+$/;
    return {
      isValid: urlPattern.test(input),
      message: urlPattern.test(input) ? '' : 'Please enter a valid URL without forbidden characters.'
    };
  }
};

/**
 * Hook for real-time input validation
 * @param {string} initialValue - Initial input value
 * @param {Object} options - Validation options
 * @returns {Object} - { value, error, handleChange, validate }
 */
export const useInputValidation = (initialValue = '', options = {}) => {
  const [value, setValue] = useState(initialValue);
  const [error, setError] = useState('');
  
  const handleChange = (event) => {
    const sanitizedValue = handleInputChange(event, options);
    setValue(sanitizedValue);
    
    // Clear error when user starts typing
    if (error) {
      setError('');
    }
  };
  
  const validate = (validatorType = 'text') => {
    const validator = inputValidators[validatorType];
    if (validator) {
      const result = validator(value, options);
      setError(result.message);
      return result.isValid;
    }
    return true;
  };
  
  return { value, error, handleChange, validate };
};

/**
 * Predefined validation configurations for common use cases
 */
export const validationConfigs = {
  // Job titles, project names
  title: {
    allowLimitedChars: true,
    strict: false,
    maxLength: 100
  },
  
  // Descriptions, comments
  description: {
    allowLimitedChars: true,
    strict: false,
    maxLength: 1000
  },
  
  // Names (first name, last name)
  name: {
    allowLimitedChars: false,
    strict: true,
    maxLength: 50
  },
  
  // Messages, support tickets
  message: {
    allowLimitedChars: true,
    strict: false,
    maxLength: 2000
  },
  
  // Search queries
  search: {
    allowLimitedChars: true,
    strict: false,
    maxLength: 100
  }
};

// Import useState for the hook
import { useState } from 'react';
