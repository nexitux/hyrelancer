# Input Validation System

This document explains how to use the input validation system implemented across the project to restrict special characters and ensure data integrity.

## Overview

The validation system prevents users from entering dangerous or problematic special characters while allowing common writing characters. It provides real-time validation and sanitization for all input fields.

## Allowed Characters

### General Text Input
- **Letters**: a-z, A-Z
- **Numbers**: 0-9
- **Common punctuation**: . , ' " - ( ) [ ] : ! ? @ # % * + = | \ / < > ~ ` 
- **Spaces**: Regular spaces

### Restricted Characters
- **Completely forbidden**: `< > { } [ ] \ | ` ~ ; $ & ^`
- **Limited use**: None (all dangerous characters are completely blocked)

## Usage

### 1. Basic FormInput Component

The enhanced `FormInput` component now includes built-in validation:

```jsx
import FormInput from '@/components/auth/FormInput';
import { validationConfigs } from '@/utils/inputValidation';

<FormInput
  label="Job Title"
  type="text"
  name="title"
  value={formData.title}
  onChange={handleChange}
  error={errors.title}
  placeholder="Enter job title"
  required
  validationType="text"
  validationConfig={validationConfigs.title}
  maxLength={100}
/>
```

### 2. Manual Validation in Form Handlers

```jsx
import { sanitizeInput, validationConfigs } from '@/utils/inputValidation';

const handleInputChange = (e) => {
  const { name, value } = e.target;
  
  let sanitizedValue = value;
  
  if (name === 'title') {
    sanitizedValue = sanitizeInput(value, validationConfigs.title);
  } else if (name === 'email') {
    sanitizedValue = value.replace(/[^a-zA-Z0-9@.]/g, '');
  } else if (name === 'phone') {
    sanitizedValue = value.replace(/[^0-9+]/g, '');
  }
  
  setFormData(prev => ({ ...prev, [name]: sanitizedValue }));
};
```

### 3. Validation Types

#### Text Inputs
- `text`: General text (allows most characters)
- `strictText`: Strict text (removes & and other limited characters)
- `name`: Names (removes special characters except basic punctuation)

#### Specialized Inputs
- `email`: Only alphanumeric, @, and .
- `phone`: Only digits and +
- `password`: Allows most characters but removes dangerous ones
- `url`: URL-safe characters only

### 4. Validation Configurations

Predefined configurations for common use cases:

```jsx
// Job titles, project names
validationConfigs.title = {
  allowLimitedChars: true,
  strict: false,
  maxLength: 100
};

// Descriptions, comments
validationConfigs.description = {
  allowLimitedChars: true,
  strict: false,
  maxLength: 1000
};

// Names (first name, last name)
validationConfigs.name = {
  allowLimitedChars: false,
  strict: true,
  maxLength: 50
};

// Messages, support tickets
validationConfigs.message = {
  allowLimitedChars: true,
  strict: false,
  maxLength: 2000
};
```

## Implementation Examples

### 1. Job Post Form
```jsx
// In job post form
const handleInputChange = (e) => {
  const { name, value } = e.target;
  
  let sanitizedValue = value;
  
  if (name === 'title') {
    sanitizedValue = sanitizeInput(value, validationConfigs.title);
  } else if (name === 'description') {
    sanitizedValue = sanitizeInput(value, validationConfigs.description);
  } else if (name === 'name') {
    sanitizedValue = sanitizeInput(value, validationConfigs.name);
  } else if (name === 'email') {
    sanitizedValue = value.replace(/[^a-zA-Z0-9@.]/g, '');
  } else if (name === 'phone') {
    sanitizedValue = value.replace(/[^0-9+]/g, '');
  }
  
  setFormData(prev => ({ ...prev, [name]: sanitizedValue }));
};
```

### 2. Auth Forms
```jsx
// In authentication forms
const handleChange = (e) => {
  const { name, value } = e.target;
  
  let sanitizedValue = value;
  
  if (name === 'name') {
    sanitizedValue = sanitizeInput(value, validationConfigs.name);
  } else if (name === 'email') {
    sanitizedValue = value.replace(/[^a-zA-Z0-9@.]/g, '');
  } else if (name === 'mobile') {
    sanitizedValue = value.replace(/[^0-9+]/g, '');
  } else if (name === 'password') {
    sanitizedValue = sanitizeInput(value, { allowLimitedChars: true, strict: false });
  }
  
  setFormData(prev => ({ ...prev, [name]: sanitizedValue }));
};
```

## Key Features

### 1. Real-time Sanitization
- Characters are removed as the user types
- No need for post-submission validation
- Immediate feedback to users

### 2. Type-specific Validation
- Different rules for different input types
- Email: Only alphanumeric, @, and .
- Phone: Only digits and +
- Names: Strict character filtering
- Passwords: Balanced security and usability

### 3. Configurable Rules
- Flexible validation configurations
- Easy to adjust for different use cases
- Support for strict and lenient modes

### 4. Character Count Display
- Shows current character count
- Respects maximum length limits
- Visual feedback for users

## Migration Guide

### For Existing Forms

1. **Import the validation utilities**:
   ```jsx
   import { sanitizeInput, validationConfigs } from '@/utils/inputValidation';
   ```

2. **Update your input change handlers**:
   ```jsx
   // Before
   const handleChange = (e) => {
     setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
   };
   
   // After
   const handleChange = (e) => {
     const { name, value } = e.target;
     const sanitizedValue = sanitizeInput(value, validationConfigs.text);
     setFormData(prev => ({ ...prev, [name]: sanitizedValue }));
   };
   ```

3. **Update FormInput components**:
   ```jsx
   // Add validation props
   <FormInput
     // ... existing props
     validationType="text"
     validationConfig={validationConfigs.title}
     maxLength={100}
   />
   ```

## Testing

The validation system has been tested with:
- Various special characters
- Different input types (text, email, phone, password)
- Edge cases (empty strings, very long inputs)
- Real-time typing scenarios

## Security Benefits

1. **XSS Prevention**: Removes potentially dangerous characters
2. **Data Integrity**: Ensures consistent data format
3. **User Experience**: Prevents errors before they occur
4. **System Stability**: Reduces server-side validation errors

## Troubleshooting

### Common Issues

1. **Characters not being removed**: Check that you're using the correct validation type
2. **Too restrictive**: Adjust the validation configuration
3. **Performance issues**: Ensure validation is only applied on change, not on every render

### Debug Mode

To debug validation issues, you can log the sanitization process:

```jsx
const handleChange = (e) => {
  const { name, value } = e.target;
  const sanitizedValue = sanitizeInput(value, validationConfigs.text);
  
  if (value !== sanitizedValue) {
    console.log(`Sanitized ${name}: "${value}" -> "${sanitizedValue}"`);
  }
  
  setFormData(prev => ({ ...prev, [name]: sanitizedValue }));
};
```

## Future Enhancements

- Custom validation rules per field
- International character support
- Advanced password strength validation
- Form-level validation summaries
- Accessibility improvements for screen readers
