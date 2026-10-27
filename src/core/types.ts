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

export interface StudySubject{ id:string; name:string }
export type Mastery='未掌握'|'部分掌握'|'已掌握';
export interface StudyMistake{ id:string; subject:string; question:string; answer:string; explanation:string; knowledgePoints:string[]; type:string; difficulty:'简单'|'中等'|'困难'; mastery:Mastery; favorite:boolean; notes:string; createdAt:string; lastReviewedAt:string; nextReviewAt:string; consecutiveWrong:number }
export interface StudyReview{ id:string; mistakeId:string; correct:boolean; at:string; reason:string }
export interface StudySession{ id:string; date:string; minutes:number; count:number; note:string }
export interface StudyTask{ id:string; title:string; due:string; done:boolean; kind:string }
export const addDays=(iso:string,d:number)=>new Date(new Date(iso).getTime()+d*864e5).toISOString();
export const DEFAULT_INTERVALS=[1,3,7,15,30];
export function planNextReview(m:Pick<StudyMistake,'mastery'|'consecutiveWrong'|'lastReviewedAt'>,correct:boolean,now=new Date(),intervals:number[]=DEFAULT_INTERVALS){
  const safe=intervals.length?intervals:DEFAULT_INTERVALS;
  if(!correct) return {mastery:'未掌握' as Mastery,consecutiveWrong:m.consecutiveWrong+1,nextReviewAt:addDays(now.toISOString(),1),interval_days:1,reason:'答错：掌握程度回落到未掌握，连续答错 +1，1 天后重新复习。'};
  if(!m.lastReviewedAt) return {mastery:'部分掌握' as Mastery,consecutiveWrong:0,nextReviewAt:addDays(now.toISOString(),safe[0]),interval_days:safe[0],reason:`首次复习答对：从未复习改为部分掌握，${safe[0]} 天后复习。`};
  const step=m.mastery==='未掌握'?0:m.mastery==='部分掌握'?1:2; const nextStep=Math.min(step+1,safe.length-1); const days=m.mastery==='已掌握'?safe[safe.length-1]:safe[nextStep]; const nm=m.mastery==='未掌握'?'部分掌握':'已掌握';
  return {mastery:nm as Mastery,consecutiveWrong:0,nextReviewAt:addDays(now.toISOString(),days),interval_days:days,reason:nm==='已掌握'?`答对且已掌握：取最大间隔 ${days} 天，避免频繁打扰。`:`答对：掌握程度提升为${nm}，${days} 天后复习。`};
}
export function reviewBucket(m:StudyMistake,now=new Date()){
  if(m.mastery==='已掌握'&&m.consecutiveWrong===0) return '已掌握';
  if(m.consecutiveWrong>=2) return '连续答错';
  if(!m.lastReviewedAt) return '未复习';
  if(m.nextReviewAt&&new Date(m.nextReviewAt)<=now) return '已到期';
  return '未到期';
}
