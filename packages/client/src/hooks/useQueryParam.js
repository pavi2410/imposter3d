import { useState, useCallback, useEffect } from 'react';

/**
 * A custom React hook for reading and writing URL query parameters
 * 
 * @param {string} paramName - The name of the query parameter to manage
 * @param {string} defaultValue - Default value if the parameter doesn't exist
 * @returns {[string, function]} - Current parameter value and setter function
 */
const useQueryParam = (paramName, defaultValue = '') => {
  // Get the initial value from URL or use default
  const getQueryParamValue = useCallback(() => {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get(paramName) || defaultValue;
  }, [paramName, defaultValue]);

  // Initialize state with current URL value
  const [value, setValue] = useState(getQueryParamValue());

  // Update URL when value changes
  const updateValue = useCallback((newValue) => {
    setValue(newValue);
    
    const url = new URL(window.location);
    
    if (newValue && newValue !== defaultValue) {
      url.searchParams.set(paramName, newValue);
    } else {
      url.searchParams.delete(paramName);
    }
    
    window.history.pushState({}, '', url);
  }, [paramName, defaultValue]);

  // Listen for popstate events (browser back/forward)
  useEffect(() => {
    const handlePopState = () => {
      setValue(getQueryParamValue());
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, [getQueryParamValue]);

  return [value, updateValue];
};

export default useQueryParam;