import { notFound } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { PublicForm } from '@/components/forms/public-form';

interface PageProps {
  params: Promise<{ slug: string }>;
}

export default async function PublicFormPage({ params }: PageProps) {
  const { slug } = await params;
  const supabase = await createClient();
  
  // Get the form by slug (including unpublished for preview)
  const { data: form, error } = await supabase
    .from('forms')
    .select('*, pipeline_stages(*)')
    .eq('slug', slug)
    .single();

  if (error || !form) {
    notFound();
  }

  // Get the first stage (New) for submissions
  const firstStage = form.pipeline_stages?.find((s: { position: number }) => s.position === 0);

  return <PublicForm form={form} firstStageId={firstStage?.id} />;
}
