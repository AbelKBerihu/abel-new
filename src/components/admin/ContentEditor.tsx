import { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Pencil, Trash2, Save, Upload, Eye, EyeOff } from 'lucide-react';
import { toast } from 'sonner';
import type { ContentTable } from '@/hooks/use-portfolio';
import { INITIAL_PORTFOLIO_DATA } from '@/lib/portfolio-store';

type Row = Record<string, unknown>;

const columns: Record<ContentTable, string[]> = {
  projects: ['title', 'discipline', 'description', 'status', 'coming_soon', 'tags', 'image_url', 'link_url', 'sort_order', 'is_visible'],
  skills: ['name', 'category', 'level', 'coming_soon', 'sort_order', 'is_visible'],
  certifications: ['title', 'issuer', 'date', 'coming_soon', 'credential_url', 'image_url', 'sort_order', 'is_visible'],
  timeline_items: ['kind', 'title', 'organization', 'period', 'description', 'sort_order', 'is_visible'],
  site_settings: ['key', 'value'],
};

const editableColumns: Record<ContentTable, string[]> = {
  projects: ['title', 'discipline', 'description', 'status', 'coming_soon', 'tags', 'image_url', 'link_url', 'sort_order'],
  skills: ['name', 'category', 'level', 'coming_soon', 'sort_order'],
  certifications: ['title', 'issuer', 'date', 'coming_soon', 'credential_url', 'image_url', 'sort_order'],
  timeline_items: ['kind', 'title', 'organization', 'period', 'description', 'sort_order'],
  site_settings: ['key', 'value'],
};

const settingNames = [
  'hero_name',
  'hero_role',
  'hero_intro',
  'about',
  'status',
  'languages',
  'currently_learning',
  'footer_banner',
  'github_url',
  'linkedin_url',
  'telegram_url',
  'whatsapp_url',
  'contact_email',
  'profile_image',
];

