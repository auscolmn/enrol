import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Plus, FileText, ExternalLink, MoreVertical } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

export default async function FormsPage() {
  const supabase = await createClient();
  
  // Get current user
  const { data: { user } } = await supabase.auth.getUser();
  
  // Get user's workspace
  const { data: workspace } = await supabase
    .from('workspaces')
    .select('id')
    .eq('owner_id', user?.id)
    .single();
  
  // Get forms
  const { data: forms } = await supabase
    .from('forms')
    .select('*')
    .eq('workspace_id', workspace?.id)
    .order('created_at', { ascending: false });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Forms</h1>
          <p className="text-gray-600">Create and manage your application forms</p>
        </div>
        <Link href="/dashboard/forms/new">
          <Button className="gap-2">
            <Plus className="w-4 h-4" />
            New Form
          </Button>
        </Link>
      </div>

      {/* Forms Grid */}
      {forms && forms.length > 0 ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {forms.map((form) => (
            <Link key={form.id} href={`/dashboard/forms/${form.id}`}>
              <Card className="p-5 hover:shadow-md transition-shadow cursor-pointer">
                <div className="flex items-start justify-between mb-3">
                  <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
                    <FileText className="w-5 h-5 text-blue-600" />
                  </div>
                  <Badge variant={form.published ? 'default' : 'secondary'}>
                    {form.published ? 'Live' : 'Draft'}
                  </Badge>
                </div>
                <h3 className="font-semibold text-gray-900 mb-1">{form.title}</h3>
                <p className="text-sm text-gray-500 mb-3 line-clamp-2">
                  {form.description || 'No description'}
                </p>
                <div className="flex items-center justify-between text-xs text-gray-400">
                  <span>{form.fields?.length || 0} fields</span>
                  <span>{formatDistanceToNow(new Date(form.created_at), { addSuffix: true })}</span>
                </div>
              </Card>
            </Link>
          ))}
        </div>
      ) : (
        /* Empty State */
        <Card className="p-12 text-center">
          <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-4">
            <FileText className="w-8 h-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No forms yet</h3>
          <p className="text-gray-600 mb-6 max-w-sm mx-auto">
            Create your first application form to start collecting submissions from prospective students.
          </p>
          <Link href="/dashboard/forms/new">
            <Button className="gap-2">
              <Plus className="w-4 h-4" />
              Create Your First Form
            </Button>
          </Link>
        </Card>
      )}
    </div>
  );
}
