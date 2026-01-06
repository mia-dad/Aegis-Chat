import React, { useState } from 'react';
import { FieldSpec } from '../../types';
import { Loader2 } from 'lucide-react';

interface DynamicFormProps {
  schema: Record<string, FieldSpec>;
  onSubmit: (data: Record<string, any>) => void;
  isSubmitting: boolean;
  disabled?: boolean;
}

export const DynamicForm: React.FC<DynamicFormProps> = ({ schema, onSubmit, isSubmitting, disabled }) => {
  const [formData, setFormData] = useState<Record<string, any>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleChange = (key: string, value: any) => {
    setFormData((prev) => ({ ...prev, [key]: value }));
    // Clear error when user changes input
    if (errors[key]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[key];
        return newErrors;
      });
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Simple validation
    const newErrors: Record<string, string> = {};
    let hasError = false;
    Object.entries(schema).forEach(([key, spec]) => {
      if (spec.required) {
        const val = formData[key];
        if (val === undefined || val === '' || val === null) {
          newErrors[key] = 'This field is required';
          hasError = true;
        }
      }
    });

    if (hasError) {
      setErrors(newErrors);
      return;
    }

    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="mt-4 p-4 bg-blue-50/50 rounded-xl border border-blue-100">
      <div className="space-y-4">
        {Object.entries(schema).map(([key, spec]) => (
          <div key={key}>
            <label className="block text-xs font-semibold text-blue-900 mb-1.5 uppercase tracking-wider">
              {key} {spec.required && <span className="text-red-500">*</span>}
            </label>
            
            {spec.description && (
              <p className="text-xs text-gray-500 mb-1">{spec.description}</p>
            )}

            {spec.type === 'boolean' ? (
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id={key}
                  disabled={disabled}
                  checked={!!formData[key]}
                  onChange={(e) => handleChange(key, e.target.checked)}
                  className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 disabled:opacity-50"
                />
                <label htmlFor={key} className="text-sm text-gray-700 select-none cursor-pointer">
                  Yes, enable this option
                </label>
              </div>
            ) : (
              <input
                type={spec.type === 'number' ? 'number' : 'text'}
                disabled={disabled}
                value={formData[key] || ''}
                onChange={(e) => handleChange(key, spec.type === 'number' ? Number(e.target.value) : e.target.value)}
                className={`w-full px-3 py-2 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 disabled:bg-gray-100 disabled:text-gray-500 transition-all
                  ${errors[key] ? 'border-red-300 bg-red-50 focus:border-red-500' : 'border-gray-200 bg-white'}`}
                placeholder={spec.type === 'number' ? '0' : 'Enter value...'}
              />
            )}
            
            {errors[key] && (
              <p className="mt-1 text-xs text-red-500">{errors[key]}</p>
            )}
          </div>
        ))}
      </div>

      <div className="mt-4 flex justify-end">
        {!disabled && (
          <button
            type="submit"
            disabled={isSubmitting}
            className="inline-flex items-center justify-center px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-sm"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Submitting...
              </>
            ) : (
              'Submit'
            )}
          </button>
        )}
      </div>
    </form>
  );
};