export function ContentEditor({ table }: { table: ContentTable }) {
  const cache = useQueryClient();
  const [draft, setDraft] = useState<Row | null>(null);
  const [original, setOriginal] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const key = table === 'site_settings' ? 'key' : 'id';
  const hasVisibility = table !== 'site_settings';

  const { data = [], isLoading, isError } = useQuery({
    queryKey: ['admin', table],
    queryFn: async () => {
      const { data, error } = await supabase.from(table).select('*').order(table === 'site_settings' ? 'key' : 'sort_order');
      if (error) throw error;

      if (table === 'site_settings') {
        const dbMap = new Map((data ?? []).map((r: any) => [r.key, r]));
        const merged = INITIAL_PORTFOLIO_DATA.site_settings.map(def => dbMap.get(def.key) ?? def);
        for (const [k, r] of dbMap.entries()) {
          if (!merged.some(m => m.key === k)) merged.push(r);
        }
        return merged as unknown as Row[];
      }

      return (data ?? []) as unknown as Row[];
    },
  });

  const refresh = () => {
    cache.invalidateQueries({ queryKey: ['admin', table] });
    cache.invalidateQueries({ queryKey: ['portfolio', table] });
  };

  const edit = (row?: Row) => {
    setOriginal(row ? String(row[key]) : null);
    setDraft(row
      ? { ...row, tags: Array.isArray(row.tags) ? row.tags.join(', ') : row.tags }
      : Object.fromEntries(columns[table].map(c => [
        c,
        c === 'sort_order' ? data.length
        : c === 'level' ? 80
        : c === 'kind' ? 'experience'
        : c === 'status' ? 'completed'
        : c === 'coming_soon' ? false
        : c === 'is_visible' ? true
        : '',
      ]))
    );
  };

  const toggleVisible = async (row: Row) => {
    try {
      const current = Boolean(row.is_visible);
      const targetKey = String(row[key]);

      const { error } = await (supabase.from(table) as any)
        .update({ is_visible: !current })
        .eq(key, targetKey);
      if (error) throw error;

      refresh();
      toast.success(!current ? 'Item is now visible on the public site.' : 'Item hidden from the public site.');
    } catch (err: any) {
      toast.error(err?.message ? `Database error: ${err.message}` : 'Failed to update visibility.');
      console.error('Toggle visibility error:', err);
    }
  };

  const remove = async (row: Row) => {
    if (!window.confirm('Remove this item? This cannot be undone.')) return;
    setBusy(true);
    try {
      const targetKey = String(row[key]);
      const { error } = await (supabase.from(table) as any).delete().eq(key, targetKey);
      if (error) throw error;

      setBusy(false);
      refresh();
      toast.success('Item removed from live site.');
    } catch (err: any) {
      setBusy(false);
      toast.error(err?.message ? `Database error: ${err.message}` : 'Failed to remove item.');
      console.error('Remove error:', err);
    }
  };

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!draft) return;
    setBusy(true);
    try {
      const fields = editableColumns[table];
      const payload = Object.fromEntries(fields.map(c => [
        c,
        c === 'tags'
          ? String(draft[c] || '').split(',').map((t: string) => t.trim()).filter(Boolean)
          : c.endsWith('_url') ? draft[c] || null
          : c === 'is_visible' ? Boolean(draft[c])
          : c === 'coming_soon' ? Boolean(draft[c])
          : c === 'sort_order' ? Number(draft[c] || 0) || 0
          : c === 'level' ? Number(draft[c] || 0) || 0
          : draft[c],
      ]));

      if (table === 'skills' && (Number(payload.level) < 0 || Number(payload.level) > 100)) {
        toast.error('Level must be between 0 and 100.');
        setBusy(false);
        return;
      }

      if (table === 'site_settings') {
        const settingKey = String(payload.key || original || '').trim();
        if (!settingKey) {
          toast.error('Setting key is required.');
          setBusy(false);
          return;
        }
        const { error } = await supabase
          .from('site_settings')
          .upsert(
            { key: settingKey, value: String(payload.value ?? ''), updated_at: new Date().toISOString() },
            { onConflict: 'key' }
          );
        if (error) throw error;
      } else if (original) {
        const { error } = await (supabase.from(table) as any).update(payload).eq(key, original);
        if (error) throw error;
      } else {
        const { error } = await (supabase.from(table) as any).insert({ ...payload, is_visible: true });
        if (error) throw error;
      }

      setBusy(false);
      setDraft(null);
      refresh();
      toast.success('Published to live site.');
    } catch (err: any) {
      setBusy(false);
      toast.error(err?.message ? `Database error: ${err.message}` : 'Failed to save changes.');
      console.error('Save error:', err);
    }
  };

  const upload = async (targetColumn: string, file?: File) => {
    if (!file || !draft) return;
    if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type) || file.size > 5 * 1024 * 1024) {
      toast.error('Choose a JPG, PNG or WebP under 5 MB.');
      return;
    }
    setBusy(true);
    try {
      const ext = file.type.split('/')[1] || 'jpg';
      const path = `${crypto.randomUUID()}.${ext}`;
      const { error } = await supabase.storage.from('portfolio-images').upload(path, file, { contentType: file.type });
      if (error) throw error;
      const { data: pub } = supabase.storage.from('portfolio-images').getPublicUrl(path);
      setDraft(d => d ? { ...d, [targetColumn]: pub.publicUrl } : d);
      setBusy(false);
      toast.success('Image uploaded to Supabase Storage. Click Save to publish.');
    } catch (err: any) {
      setBusy(false);
      toast.error(err?.message ? `Upload failed: ${err.message}` : 'Could not upload image to storage.');
    }
  };

  const isImageField = (col: string) =>
    (col.endsWith('_url') && col.includes('image')) ||
    (table === 'site_settings' && draft?.key === 'profile_image' && col === 'value');

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <p className="text-sm text-muted-foreground">
          Showing {data.length} {table.replace('_', ' ')}
        </p>
        <Button onClick={() => edit()}>
          <Plus className="mr-2 h-4 w-4" /> {table === 'site_settings' ? 'Add setting' : 'Add item'}
        </Button>
      </div>

      {isLoading && <p role="status">Loading…</p>}
      {isError && <p role="alert" className="text-destructive">Could not load this table from Supabase. Make sure you ran supabase_full_setup.sql in the Supabase SQL Editor.</p>}

      <div className="overflow-x-auto rounded-lg border border-border">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-border bg-card/60 text-xs uppercase text-muted-foreground">
            <tr>
              <th className="px-4 py-3">Item</th>
              <th className="px-4 py-3">Details</th>
              {hasVisibility && <th className="px-4 py-3">Visible</th>}
              <th className="px-4 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {data.map((row) => (
              <tr key={String(row[key])} className="hover:bg-card/40 transition-colors">
                <td className="px-4 py-3 font-medium">
                  {String(row.title || row.name || row.key || '')}
                </td>
                <td className="max-w-md truncate px-4 py-3 text-muted-foreground">
                  {String(row.value || row.description || row.category || row.issuer || '')}
                </td>
                {hasVisibility && (
                  <td className="px-4 py-3">
                    <button
                      type="button"
                      onClick={() => toggleVisible(row)}
                      className={`inline-flex items-center gap-1 rounded px-2 py-0.5 text-xs font-jetbrains transition-colors ${
                        row.is_visible
                          ? 'bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20'
                          : 'bg-muted text-muted-foreground hover:bg-muted/80'
                      }`}
                    >
                      {row.is_visible ? <Eye className="h-3 w-3" /> : <EyeOff className="h-3 w-3" />}
                      {row.is_visible ? 'Visible' : 'Hidden'}
                    </button>
                  </td>
                )}
                <td className="px-4 py-3 text-right">
                  <div className="flex items-center justify-end gap-1">
                    <Button variant="ghost" size="sm" onClick={() => edit(row)}>
                      <Pencil className="h-3.5 w-3.5" />
                    </Button>
                    {table !== 'site_settings' && (
                      <Button variant="ghost" size="sm" onClick={() => remove(row)} className="text-destructive hover:text-destructive">
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Dialog open={Boolean(draft)} onOpenChange={open => !open && setDraft(null)}>
        <DialogContent className="max-h-[85svh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{original ? 'Edit item' : 'Add item'}</DialogTitle>
          </DialogHeader>
          {draft && (
            <form onSubmit={save} className="space-y-4">
              {editableColumns[table].map(c => (
                <div key={c}>
                  <label htmlFor={`edit-${c}`} className="mb-2 block text-sm font-medium capitalize">
                    {c.replace(/_/g, ' ')}
                  </label>
                  {c === 'kind' ? (
                    <Select value={String(draft[c] || 'experience')} onValueChange={value => setDraft({ ...draft, [c]: value })}>
                      <SelectTrigger id={`edit-${c}`}><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {['experience', 'education', 'learning'].map(k => <SelectItem key={k} value={k}>{k}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  ) : c === 'status' ? (
                    <Select value={String(draft[c] || 'completed')} onValueChange={value => setDraft({ ...draft, [c]: value })}>
                      <SelectTrigger id={`edit-${c}`}><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="completed">Completed</SelectItem>
                        <SelectItem value="in_progress">In progress</SelectItem>
                      </SelectContent>
                    </Select>
                  ) : c === 'coming_soon' ? (
                    <div className="flex items-center gap-3">
                      <input
                        id={`edit-${c}`}
                        type="checkbox"
                        checked={Boolean(draft[c])}
                        onChange={e => setDraft({ ...draft, [c]: e.target.checked })}
                        className="h-4 w-4 rounded border-border"
                      />
                      <label htmlFor={`edit-${c}`} className="text-sm text-muted-foreground">
                        Show as "Coming soon" with placeholder badge
                      </label>
                    </div>
                  ) : c === 'key' && table === 'site_settings' ? (
                    <Select value={String(draft[c] || '')} onValueChange={value => setDraft({ ...draft, [c]: value })} disabled={Boolean(original)}>
                      <SelectTrigger id={`edit-${c}`}><SelectValue placeholder="Select setting key" /></SelectTrigger>
                      <SelectContent>
                        {settingNames.map(name => <SelectItem key={name} value={name}>{name}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  ) : ['description', 'about', 'hero_intro'].includes(c) || (table === 'site_settings' && c === 'value' && ['about', 'hero_intro', 'currently_learning'].includes(String(draft.key))) ? (
                    <Textarea
                      id={`edit-${c}`}
                      rows={4}
                      value={String(draft[c] || '')}
                      onChange={e => setDraft({ ...draft, [c]: e.target.value })}
                    />
                  ) : (
                    <Input
                      id={`edit-${c}`}
                      type={c === 'sort_order' || c === 'level' ? 'number' : 'text'}
                      value={String(draft[c] ?? '')}
                      onChange={e => setDraft({ ...draft, [c]: e.target.value })}
                    />
                  )}
                  {isImageField(c) && (
                    <div className="mt-2">
                      <label className="inline-flex cursor-pointer items-center gap-2 text-xs text-primary hover:underline">
                        <Upload className="h-3.5 w-3.5" /> Upload image file
                        <input
                          type="file"
                          accept="image/jpeg,image/png,image/webp"
                          className="hidden"
                          onChange={e => upload(c, e.target.files?.[0])}
                        />
                      </label>
                      {draft[c] ? (
                        <div className="mt-2 h-16 w-16 overflow-hidden rounded border border-border">
                          <img src={String(draft[c])} alt="preview" className="h-full w-full object-cover" />
                        </div>
                      ) : null}
                    </div>
                  )}
                </div>
              ))}
              <div className="flex justify-end gap-2 pt-4">
                <Button type="button" variant="outline" onClick={() => setDraft(null)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={busy}>
                  <Save className="mr-2 h-4 w-4" /> {busy ? 'Saving…' : 'Save'}
                </Button>
              </div>
            </form>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
