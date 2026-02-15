import { createClient } from '@supabase/supabase-js';
import { sendNewSubmissionEmail } from '@/lib/email';
import { NextRequest, NextResponse } from 'next/server';

// Use service role for API route to bypass RLS
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { form_id, stage_id, data, email, name } = body;

    if (!form_id || !data) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Create submission
    const { data: submission, error: submitError } = await supabase
      .from('submissions')
      .insert({
        form_id,
        stage_id,
        data,
        email,
        name,
      })
      .select()
      .single();

    if (submitError) {
      console.error('Submission error:', submitError);
      return NextResponse.json({ error: submitError.message }, { status: 500 });
    }

    // Get form details for notification (including fields for labels)
    const { data: form } = await supabase
      .from('forms')
      .select('title, workspace_id, fields')
      .eq('id', form_id)
      .single();

    if (form) {
      // Get workspace owner email
      const { data: workspace } = await supabase
        .from('workspaces')
        .select('owner_id')
        .eq('id', form.workspace_id)
        .single();

      if (workspace) {
        // Get user email from auth
        const { data: { user } } = await supabase.auth.admin.getUserById(workspace.owner_id);

        if (user?.email) {
          // Send notification email
          const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://enrol.studio';
          await sendNewSubmissionEmail({
            to: user.email,
            applicantName: name || '',
            applicantEmail: email || '',
            formTitle: form.title,
            formData: data,
            formFields: form.fields || [],
            viewUrl: `${appUrl}/dashboard/pipeline`,
          });
        }
      }
    }

    return NextResponse.json({ success: true, submission });
  } catch (error) {
    console.error('API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
