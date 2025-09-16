'use client'
import { FaEye, FaEyeSlash, FaExclamationCircle } from 'react-icons/fa';

const FormInput = ({
  label,
  type = 'text',
  name,
  value,
  onChange,
  error,
  showPassword,
  onTogglePassword,
  placeholder,
  required = false
}) => {
  const hasError = error && (Array.isArray(error) ? error.length > 0 : error);
  const errorMessage = Array.isArray(error) ? error[0] : error;

  return (
    <div className="mb-4">
      <label htmlFor={name} className="block text-sm font-medium text-gray-700 dark:text-gray-300">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      <div className="relative">
        <input
          type={type === 'password' && showPassword ? 'text' : type}
          id={name}
          name={name}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          className={`block px-3 py-3 mt-1 w-full rounded-lg border shadow-sm focus:outline-none focus:ring-2 transition-all duration-200 dark:bg-gray-700 dark:text-white ${
            hasError 
              ? 'bg-red-50 border-red-300 focus:ring-red-500 focus:border-red-500' 
              : 'border-gray-300 dark:border-gray-600 focus:ring-blue-500 focus:border-blue-500'
          }`}
        />
        
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

export default FormInput;