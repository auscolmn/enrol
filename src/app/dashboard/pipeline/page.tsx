import { createClient } from '@/lib/supabase/server';
import { DEFAULT_STAGES } from '@/types';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { Users, Clock, CheckCircle, GraduationCap } from 'lucide-react';

// Stage icons mapping
const stageIcons: Record<string, React.ReactNode> = {
  new: <Clock className="w-4 h-4" />,
  reviewing: <Users className="w-4 h-4" />,
  accepted: <CheckCircle className="w-4 h-4" />,
  enrolled: <GraduationCap className="w-4 h-4" />,
};

export default async function PipelinePage() {
  const supabase = await createClient();
  
  // For now, show empty state since we don't have data yet
  // Later we'll fetch actual submissions
  
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Pipeline</h1>
          <p className="text-gray-600">Track applicants through your enrollment process</p>
        </div>
      </div>

      {/* Pipeline Board */}
      <div className="flex gap-4 overflow-x-auto pb-4">
        {DEFAULT_STAGES.map((stage) => (
          <div
            key={stage.slug}
            className="flex-shrink-0 w-72"
          >
            {/* Stage Header */}
            <div className="flex items-center gap-2 mb-3 px-1">
              <div
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: stage.color }}
              />
              <h3 className="font-medium text-gray-900">{stage.name}</h3>
              <Badge variant="secondary" className="ml-auto">
                0
              </Badge>
            </div>

            {/* Stage Column */}
            <div className="bg-gray-100 rounded-lg p-3 min-h-[500px] space-y-3">
              {/* Empty state */}
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <div className="w-12 h-12 rounded-full bg-gray-200 flex items-center justify-center mb-3">
                  {stageIcons[stage.slug] || <Users className="w-5 h-5 text-gray-400" />}
                </div>
                <p className="text-sm text-gray-500">No applicants yet</p>
              </div>

              {/* Example card (commented out - will use when we have data) */}
              {/* 
              <Card className="p-3 cursor-pointer hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between mb-2">
                  <h4 className="font-medium text-gray-900">John Smith</h4>
                  <Badge variant="outline" className="text-xs">2d ago</Badge>
                </div>
                <p className="text-sm text-gray-600 truncate">john@example.com</p>
              </Card>
              */}
            </div>
          </div>
        ))}
      </div>

      {/* Getting Started */}
      <Card className="p-6 bg-blue-50 border-blue-200">
        <h3 className="font-semibold text-blue-900 mb-2">🚀 Getting Started</h3>
        <p className="text-blue-800 text-sm mb-4">
          Your pipeline is ready! Here&apos;s what to do next:
        </p>
        <ol className="list-decimal list-inside text-sm text-blue-800 space-y-1">
          <li>Create an application form in the Forms section</li>
          <li>Share the form link with prospective students</li>
          <li>Applicants will appear here when they submit</li>
          <li>Drag cards between columns to track their progress</li>
        </ol>
      </Card>
    </div>
  );
}
