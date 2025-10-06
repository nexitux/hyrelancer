'use client'
import { useState } from 'react';
import { sanitizeInput, validateInput, inputValidators, validationConfigs } from '@/utils/inputValidation';

const ValidationTest = () => {
  const [testInputs, setTestInputs] = useState({
    text: '',
    email: '',
    phone: '',
    name: '',
    password: ''
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
      case 'email':
        sanitizedValue = value.replace(/[^a-zA-Z0-9@.]/g, '');
        validation = inputValidators.email(sanitizedValue);
        break;
      case 'phone':
        sanitizedValue = value.replace(/[^0-9+]/g, '');
        validation = inputValidators.phone(sanitizedValue);
        break;
      case 'name':
        sanitizedValue = sanitizeInput(value, validationConfigs.name);
        validation = inputValidators.strictText(sanitizedValue, validationConfigs.name);
        break;
      case 'password':
        sanitizedValue = sanitizeInput(value, { allowLimitedChars: true, strict: false });
        validation = inputValidators.password(sanitizedValue);
        break;
    }

    setTestInputs(prev => ({ ...prev, [field]: sanitizedValue }));
    setResults(prev => ({ ...prev, [field]: validation }));
  };

  const testCases = [
    { field: 'text', label: 'General Text', placeholder: 'Try: Hello <script>alert("xss")</script> world!' },
    { field: 'email', label: 'Email', placeholder: 'Try: user@domain.com or user@domain.com<script>' },
    { field: 'phone', label: 'Phone', placeholder: 'Try: +1234567890 or +123-456-7890' },
    { field: 'name', label: 'Name', placeholder: 'Try: John & Jane Doe or John <script>alert("xss")</script>' },
    { field: 'password', label: 'Password', placeholder: 'Try: MyP@ssw0rd! or password<script>alert("xss")</script>' }
  ];

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white rounded-lg shadow-lg">
      <h2 className="text-2xl font-bold mb-6 text-center">Input Validation Test</h2>
      <p className="text-gray-600 mb-6 text-center">
        Test the character validation system. Try entering special characters to see how they are sanitized.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {testCases.map(({ field, label, placeholder }) => (
          <div key={field} className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              {label}
            </label>
            <input
              type={field === 'password' ? 'password' : 'text'}
              value={testInputs[field]}
              onChange={(e) => handleTestInput(field, e.target.value)}
              placeholder={placeholder}
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 ${
                results[field]?.isValid 
                  ? 'border-green-300 focus:ring-green-500' 
                  : 'border-red-300 focus:ring-red-500'
              }`}
            />
            {results[field]?.message && (
              <p className="text-sm text-red-600">{results[field].message}</p>
            )}
            <div className="text-xs text-gray-500">
              <strong>Original:</strong> {testInputs[field] || '(empty)'}
            </div>
          </div>
        ))}
      </div>

      <div className="mt-8 p-4 bg-gray-50 rounded-lg">
        <h3 className="font-semibold mb-2">Validation Rules:</h3>
        <ul className="text-sm space-y-1">
          <li><strong>General Text:</strong> Allows common punctuation, removes &lt; &gt; { } [ ] \ | ` ~</li>
          <li><strong>Email:</strong> Only letters, numbers, @ and .</li>
          <li><strong>Phone:</strong> Only digits and +</li>
          <li><strong>Name:</strong> Strict mode - removes & and other special characters</li>
          <li><strong>Password:</strong> Allows most characters but removes dangerous ones</li>
        </ul>
      </div>

      <div className="mt-6 p-4 bg-blue-50 rounded-lg">
        <h3 className="font-semibold mb-2">Test Cases to Try:</h3>
        <div className="text-sm space-y-1">
          <div><strong>XSS Attempt:</strong> &lt;script&gt;alert('xss')&lt;/script&gt;</div>
          <div><strong>SQL Injection:</strong> '; DROP TABLE users; --</div>
          <div><strong>Special Characters:</strong> !@#$%^&*()_+{}|:"&lt;&gt;?[]\\;',./</div>
          <div><strong>Unicode:</strong> Hello 世界 🌍</div>
        </div>
      </div>
    </div>
  );
};

export default ValidationTest;
