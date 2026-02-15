import { createClient } from '@/lib/supabase/server';
import { ApplicantsTable } from '@/components/applicants/applicants-table';
import { Card } from '@/components/ui/card';
import { Users } from 'lucide-react';

export default async function ApplicantsPage() {
  const supabase = await createClient();
  
  // Get current user
  const { data: { user } } = await supabase.auth.getUser();
  
  // Get user's workspace
  const { data: workspace } = await supabase
    .from('workspaces')
    .select('id')
    .eq('owner_id', user?.id)
    .single();

  // Get all forms for this workspace (including fields for label lookup)
  const { data: forms } = await supabase
    .from('forms')
    .select('id, title, fields')
    .eq('workspace_id', workspace?.id);

  const formIds = forms?.map(f => f.id) || [];

  // Get all pipeline stages
  const { data: stages } = await supabase
    .from('pipeline_stages')
    .select('*')
    .in('form_id', formIds.length > 0 ? formIds : ['none']);

  // Get all submissions with form info
  const { data: submissions } = await supabase
    .from('submissions')
    .select('*')
    .in('form_id', formIds.length > 0 ? formIds : ['none'])
    .order('created_at', { ascending: false });

  // Create lookup maps
  const formMap = Object.fromEntries((forms || []).map(f => [f.id, f.title]));
  const stageMap = Object.fromEntries((stages || []).map(s => [s.id, s]));

  // Enrich submissions
  const enrichedSubmissions = (submissions || []).map(s => ({
    ...s,
    formTitle: formMap[s.form_id] || 'Unknown Form',
    stage: stageMap[s.stage_id] || null,
  }));

  if (enrichedSubmissions.length === 0) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Applicants</h1>
          <p className="text-gray-600">View and manage all applicants</p>
        </div>
        <Card className="p-12 text-center">
          <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-4">
            <Users className="w-8 h-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No applicants yet</h3>
          <p className="text-gray-600">
            Applicants will appear here when they submit your forms.
          </p>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Applicants</h1>
        <p className="text-gray-600">{enrichedSubmissions.length} total applicants</p>
      </div>
      <ApplicantsTable 
        submissions={enrichedSubmissions} 
        stages={stages || []}
        forms={forms || []}
      />
    </div>
  );
}
