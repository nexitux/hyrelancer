'use client'
import { useState } from 'react';
import { Input } from 'antd';
import { sanitizeInput, validationConfigs } from '@/utils/inputValidation';
import RestrictedCharTooltip from '@/components/ui/RestrictedCharTooltip';
import CharacterRestrictionIndicator from '@/components/ui/CharacterRestrictionIndicator';

const { TextArea } = Input;

const ValidatedAntdInput = ({ 
  validationType = 'text', 
  validationConfig = {}, 
  onChange, 
  value, 
  showCharacterIndicator = true,
  ...props 
}) => {
  const [showTooltip, setShowTooltip] = useState(false);
  const [restrictedChar, setRestrictedChar] = useState('');
  const handleChange = (e) => {
    const inputValue = e.target.value;
    let sanitizedValue = inputValue;
    
    // Apply validation based on input type
    if (validationType === 'email') {
      sanitizedValue = inputValue.replace(/[^a-zA-Z0-9@.]/g, '');
    } else if (validationType === 'phone') {
      sanitizedValue = inputValue.replace(/[^0-9+]/g, '');
    } else if (validationType === 'name') {
      sanitizedValue = sanitizeInput(inputValue, validationConfigs.name);
    } else if (validationType === 'title') {
      sanitizedValue = sanitizeInput(inputValue, validationConfigs.title);
    } else if (validationType === 'description') {
      sanitizedValue = sanitizeInput(inputValue, validationConfigs.description);
    } else if (validationType === 'message') {
      sanitizedValue = sanitizeInput(inputValue, validationConfigs.message);
    } else {
      sanitizedValue = sanitizeInput(inputValue, validationConfig);
    }
    
    // Update the input value
    e.target.value = sanitizedValue;
    
    // Call the original onChange with the sanitized value
    if (onChange) {
      onChange(e);
    }
  };

  const handleKeyPress = (e) => {
    const char = e.key;
    
    // Allow control keys (backspace, delete, arrow keys, etc.)
    if (e.ctrlKey || e.metaKey || e.altKey || 
        ['Backspace', 'Delete', 'ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', 'Tab', 'Enter'].includes(char)) {
      return;
    }
    
    let isRestricted = false;
    
    // For email inputs
    if (validationType === 'email') {
      if (!/[a-zA-Z0-9@.]/.test(char)) {
        isRestricted = true;
      }
    }
    // For phone inputs
    else if (validationType === 'phone') {
      if (!/[0-9+]/.test(char)) {
        isRestricted = true;
      }
    }
    // For other text inputs, check against forbidden characters
    else if (['text', 'title', 'description', 'message', 'name'].includes(validationType)) {
      const forbiddenChars = /[<>{}[\]\\|`~;$\^&]/;
      if (forbiddenChars.test(char)) {
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
    <div>
      <RestrictedCharTooltip
        showTooltip={showTooltip}
        restrictedChar={restrictedChar}
        validationType={validationType}
        validationConfig={validationConfig}
        onTooltipChange={setShowTooltip}
      >
        <Input
          {...props}
          value={value}
          onChange={handleChange}
          onKeyPress={handleKeyPress}
        />
      </RestrictedCharTooltip>
      
      {/* Character Restriction Indicator */}
      {showCharacterIndicator && (
        <CharacterRestrictionIndicator
          value={value}
          validationType={validationType}
          validationConfig={validationConfig}
          showIndicator={true}
        />
      )}
    </div>
  );
};

const ValidatedAntdTextArea = ({ 
  validationType = 'text', 
  validationConfig = {}, 
  onChange, 
  value, 
  showCharacterIndicator = true,
  ...props 
}) => {
  const [showTooltip, setShowTooltip] = useState(false);
  const [restrictedChar, setRestrictedChar] = useState('');
  const handleChange = (e) => {
    const inputValue = e.target.value;
    let sanitizedValue = inputValue;
    
    // Apply validation based on input type
    if (validationType === 'description') {
      sanitizedValue = sanitizeInput(inputValue, validationConfigs.description);
    } else if (validationType === 'message') {
      sanitizedValue = sanitizeInput(inputValue, validationConfigs.message);
    } else {
      sanitizedValue = sanitizeInput(inputValue, validationConfig);
    }
    
    // Update the input value
    e.target.value = sanitizedValue;
    
    // Call the original onChange with the sanitized value
    if (onChange) {
      onChange(e);
    }
  };

  const handleKeyPress = (e) => {
    const char = e.key;
    
    // Allow control keys (backspace, delete, arrow keys, etc.)
    if (e.ctrlKey || e.metaKey || e.altKey || 
        ['Backspace', 'Delete', 'ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', 'Tab', 'Enter'].includes(char)) {
      return;
    }
    
    let isRestricted = false;
    
    // For textarea inputs, check against forbidden characters
    const forbiddenChars = /[<>{}[\]\\|`~;$\^&]/;
    if (forbiddenChars.test(char)) {
      isRestricted = true;
    }
    
    if (isRestricted) {
      e.preventDefault();
      setRestrictedChar(char);
      setShowTooltip(true);
      return;
    }
  };

  return (
    <div>
      <RestrictedCharTooltip
        showTooltip={showTooltip}
        restrictedChar={restrictedChar}
        validationType={validationType}
        validationConfig={validationConfig}
        onTooltipChange={setShowTooltip}
      >
        <TextArea
          {...props}
          value={value}
          onChange={handleChange}
          onKeyPress={handleKeyPress}
        />
      </RestrictedCharTooltip>
      
      {/* Character Restriction Indicator */}
      {showCharacterIndicator && (
        <CharacterRestrictionIndicator
          value={value}
          validationType={validationType}
          validationConfig={validationConfig}
          showIndicator={true}
        />
      )}
    </div>
  );
};

export { ValidatedAntdInput, ValidatedAntdTextArea };
export default ValidatedAntdInput;
