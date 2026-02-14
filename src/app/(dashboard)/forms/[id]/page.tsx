import { notFound } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { FormEditor } from '@/components/forms/form-editor';

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function FormEditorPage({ params }: PageProps) {
  const { id } = await params;
  const supabase = await createClient();
  
  // Get the form
  const { data: form, error } = await supabase
    .from('forms')
    .select('*')
    .eq('id', id)
    .single();

  if (error || !form) {
    notFound();
  }

  return <FormEditor initialForm={form} />;
}
