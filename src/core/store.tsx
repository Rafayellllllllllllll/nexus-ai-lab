import React,{createContext,useContext,useEffect,useMemo,useState} from 'react';
import type {Agent,Workflow,RunRecord,PromptTpl,ModelCfg,Collection,Settings,VersionSnap,WFNode,StudySubject,StudyMistake,StudyReview,StudySession,StudyTask} from './types';
import {uid,nowISO} from './types'; import {idbGet,idbSet} from './storage';
import {isBackendConfigured, fetchBackendState, saveBackendState} from './backend';
export interface State{ agents:Agent[]; workflows:Workflow[]; runs:RunRecord[]; prompts:PromptTpl[]; models:ModelCfg[]; collections:Collection[]; settings:Settings; versions:VersionSnap[]; workspace:string; recent:string[]; studySubjects:StudySubject[]; studyMistakes:StudyMistake[]; studyReviews:StudyReview[]; studySessions:StudySession[]; studyTasks:StudyTask[]; studyIntervals:number[] }
const AGENTS:Agent[]=[
 {id:'a-planner',name:'Planner · 规划者',role:'Planner',icon:'🧭',systemPrompt:'你是任务规划专家。先拆解目标、约束与验收标准，再输出有序步骤。',goal:'把模糊任务拆成可执行步骤',tags:['规划','拆解'],model:'nexus-sim-1',temperature:0.3,maxTokens:1024,createdAt:'2026-10-20T09:00:00',updatedAt:'2026-10-26T10:00:00',status:'active',version:'v1.2',notes:'默认开启审核分支',favorite:true},
 {id:'a-researcher',name:'Researcher · 研究员',role:'Researcher',icon:'🔍',systemPrompt:'你是资料研究员。只基于给定资料归纳要点，并标注不确定项。',goal:'从资料中提炼要点与风险',tags:['研究','摘要'],model:'nexus-sim-1',temperature:0.5,maxTokens:1536,createdAt:'2026-10-20T09:10:00',updatedAt:'2026-10-25T10:00:00',status:'active',version:'v1.1',notes:'',favorite:false},
 {id:'a-dev',name:'Developer · 开发者',role:'Developer',icon:'💻',systemPrompt:'你是代码开发助手。给出可落地的模块划分、接口与边界处理，不编造不存在的库。',goal:'输出模拟实现方案',tags:['代码','方案'],model:'nexus-sim-1',temperature:0.4,maxTokens:2048,createdAt:'2026-10-21T09:00:00',updatedAt:'2026-10-26T09:00:00',status:'active',version:'v1.3',notes:'',favorite:true},
 {id:'a-reviewer',name:'Reviewer · 审核员',role:'Reviewer',icon:'✅',systemPrompt:'你是质量审核员。按逻辑、格式、完整性三项检查，给出通过/修改意见。',goal:'检查结果并给出修改意见',tags:['审核','质量'],model:'nexus-sim-1',temperature:0.2,maxTokens:1024,createdAt:'2026-10-21T10:00:00',updatedAt:'2026-10-24T10:00:00',status:'active',version:'v1.0',notes:'',favorite:false},
 {id:'a-analyst',name:'Analyst · 分析师',role:'Analyst',icon:'📊',systemPrompt:'你是数据分析师。用数字说话，区分事实与推断，给出可验证的结论。',goal:'解读输入并输出结论',tags:['分析','数据'],model:'nexus-sim-1',temperature:0.4,maxTokens:1536,createdAt:'2026-10-22T09:00:00',updatedAt:'2026-10-25T09:00:00',status:'active',version:'v1.1',notes:'',favorite:false},
 {id:'a-writer',name:'Writer · 撰写者',role:'Writer',icon:'✍️',systemPrompt:'你是内容整理者。按结论-依据-下一步结构汇总，语言简洁。',goal:'汇总多智能体结果',tags:['写作','汇总'],model:'nexus-sim-1',temperature:0.6,maxTokens:2048,createdAt:'2026-10-22T10:00:00',updatedAt:'2026-10-26T09:00:00',status:'active',version:'v1.2',notes:'',favorite:false},
];
const demoWF:Workflow={id:'w-demo',name:'演示：输入 → 智能体 → 转换 → 输出',updatedAt:nowISO(),nodes:[
 {id:'n1',type:'start',label:'Start',x:40,y:180,config:{}},
 {id:'n2',type:'input',label:'Input 输入',x:220,y:180,config:{text:'请为校园社团设计一次招新活动方案'}},
 {id:'n3',type:'agent',label:'Agent · Planner',x:420,y:180,config:{agentId:'a-planner'}},
 {id:'n4',type:'transform',label:'Transform 整理',x:620,y:180,config:{op:'prefix',arg:'【已整理】'}},
 {id:'n5',type:'output',label:'Output 输出',x:820,y:180,config:{}},
 {id:'n6',type:'end',label:'End',x:1000,y:180,config:{}},
],edges:[{id:'e1',from:'n1',to:'n2'},{id:'e2',from:'n2',to:'n3'},{id:'e3',from:'n3',to:'n4'},{id:'e4',from:'n4',to:'n5'},{id:'e5',from:'n5',to:'n6'}]};
export function seedState():State{ return { agents:AGENTS, workflows:[demoWF], runs:[{id:'r-seed',kind:'工作流',name:'演示：输入 → 智能体 → 转换 → 输出',status:'success',startedAt:'2026-10-27T10:00:00',endedAt:'2026-10-27T10:00:02',durationMs:2100,nodeCount:6,logs:[{t:'10:00:00',msg:'开始执行（本地模拟）'},{t:'10:00:02',msg:'全部节点完成'}],nodes:[{id:'n1',label:'Start',input:'',output:'开始',status:'success'}],result:'演示运行已完成（本地模拟示例）'}], prompts:[{id:'p1',name:'任务拆解模板',system:'你是规划专家，输出有序步骤。',user:'请把 {{task}} 拆成 {{steps}} 步，面向 {{audience}}。',category:'规划',updatedAt:nowISO(),versions:[{v:'v1',note:'初始版',at:nowISO(),system:'你是规划专家。',user:'请把 {{task}} 拆解。'}]}], models:[{id:'m1',name:'Nexus Sim 1（模拟）',category:'通用',context:128000,temperature:0.5,topP:0.9,maxTokens:2048,tags:['通用','快速'],latencyMs:800,pricePer1k:0.02},{id:'m2',name:'Nexus Sim Pro（模拟）',category:'推理',context:200000,temperature:0.3,topP:0.85,maxTokens:4096,tags:['推理','长文本'],latencyMs:1800,pricePer1k:0.06}], collections:[{id:'c1',name:'产品知识库',docs:[{id:'d1',title:'工作流入门',content:'工作流由节点和连线组成。Start 开始，Agent 调用智能体，Condition 按条件分流，Transform 做文本处理，Output 输出结果。节点必须有输入连线，循环节点有最大次数限制。'},{id:'d2',title:'智能体协作说明',content:'Planner 拆解任务，Researcher 研究资料，Developer 给出方案，Reviewer 审核，Writer 汇总。审核失败会进入修改阶段，最多迭代 3 次。'}]}], settings:{theme:'dark',accent:'violet',density:'comfortable',animations:true,defaultHome:'dashboard',sidebarCollapsed:false,autosave:true}, versions:[], workspace:'默认工作区', recent:['dashboard','agents','workflows'],
 studySubjects:[{id:'s-math',name:'数学'}],
 studyMistakes:[
  {id:'sm1',subject:'数学',question:'二进制 1101 转十进制是多少？',answer:'13',explanation:'从右往左按 1、2、4、8 加权：1+4+8=13。',knowledgePoints:['二进制转换'],type:'计算',difficulty:'简单',mastery:'已掌握',favorite:false,notes:'曾错过一次，已订正',createdAt:'2026-10-25T10:00:00',lastReviewedAt:'2026-10-26T10:00:00',nextReviewAt:'2026-11-25T10:00:00',consecutiveWrong:0},
  {id:'sm2',subject:'数学',question:'RAM 与 ROM 哪一个是易失性存储？',answer:'RAM',explanation:'RAM 断电丢失，ROM 断电保留。',knowledgePoints:['存储器'],type:'概念',difficulty:'简单',mastery:'部分掌握',favorite:true,notes:'',createdAt:'2026-10-26T10:00:00',lastReviewedAt:'2026-10-26T10:00:00',nextReviewAt:'2026-10-29T10:00:00',consecutiveWrong:0},
  {id:'sm3',subject:'数学',question:'求函数 f(x)=x^2 在 x=3 处的导数。',answer:'6',explanation:'f′(x)=2x，代入得 6。',knowledgePoints:['导数'],type:'计算',difficulty:'中等',mastery:'未掌握',favorite:false,notes:'',createdAt:'2026-10-27T10:00:00',lastReviewedAt:'',nextReviewAt:'2026-10-28T10:00:00',consecutiveWrong:1},
 ],
 studyReviews:[], studySessions:[{id:'ss1',date:'2026-10-27',minutes:45,count:10,note:'单招练习 10 题'}], studyTasks:[{id:'st1',title:'复习今日到期错题',due:'2026-10-28',done:false,kind:'复习'}], studyIntervals:[1,3,7,15,30] }; }
