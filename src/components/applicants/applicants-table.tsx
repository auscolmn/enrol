'use client';

import { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ApplicantModal } from '@/components/pipeline/applicant-modal';
import { format } from 'date-fns';
import { Search, ChevronDown, Mail, Calendar, Filter } from 'lucide-react';
import type { PipelineStage, Submission } from '@/types';

interface EnrichedSubmission extends Omit<Submission, 'stage'> {
  formTitle: string;
  stage: PipelineStage | null;
}

interface ApplicantsTableProps {
  submissions: EnrichedSubmission[];
  stages: PipelineStage[];
}

export function ApplicantsTable({ submissions: initialSubmissions, stages }: ApplicantsTableProps) {
  const [submissions, setSubmissions] = useState(initialSubmissions);
  const [search, setSearch] = useState('');
  const [stageFilter, setStageFilter] = useState<string>('all');
  const [selectedSubmission, setSelectedSubmission] = useState<EnrichedSubmission | null>(null);
  const router = useRouter();

  // Get unique stages for filter
  const uniqueStages = useMemo(() => {
    const stageIds = new Set(submissions.map(s => s.stage_id));
    return stages.filter(s => stageIds.has(s.id));
  }, [submissions, stages]);

  // Filter submissions
  const filteredSubmissions = useMemo(() => {
    return submissions.filter(s => {
      // Search filter
      const searchLower = search.toLowerCase();
      const matchesSearch = !search || 
        s.name?.toLowerCase().includes(searchLower) ||
        s.email?.toLowerCase().includes(searchLower) ||
        s.formTitle.toLowerCase().includes(searchLower);

      // Stage filter
      const matchesStage = stageFilter === 'all' || s.stage_id === stageFilter;

      return matchesSearch && matchesStage;
    });
  }, [submissions, search, stageFilter]);

  const handleUpdate = (updated: Submission) => {
    setSubmissions(submissions.map(s => 
      s.id === updated.id 
        ? { ...s, ...updated, stage: stages.find(st => st.id === updated.stage_id) || s.stage }
        : s
    ));
    if (selectedSubmission?.id === updated.id) {
      setSelectedSubmission({
        ...selectedSubmission,
        ...updated,
        stage: stages.find(st => st.id === updated.stage_id) || selectedSubmission.stage,
      });
    }
    router.refresh();
  };

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input
            placeholder="Search by name, email, or form..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <div className="flex gap-2">
          <select
            value={stageFilter}
            onChange={(e) => setStageFilter(e.target.value)}
            className="h-10 px-3 rounded-md border border-input bg-background text-sm"
          >
            <option value="all">All Stages</option>
            {uniqueStages.map(stage => (
              <option key={stage.id} value={stage.id}>{stage.name}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Results count */}
      <p className="text-sm text-gray-500">
        Showing {filteredSubmissions.length} of {submissions.length} applicants
      </p>

      {/* Table */}
      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Applicant
                </th>
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Form
                </th>
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Applied
                </th>
                <th className="text-right px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredSubmissions.map((submission) => (
                <tr 
                  key={submission.id} 
                  className="hover:bg-gray-50 cursor-pointer"
                  onClick={() => setSelectedSubmission(submission)}
                >
                  <td className="px-4 py-4">
                    <div>
                      <p className="font-medium text-gray-900">
                        {submission.name || 'No name'}
                      </p>
                      {submission.email && (
                        <p className="text-sm text-gray-500 flex items-center gap-1">
                          <Mail className="w-3 h-3" />
                          {submission.email}
                        </p>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-4">
                    <p className="text-sm text-gray-600">{submission.formTitle}</p>
                  </td>
                  <td className="px-4 py-4">
                    {submission.stage ? (
                      <Badge 
                        style={{ 
                          backgroundColor: submission.stage.color, 
                          color: 'white' 
                        }}
                      >
                        {submission.stage.name}
                      </Badge>
                    ) : (
                      <Badge variant="secondary">Unknown</Badge>
                    )}
                  </td>
                  <td className="px-4 py-4">
                    <p className="text-sm text-gray-500 flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      {format(new Date(submission.created_at), 'MMM d, yyyy')}
                    </p>
                  </td>
                  <td className="px-4 py-4 text-right">
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedSubmission(submission);
                      }}
                    >
                      View
                    </Button>
                  </td>
                </tr>
              ))}
              {filteredSubmissions.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-4 py-8 text-center text-gray-500">
                    No applicants match your filters
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Applicant Modal */}
      {selectedSubmission && (
        <ApplicantModal
          submission={selectedSubmission as unknown as Submission}
          stages={stages.filter(s => s.form_id === selectedSubmission.form_id)}
          onClose={() => setSelectedSubmission(null)}
          onUpdate={handleUpdate}
        />
      )}
    </div>
  );
}
