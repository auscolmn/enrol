'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import Link from 'next/link';

export default function NewFormPage() {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const supabase = createClient();

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      // Get current user
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      // Get workspace
      const { data: workspace } = await supabase
        .from('workspaces')
        .select('id')
        .eq('owner_id', user.id)
        .single();
      
      if (!workspace) throw new Error('No workspace found');

      // Generate slug from title
      const slug = title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '')
        + '-' + Math.random().toString(36).substring(2, 6);

      // Create form with default fields
      const defaultFields = [
        {
          id: crypto.randomUUID(),
          type: 'text',
          label: 'Full Name',
          required: true,
          placeholder: 'Enter your full name',
        },
        {
          id: crypto.randomUUID(),
          type: 'email',
          label: 'Email Address',
          required: true,
          placeholder: 'you@example.com',
        },
      ];

      const { data: form, error: createError } = await supabase
        .from('forms')
        .insert({
          workspace_id: workspace.id,
          title,
          description,
          slug,
          fields: defaultFields,
          published: false,
        })
        .select()
        .single();

      if (createError) throw createError;

      // Create default pipeline stages for this form
      const defaultStages = [
        { name: 'New', slug: 'new', color: '#6B7280', position: 0 },
        { name: 'Reviewing', slug: 'reviewing', color: '#F59E0B', position: 1 },
        { name: 'Accepted', slug: 'accepted', color: '#10B981', position: 2 },
        { name: 'Enrolled', slug: 'enrolled', color: '#3B82F6', position: 3 },
      ];

      await supabase
        .from('pipeline_stages')
        .insert(defaultStages.map(stage => ({
          ...stage,
          form_id: form.id,
        })));

      // Redirect to form editor
      router.push(`/dashboard/forms/${form.id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create form');
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Back Link */}
      <Link 
        href="/dashboard/forms" 
        className="inline-flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Forms
      </Link>

      <Card>
        <CardHeader>
          <CardTitle>Create New Form</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleCreate} className="space-y-6">
            {error && (
              <div className="p-3 text-sm text-red-600 bg-red-50 rounded-md">
                {error}
              </div>
            )}
            
            <div className="space-y-2">
              <label htmlFor="title" className="text-sm font-medium">
                Form Title *
              </label>
              <Input
                id="title"
                placeholder="e.g., July 2026 Training Application"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="description" className="text-sm font-medium">
                Description
              </label>
              <Textarea
                id="description"
                placeholder="Brief description shown to applicants..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
              />
            </div>

            <div className="flex justify-end gap-3">
              <Link href="/dashboard/forms">
                <Button type="button" variant="outline">
                  Cancel
                </Button>
              </Link>
              <Button type="submit" disabled={loading || !title.trim()} className="gap-2">
                {loading ? 'Creating...' : 'Create Form'}
                <ArrowRight className="w-4 h-4" />
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
