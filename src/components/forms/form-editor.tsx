'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  ArrowLeft, 
  Plus, 
  Trash2, 
  GripVertical, 
  Eye,
  Globe,
  Save,
  Type,
  AlignLeft,
  Mail,
  Phone,
  List,
  Upload
} from 'lucide-react';
import type { Form, FormField, FieldType } from '@/types';

const FIELD_TYPES: { type: FieldType; label: string; icon: React.ReactNode }[] = [
  { type: 'text', label: 'Short Text', icon: <Type className="w-4 h-4" /> },
  { type: 'textarea', label: 'Long Text', icon: <AlignLeft className="w-4 h-4" /> },
  { type: 'email', label: 'Email', icon: <Mail className="w-4 h-4" /> },
  { type: 'phone', label: 'Phone', icon: <Phone className="w-4 h-4" /> },
  { type: 'select', label: 'Dropdown', icon: <List className="w-4 h-4" /> },
  { type: 'file', label: 'File Upload', icon: <Upload className="w-4 h-4" /> },
];

interface FormEditorProps {
  initialForm: Form;
}

export function FormEditor({ initialForm }: FormEditorProps) {
  const [form, setForm] = useState<Form>(initialForm);
  const [fields, setFields] = useState<FormField[]>(initialForm.fields || []);
  const [saving, setSaving] = useState(false);
  const [selectedFieldId, setSelectedFieldId] = useState<string | null>(null);
  const router = useRouter();
  const supabase = createClient();

  const addField = (type: FieldType) => {
    const newField: FormField = {
      id: crypto.randomUUID(),
      type,
      label: `New ${FIELD_TYPES.find(f => f.type === type)?.label || 'Field'}`,
      required: false,
      placeholder: '',
      ...(type === 'select' ? { options: [{ label: 'Option 1', value: 'option-1' }] } : {}),
    } as FormField;
    
    setFields([...fields, newField]);
    setSelectedFieldId(newField.id);
  };

  const updateField = (id: string, updates: Partial<FormField>) => {
    setFields(fields.map(f => f.id === id ? { ...f, ...updates } as FormField : f));
  };

  const removeField = (id: string) => {
    setFields(fields.filter(f => f.id !== id));
    if (selectedFieldId === id) setSelectedFieldId(null);
  };

  const saveForm = async (publish = false) => {
    setSaving(true);
    try {
      const { error } = await supabase
        .from('forms')
        .update({ 
          fields,
          published: publish ? true : form.published,
          updated_at: new Date().toISOString(),
        })
        .eq('id', form.id);

      if (error) throw error;
      
      setForm({ ...form, fields, published: publish ? true : form.published });
      router.refresh();
    } catch (err) {
      console.error('Failed to save:', err);
    } finally {
      setSaving(false);
    }
  };

  const selectedField = fields.find(f => f.id === selectedFieldId);
  const publicUrl = typeof window !== 'undefined' 
    ? `${window.location.origin}/f/${form.slug}`
    : `/f/${form.slug}`;

  return (
    <div className="h-[calc(100vh-4rem)] flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between py-4 border-b">
        <div className="flex items-center gap-4">
          <Link 
            href="/dashboard/forms" 
            className="p-2 hover:bg-gray-100 rounded-md"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-lg font-semibold">{form.title}</h1>
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <Badge variant={form.published ? 'default' : 'secondary'}>
                {form.published ? 'Live' : 'Draft'}
              </Badge>
              <span>{fields.length} fields</span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Link href={`/f/${form.slug}`} target="_blank">
            <Button variant="outline" size="sm" className="gap-2">
              <Eye className="w-4 h-4" />
              Preview
            </Button>
          </Link>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => saveForm(false)}
            disabled={saving}
            className="gap-2"
          >
            <Save className="w-4 h-4" />
            Save
          </Button>
          {!form.published && (
            <Button 
              size="sm" 
              onClick={() => saveForm(true)}
              disabled={saving}
              className="gap-2"
            >
              <Globe className="w-4 h-4" />
              Publish
            </Button>
          )}
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Field Types Panel */}
        <div className="w-48 border-r bg-gray-50 p-4 overflow-y-auto">
          <h3 className="text-xs font-semibold text-gray-500 uppercase mb-3">Add Field</h3>
          <div className="space-y-2">
            {FIELD_TYPES.map(({ type, label, icon }) => (
              <button
                key={type}
                onClick={() => addField(type)}
                className="w-full flex items-center gap-2 px-3 py-2 text-sm text-gray-700 bg-white border rounded-md hover:bg-gray-50 hover:border-gray-300 transition-colors"
              >
                {icon}
                {label}
              </button>
            ))}
          </div>
        </div>

        {/* Form Preview */}
        <div className="flex-1 overflow-y-auto p-6 bg-gray-100">
          <div className="max-w-xl mx-auto">
            <Card className="p-6">
              <h2 className="text-xl font-semibold mb-2">{form.title}</h2>
              {form.description && (
                <p className="text-gray-600 mb-6">{form.description}</p>
              )}
              
              <div className="space-y-4">
                {fields.map((field, index) => (
                  <div
                    key={field.id}
                    onClick={() => setSelectedFieldId(field.id)}
                    className={`group relative p-4 border-2 rounded-lg cursor-pointer transition-colors ${
                      selectedFieldId === field.id 
                        ? 'border-blue-500 bg-blue-50' 
                        : 'border-transparent hover:border-gray-200'
                    }`}
                  >
                    <div className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-6 opacity-0 group-hover:opacity-100">
                      <GripVertical className="w-4 h-4 text-gray-400" />
                    </div>
                    <label className="block text-sm font-medium mb-1">
                      {field.label}
                      {field.required && <span className="text-red-500 ml-1">*</span>}
                    </label>
                    {field.type === 'textarea' ? (
                      <div className="w-full h-20 bg-gray-100 rounded-md border" />
                    ) : field.type === 'select' ? (
                      <div className="w-full h-10 bg-gray-100 rounded-md border flex items-center px-3 text-gray-400 text-sm">
                        Select an option...
                      </div>
                    ) : (
                      <div className="w-full h-10 bg-gray-100 rounded-md border" />
                    )}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        removeField(field.id);
                      }}
                      className="absolute right-2 top-2 p-1 text-gray-400 hover:text-red-500 opacity-0 group-hover:opacity-100"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}

                {fields.length === 0 && (
                  <div className="text-center py-12 text-gray-500">
                    <p>No fields yet. Add fields from the left panel.</p>
                  </div>
                )}
              </div>
            </Card>
          </div>
        </div>

        {/* Field Settings Panel */}
        <div className="w-72 border-l bg-white p-4 overflow-y-auto">
          {selectedField ? (
            <div className="space-y-4">
              <h3 className="text-sm font-semibold text-gray-900">Field Settings</h3>
              
              <div className="space-y-2">
                <label className="text-xs font-medium text-gray-500">Label</label>
                <Input
                  value={selectedField.label}
                  onChange={(e) => updateField(selectedField.id, { label: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-medium text-gray-500">Placeholder</label>
                <Input
                  value={selectedField.placeholder || ''}
                  onChange={(e) => updateField(selectedField.id, { placeholder: e.target.value })}
                  placeholder="Enter placeholder text..."
                />
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="required"
                  checked={selectedField.required}
                  onChange={(e) => updateField(selectedField.id, { required: e.target.checked })}
                  className="rounded"
                />
                <label htmlFor="required" className="text-sm">Required field</label>
              </div>

              {selectedField.type === 'select' && 'options' in selectedField && (
                <div className="space-y-2">
                  <label className="text-xs font-medium text-gray-500">Options</label>
                  {selectedField.options?.map((opt, idx) => (
                    <div key={idx} className="flex gap-2">
                      <Input
                        value={opt.label}
                        onChange={(e) => {
                          const newOptions = [...(selectedField.options || [])];
                          newOptions[idx] = { 
                            label: e.target.value, 
                            value: e.target.value.toLowerCase().replace(/\s+/g, '-') 
                          };
                          updateField(selectedField.id, { options: newOptions });
                        }}
                        placeholder={`Option ${idx + 1}`}
                      />
                      <button
                        onClick={() => {
                          const newOptions = selectedField.options?.filter((_, i) => i !== idx);
                          updateField(selectedField.id, { options: newOptions });
                        }}
                        className="p-2 text-gray-400 hover:text-red-500"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      const newOptions = [
                        ...(selectedField.options || []),
                        { label: '', value: '' }
                      ];
                      updateField(selectedField.id, { options: newOptions });
                    }}
                    className="w-full"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Add Option
                  </Button>
                </div>
              )}

              <div className="pt-4 border-t">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => removeField(selectedField.id)}
                  className="w-full text-red-600 hover:bg-red-50"
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Delete Field
                </Button>
              </div>
            </div>
          ) : (
            <div className="text-center py-12 text-gray-500">
              <p className="text-sm">Select a field to edit its settings</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
