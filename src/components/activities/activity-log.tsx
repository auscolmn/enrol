'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { format } from 'date-fns';
import { 
  Clock, 
  ArrowRight, 
  StickyNote, 
  Tag, 
  MessageSquare,
  Plus,
  User,
  Sparkles
} from 'lucide-react';
import type { Activity, ActivityType } from '@/types';

const ACTIVITY_ICONS: Record<ActivityType, React.ReactNode> = {
  stage_change: <ArrowRight className="w-4 h-4" />,
  note: <StickyNote className="w-4 h-4" />,
  manual: <MessageSquare className="w-4 h-4" />,
  tag_added: <Tag className="w-4 h-4" />,
  tag_removed: <Tag className="w-4 h-4" />,
  created: <Sparkles className="w-4 h-4" />,
};

const ACTIVITY_COLORS: Record<ActivityType, string> = {
  stage_change: 'bg-blue-100 text-blue-600',
  note: 'bg-amber-100 text-amber-600',
  manual: 'bg-purple-100 text-purple-600',
  tag_added: 'bg-green-100 text-green-600',
  tag_removed: 'bg-red-100 text-red-600',
  created: 'bg-gray-100 text-gray-600',
};

interface ActivityLogProps {
  submissionId: string;
  onActivityAdded?: () => void;
}

export function ActivityLog({ submissionId, onActivityAdded }: ActivityLogProps) {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newEntry, setNewEntry] = useState('');
  const [adding, setAdding] = useState(false);
  const supabase = createClient();

  // Fetch activities
  useEffect(() => {
    async function fetchActivities() {
      setLoading(true);
      const { data, error } = await supabase
        .from('activities')
        .select('*')
        .eq('submission_id', submissionId)
        .order('created_at', { ascending: false });

      if (data) setActivities(data);
      setLoading(false);
    }
    fetchActivities();
  }, [submissionId, supabase]);

  const addManualEntry = async () => {
    if (!newEntry.trim()) return;
    
    setAdding(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      const { data, error } = await supabase
        .from('activities')
        .insert({
          submission_id: submissionId,
          type: 'manual',
          description: newEntry.trim(),
          created_by: user?.id,
        })
        .select()
        .single();

      if (error) throw error;
      
      setActivities([data, ...activities]);
      setNewEntry('');
      setShowAddForm(false);
      onActivityAdded?.();
    } catch (err) {
      console.error('Failed to add activity:', err);
    } finally {
      setAdding(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-2">
        <div className="h-8 bg-gray-100 rounded animate-pulse" />
        <div className="h-8 bg-gray-100 rounded animate-pulse" />
        <div className="h-8 bg-gray-100 rounded animate-pulse" />
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {/* Add Entry Button/Form */}
      {showAddForm ? (
        <div className="flex gap-2">
          <Input
            value={newEntry}
            onChange={(e) => setNewEntry(e.target.value)}
            placeholder="e.g., Called applicant, left voicemail"
            className="flex-1"
            onKeyDown={(e) => e.key === 'Enter' && addManualEntry()}
            autoFocus
          />
          <Button size="sm" onClick={addManualEntry} disabled={adding || !newEntry.trim()}>
            {adding ? '...' : 'Add'}
          </Button>
          <Button size="sm" variant="outline" onClick={() => setShowAddForm(false)}>
            Cancel
          </Button>
        </div>
      ) : (
        <button
          onClick={() => setShowAddForm(true)}
          className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700"
        >
          <Plus className="w-4 h-4" />
          Log activity
        </button>
      )}

      {/* Activity Timeline */}
      {activities.length > 0 ? (
        <div className="space-y-3">
          {activities.map((activity) => (
            <div key={activity.id} className="flex items-start gap-3">
              <div className={`p-1.5 rounded-full ${ACTIVITY_COLORS[activity.type]}`}>
                {ACTIVITY_ICONS[activity.type]}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm text-gray-900">{activity.description}</p>
                <p className="text-xs text-gray-400">
                  {format(new Date(activity.created_at), 'MMM d, h:mm a')}
                </p>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-sm text-gray-500 italic">No activity yet</p>
      )}
    </div>
  );
}

// Helper function to log activities from other components
export async function logActivity(
  supabase: ReturnType<typeof createClient>,
  submissionId: string,
  type: ActivityType,
  description: string,
  metadata: Record<string, unknown> = {}
) {
  const { data: { user } } = await supabase.auth.getUser();
  
  await supabase.from('activities').insert({
    submission_id: submissionId,
    type,
    description,
    metadata,
    created_by: user?.id,
  });
}