const Ctx=createContext<{s:State; set:(p:Partial<State>)=>void; resetDemo:()=>void; addRun:(r:RunRecord)=>void; visit:(k:string)=>void; backendConfigured:boolean}|null>(null);
export const useStore=()=>useContext(Ctx)!;
export function StoreProvider({children}:{children:React.ReactNode}){ const [s,setS]=useState<State>(seedState); const [loaded,setLoaded]=useState(false);
 useEffect(()=>{ idbGet('state').then(async v=>{ if(v&&v.agents) setS(v); if(isBackendConfigured){ const b=await fetchBackendState(); if(b) setS(prev=>({...prev,...b})); } setLoaded(true); }); },[]);
 useEffect(()=>{ if(loaded&&s.settings.autosave){ idbSet('state',s); saveBackendState(s); } },[s,loaded]);
 const set=(p:Partial<State>)=>setS(prev=>({...prev,...p}));
 const value=useMemo(()=>({s,set,backendConfigured:isBackendConfigured,resetDemo:()=>setS(seedState()),addRun:(r:RunRecord)=>setS(prev=>({...prev,runs:[r,...prev.runs].slice(0,200)})),visit:(k:string)=>setS(prev=>({...prev,recent:[k,...prev.recent.filter(x=>x!==k)].slice(0,6)}))}),[s]);
 return <Ctx.Provider value={value}>{children}</Ctx.Provider>; }
