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
import { X, Mail, Phone, Calendar, Clock, Save, FileText } from 'lucide-react';
import type { PipelineStage, Submission, StageHistory } from '@/types';

interface ApplicantModalProps {
  submission: Submission;
  stages: PipelineStage[];
  onClose: () => void;
  onUpdate: (submission: Submission) => void;
}

export function ApplicantModal({ submission, stages, onClose, onUpdate }: ApplicantModalProps) {
  const [notes, setNotes] = useState(submission.notes || '');
  const [saving, setSaving] = useState(false);
  const [history, setHistory] = useState<StageHistory[]>([]);
  const supabase = createClient();

  const currentStage = stages.find(s => s.id === submission.stage_id);

  // Fetch stage history
  useEffect(() => {
    async function fetchHistory() {
      const { data } = await supabase
        .from('stage_history')
        .select('*, from_stage:pipeline_stages!from_stage_id(name, color), to_stage:pipeline_stages!to_stage_id(name, color)')
        .eq('submission_id', submission.id)
        .order('changed_at', { ascending: false });
      
      if (data) setHistory(data);
    }
    fetchHistory();
  }, [submission.id, supabase]);

  const saveNotes = async () => {
    setSaving(true);
    try {
      const { error } = await supabase
        .from('submissions')
        .update({ notes, updated_at: new Date().toISOString() })
        .eq('id', submission.id);

      if (error) throw error;
      onUpdate({ ...submission, notes });
    } catch (err) {
      console.error('Failed to save notes:', err);
    } finally {
      setSaving(false);
    }
  };

  const changeStage = async (stageId: string) => {
    if (stageId === submission.stage_id) return;

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

      onUpdate({ ...submission, stage_id: stageId });
      
      // Refresh history
      const { data } = await supabase
        .from('stage_history')
        .select('*, from_stage:pipeline_stages!from_stage_id(name, color), to_stage:pipeline_stages!to_stage_id(name, color)')
        .eq('submission_id', submission.id)
        .order('changed_at', { ascending: false });
      
      if (data) setHistory(data);
    } catch (err) {
      console.error('Failed to change stage:', err);
    }
  };

  // Parse form data for display
  const formData = submission.data as Record<string, string>;

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
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
            <div className="flex flex-wrap gap-2">
              {stages.map((stage) => (
                <button
                  key={stage.id}
                  onClick={() => changeStage(stage.id)}
                  className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
                    stage.id === submission.stage_id
                      ? 'ring-2 ring-offset-2'
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

          {/* Application Data */}
          <div>
            <label className="text-sm font-medium text-gray-700 mb-2 block flex items-center gap-2">
              <FileText className="w-4 h-4" />
              Application Details
            </label>
            <Card className="p-4">
              <dl className="space-y-3">
                {Object.entries(formData).map(([key, value]) => (
                  <div key={key} className="grid grid-cols-3 gap-2">
                    <dt className="text-sm text-gray-500 truncate">{key}</dt>
                    <dd className="text-sm text-gray-900 col-span-2">{String(value) || '—'}</dd>
                  </div>
                ))}
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

          {/* History */}
          {history.length > 0 && (
            <div>
              <label className="text-sm font-medium text-gray-700 mb-2 block flex items-center gap-2">
                <Clock className="w-4 h-4" />
                History
              </label>
              <div className="space-y-2">
                {history.map((item) => (
                  <div key={item.id} className="flex items-center gap-2 text-sm text-gray-600">
                    <span className="text-gray-400">
                      {format(new Date(item.changed_at), 'MMM d, h:mm a')}
                    </span>
                    <span>→</span>
                    <Badge 
                      variant="outline" 
                      style={{ 
                        borderColor: (item.to_stage as any)?.color,
                        color: (item.to_stage as any)?.color,
                      }}
                    >
                      {(item.to_stage as any)?.name || 'Unknown'}
                    </Badge>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
