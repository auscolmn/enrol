import { createClient } from '@/lib/supabase/server';
import { PipelineBoard } from '@/components/pipeline/pipeline-board';

export default async function PipelinePage() {
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

  // Get all pipeline stages for these forms
  const formIds = forms?.map(f => f.id) || [];
  
  const { data: stages } = await supabase
    .from('pipeline_stages')
    .select('*')
    .in('form_id', formIds.length > 0 ? formIds : ['none'])
    .order('position');

  // Get all submissions for these forms
  const { data: submissions } = await supabase
    .from('submissions')
    .select('*')
    .in('form_id', formIds.length > 0 ? formIds : ['none'])
    .order('created_at', { ascending: false });

  // Group stages by form (for now just use first form's stages as default)
  const defaultStages = stages?.filter(s => s.form_id === formIds[0]) || [];

  return (
    <PipelineBoard 
      stages={defaultStages}
      submissions={submissions || []}
      forms={forms || []}
      workspaceId={workspace?.id || ''}
    />
  );
}