export const NODE_META:Record<string,{label:string;icon:string;desc:string}>={
 start:{label:'Start',icon:'▶',desc:'工作流开始'}, input:{label:'Input',icon:'⌨',desc:'接收输入文本'}, agent:{label:'Agent',icon:'🤖',desc:'调用本地模拟智能体'}, prompt:{label:'Prompt',icon:'💬',desc:'构建提示词模板'}, condition:{label:'Condition',icon:'🔀',desc:'条件分支判断'}, transform:{label:'Transform',icon:'🔧',desc:'数据转换处理'}, merge:{label:'Merge',icon:'⫼',desc:'合并多路输入'}, delay:{label:'Delay',icon:'⏱',desc:'模拟延迟'}, loop:{label:'Loop',icon:'↻',desc:'循环处理（有上限）'}, review:{label:'Human Review',icon:'👤',desc:'人工审核节点'}, output:{label:'Output',icon:'📤',desc:'输出结果'}, end:{label:'End',icon:'■',desc:'结束流程'}};
export const TEMPLATES=[
 {id:'t1',name:'任务规划与拆分',cat:'规划',desc:'输入目标 → Planner 拆解 → 审核 → 输出清单',nodes:'Start → Input → Agent → Review → Output → End',use:'周计划、项目启动'},
 {id:'t2',name:'文本分析流程',cat:'分析',desc:'输入文本 → Analyst 解读 → Transform 整理 → 输出',nodes:'Start → Input → Agent → Transform → Output → End',use:'周报、反馈分析'},
 {id:'t3',name:'代码审查流程',cat:'开发',desc:'Developer 方案 → Reviewer 审核 → 失败回炉 → Writer 汇总',nodes:'Start → Input → Agent → Review → Output → End',use:'代码评审、方案评审'},
 {id:'t4',name:'文档摘要流程',cat:'写作',desc:'长文档输入 → Researcher 提炼 → Writer 汇总成摘要',nodes:'Start → Input → Agent → Transform → Output → End',use:'会议纪要、资料摘要'},
 {id:'t5',name:'多智能体协作流程',cat:'协作',desc:'Planner → Researcher → Developer → Reviewer → Writer 全链路',nodes:'Start → Agent ×5 → Output → End',use:'复杂任务协作'},
 {id:'t6',name:'文档关键词检索流程',cat:'知识库',desc:'文档 → 切分 → 关键词索引 → 检索 → 排序 → 整理',nodes:'文档 → 切分 → 索引 → 检索 → 排序 → 输出',use:'内部资料问答'},
 {id:'t7',name:'数据转换流程',cat:'数据',desc:'原始文本 → 多种 Transform 规则 → 合并输出',nodes:'Start → Input → Transform → Merge → Output → End',use:'数据清洗、格式整理'},
 {id:'t8',name:'人工审核流程',cat:'审核',desc:'自动处理后必须经人工确认，拒绝则返回修改',nodes:'Start → Agent → Human Review → Condition → Output → End',use:'对外文案、重要发布'},
];
