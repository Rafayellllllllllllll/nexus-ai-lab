import type { WFNode, WFEdge, Agent } from './types';
export interface EngineEvents{ onNode:(id:string,status:string)=>void; onLog:(msg:string)=>void; onNodeIO:(id:string,input:string,output:string)=>void }
export function validateWorkflow(nodes:WFNode[],edges:WFEdge[]):string[]{
  const errs:string[]=[];
  if(!nodes.some(n=>n.type==='start')) errs.push('缺少 Start 节点');
  if(!nodes.some(n=>n.type==='end')) errs.push('缺少 End 节点');
  const ids=new Set(nodes.map(n=>n.id));
  edges.forEach(e=>{ if(!ids.has(e.from)||!ids.has(e.to)) errs.push('存在指向不存在节点的连线'); });
  nodes.forEach(n=>{ if(n.type!=='start' && !edges.some(e=>e.to===n.id)) errs.push(`节点「${n.label}」没有输入连线，可能无法到达`); });
  return errs;
}
export function topoOrder(nodes:WFNode[],edges:WFEdge[]):WFNode[]{
  const indeg=new Map(nodes.map(n=>[n.id,0])); edges.forEach(e=>indeg.set(e.to,(indeg.get(e.to)||0)+1));
  const q=nodes.filter(n=>(indeg.get(n.id)||0)===0); const out:WFNode[]=[];
  const adj=new Map<string,string[]>(); edges.forEach(e=>{ if(!adj.has(e.from)) adj.set(e.from,[]); adj.get(e.from)!.push(e.to); });
  while(q.length){ const n=q.shift()!; out.push(n); (adj.get(n.id)||[]).forEach(t=>{ indeg.set(t,indeg.get(t)!-1); if(indeg.get(t)===0) q.push(nodes.find(x=>x.id===t)!); }); }
  return out.length===nodes.length?out:[...out,...nodes.filter(n=>!out.includes(n))];
}
export function agentSim(agent:Agent|undefined,input:string):string{
  const role=agent?.role||'Analyst'; const base=input.slice(0,80)||'（无输入，使用默认演示输入）';
  const map:Record<string,string>={
    Planner:`【本地模拟·Planner】已把任务拆为 3 步：① 明确目标与约束 ② 收集关键信息 ③ 输出可执行清单。输入要点：${base}`,
    Researcher:`【本地模拟·Researcher】研究摘要：围绕「${base}」整理了 3 个要点与 2 个风险，结论偏向先做小范围验证再扩大。`,
    Developer:`【本地模拟·Developer】实现方案（演示）：模块 A 接收输入 → 模块 B 做规则处理 → 模块 C 输出结构化结果；含 2 个边界情况处理。`,
    Reviewer:`【本地模拟·Reviewer】检查结果：逻辑完整，格式一致；建议补 1 条异常分支说明，其余可通过。`,
    Analyst:`【本地模拟·Analyst】数据解读：输入长度 ${input.length} 字，关键信号 3 个，趋势为先升后稳，建议关注第 2 个信号。`,
    Writer:`【本地模拟·Writer】汇总：目标已达成，主要结论 3 条，待办 2 项，全文约 300 字，已按「结论-依据-下一步」整理。`};
  return map[role]||map.Analyst;
}
export function transformData(op:string,input:string,arg:string):string{
  switch(op){
    case 'uppercase': return input.toUpperCase();
    case 'lowercase': return input.toLowerCase();
    case 'reverse': return [...input].reverse().join('');
    case 'trim': return input.trim().replace(/\s+/g,' ');
    case 'prefix': return (arg||'【处理】')+input;
    case 'lines': return input.split(/\n/).map((l,i)=>`${i+1}. ${l}`).join('\n');
    default: return input;
  }
}
export function evalCondition(field:string,op:string,value:string,input:string):boolean{
  const v=field==='length'?String(input.length):field==='contains'?input:input;
  if(field==='length'){ const n=Number(value||0); return op==='>'?input.length>n:op==='<'?input.length<n:input.length===n; }
  if(op==='contains') return input.includes(value);
  if(op==='equals') return v===value;
  return v!==value;
}
export function extractVars(tpl:string):string[]{ const s=new Set<string>(); let m; const re=/\{\{\s*([a-zA-Z0-9_\u4e00-\u9fa5]+)\s*\}\}/g; while((m=re.exec(tpl))) s.add(m[1]); return [...s]; }
export function renderTpl(tpl:string,vars:Record<string,string>):string{ return tpl.replace(/\{\{\s*([a-zA-Z0-9_\u4e00-\u9fa5]+)\s*\}\}/g,(_,k)=>vars[k]??`{{${k}}}`); }
export function keywordSearch(query:string,docs:{title:string;content:string}[],chunkSize=200){
  const kws=query.toLowerCase().split(/\s+/).filter(Boolean); if(!kws.length) return [];
  const out:any[]=[];
  docs.forEach(d=>{ for(let i=0;i<d.content.length;i+=chunkSize){ const chunk=d.content.slice(i,i+chunkSize); const hits=kws.filter(k=>chunk.toLowerCase().includes(k)); if(hits.length) out.push({doc:d.title,chunk,hits,score:Math.round(hits.length/kws.length*100)}); } });
  return out.sort((a,b)=>b.score-a.score);
}
