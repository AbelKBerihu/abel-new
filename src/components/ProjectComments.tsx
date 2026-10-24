import { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import { Send } from 'lucide-react';

export function ProjectComments({ projectId }: { projectId: string }) {
  const cache = useQueryClient();
  const [name, setName] = useState('');
  const [comment, setComment] = useState('');
  const [busy, setBusy] = useState(false);
  const { data = [], isError } = useQuery({
    queryKey: ['comments', projectId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('project_comments')
        .select('*')
        .eq('project_id', projectId)
        .eq('approved', true)
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data ?? [];
    },
    retry: 1,
  });
  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (name.trim().length < 2 || comment.trim().length < 3) {
      toast.error('Enter your name and a longer comment.');
      return;
    }
    setBusy(true);
    try {
      const { error } = await supabase
        .from('project_comments')
        .insert({ project_id: projectId, name: name.trim(), comment: comment.trim(), approved: false });
      if (error) throw error;
      setComment('');
      toast.success('Comment saved, awaiting review.');
      cache.invalidateQueries({ queryKey: ['comments', projectId] });
    } catch {
      toast.error('Could not save your comment. Please wait and try again.');
    } finally {
      setBusy(false);
    }
  };
  return (
    <div className="mt-6 border-t border-border pt-6">
      <h4 className="mb-4 font-semibold">Project notes</h4>
      {isError && <p role="alert" className="text-sm text-destructive">Comments are unavailable right now.</p>}
      {data.map(c => (
        <div key={c.id} className="mb-4 border-l border-primary/40 pl-4">
          <div className="flex flex-wrap justify-between gap-2 text-sm">
            <strong>{c.name}</strong>
            <time className="text-muted-foreground" dateTime={c.created_at}>
              {new Date(c.created_at).toLocaleString()}
            </time>
          </div>
          <p className="mt-2 whitespace-pre-wrap break-words text-sm text-muted-foreground">{c.comment}</p>
        </div>
      ))}
      <form onSubmit={submit} className="space-y-3">
        <label className="block text-sm" htmlFor={`name-${projectId}`}>Name</label>
        <Input id={`name-${projectId}`} value={name} onChange={e => setName(e.target.value)} minLength={2} maxLength={60} required autoComplete="name"/>
        <label className="block text-sm" htmlFor={`note-${projectId}`}>Comment</label>
        <Textarea id={`note-${projectId}`} value={comment} onChange={e => setComment(e.target.value)} minLength={3} maxLength={1000} required/>
        <Button type="submit" disabled={busy}><Send/>{busy ? 'Saving…' : 'Leave a note'}</Button>
      </form>
    </div>
  );
}
