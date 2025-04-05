import { useState, useCallback, useEffect } from 'react';

/**
 * A custom React hook for reading and writing URL query parameters
 * 
 * @param paramName - The name of the query parameter to manage
 * @param defaultValue - Default value if the parameter doesn't exist
 * @returns - Current parameter value and setter function
 */
const useQueryParam = (
  paramName: string, 
  defaultValue: string = ''
): [string, (newValue: string) => void] => {
  // Get the initial value from URL or use default
  const getQueryParamValue = useCallback((): string => {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get(paramName) || defaultValue;
  }, [paramName, defaultValue]);

  // Initialize state with current URL value
  const [value, setValue] = useState<string>(getQueryParamValue());

  // Update URL when value changes
  const updateValue = useCallback((newValue: string): void => {
    setValue(newValue);
    
    const url = new URL(window.location.href);
    
    if (newValue && newValue !== defaultValue) {
      url.searchParams.set(paramName, newValue);
    } else {
      url.searchParams.delete(paramName);
    }
    
    window.history.pushState({}, '', url.toString());
  }, [paramName, defaultValue]);

  // Listen for popstate events (browser back/forward)
  useEffect(() => {
    const handlePopState = (): void => {
      setValue(getQueryParamValue());
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, [getQueryParamValue]);

  return [value, updateValue];
};

export default useQueryParam; 