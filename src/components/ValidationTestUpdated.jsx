'use client'
import { useState } from 'react';
import { sanitizeInput, validateInput, inputValidators, validationConfigs } from '@/utils/inputValidation';

const ValidationTestUpdated = () => {
  const [testInputs, setTestInputs] = useState({
    text: '',
    name: '',
    description: ''
  });

  const [results, setResults] = useState({});

  const handleTestInput = (field, value) => {
    let sanitizedValue = value;
    let validation = { isValid: true, message: '' };

    switch (field) {
      case 'text':
        sanitizedValue = sanitizeInput(value, validationConfigs.title);
        validation = inputValidators.text(sanitizedValue, validationConfigs.title);
        break;
      case 'name':
        sanitizedValue = sanitizeInput(value, validationConfigs.name);
        validation = inputValidators.strictText(sanitizedValue, validationConfigs.name);
        break;
      case 'description':
        sanitizedValue = sanitizeInput(value, validationConfigs.description);
        validation = inputValidators.text(sanitizedValue, validationConfigs.description);
        break;
    }

    setTestInputs(prev => ({ ...prev, [field]: sanitizedValue }));
    setResults(prev => ({ ...prev, [field]: validation }));
  };

  const testCases = [
    { 
      field: 'text', 
      label: 'General Text', 
      placeholder: 'Try: Hello <script>alert("xss")</script> world!',
      description: 'Should remove: < > { } [ ] \\ | ` ~ ; $ & ^'
    },
    { 
      field: 'name', 
      label: 'Name (Strict)', 
      placeholder: 'Try: John & Jane Doe; $100',
      description: 'Should remove: ; $ & ^ and other special chars'
    },
    { 
      field: 'description', 
      label: 'Description', 
      placeholder: 'Try: My project costs $500; uses & symbols',
      description: 'Should remove: ; $ & ^ characters'
    }
  ];

  const dangerousChars = [';', '$', '&', '^', '<', '>', '{', '}', '[', ']', '\\', '|', '`', '~'];

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white rounded-lg shadow-lg">
      <h2 className="text-2xl font-bold mb-6 text-center">Updated Input Validation Test</h2>
      <p className="text-gray-600 mb-6 text-center">
        Test the updated character validation system. The new forbidden characters are: <strong>; $ & ^</strong>
      </p>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {testCases.map(({ field, label, placeholder, description }) => (
          <div key={field} className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              {label}
            </label>
            <input
              type="text"
              value={testInputs[field]}
              onChange={(e) => handleTestInput(field, e.target.value)}
              placeholder={placeholder}
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 ${
                results[field]?.isValid 
                  ? 'border-green-300 focus:ring-green-500' 
                  : 'border-red-300 focus:ring-red-500'
              }`}
            />
            <p className="text-xs text-gray-500">{description}</p>
            {results[field]?.message && (
              <p className="text-sm text-red-600">{results[field].message}</p>
            )}
            <div className="text-xs text-gray-500">
              <strong>Sanitized:</strong> {testInputs[field] || '(empty)'}
            </div>
          </div>
        ))}
      </div>

      <div className="mt-8 p-4 bg-red-50 rounded-lg">
        <h3 className="font-semibold mb-2 text-red-800">New Forbidden Characters:</h3>
        <div className="flex flex-wrap gap-2">
          {dangerousChars.map((char, index) => (
            <span 
              key={index}
              className={`px-2 py-1 rounded text-sm font-mono ${
                [';', '$', '&', '^'].includes(char) 
                  ? 'bg-red-200 text-red-800 border border-red-300' 
                  : 'bg-gray-200 text-gray-800'
              }`}
            >
              {char}
            </span>
          ))}
        </div>
        <p className="text-sm text-red-700 mt-2">
          <strong>New additions:</strong> ; $ & ^ (highlighted in red)
        </p>
      </div>

      <div className="mt-6 p-4 bg-blue-50 rounded-lg">
        <h3 className="font-semibold mb-2">Test Cases to Try:</h3>
        <div className="text-sm space-y-1">
          <div><strong>Dangerous Characters:</strong> ; $ & ^ (newly blocked)</div>
          <div><strong>XSS Attempt:</strong> &lt;script&gt;alert('xss')&lt;/script&gt;</div>
          <div><strong>SQL Injection:</strong> '; DROP TABLE users; --</div>
          <div><strong>Mixed Content:</strong> Hello $100; uses & symbols ^ power</div>
        </div>
      </div>
    </div>
  );
};

export default ValidationTestUpdated;
