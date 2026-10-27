import { createClient } from '@supabase/supabase-js';
import type { State } from './store';
import { agentSim } from './engine';
import type { Agent } from './types';
export const SUPABASE_URL = (import.meta as any).env?.VITE_SUPABASE_URL as string | undefined;
export const SUPABASE_ANON_KEY = (import.meta as any).env?.VITE_SUPABASE_ANON_KEY as string | undefined;
export const isBackendConfigured = Boolean(SUPABASE_URL && SUPABASE_ANON_KEY);
export const supabase = isBackendConfigured ? createClient(SUPABASE_URL!, SUPABASE_ANON_KEY!) : null;
const TABLES = { agents: 'nexus_agents', workflows: 'nexus_workflows', prompts: 'nexus_prompts', collections: 'nexus_collections', models: 'nexus_models', runs: 'nexus_runs', versions: 'nexus_versions', studySubjects: 'nexus_study_subjects', studyMistakes: 'nexus_study_mistakes', studyReviews: 'nexus_study_reviews', studySessions: 'nexus_study_sessions', studyTasks: 'nexus_study_tasks' } as const;
type Key = keyof typeof TABLES;
async function fetchTable(k: Key): Promise<any[]> {
  if (!supabase) return [];
  const { data, error } = await supabase.from(TABLES[k]).select('data').order('updated_at', { ascending: false }).limit(500);
  if (error) throw error;
  return (data || []).map((r: any) => r.data);
}
export async function fetchBackendState(): Promise<Partial<State> | null> {
  if (!supabase) return null;
  try {
    const vals = await Promise.all((Object.keys(TABLES) as Key[]).map(fetchTable));
    const out: any = {}; (Object.keys(TABLES) as Key[]).forEach((k, i) => { out[k] = vals[i]; });
    if (!out.agents.length && !out.workflows.length) return null;
    return out as Partial<State>;
  } catch (e) { console.warn('Supabase 读取失败，回退本地', e); return null; }
}
let timer: any = null; let pending: State | null = null;
export function saveBackendState(s: State) {
  if (!supabase) return;
  pending = s; if (timer) return;
  timer = setTimeout(async () => {
    timer = null; const cur = pending; pending = null; if (!cur || !supabase) return;
    try {
      for (const k of Object.keys(TABLES) as Key[]) {
        const arr = cur[k] as any[]; if (!Array.isArray(arr)) continue; const rows = arr.map((d: any) => ({ id: d.id, data: d, updated_at: new Date().toISOString() }));
        if (rows.length) await supabase.from(TABLES[k]).upsert(rows, { onConflict: 'id' });
      }
    } catch (e) { console.warn('Supabase 保存失败，本地 IndexedDB 仍保留数据', e); }
  }, 900);
}
export async function runAgentReal(agent: Agent | undefined, input: string): Promise<{ text: string; source: 'real' | 'sim'; error?: string }> {
  if (!isBackendConfigured || !SUPABASE_URL || !SUPABASE_ANON_KEY) return { text: agentSim(agent, input), source: 'sim' };
  try {
    const r = await fetch(`${SUPABASE_URL}/functions/v1/nexus-chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', apikey: SUPABASE_ANON_KEY, Authorization: `Bearer ${SUPABASE_ANON_KEY}` },
      body: JSON.stringify({ system: agent?.systemPrompt || '', user: input, temperature: agent?.temperature ?? 0.5, maxTokens: agent?.maxTokens ?? 1024 }),
    });
    const j = await r.json();
    if (!r.ok) return { text: agentSim(agent, input), source: 'sim', error: j?.error || '真实调用失败，已回退本地模拟' };
    return { text: j.text || agentSim(agent, input), source: 'real' };
  } catch (e: any) { return { text: agentSim(agent, input), source: 'sim', error: '真实调用异常，已回退本地模拟：' + String(e?.message || e) }; }
}
