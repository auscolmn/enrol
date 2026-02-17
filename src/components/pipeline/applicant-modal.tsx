'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle,
} from '@/components/ui/dialog';
import { formatDistanceToNow, format } from 'date-fns';
import { X, Mail, Phone, Calendar, Clock, Save, FileText, Tag, GraduationCap } from 'lucide-react';
import { TagManager } from '@/components/tags/tag-manager';
import { ActivityLog, logActivity } from '@/components/activities/activity-log';
import { LearnStudioLink } from '@/components/learnstudio-button';
import type { PipelineStage, Submission, StageHistory, FormField, Tag as TagType, LearnStudioCourse } from '@/types';

interface ApplicantModalProps {
  submission: Submission;
  stages: PipelineStage[];
  formFields: FormField[];
  workspaceId: string;
  learnstudioCourseId?: string | null;
  onClose: () => void;
  onUpdate: (submission: Submission) => void;
}

export function ApplicantModal({ submission, stages, formFields, workspaceId, learnstudioCourseId, onClose, onUpdate }: ApplicantModalProps) {
  const [notes, setNotes] = useState(submission.notes || '');
  const [saving, setSaving] = useState(false);
  const [tags, setTags] = useState<TagType[]>([]);
  const [activityKey, setActivityKey] = useState(0); // For refreshing activity log
  const [courseName, setCourseName] = useState<string | null>(null);
  const supabase = createClient();

  const currentStage = stages.find(s => s.id === submission.stage_id);
  const isEnrolled = currentStage?.slug === 'enrolled';
  const hasLearnStudioAccess = isEnrolled && learnstudioCourseId != null;

  // Fetch course name if LearnStudio is configured
  useEffect(() => {
    async function fetchCourseName() {
      if (!learnstudioCourseId) return;
      
      const { data } = await supabase
        .from('courses')
        .select('title')
        .eq('id', learnstudioCourseId)
        .single();
      
      if (data) {
        setCourseName(data.title);
      }
    }
    
    fetchCourseName();
  }, [learnstudioCourseId, supabase]);

  // Fetch tags
  useEffect(() => {
    async function fetchTags() {
      const { data: tagData } = await supabase
        .from('submission_tags')
        .select('*, tag:tags(*)')
        .eq('submission_id', submission.id);
      
      if (tagData) {
        setTags(tagData.map(st => st.tag).filter(Boolean) as TagType[]);
      }
    }
    fetchTags();
  }, [submission.id, supabase]);
  
  // Refresh activity log
  const refreshActivity = () => setActivityKey(k => k + 1);

  const saveNotes = async () => {
    setSaving(true);
    try {
      const { error } = await supabase
        .from('submissions')
        .update({ notes, updated_at: new Date().toISOString() })
        .eq('id', submission.id);

      if (error) throw error;

      // Log activity
      await logActivity(
        supabase,
        submission.id,
        'note',
        'Updated notes'
      );

      onUpdate({ ...submission, notes });
      refreshActivity();
    } catch (err) {
      console.error('Failed to save notes:', err);
    } finally {
      setSaving(false);
    }
  };

  const changeStage = async (stageId: string) => {
    if (stageId === submission.stage_id) return;

    const fromStage = stages.find(s => s.id === submission.stage_id);
    const toStage = stages.find(s => s.id === stageId);

    try {
      const { error } = await supabase
        .from('submissions')
        .update({ stage_id: stageId, updated_at: new Date().toISOString() })
        .eq('id', submission.id);

      if (error) throw error;

      // Record history
      await supabase.from('stage_history').insert({
        submission_id: submission.id,
        from_stage_id: submission.stage_id,
        to_stage_id: stageId,
      });

      // Log activity
      await logActivity(
        supabase,
        submission.id,
        'stage_change',
        `Moved from ${fromStage?.name || 'Unknown'} to ${toStage?.name || 'Unknown'}`,
        { from_stage_id: submission.stage_id, to_stage_id: stageId }
      );

      onUpdate({ ...submission, stage_id: stageId });
      refreshActivity();
    } catch (err) {
      console.error('Failed to change stage:', err);
    }
  };

  // Parse form data for display
  const formData = submission.data as Record<string, string>;

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto w-[95vw] sm:w-full p-4 sm:p-6">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3">
            <span>{submission.name || submission.email || 'Applicant'}</span>
            {currentStage && (
              <Badge style={{ backgroundColor: currentStage.color, color: 'white' }}>
                {currentStage.name}
              </Badge>
            )}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6 mt-4">
          {/* Quick Info */}
          <div className="flex flex-wrap gap-4 text-sm text-gray-600">
            {submission.email && (
              <div className="flex items-center gap-1">
                <Mail className="w-4 h-4" />
                <a href={`mailto:${submission.email}`} className="hover:underline">
                  {submission.email}
                </a>
              </div>
            )}
            <div className="flex items-center gap-1">
              <Calendar className="w-4 h-4" />
              <span>Applied {formatDistanceToNow(new Date(submission.created_at), { addSuffix: true })}</span>
            </div>
          </div>

          {/* Stage Selector */}
          <div>
            <label className="text-sm font-medium text-gray-700 mb-2 block">Status</label>
            <div className="flex flex-wrap gap-1.5 sm:gap-2">
              {stages.map((stage) => (
                <button
                  key={stage.id}
                  onClick={() => changeStage(stage.id)}
                  className={`px-2 sm:px-3 py-1 sm:py-1.5 rounded-full text-xs sm:text-sm font-medium transition-colors ${
                    stage.id === submission.stage_id
                      ? 'ring-2 ring-offset-1 sm:ring-offset-2'
                      : 'opacity-60 hover:opacity-100'
                  }`}
                  style={{ 
                    backgroundColor: stage.color, 
                    color: 'white',
                    boxShadow: stage.id === submission.stage_id ? `0 0 0 2px white, 0 0 0 4px ${stage.color}` : undefined,
                  }}
                >
                  {stage.name}
                </button>
              ))}
            </div>
          </div>

          {/* LearnStudio Access */}
          {hasLearnStudioAccess && (
            <div className="p-4 bg-[#22C55E]/5 border border-[#22C55E]/20 rounded-lg">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 bg-[#22C55E]/10 rounded-md">
                    <GraduationCap className="w-4 h-4 text-[#22C55E]" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">LearnStudio Access</p>
                    {courseName && (
                      <p className="text-xs text-gray-500">Enrolled in: {courseName}</p>
                    )}
                  </div>
                </div>
                <LearnStudioLink />
              </div>
            </div>
          )}

          {/* Tags */}
          <div>
            <label className="text-sm font-medium text-gray-700 mb-2 block flex items-center gap-2">
              <Tag className="w-4 h-4" />
              Tags
            </label>
            <TagManager
              submissionId={submission.id}
              workspaceId={workspaceId}
              initialTags={tags}
              onTagsChange={setTags}
            />
          </div>

          {/* Application Data */}
          <div>
            <label className="text-sm font-medium text-gray-700 mb-2 block flex items-center gap-2">
              <FileText className="w-4 h-4" />
              Application Details
            </label>
            <Card className="p-4">
              <dl className="space-y-3">
                {formFields.length > 0 ? (
                  // Show fields in form order with proper labels
                  formFields.map((field) => {
                    const value = formData[field.id];
                    if (value === undefined) return null;
                    return (
                      <div key={field.id} className="grid grid-cols-3 gap-2">
                        <dt className="text-sm text-gray-500">{field.label}</dt>
                        <dd className="text-sm text-gray-900 col-span-2 whitespace-pre-wrap">
                          {String(value) || '—'}
                        </dd>
                      </div>
                    );
                  })
                ) : (
                  // Fallback: show raw keys if no field definitions
                  Object.entries(formData).map(([key, value]) => (
                    <div key={key} className="grid grid-cols-3 gap-2">
                      <dt className="text-sm text-gray-500 truncate">{key}</dt>
                      <dd className="text-sm text-gray-900 col-span-2">{String(value) || '—'}</dd>
                    </div>
                  ))
                )}
              </dl>
            </Card>
          </div>

          {/* Notes */}
          <div>
            <label className="text-sm font-medium text-gray-700 mb-2 block">
              Internal Notes
            </label>
            <Textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Add notes about this applicant..."
              rows={4}
            />
            <div className="flex justify-end mt-2">
              <Button 
                size="sm" 
                onClick={saveNotes} 
                disabled={saving || notes === (submission.notes || '')}
                className="gap-2"
              >
                <Save className="w-4 h-4" />
                {saving ? 'Saving...' : 'Save Notes'}
              </Button>
            </div>
          </div>

          {/* Activity Log */}
          <div>
            <label className="text-sm font-medium text-gray-700 mb-2 block flex items-center gap-2">
              <Clock className="w-4 h-4" />
              Activity
            </label>
            <ActivityLog key={activityKey} submissionId={submission.id} />
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
