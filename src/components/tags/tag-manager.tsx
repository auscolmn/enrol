'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { TagBadge } from './tag-badge';
import { logActivity } from '@/components/activities/activity-log';
import { Plus, Tag as TagIcon, Check } from 'lucide-react';
import type { Tag } from '@/types';

// Preset colors for new tags
const TAG_COLORS = [
  '#EF4444', // red
  '#F97316', // orange
  '#F59E0B', // amber
  '#84CC16', // lime
  '#22C55E', // green
  '#14B8A6', // teal
  '#06B6D4', // cyan
  '#3B82F6', // blue
  '#8B5CF6', // violet
  '#EC4899', // pink
];

interface TagManagerProps {
  submissionId: string;
  workspaceId: string;
  initialTags?: Tag[];
  onTagsChange?: (tags: Tag[]) => void;
}

export function TagManager({ submissionId, workspaceId, initialTags = [], onTagsChange }: TagManagerProps) {
  const [assignedTags, setAssignedTags] = useState<Tag[]>(initialTags);
  const [allTags, setAllTags] = useState<Tag[]>([]);
  const [showPicker, setShowPicker] = useState(false);
  const [newTagName, setNewTagName] = useState('');
  const [creating, setCreating] = useState(false);
  const supabase = createClient();

  // Fetch all workspace tags
  useEffect(() => {
    async function fetchTags() {
      const { data } = await supabase
        .from('tags')
        .select('*')
        .eq('workspace_id', workspaceId)
        .order('name');
      
      if (data) setAllTags(data);
    }
    fetchTags();
  }, [workspaceId, supabase]);

  const availableTags = allTags.filter(
    t => !assignedTags.some(at => at.id === t.id)
  );

  const addTag = async (tag: Tag) => {
    try {
      const { error } = await supabase
        .from('submission_tags')
        .insert({ submission_id: submissionId, tag_id: tag.id });
      
      if (error) throw error;

      // Log activity
      await logActivity(supabase, submissionId, 'tag_added', `Added tag: ${tag.name}`, { tag_id: tag.id, tag_name: tag.name });
      
      const newTags = [...assignedTags, tag];
      setAssignedTags(newTags);
      onTagsChange?.(newTags);
    } catch (err) {
      console.error('Failed to add tag:', err);
    }
  };

  const removeTag = async (tagId: string) => {
    const tag = assignedTags.find(t => t.id === tagId);
    try {
      const { error } = await supabase
        .from('submission_tags')
        .delete()
        .eq('submission_id', submissionId)
        .eq('tag_id', tagId);
      
      if (error) throw error;

      // Log activity
      if (tag) {
        await logActivity(supabase, submissionId, 'tag_removed', `Removed tag: ${tag.name}`, { tag_id: tagId, tag_name: tag.name });
      }
      
      const newTags = assignedTags.filter(t => t.id !== tagId);
      setAssignedTags(newTags);
      onTagsChange?.(newTags);
    } catch (err) {
      console.error('Failed to remove tag:', err);
    }
  };

  const createTag = async () => {
    if (!newTagName.trim()) return;
    
    setCreating(true);
    try {
      // Pick a random color
      const color = TAG_COLORS[Math.floor(Math.random() * TAG_COLORS.length)];
      
      const { data, error } = await supabase
        .from('tags')
        .insert({ 
          workspace_id: workspaceId, 
          name: newTagName.trim(),
          color 
        })
        .select()
        .single();
      
      if (error) throw error;
      
      // Add to all tags and assign to submission
      setAllTags([...allTags, data]);
      await addTag(data);
      setNewTagName('');
    } catch (err) {
      console.error('Failed to create tag:', err);
    } finally {
      setCreating(false);
    }
  };

  return (
    <div className="space-y-2">
      {/* Current tags */}
      <div className="flex flex-wrap gap-1.5">
        {assignedTags.map(tag => (
          <TagBadge 
            key={tag.id} 
            tag={tag} 
            size="sm"
            onRemove={() => removeTag(tag.id)} 
          />
        ))}
        <button
          onClick={() => setShowPicker(!showPicker)}
          className="inline-flex items-center gap-1 px-2 py-0.5 text-xs text-gray-500 border border-dashed border-gray-300 rounded-full hover:border-gray-400 hover:text-gray-600"
        >
          <Plus className="w-3 h-3" />
          Add tag
        </button>
      </div>

      {/* Tag picker dropdown */}
      {showPicker && (
        <div className="border rounded-lg p-3 bg-gray-50 space-y-3">
          {/* Existing tags */}
          {availableTags.length > 0 && (
            <div>
              <p className="text-xs text-gray-500 mb-2">Click to add:</p>
              <div className="flex flex-wrap gap-1.5">
                {availableTags.map(tag => (
                  <button
                    key={tag.id}
                    onClick={() => addTag(tag)}
                    className="hover:opacity-80"
                  >
                    <TagBadge tag={tag} size="sm" />
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Create new tag */}
          <div>
            <p className="text-xs text-gray-500 mb-2">Or create new:</p>
            <div className="flex gap-2">
              <Input
                value={newTagName}
                onChange={(e) => setNewTagName(e.target.value)}
                placeholder="Tag name..."
                className="h-8 text-sm"
                onKeyDown={(e) => e.key === 'Enter' && createTag()}
              />
              <Button 
                size="sm" 
                onClick={createTag}
                disabled={!newTagName.trim() || creating}
                className="h-8"
              >
                {creating ? '...' : 'Add'}
              </Button>
            </div>
          </div>

          <button
            onClick={() => setShowPicker(false)}
            className="text-xs text-gray-500 hover:text-gray-700"
          >
            Done
          </button>
        </div>
      )}
    </div>
  );
}
