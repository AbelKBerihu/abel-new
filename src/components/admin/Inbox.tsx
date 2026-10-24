import { useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Check, Trash2, Mail } from 'lucide-react';
import { toast } from 'sonner';
export function Inbox({ comments = false }: { comments?: boolean }) {
  const table = comments ? 'project_comments' : 'contact_submissions';
  const cache = useQueryClient();
  const { data = [], isLoading, isError } = useQuery({ queryKey: ['admin', table], queryFn: async () => {
    const { data, error } = await supabase.from(table).select('*').order('created_at', { ascending: false });
    if (error) throw error; return data;
  }});
  const act = async (id: string, approve = false) => {
    if (!approve && !confirm('Permanently delete this item?')) return;
    const { error } = approve ? await supabase.from('project_comments').update({ approved: true }).eq('id', id) : await supabase.from(table).delete().eq('id', id);
    if (error) { toast.error('Could not update item.'); return; }
    cache.invalidateQueries({ queryKey: ['admin', table] }); cache.invalidateQueries({ queryKey: ['comments'] }); toast.success(approve ? 'Comment approved.' : 'Item deleted.');
  };
  return <div><h2 className="mb-6 text-xl font-semibold">{comments ? 'Project comments' : 'Enquiries'}</h2>{isLoading && <p role="status">Loading…</p>}{isError && <p role="alert">Could not load messages.</p>}{!isLoading && !isError && !data.length && <p className="text-muted-foreground">Nothing here yet.</p>}{data.map(row => <article key={row.id} className="border-b border-border py-6"><div className="flex flex-wrap items-start justify-between gap-4"><div><h3 className="font-sans font-semibold">{row.name}</h3><time className="text-xs text-muted-foreground">{new Date(row.created_at).toLocaleString()}</time></div><div className="flex gap-1">{'approved' in row && !row.approved && <Button size="sm" variant="outline" onClick={() => act(row.id, true)}><Check/>Approve</Button>}<Button variant="ghost" size="icon" aria-label="Delete message" onClick={() => act(row.id)}><Trash2/></Button></div></div>{'comment' in row ? <><p className="mt-4 whitespace-pre-wrap break-words">{row.comment}</p><p className="mt-3 text-xs text-muted-foreground">{row.approved ? 'Published' : 'Awaiting review'} · Project: {row.project_id}</p></> : <><div className="mt-3 flex flex-wrap gap-4 text-sm text-muted-foreground"><a href={`mailto:${row.email}`} className="flex items-center gap-2"><Mail className="h-4 w-4"/>{row.email}</a>{row.phone && <span>{row.phone}</span>}<span>Preferred date: {row.preferred_date}</span></div><p className="mt-4 whitespace-pre-wrap break-words">{row.message}</p>{row.project_needs && <p className="mt-3 whitespace-pre-wrap text-muted-foreground">{row.project_needs}</p>}{row.ai_brief && <pre className="mt-4 whitespace-pre-wrap break-words border-l border-primary/50 pl-4 font-sans text-sm leading-relaxed">{row.ai_brief}</pre>}<p className="mt-3 text-xs text-muted-foreground">Telegram: {row.telegram_delivered ? 'Delivered' : 'Not delivered'}</p></>}</article>)}</div>;
}
