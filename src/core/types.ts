export type AgentRole='Planner'|'Researcher'|'Developer'|'Reviewer'|'Analyst'|'Writer';
export interface Agent{ id:string; name:string; role:AgentRole; icon:string; systemPrompt:string; goal:string; tags:string[]; model:string; temperature:number; maxTokens:number; createdAt:string; updatedAt:string; status:'active'|'draft'|'paused'; version:string; notes:string; favorite:boolean }
export type NodeType='start'|'input'|'agent'|'prompt'|'condition'|'transform'|'merge'|'delay'|'loop'|'review'|'output'|'end';
export interface WFNode{ id:string; type:NodeType; label:string; x:number; y:number; config:Record<string,any> }
export interface WFEdge{ id:string; from:string; to:string; label?:string }
export interface Workflow{ id:string; name:string; nodes:WFNode[]; edges:WFEdge[]; updatedAt:string }
export interface RunLog{ t:string; msg:string }
export interface RunNodeResult{ id:string; label:string; input:string; output:string; status:'success'|'failed'|'skipped'|'running' }
export interface RunRecord{ id:string; kind:string; name:string; status:'success'|'failed'|'cancelled'; startedAt:string; endedAt:string; durationMs:number; nodeCount:number; logs:RunLog[]; nodes:RunNodeResult[]; result:string }
export interface PromptTpl{ id:string; name:string; system:string; user:string; category:string; updatedAt:string; versions:{v:string; note:string; at:string; system:string; user:string}[] }
export interface ModelCfg{ id:string; name:string; category:string; context:number; temperature:number; topP:number; maxTokens:number; tags:string[]; latencyMs:number; pricePer1k:number }
export interface DocItem{ id:string; title:string; content:string }
export interface Collection{ id:string; name:string; docs:DocItem[] }
export interface Settings{ theme:'dark'|'light'; accent:'violet'|'cyan'|'teal'; density:'comfortable'|'compact'; animations:boolean; defaultHome:string; sidebarCollapsed:boolean; autosave:boolean }
export interface VersionSnap{ id:string; objectType:string; objectId:string; name:string; version:string; note:string; createdAt:string; data:any }
export const uid=()=>Math.random().toString(36).slice(2,9)+Date.now().toString(36).slice(-4);
export const nowISO=()=>new Date().toISOString();
export const fmt=(s:string)=>{ try{ return new Date(s).toLocaleString('zh-CN',{month:'2-digit',day:'2-digit',hour:'2-digit',minute:'2-digit'}) }catch{ return s } };
