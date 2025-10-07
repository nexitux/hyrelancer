'use client'
import { useState, useEffect } from 'react';
import { FaExclamationTriangle, FaCheckCircle } from 'react-icons/fa';

const CharacterRestrictionIndicator = ({ 
  value = '', 
  validationType = 'text',
  validationConfig = {},
  showIndicator = true
}) => {
  const [hasRestrictedChars, setHasRestrictedChars] = useState(false);
  const [restrictedChars, setRestrictedChars] = useState([]);

  useEffect(() => {
    if (!value || !showIndicator) {
      setHasRestrictedChars(false);
      setRestrictedChars([]);
      return;
    }

    let forbiddenChars = [];
    let foundRestricted = [];

    // Check based on validation type
    if (validationType === 'email') {
      const invalidChars = value.match(/[^a-zA-Z0-9@.]/g);
      if (invalidChars) {
        foundRestricted = [...new Set(invalidChars)];
      }
    } else if (validationType === 'phone') {
      const invalidChars = value.match(/[^0-9+]/g);
      if (invalidChars) {
        foundRestricted = [...new Set(invalidChars)];
      }
    } else {
      // For text inputs, check forbidden characters
      const forbiddenPattern = /[<>{}[\]\\|`~;$\^&]/g;
      const matches = value.match(forbiddenPattern);
      if (matches) {
        foundRestricted = [...new Set(matches)];
      }
    }

    setHasRestrictedChars(foundRestricted.length > 0);
    setRestrictedChars(foundRestricted);
  }, [value, validationType, validationConfig, showIndicator]);

  if (!showIndicator || !value) {
    return null;
  }

  return (
    <div className="flex items-center space-x-2 mt-1">
      {hasRestrictedChars ? (
        <div className="flex items-center space-x-1 text-red-500">
          <FaExclamationTriangle className="text-xs" />
          <span className="text-xs">
            Restricted characters: {restrictedChars.join(', ')}
          </span>
        </div>
      ) : (
        <div className="flex items-center space-x-1 text-green-500">
          <FaCheckCircle className="text-xs" />
          <span className="text-xs">Valid characters</span>
        </div>
      )}
    </div>
  );
};

export default CharacterRestrictionIndicator;

