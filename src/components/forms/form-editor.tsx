'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
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
  Upload,
  Copy,
  Check,
  Link as LinkIcon,
  Palette,
  Settings,
  Layers,
  Crown,
  GraduationCap
} from 'lucide-react';
import type { Form, FormField, FieldType, FormBranding, FormSettings, LearnStudioCourse } from '@/types';

const FIELD_TYPES: { type: FieldType; label: string; icon: React.ReactNode }[] = [
  { type: 'text', label: 'Short Text', icon: <Type className="w-4 h-4" /> },
  { type: 'textarea', label: 'Long Text', icon: <AlignLeft className="w-4 h-4" /> },
  { type: 'email', label: 'Email', icon: <Mail className="w-4 h-4" /> },
  { type: 'phone', label: 'Phone', icon: <Phone className="w-4 h-4" /> },
  { type: 'select', label: 'Dropdown', icon: <List className="w-4 h-4" /> },
  { type: 'file', label: 'File Upload', icon: <Upload className="w-4 h-4" /> },
];

const DEFAULT_BRANDING: FormBranding = {
  primaryColor: '#3B82F6',
  backgroundColor: '#F9FAFB',
  cardBackground: '#FFFFFF',
  fontFamily: 'inter',
  borderRadius: 'rounded',
  submitButtonText: 'Submit Application',
  hideEnrolBranding: false,
};

const FONT_FAMILIES = [
  { value: 'inter', label: 'Inter' },
  { value: 'plus-jakarta', label: 'Plus Jakarta Sans' },
  { value: 'system', label: 'System Default' },
];

const BORDER_RADIUS_OPTIONS = [
  { value: 'sharp', label: 'Sharp', preview: '0px' },
  { value: 'rounded', label: 'Rounded', preview: '8px' },
  { value: 'pill', label: 'Pill', preview: '9999px' },
];

interface FormEditorProps {
  initialForm: Form;
}

