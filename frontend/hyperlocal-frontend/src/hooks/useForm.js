import { useState, useCallback } from 'react';

/**
 * Custom hook for form state management and validation
 * Reduces repetitive form handling logic across components
 */
export const useForm = (initialValues, onSubmit, validator) => {
  const [formData, setFormData] = useState(initialValues);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const handleChange = useCallback((e) => {
    const { name, value, type, checked } = e.target;
    const newValue = type === 'checkbox' ? checked : value;
    
    setFormData((prev) => ({ ...prev, [name]: newValue }));
    
    // Clear error for this field when user starts typing
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  }, [errors]);

  const handleSubmit = useCallback(
    async (e) => {
      e.preventDefault();
      
      const newErrors = validator(formData);
      
      if (Object.keys(newErrors).length > 0) {
        setErrors(newErrors);
        return;
      }

      setLoading(true);
      try {
        await onSubmit(formData);
      } catch (error) {
        setErrors({ submit: error.message || 'An error occurred. Please try again.' });
      } finally {
        setLoading(false);
      }
    },
    [formData, validator, onSubmit]
  );

  const setFieldError = useCallback((field, error) => {
    setErrors((prev) => ({ ...prev, [field]: error }));
  }, []);

  const clearErrors = useCallback(() => {
    setErrors({});
  }, []);

  const resetForm = useCallback(() => {
    setFormData(initialValues);
    setErrors({});
  }, [initialValues]);

  return {
    formData,
    setFormData,
    errors,
    setErrors,
    loading,
    setLoading,
    handleChange,
    handleSubmit,
    setFieldError,
    clearErrors,
    resetForm,
  };
};
