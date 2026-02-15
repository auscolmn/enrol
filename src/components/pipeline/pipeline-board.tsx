'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import {
  DndContext,
  DragOverlay,
  closestCorners,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragStartEvent,
  type DragEndEvent,
} from '@dnd-kit/core';
import { sortableKeyboardCoordinates } from '@dnd-kit/sortable';
import { StageColumn } from './stage-column';
import { ApplicantCard } from './applicant-card';
import { ApplicantModal } from './applicant-modal';
import { Card } from '@/components/ui/card';
import { FileText } from 'lucide-react';
import type { PipelineStage, Submission } from '@/types';

interface PipelineBoardProps {
  stages: PipelineStage[];
  submissions: Submission[];
  forms: { id: string; title: string }[];
}

export function PipelineBoard({ stages, submissions: initialSubmissions, forms }: PipelineBoardProps) {
  const [submissions, setSubmissions] = useState(initialSubmissions);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [selectedSubmission, setSelectedSubmission] = useState<Submission | null>(null);
  const router = useRouter();
  const supabase = createClient();

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as string);
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveId(null);

    if (!over) return;

    const submissionId = active.id as string;
    const newStageId = over.id as string;

    // Find the submission
    const submission = submissions.find(s => s.id === submissionId);
    if (!submission || submission.stage_id === newStageId) return;

    // Optimistically update UI
    setSubmissions(submissions.map(s => 
      s.id === submissionId ? { ...s, stage_id: newStageId } : s
    ));

    // Update in database
    try {
      const { error } = await supabase
        .from('submissions')
        .update({ stage_id: newStageId, updated_at: new Date().toISOString() })
        .eq('id', submissionId);

      if (error) throw error;

      // Record stage history
      await supabase.from('stage_history').insert({
        submission_id: submissionId,
        from_stage_id: submission.stage_id,
        to_stage_id: newStageId,
      });

      router.refresh();
    } catch (err) {
      // Revert on error
      setSubmissions(submissions);
      console.error('Failed to update stage:', err);
    }
  };

  const activeSubmission = activeId ? submissions.find(s => s.id === activeId) : null;

  // Empty state - no forms yet
  if (forms.length === 0) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Pipeline</h1>
          <p className="text-gray-600">Track applicants through your enrollment process</p>
        </div>
        <Card className="p-12 text-center">
          <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-4">
            <FileText className="w-8 h-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No forms yet</h3>
          <p className="text-gray-600 mb-4">
            Create a form first, then applicants will appear here when they submit.
          </p>
          <a 
            href="/dashboard/forms/new"
            className="inline-flex items-center justify-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            Create Your First Form
          </a>
        </Card>
      </div>
    );
  }

  // Empty state - no stages (shouldn't happen, but just in case)
  if (stages.length === 0) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Pipeline</h1>
          <p className="text-gray-600">Track applicants through your enrollment process</p>
        </div>
        <Card className="p-12 text-center">
          <p className="text-gray-600">No pipeline stages configured.</p>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Pipeline</h1>
        <p className="text-gray-600">
          {submissions.length} applicant{submissions.length !== 1 ? 's' : ''} • Drag cards to update status
        </p>
      </div>

      {/* Pipeline Board */}
      <DndContext
        sensors={sensors}
        collisionDetection={closestCorners}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        <div className="flex gap-4 overflow-x-auto pb-4">
          {stages.map((stage) => {
            const stageSubmissions = submissions.filter(s => s.stage_id === stage.id);
            return (
              <StageColumn
                key={stage.id}
                stage={stage}
                submissions={stageSubmissions}
                onCardClick={setSelectedSubmission}
              />
            );
          })}
        </div>

        <DragOverlay>
          {activeSubmission ? (
            <ApplicantCard submission={activeSubmission} isDragging />
          ) : null}
        </DragOverlay>
      </DndContext>

      {/* Applicant Detail Modal */}
      {selectedSubmission && (
        <ApplicantModal
          submission={selectedSubmission}
          stages={stages}
          onClose={() => setSelectedSubmission(null)}
          onUpdate={(updated) => {
            setSubmissions(submissions.map(s => s.id === updated.id ? updated : s));
            setSelectedSubmission(updated);
          }}
        />
      )}
    </div>
  );
}
