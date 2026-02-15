'use client';

import { useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card } from '@/components/ui/card';
import { CheckCircle, AlertCircle } from 'lucide-react';
import type { Form, FormField } from '@/types';

interface PublicFormProps {
  form: Form;
  firstStageId?: string;
}

export function PublicForm({ form, firstStageId }: PublicFormProps) {
  const [formData, setFormData] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const supabase = createClient();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);

    try {
      // Validate required fields
      for (const field of form.fields) {
        if (field.required && !formData[field.id]) {
          throw new Error(`${field.label} is required`);
        }
      }

      // Extract name and email for quick access
      const emailField = form.fields.find(f => f.type === 'email');
      const nameField = form.fields.find(f => 
        f.label.toLowerCase().includes('name') && f.type === 'text'
      );

      // Submit via API (handles email notification)
      const response = await fetch('/api/submissions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          form_id: form.id,
          stage_id: firstStageId,
          data: formData,
          email: emailField ? formData[emailField.id] : null,
          name: nameField ? formData[nameField.id] : null,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to submit');
      }

      setSubmitted(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to submit');
    } finally {
      setSubmitting(false);
    }
  };

  const updateField = (fieldId: string, value: string) => {
    setFormData(prev => ({ ...prev, [fieldId]: value }));
  };

  // Success state
  if (submitted) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <Card className="max-w-md w-full p-8 text-center">
          <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="w-8 h-8 text-green-600" />
          </div>
          <h2 className="text-2xl font-semibold mb-2">Application Submitted!</h2>
          <p className="text-gray-600">
            Thank you for your application. We'll review it and get back to you soon.
          </p>
        </Card>
      </div>
    );
  }

  // Not published warning
  if (!form.published) {
    return (
      <div className="min-h-screen bg-gray-50 p-4">
        <div className="max-w-xl mx-auto">
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6 flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-yellow-800">Preview Mode</p>
              <p className="text-sm text-yellow-700">
                This form is not published yet. Only you can see this preview.
              </p>
            </div>
          </div>
          <FormContent 
            form={form}
            formData={formData}
            updateField={updateField}
            handleSubmit={handleSubmit}
            submitting={submitting}
            error={error}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-xl mx-auto">
        <FormContent 
          form={form}
          formData={formData}
          updateField={updateField}
          handleSubmit={handleSubmit}
          submitting={submitting}
          error={error}
        />
      </div>
    </div>
  );
}

interface FormContentProps {
  form: Form;
  formData: Record<string, string>;
  updateField: (fieldId: string, value: string) => void;
  handleSubmit: (e: React.FormEvent) => void;
  submitting: boolean;
  error: string | null;
}

function FormContent({ form, formData, updateField, handleSubmit, submitting, error }: FormContentProps) {
  return (
    <Card className="p-6 md:p-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">{form.title}</h1>
        {form.description && (
          <p className="text-gray-600">{form.description}</p>
        )}
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {error && (
          <div className="p-3 text-sm text-red-600 bg-red-50 rounded-md flex items-center gap-2">
            <AlertCircle className="w-4 h-4" />
            {error}
          </div>
        )}

        {form.fields.map((field: FormField) => (
          <div key={field.id} className="space-y-2">
            <label htmlFor={field.id} className="block text-sm font-medium text-gray-700">
              {field.label}
              {field.required && <span className="text-red-500 ml-1">*</span>}
            </label>
            
            {field.type === 'textarea' ? (
              <Textarea
                id={field.id}
                placeholder={field.placeholder}
                value={formData[field.id] || ''}
                onChange={(e) => updateField(field.id, e.target.value)}
                required={field.required}
                rows={4}
              />
            ) : field.type === 'select' && 'options' in field ? (
              <select
                id={field.id}
                value={formData[field.id] || ''}
                onChange={(e) => updateField(field.id, e.target.value)}
                required={field.required}
                className="w-full h-10 px-3 rounded-md border border-input bg-background text-sm"
              >
                <option value="">Select an option...</option>
                {field.options?.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            ) : (
              <Input
                id={field.id}
                type={field.type === 'email' ? 'email' : field.type === 'phone' ? 'tel' : 'text'}
                placeholder={field.placeholder}
                value={formData[field.id] || ''}
                onChange={(e) => updateField(field.id, e.target.value)}
                required={field.required}
              />
            )}

            {field.helpText && (
              <p className="text-xs text-gray-500">{field.helpText}</p>
            )}
          </div>
        ))}

        <Button type="submit" className="w-full" disabled={submitting}>
          {submitting ? 'Submitting...' : 'Submit Application'}
        </Button>
      </form>

      <p className="text-center text-xs text-gray-400 mt-6">
        Powered by EnrolStudio
      </p>
    </Card>
  );
}
