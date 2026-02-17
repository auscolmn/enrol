'use client';

import { useDroppable } from '@dnd-kit/core';
import { Badge } from '@/components/ui/badge';
import { ApplicantCard } from './applicant-card';
import { Users } from 'lucide-react';
import type { PipelineStage, Submission } from '@/types';

interface StageColumnProps {
  stage: PipelineStage;
  submissions: Submission[];
  onCardClick: (submission: Submission) => void;
  formHasLearnStudio?: boolean;
}

export function StageColumn({ stage, submissions, onCardClick, formHasLearnStudio }: StageColumnProps) {
  // Check if this is the "Enrolled" stage
  const isEnrolledStage = stage.slug === 'enrolled';
  const { setNodeRef, isOver } = useDroppable({
    id: stage.id,
  });

  return (
    <div className="flex-shrink-0 w-64 sm:w-72 snap-start">
      {/* Stage Header */}
      <div className="flex items-center gap-2 mb-3 px-1">
        <div
          className="w-3 h-3 rounded-full flex-shrink-0"
          style={{ backgroundColor: stage.color }}
        />
        <h3 className="font-medium text-gray-900 truncate">{stage.name}</h3>
        <Badge variant="secondary" className="ml-auto flex-shrink-0">
          {submissions.length}
        </Badge>
      </div>

      {/* Stage Column */}
      <div
        ref={setNodeRef}
        className={`bg-gray-100 rounded-lg p-2 sm:p-3 min-h-[400px] sm:min-h-[500px] space-y-2 sm:space-y-3 transition-colors ${
          isOver ? 'bg-blue-50 ring-2 ring-blue-300' : ''
        }`}
      >
        {submissions.length > 0 ? (
          submissions.map((submission) => (
            <ApplicantCard
              key={submission.id}
              submission={submission}
              onClick={() => onCardClick(submission)}
              isEnrolled={isEnrolledStage}
              hasLearnStudioAccess={formHasLearnStudio}
            />
          ))
        ) : (
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <div className="w-12 h-12 rounded-full bg-gray-200 flex items-center justify-center mb-3">
              <Users className="w-5 h-5 text-gray-400" />
            </div>
            <p className="text-sm text-gray-500">No applicants</p>
          </div>
        )}
      </div>
    </div>
  );
}
