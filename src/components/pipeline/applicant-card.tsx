'use client';

import { useDraggable } from '@dnd-kit/core';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { formatDistanceToNow } from 'date-fns';
import { GripVertical, Mail, StickyNote, GraduationCap } from 'lucide-react';
import type { Submission } from '@/types';

interface ApplicantCardProps {
  submission: Submission;
  onClick?: () => void;
  isDragging?: boolean;
  isEnrolled?: boolean;
  hasLearnStudioAccess?: boolean;
}

export function ApplicantCard({ submission, onClick, isDragging, isEnrolled, hasLearnStudioAccess }: ApplicantCardProps) {
  const { attributes, listeners, setNodeRef, transform } = useDraggable({
    id: submission.id,
  });

  const style = transform
    ? {
        transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
      }
    : undefined;

  const displayName = submission.name || submission.email || 'Unknown Applicant';
  const timeAgo = formatDistanceToNow(new Date(submission.created_at), { addSuffix: true });

  return (
    <Card
      ref={setNodeRef}
      style={style}
      className={`p-3 cursor-pointer hover:shadow-md transition-shadow ${
        isDragging ? 'shadow-lg ring-2 ring-blue-400 opacity-90' : ''
      }`}
      onClick={onClick}
    >
      <div className="flex items-start gap-2">
        {/* Drag Handle */}
        <button
          {...attributes}
          {...listeners}
          className="p-1 -ml-1 text-gray-400 hover:text-gray-600 cursor-grab active:cursor-grabbing"
          onClick={(e) => e.stopPropagation()}
        >
          <GripVertical className="w-4 h-4" />
        </button>

        <div className="flex-1 min-w-0">
          {/* Name & Time */}
          <div className="flex items-start justify-between gap-2 mb-1">
            <h4 className="font-medium text-gray-900 truncate">{displayName}</h4>
            <Badge variant="outline" className="text-xs flex-shrink-0">
              {timeAgo}
            </Badge>
          </div>

          {/* Email */}
          {submission.email && submission.email !== displayName && (
            <div className="flex items-center gap-1 text-sm text-gray-500 truncate">
              <Mail className="w-3 h-3" />
              <span className="truncate">{submission.email}</span>
            </div>
          )}

          {/* Notes indicator */}
          {submission.notes && (
            <div className="flex items-center gap-1 text-xs text-amber-600 mt-2">
              <StickyNote className="w-3 h-3" />
              <span>Has notes</span>
            </div>
          )}

          {/* LearnStudio access indicator */}
          {isEnrolled && hasLearnStudioAccess && (
            <div className="flex items-center gap-1 text-xs text-[#22C55E] mt-2">
              <GraduationCap className="w-3 h-3" />
              <span>Course access</span>
            </div>
          )}
        </div>
      </div>
    </Card>
  );
}