export function FormEditor({ initialForm }: FormEditorProps) {
  const [form, setForm] = useState<Form>(initialForm);
  const [fields, setFields] = useState<FormField[]>(initialForm.fields || []);
  const [settings, setSettings] = useState<FormSettings>(initialForm.settings || {});
  const [branding, setBranding] = useState<FormBranding>({
    ...DEFAULT_BRANDING,
    ...initialForm.settings?.branding,
  });
  const [saving, setSaving] = useState(false);
  const [selectedFieldId, setSelectedFieldId] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [rightPanelTab, setRightPanelTab] = useState('fields');
  
  // LearnStudio integration state
  const [learnstudioCourseId, setLearnstudioCourseId] = useState<string | null>(
    initialForm.learnstudio_course_id || null
  );
  const [learnstudioSendEmail, setLearnstudioSendEmail] = useState(
    initialForm.learnstudio_send_welcome_email || false
  );
  const [availableCourses, setAvailableCourses] = useState<LearnStudioCourse[]>([]);
  const [coursesLoading, setCoursesLoading] = useState(true);
  
  const router = useRouter();
  const supabase = createClient();

  // Fetch LearnStudio courses on mount
  useEffect(() => {
    async function fetchCourses() {
      setCoursesLoading(true);
      try {
        const { data, error } = await supabase
          .from('courses')
          .select('id, org_id, title, slug, status')
          .eq('status', 'published')
          .order('title');
        
        if (error) {
          console.error('Failed to fetch courses:', error);
        } else {
          setAvailableCourses(data || []);
        }
      } catch (err) {
        console.error('Error fetching courses:', err);
      } finally {
        setCoursesLoading(false);
      }
    }
    
    fetchCourses();
  }, [supabase]);

  const publicUrl = typeof window !== 'undefined' 
    ? `${window.location.origin}/f/${form.slug}`
    : `/f/${form.slug}`;

  const copyLink = () => {
    navigator.clipboard.writeText(publicUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

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
    setRightPanelTab('fields');
  };

  const updateField = (id: string, updates: Partial<FormField>) => {
    setFields(fields.map(f => f.id === id ? { ...f, ...updates } as FormField : f));
  };

  const removeField = (id: string) => {
    setFields(fields.filter(f => f.id !== id));
    if (selectedFieldId === id) setSelectedFieldId(null);
  };

  const updateBranding = (updates: Partial<FormBranding>) => {
    setBranding(prev => ({ ...prev, ...updates }));
  };

  const updateSettings = (updates: Partial<FormSettings>) => {
    setSettings(prev => ({ ...prev, ...updates }));
  };

  const saveForm = async (publish = false) => {
    setSaving(true);
    try {
      const updatedSettings: FormSettings = {
        ...settings,
        branding,
      };

      const { error } = await supabase
        .from('forms')
        .update({ 
          fields,
          settings: updatedSettings,
          published: publish ? true : form.published,
          learnstudio_course_id: learnstudioCourseId,
          learnstudio_send_welcome_email: learnstudioSendEmail,
          updated_at: new Date().toISOString(),
        })
        .eq('id', form.id);

      if (error) throw error;
      
      setForm({ 
        ...form, 
        fields, 
        settings: updatedSettings, 
        published: publish ? true : form.published,
        learnstudio_course_id: learnstudioCourseId,
        learnstudio_send_welcome_email: learnstudioSendEmail,
      });
      setSettings(updatedSettings);
      router.refresh();
    } catch (err) {
      console.error('Failed to save:', err);
    } finally {
      setSaving(false);
    }
  };

  const selectedField = fields.find(f => f.id === selectedFieldId);

  // Compute preview styles based on branding
  const getBorderRadiusValue = (radius: string | undefined) => {
    switch (radius) {
      case 'sharp': return '0px';
      case 'pill': return '9999px';
      default: return '8px';
    }
  };

  const getFontFamilyClass = (font: string | undefined) => {
    switch (font) {
      case 'plus-jakarta': return 'font-sans'; // Would need actual font loaded
      case 'system': return 'font-sans';
      default: return 'font-sans';
    }
  };

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
            {form.published && (
              <div className="flex items-center gap-2 mt-1">
                <LinkIcon className="w-3 h-3 text-gray-400" />
                <code className="text-xs text-gray-500 bg-gray-100 px-2 py-0.5 rounded">
                  {publicUrl}
                </code>
                <button
                  onClick={copyLink}
                  className="text-gray-400 hover:text-gray-600"
                  title="Copy link"
                >
                  {copied ? <Check className="w-3 h-3 text-green-500" /> : <Copy className="w-3 h-3" />}
                </button>
              </div>
            )}
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
        <div 
          className="flex-1 overflow-y-auto p-6 transition-colors"
          style={{ backgroundColor: branding.backgroundColor || '#F9FAFB' }}
        >
          <div className="max-w-xl mx-auto">
            {/* Logo Preview */}
            {branding.logoUrl && (
              <div className="flex justify-center mb-6">
                <img 
                  src={branding.logoUrl} 
                  alt="Logo" 
                  className="max-h-16 object-contain"
                  onError={(e) => {
                    (e.target as HTMLImageElement).style.display = 'none';
                  }}
                />
              </div>
            )}
            
            <Card 
              className={`p-6 transition-all ${getFontFamilyClass(branding.fontFamily)}`}
              style={{ 
                backgroundColor: branding.cardBackground || '#FFFFFF',
                borderRadius: getBorderRadiusValue(branding.borderRadius),
              }}
            >
              <h2 className="text-xl font-semibold mb-2">{form.title}</h2>
              {form.description && (
                <p className="text-gray-600 mb-6">{form.description}</p>
              )}
              
              <div className="space-y-4">
                {fields.map((field, index) => (
                  <div
                    key={field.id}
                    onClick={() => {
                      setSelectedFieldId(field.id);
                      setRightPanelTab('fields');
                    }}
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
                      <div 
                        className="w-full h-20 bg-gray-100 border"
                        style={{ borderRadius: getBorderRadiusValue(branding.borderRadius) }}
                      />
                    ) : field.type === 'select' ? (
                      <div 
                        className="w-full h-10 bg-gray-100 border flex items-center px-3 text-gray-400 text-sm"
                        style={{ borderRadius: getBorderRadiusValue(branding.borderRadius) }}
                      >
                        Select an option...
                      </div>
                    ) : (
                      <div 
                        className="w-full h-10 bg-gray-100 border"
                        style={{ borderRadius: getBorderRadiusValue(branding.borderRadius) }}
                      />
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

              {/* Submit Button Preview */}
              {fields.length > 0 && (
                <div className="mt-6">
                  <button
                    className="w-full py-2.5 px-4 text-white font-medium transition-colors"
                    style={{ 
                      backgroundColor: branding.primaryColor || '#3B82F6',
                      borderRadius: getBorderRadiusValue(branding.borderRadius),
                    }}
                  >
                    {branding.submitButtonText || 'Submit Application'}
                  </button>
                </div>
              )}

              {/* Branding Footer Preview */}
              {!branding.hideEnrolBranding && fields.length > 0 && (
                <p className="text-center text-xs text-gray-400 mt-6">
                  Powered by EnrolStudio
                </p>
              )}
            </Card>
          </div>
        </div>

        {/* Right Panel with Tabs */}
        <div className="w-80 border-l bg-white overflow-y-auto">
          <Tabs value={rightPanelTab} onValueChange={setRightPanelTab} className="h-full flex flex-col">
            <TabsList className="w-full grid grid-cols-3 rounded-none border-b h-12 bg-gray-50">
              <TabsTrigger value="fields" className="gap-1.5 data-[state=active]:bg-white">
                <Layers className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Fields</span>
              </TabsTrigger>
              <TabsTrigger value="branding" className="gap-1.5 data-[state=active]:bg-white">
                <Palette className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Branding</span>
              </TabsTrigger>
              <TabsTrigger value="settings" className="gap-1.5 data-[state=active]:bg-white">
                <Settings className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Settings</span>
              </TabsTrigger>
            </TabsList>

            {/* Fields Tab */}
            <TabsContent value="fields" className="flex-1 p-4 m-0">
              {selectedField ? (
                <div className="space-y-4">
                  <h3 className="text-sm font-semibold text-gray-900">Field Settings</h3>
                  
                  <div className="space-y-2">
                    <Label className="text-xs font-medium text-gray-500">Label</Label>
                    <Input
                      value={selectedField.label}
                      onChange={(e) => updateField(selectedField.id, { label: e.target.value })}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label className="text-xs font-medium text-gray-500">Placeholder</Label>
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
                      <Label className="text-xs font-medium text-gray-500">Options</Label>
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
            </TabsContent>

            {/* Branding Tab */}
            <TabsContent value="branding" className="flex-1 p-4 m-0">
              <div className="space-y-5">
                <h3 className="text-sm font-semibold text-gray-900">Brand Customization</h3>
                
                {/* Logo URL */}
                <div className="space-y-2">
                  <Label className="text-xs font-medium text-gray-500">Logo URL</Label>
                  <Input
                    value={branding.logoUrl || ''}
                    onChange={(e) => updateBranding({ logoUrl: e.target.value })}
                    placeholder="https://example.com/logo.png"
                  />
                  <p className="text-xs text-gray-400">Direct link to your logo image</p>
                </div>

                {/* Primary Color */}
                <div className="space-y-2">
                  <Label className="text-xs font-medium text-gray-500">Primary Color</Label>
                  <div className="flex gap-2">
                    <div className="relative">
                      <input
                        type="color"
                        value={branding.primaryColor || '#3B82F6'}
                        onChange={(e) => updateBranding({ primaryColor: e.target.value })}
                        className="w-10 h-10 rounded-md border cursor-pointer"
                      />
                    </div>
                    <Input
                      value={branding.primaryColor || '#3B82F6'}
                      onChange={(e) => updateBranding({ primaryColor: e.target.value })}
                      placeholder="#3B82F6"
                      className="flex-1 font-mono text-sm"
                    />
                  </div>
                </div>

                {/* Background Color */}
                <div className="space-y-2">
                  <Label className="text-xs font-medium text-gray-500">Background Color</Label>
                  <div className="flex gap-2">
                    <input
                      type="color"
                      value={branding.backgroundColor || '#F9FAFB'}
                      onChange={(e) => updateBranding({ backgroundColor: e.target.value })}
                      className="w-10 h-10 rounded-md border cursor-pointer"
                    />
                    <Input
                      value={branding.backgroundColor || '#F9FAFB'}
                      onChange={(e) => updateBranding({ backgroundColor: e.target.value })}
                      placeholder="#F9FAFB"
                      className="flex-1 font-mono text-sm"
                    />
                  </div>
                </div>

                {/* Card Background Color */}
                <div className="space-y-2">
                  <Label className="text-xs font-medium text-gray-500">Card Background</Label>
                  <div className="flex gap-2">
                    <input
                      type="color"
                      value={branding.cardBackground || '#FFFFFF'}
                      onChange={(e) => updateBranding({ cardBackground: e.target.value })}
                      className="w-10 h-10 rounded-md border cursor-pointer"
                    />
                    <Input
                      value={branding.cardBackground || '#FFFFFF'}
                      onChange={(e) => updateBranding({ cardBackground: e.target.value })}
                      placeholder="#FFFFFF"
                      className="flex-1 font-mono text-sm"
                    />
                  </div>
                </div>

                {/* Font Family */}
                <div className="space-y-2">
                  <Label className="text-xs font-medium text-gray-500">Font Family</Label>
                  <Select
                    value={branding.fontFamily || 'inter'}
                    onValueChange={(value) => updateBranding({ fontFamily: value as FormBranding['fontFamily'] })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {FONT_FAMILIES.map((font) => (
                        <SelectItem key={font.value} value={font.value}>
                          {font.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Border Radius */}
                <div className="space-y-2">
                  <Label className="text-xs font-medium text-gray-500">Border Radius</Label>
                  <div className="flex gap-2">
                    {BORDER_RADIUS_OPTIONS.map((option) => (
                      <button
                        key={option.value}
                        onClick={() => updateBranding({ borderRadius: option.value as FormBranding['borderRadius'] })}
                        className={`flex-1 py-2 px-3 text-sm border rounded-md transition-colors ${
                          branding.borderRadius === option.value 
                            ? 'border-blue-500 bg-blue-50 text-blue-700' 
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        {option.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Submit Button Text */}
                <div className="space-y-2">
                  <Label className="text-xs font-medium text-gray-500">Submit Button Text</Label>
                  <Input
                    value={branding.submitButtonText || ''}
                    onChange={(e) => updateBranding({ submitButtonText: e.target.value })}
                    placeholder="Submit Application"
                  />
                </div>

                {/* Hide Branding */}
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border">
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="hideBranding"
                      checked={branding.hideEnrolBranding || false}
                      onChange={(e) => updateBranding({ hideEnrolBranding: e.target.checked })}
                      className="rounded"
                    />
                    <label htmlFor="hideBranding" className="text-sm">
                      Hide "Powered by EnrolStudio"
                    </label>
                  </div>
                  <Badge variant="secondary" className="gap-1 text-xs">
                    <Crown className="w-3 h-3" />
                    Premium
                  </Badge>
                </div>
              </div>
            </TabsContent>

            {/* Settings Tab */}
            <TabsContent value="settings" className="flex-1 p-4 m-0">
              <div className="space-y-5">
                <h3 className="text-sm font-semibold text-gray-900">Form Settings</h3>
                
                {/* Confirmation Message */}
                <div className="space-y-2">
                  <Label className="text-xs font-medium text-gray-500">Confirmation Message</Label>
                  <textarea
                    value={settings.confirmationMessage || ''}
                    onChange={(e) => updateSettings({ confirmationMessage: e.target.value })}
                    placeholder="Thank you for your application. We'll review it and get back to you soon."
                    className="w-full h-24 px-3 py-2 text-sm border rounded-md resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  <p className="text-xs text-gray-400">Shown after successful submission</p>
                </div>

                {/* Notification Email */}
                <div className="space-y-2">
                  <Label className="text-xs font-medium text-gray-500">Notification Email</Label>
                  <Input
                    type="email"
                    value={settings.notifyEmail || ''}
                    onChange={(e) => updateSettings({ notifyEmail: e.target.value })}
                    placeholder="notify@example.com"
                  />
                  <p className="text-xs text-gray-400">Get notified when someone submits</p>
                </div>

                {/* Redirect URL */}
                <div className="space-y-2">
                  <Label className="text-xs font-medium text-gray-500">Redirect URL</Label>
                  <Input
                    type="url"
                    value={settings.redirectUrl || ''}
                    onChange={(e) => updateSettings({ redirectUrl: e.target.value })}
                    placeholder="https://example.com/thank-you"
                  />
                  <p className="text-xs text-gray-400">Redirect after submission (optional)</p>
                </div>

                {/* LearnStudio Integration Section */}
                <div className="pt-4 border-t border-[#22C55E]/20">
                  <div className="flex items-center gap-2 mb-4">
                    <div className="p-1.5 bg-[#22C55E]/10 rounded-md">
                      <GraduationCap className="w-4 h-4 text-[#22C55E]" />
                    </div>
                    <h3 className="text-sm font-semibold text-gray-900">LearnStudio Integration</h3>
                  </div>
                  
                  {/* Course Selector */}
                  <div className="space-y-2 mb-4">
                    <Label className="text-xs font-medium text-gray-500">
                      Grant access to course
                    </Label>
                    <Select
                      value={learnstudioCourseId || 'none'}
                      onValueChange={(value) => setLearnstudioCourseId(value === 'none' ? null : value)}
                      disabled={coursesLoading}
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder={coursesLoading ? "Loading courses..." : "Select a course"} />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">
                          <span className="text-gray-500">No course access</span>
                        </SelectItem>
                        {availableCourses.map((course) => (
                          <SelectItem key={course.id} value={course.id}>
                            <div className="flex items-center gap-2">
                              <GraduationCap className="w-3.5 h-3.5 text-[#22C55E]" />
                              {course.title}
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <p className="text-xs text-gray-400">
                      When applicants reach "Enrolled" stage, they'll get access to this course
                    </p>
                  </div>

                  {/* Welcome Email Toggle */}
                  {learnstudioCourseId && (
                    <div className="flex items-start gap-3 p-3 bg-[#22C55E]/5 rounded-lg border border-[#22C55E]/20">
                      <input
                        type="checkbox"
                        id="sendWelcomeEmail"
                        checked={learnstudioSendEmail}
                        onChange={(e) => setLearnstudioSendEmail(e.target.checked)}
                        className="mt-0.5 rounded border-[#22C55E] text-[#22C55E] focus:ring-[#22C55E]"
                      />
                      <div>
                        <label htmlFor="sendWelcomeEmail" className="text-sm font-medium text-gray-900 cursor-pointer">
                          Send welcome email with course link
                        </label>
                        <p className="text-xs text-gray-500 mt-0.5">
                          Automatically email enrollees their course access details
                        </p>
                      </div>
                    </div>
                  )}

                  {/* No courses available message */}
                  {!coursesLoading && availableCourses.length === 0 && (
                    <p className="text-xs text-amber-600 bg-amber-50 p-2 rounded-md">
                      No published courses found. Create a course in LearnStudio first.
                    </p>
                  )}
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}
