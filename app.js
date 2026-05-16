function pixelIcon(src, size=16) {
  return `<img src="${src}" width="${size}" height="${size}" style="image-rendering:pixelated;vertical-align:middle;margin-right:3px;" alt="">`;
}
/* ─── CONSTANTS ─────────────────────────────────────────────────────────── */
const DAYS=['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];
const SHORT=['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];
const CIRC=175.9;

/* ─── DEFAULT DATA ──────────────────────────────────────────────────────── */
const SUNDAY_PILL_TASK={id:'sunday-pillbox',name:'Fill weekly pill box',time:'Evening'};

/* ─── QUALITY SYSTEM CONFIG ──────────────────────────────────────────────── */
// Tasks eligible for Legendary Execution (purple orb)
const PURPLE_ELIGIBLE = new Set([
  'wakeup','gym','breakfast','work','dinner','intentions','personal','winddown','sleep'
]);
const GRAY_GRACE={
  'gym':2,'shower':3,'intentions':3,
  'winddown':3,'sleep':3,'wakeup':5,'sunday-pillbox':1
};
const GYM_TEMPLATES={
  upper:{name:'Upper Body',exercises:[
    {id:'lat-pulldown',name:'Lat Pulldown'},
    {id:'seated-row',name:'Seated Row'},
    {id:'chest-fly',name:'Chest Fly'},
    {id:'bicep-curl',name:'Bicep Curl'},
    {id:'incline-press',name:'Incline Press'},
    {id:'tricep-press',name:'Tricep Press'},
  ]},
  legs:{name:'Leg Day',exercises:[
    {id:'leg-press',name:'Leg Press'},
    {id:'leg-extension',name:'Leg Extension'},
    {id:'leg-curl',name:'Leg Curl'},
    {id:'hip-adductor',name:'Hip Adductor'},
  ]},
  cardio:{name:'Cardio — Elliptical',type:'cardio',exercises:[]}
};
const GYM_EFFORT=[
  {id:'warmup',label:'😤 Warm Up'},
  {id:'solid',label:'💪 Solid'},
  {id:'pushed',label:'🔥 Pushed It'},
  {id:'destroyed',label:'💀 Destroyed'},
];
const QUALITY_TASKS = {
  'wakeup':    { debuff:'sluggish',        label:'Sluggish',         debuffOnYellow:true  },
  'gym':       { debuff:'undertrained',    label:'Undertrained',     debuffOnYellow:false },
  'shower':    { debuff:'foggy-crawler',   label:'Foggy Crawler',    debuffOnYellow:false },
  'meds-am':   { debuff:'foggy-crawler',   label:'Foggy Crawler',    debuffOnYellow:true  },
  'meds-pm':   { debuff:'foggy-crawler',   label:'Foggy Crawler',    debuffOnYellow:true  },
  'breakfast': { debuff:'running-on-empty',label:'Running on Empty', debuffOnYellow:false },
  'work':      { debuff:'running-on-empty',label:'Running on Empty', debuffOnYellow:false },
  'dinner':    { debuff:'running-on-empty',label:'Running on Empty', debuffOnYellow:false },
  'winddown':  { debuff:'doomscrolling',   label:'Doomscrolling',    debuffOnYellow:true  },
  'sleep':     { debuff:'sleep-deprived',  label:'Sleep Deprived',   debuffOnYellow:true  },
};

const FLOOR_CONDITIONS=[
  {id:'sick-day',name:'Sick Day',cat:'Physical',
   tasks:['gym','shower','facewash','moisturize','deodorant'],effect:'recovering',
   desc:'Movement + self-care tasks set to Recovering. Streak protected.'},
  {id:'injury',name:'Injury',cat:'Physical',
   tasks:['gym'],effect:'recovering',
   desc:'Gym set to Recovering. No penalty.'},
  {id:'chronic-flare',name:'Chronic Flare',cat:'Physical',
   tasks:'all',effect:'recovery-mode',
   desc:'All tasks. Recovery Mode pre-activated. Streak protected.'},
  {id:'day-off',name:'Day Off',cat:'Schedule',
   tasks:['work','leave'],effect:'reconfigured',
   desc:'Work tasks removed from floor today.'},
  {id:'working-late',name:'Working Late',cat:'Schedule',
   tasks:['home','winddown','sleep'],effect:'recovering',
   desc:'Evening tasks set to Recovering. Sleep Deprived risk noted.'},
  {id:'vet-emergency',name:'Vet Emergency',cat:'Schedule',
   tasks:['work','home','dinner','nightprep','winddown','sleep'],effect:'recovering',
   desc:'Work + evening tasks. No penalty.'},
  {id:'travel-day',name:'Travel Day',cat:'Schedule',
   tasks:['gym','work','dogs-walk-am','dogs-walk-pm'],effect:'reconfigured',
   desc:'Location-dependent tasks removed from floor.'},
  {id:'appointment-heavy',name:'Appointment Heavy Day',cat:'Life',
   tasks:['personal','intentions'],effect:'reconfigured',
   desc:'Personal time + intentions adjusted.'},
  {id:'weather-event',name:'Weather / Power Event',cat:'Life',
   tasks:['gym','dogs-walk-am','dogs-walk-pm'],effect:'recovering',
   desc:'Force majeure. No penalty.'},
  {id:'low-capacity',name:'Low Capacity Day',cat:'Mental Health',
   tasks:'all',effect:'recovery-mode',
   desc:'All tasks. Recovery Mode pre-activated. Three tasks clears the floor.'},
  {id:'therapy-day',name:'Therapy Day',cat:'Mental Health',
   tasks:['work'],effect:'reconfigured',
   desc:'Schedule adjusted. Intentions weighted higher.'},
];

const DEFAULT_SCHEDULE={
  weekday:[
    {section:'Morning',tasks:[
      {id:'meds-am',name:'Morning medications',time:'5:30 AM'},
      {id:'wakeup',name:'Wake up at 5:30 AM',time:'5:30 AM'},
      {id:'gym',name:'Gym (40 min)',time:'5:35–6:15 AM'},
      {id:'shower',name:'Shower',time:'6:15 AM'},
      {id:'facewash',name:'Face wash',time:'In shower'},
      {id:'moisturize',name:'Moisturize + sunscreen',time:'After shower'},
      {id:'teeth',name:'Brush teeth + floss',time:'At sink'},
      {id:'deodorant',name:'Deodorant',time:'At sink'},
      {id:'breakfast',name:'Eat breakfast',time:'6:40 AM'},
      {id:'intentions',name:'Set 3 daily intentions',time:'6:55 AM'},
      {id:'leave',name:'Leave for work',time:'7:15 AM'},
    ]},
    {section:'Workday',tasks:[
      {id:'work',name:'Work + real lunch break',time:'8 AM–4:30 PM'},
    ]},
    {section:'Evening',tasks:[
      {id:'home',name:'Home — change clothes',time:'Before 5 PM'},
      {id:'dinner',name:'Dinner + downtime',time:'5–6:30 PM'},
      {id:'personal',name:'Personal time',time:'6:30–8:30 PM'},
      {id:'nightprep',name:'Night prep (bag, outfit, lunch)',time:'8:30 PM'},
      {id:'nightwash',name:'Evening face wash',time:'9:00 PM'},
      {id:'nightteeth',name:'Brush + floss + mouthwash',time:'9:10 PM'},
      {id:'meds-pm',name:'Evening medications',time:'9:10 PM'},
      {id:'winddown',name:'No screens — wind down',time:'9:15 PM'},
      {id:'sleep',name:'Lights out',time:'9:30–10 PM'},
    ]}
  ],
  weekend:[
    {section:'Morning',tasks:[
      {id:'meds-am',name:'Morning medications',time:'Morning'},
      {id:'wakeup',name:'Wake up by 6:30 AM',time:'6:30 AM'},
      {id:'shower',name:'Shower',time:'Morning'},
      {id:'facewash',name:'Face wash',time:'In shower'},
      {id:'moisturize',name:'Moisturize + sunscreen',time:'After shower'},
      {id:'teeth',name:'Brush teeth + floss',time:'At sink'},
      {id:'deodorant',name:'Deodorant',time:'At sink'},
      {id:'breakfast',name:'Proper breakfast',time:'Morning'},
    ]},
    {section:'Daytime',tasks:[
      {id:'gym',name:'Gym or active activity',time:'Morning/afternoon'},
      {id:'dogs-walk-wknd',name:'Walk Edna & Kronk',time:'Morning/afternoon'},
      {id:'errands',name:'Errands or meal prep',time:'Afternoon'},
      {id:'personal',name:'Personal time',time:'Afternoon'},
    ]},
    {section:'Evening',tasks:[
      {id:'dinner',name:'Dinner',time:'Evening'},
      {id:'nightwash',name:'Evening face wash',time:'9:00 PM'},
      {id:'nightteeth',name:'Brush + floss + mouthwash',time:'9:10 PM'},
      {id:'meds-pm',name:'Evening medications',time:'9:10 PM'},
      {id:'nightprep',name:'Night prep',time:'8:30 PM'},
      {id:'sleep',name:'Lights out',time:'9:30–10 PM'},
    ]}
  ]
};

const DEFAULT_DOG_TASKS={
  shared:{
    morning:[
      {id:'dogs-feed-am',name:'Feed Edna & Kronk',time:'Morning'},
      {id:'dogs-water-am',name:'Fresh water for Edna & Kronk',time:'Morning'},
      {id:'dogs-walk-am',name:'Walk Edna & Kronk',time:'Before work'},
    ],
    evening:[
      {id:'dogs-feed-pm',name:'Feed Edna & Kronk',time:'Evening'},
      {id:'dogs-water-pm',name:'Fresh water for Edna & Kronk',time:'Evening'},
      {id:'dogs-walk-pm',name:'Walk Edna & Kronk',time:'Evening'},
    ]
  },
  mental:[
    {id:'m-snuggle',name:'Snuggle time with Edna & Kronk',time:'Anytime'},
    {id:'m-breath',name:'5 min breathing with the dogs',time:'Anytime'},
    {id:'m-play',name:'Backyard play session',time:'Anytime'},
    {id:'m-gratitude',name:'Grateful for Edna & Kronk',time:'Evening'},
    {id:'m-photo',name:'Take a cute photo of the dogs',time:'Anytime'},
  ],
  grooming:[
    {id:'g-e-bath',label:'Edna — bath',days:14},
    {id:'g-e-brush',label:'Edna — brush',days:3},
    {id:'g-e-nails',label:'Edna — nails',days:21},
    {id:'g-k-bath',label:'Kronk — bath',days:14},
    {id:'g-k-brush',label:'Kronk — brush',days:3},
    {id:'g-k-nails',label:'Kronk — nails',days:21},
  ],
  prevention:[
    {id:'prev-e-monthly',label:'Edna — monthly prevention',dayOfMonth:15},
    {id:'prev-k-monthly',label:'Kronk — monthly prevention',dayOfMonth:15},
  ]
};

const DEFAULT_WHEEL={
  clean:{standalone:[
    {id:'c1',name:'Wipe down kitchen counters',dur:10,repeat:true,cooldown:2},
    {id:'c2',name:'Unload the dishwasher',dur:10,repeat:true,cooldown:1},
    {id:'c3',name:'Sweep the floor',dur:10,repeat:true,cooldown:2},
    {id:'c4',name:'Take out trash',dur:5,repeat:true,cooldown:2},
    {id:'c5',name:'Wipe down stovetop',dur:10,repeat:true,cooldown:3},
    {id:'c6',name:'Clean bathroom sink',dur:10,repeat:true,cooldown:3},
    {id:'c7',name:'Wipe down mirrors',dur:5,repeat:true,cooldown:3},
    {id:'c8',name:'Quick fridge clean-out',dur:15,repeat:true,cooldown:7},
  ],projects:[
    {id:'p-deep',name:'Deep Clean',tasks:[
      {id:'dc1',name:'Vacuum all rooms',dur:20,repeat:true,cooldown:7},
      {id:'dc2',name:'Mop floors',dur:20,repeat:true,cooldown:7},
      {id:'dc3',name:'Clean toilet',dur:10,repeat:true,cooldown:7},
      {id:'dc4',name:'Scrub shower',dur:15,repeat:true,cooldown:14},
      {id:'dc5',name:'Clean windows',dur:20,repeat:true,cooldown:30},
    ]},
    {id:'p-laundry',name:'Laundry',tasks:[
      {id:'l1',name:'Do a load of laundry',dur:10,repeat:true,cooldown:2},
      {id:'l2',name:'Fold and put away clothes',dur:15,repeat:true,cooldown:2},
      {id:'l3',name:'Change bed sheets',dur:15,repeat:true,cooldown:7},
    ]}
  ]},
  admin:{standalone:[
    {id:'a1',name:'Reply to 3 emails',dur:15,repeat:true,cooldown:1},
    {id:'a2',name:'Pay a bill',dur:10,repeat:false,cooldown:0},
    {id:'a3',name:'Clear your desk',dur:10,repeat:true,cooldown:3},
    {id:'a4',name:'Schedule one appointment',dur:10,repeat:false,cooldown:0},
    {id:'a5',name:'Check in on a friend',dur:10,repeat:true,cooldown:3},
    {id:'a6',name:'Organize one drawer',dur:15,repeat:true,cooldown:14},
  ],projects:[
    {id:'p-finance',name:'Finance',tasks:[
      {id:'f1',name:'Review recent transactions',dur:15,repeat:true,cooldown:7},
      {id:'f2',name:'Check savings goal progress',dur:10,repeat:true,cooldown:7},
      {id:'f3',name:'Update budget',dur:20,repeat:true,cooldown:7},
    ]}
  ]},
  mental:{standalone:[
    {id:'mh1',name:'5 min breathing exercise',dur:5,repeat:true,cooldown:1},
    {id:'mh2',name:'Write 3 things I am grateful for',dur:5,repeat:true,cooldown:1},
    {id:'mh3',name:'10 min walk outside',dur:10,repeat:true,cooldown:1},
    {id:'mh4',name:'Journal for 10 min',dur:10,repeat:true,cooldown:1},
    {id:'mh5',name:'Call someone I care about',dur:15,repeat:true,cooldown:3},
    {id:'mh6',name:'Do something just for fun',dur:20,repeat:true,cooldown:2},
  ],projects:[
    {id:'p-therapy',name:'Therapy Prep',tasks:[
      {id:'tp1',name:'Write down what I want to discuss',dur:10,repeat:false,cooldown:0},
      {id:'tp2',name:"Review last week's mood",dur:10,repeat:true,cooldown:7},
      {id:'tp3',name:'Note any patterns I noticed',dur:10,repeat:true,cooldown:7},
    ]}
  ]},
  bonus:{standalone:[
    {id:'b1',name:'Try a new recipe',dur:20,repeat:true,cooldown:7},
    {id:'b2',name:'Read for 20 min',dur:20,repeat:true,cooldown:1},
    {id:'b3',name:"Watch something you've been putting off",dur:20,repeat:true,cooldown:3},
    {id:'b4',name:'Take Edna & Kronk on a long walk',dur:20,repeat:true,cooldown:2},
  ],projects:[]},
  priority:{standalone:[],projects:[]}
};

/* ─── SUPABASE ──────────────────────────────────────────────────────────── */
const SUPABASE_URL='https://udfeyrpayakrovhyfjsc.supabase.co';
const SUPABASE_KEY='eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVkZmV5cnBheWFrcm92aHlmanNjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzg0NDg0NTksImV4cCI6MjA5NDAyNDQ1OX0.wfh5zKaGTl-rngZ5a4wcITtnlhsikLSF4eZpx6PxeOM';
const SYNC_ID='main';

function loadLocal(k,d){try{const v=localStorage.getItem(k);return v?JSON.parse(v):d;}catch(e){return d;}}
function saveLocal(k,v){try{localStorage.setItem(k,JSON.stringify(v));}catch(e){}}

async function syncToSupabase(){
  try{
    await fetch(`${SUPABASE_URL}/rest/v1/routine_data`,{
      method:'POST',
      headers:{'Content-Type':'application/json','apikey':SUPABASE_KEY,'Authorization':'Bearer '+SUPABASE_KEY,'Prefer':'resolution=merge-duplicates'},
      body:JSON.stringify({id:SYNC_ID,data:{state,schedule,dogTasks,dogState,groomState,prevState,notifs,wheel,wheelDone,wheelSkips,wheelPinned,inbox,shopItems,rewardsState,xpState,companionPhotos,archived,qualityState,customRewards,donutChat,donutWeeklySummary,donutTherapistSummary,donutApiKey},updated_at:new Date().toISOString()})
    });
  }catch(e){console.warn('Sync failed',e);}
}

async function loadFromSupabase(){
  try{
    const res=await fetch(`${SUPABASE_URL}/rest/v1/routine_data?id=eq.${SYNC_ID}&select=data`,{headers:{'apikey':SUPABASE_KEY,'Authorization':'Bearer '+SUPABASE_KEY}});
    const rows=await res.json();
    if(rows&&rows.length&&rows[0].data){
      const d=rows[0].data;
      if(d.state)state=d.state;
      if(d.schedule&&d.schedule.weekday&&d.schedule.weekday.length){
        schedule=d.schedule;
        // MIGRATION: ensure meds tasks exist
        const wdMorn=schedule.weekday.find(s=>s.section==='Morning');
        const wdEve=schedule.weekday.find(s=>s.section==='Evening');
        const weMorn=schedule.weekend.find(s=>s.section==='Morning');
        const weEve=schedule.weekend.find(s=>s.section==='Evening');
        if(wdMorn&&!wdMorn.tasks.find(t=>t.id==='meds-am'))wdMorn.tasks.unshift({id:'meds-am',name:'Morning medications',time:'5:30 AM'});
        if(wdEve&&!wdEve.tasks.find(t=>t.id==='meds-pm')){const si=wdEve.tasks.findIndex(t=>t.id==='sleep');si>-1?wdEve.tasks.splice(si,0,{id:'meds-pm',name:'Evening medications',time:'9:10 PM'}):wdEve.tasks.push({id:'meds-pm',name:'Evening medications',time:'9:10 PM'});}
        if(weMorn&&!weMorn.tasks.find(t=>t.id==='meds-am'))weMorn.tasks.unshift({id:'meds-am',name:'Morning medications',time:'Morning'});
        if(weEve&&!weEve.tasks.find(t=>t.id==='meds-pm')){const si=weEve.tasks.findIndex(t=>t.id==='sleep');si>-1?weEve.tasks.splice(si,0,{id:'meds-pm',name:'Evening medications',time:'9:10 PM'}):weEve.tasks.push({id:'meds-pm',name:'Evening medications',time:'9:10 PM'});}
        // MIGRATION: ensure gym task exists in weekday morning (insert before shower)
        if(wdMorn&&!wdMorn.tasks.find(t=>t.id==='gym')){
          const showerIdx=wdMorn.tasks.findIndex(t=>t.id==='shower');
          const insertIdx=showerIdx>=0?showerIdx:Math.min(2,wdMorn.tasks.length);
          wdMorn.tasks.splice(insertIdx,0,{id:'gym',name:'Gym (40 min)',time:'5:35–6:15 AM'});
        }
      }
      if(d.dogTasks){
        dogTasks=d.dogTasks;
        if(!dogTasks.prevention)dogTasks.prevention=DEFAULT_DOG_TASKS.prevention;
        if(!dogTasks.mental)dogTasks.mental=DEFAULT_DOG_TASKS.mental;
        // Nuclear: always rebuild shared from defaults to kill stale snuggles permanently
        dogTasks.shared={
          morning:DEFAULT_DOG_TASKS.shared.morning.map(def=>({...def})),
          evening:DEFAULT_DOG_TASKS.shared.evening.map(def=>({...def}))
        };
        // Collapse prevention to 2 combined entries
        const hasCombined=(dogTasks.prevention||[]).find(p=>p.id==='prev-e-monthly'||p.id==='prev-k-monthly');
        if(!hasCombined||(dogTasks.prevention||[]).length>2)dogTasks.prevention=DEFAULT_DOG_TASKS.prevention;
      }
      if(d.rewardsState)rewardsState={...DEFAULT_REWARDS_STATE,...d.rewardsState};
      if(d.xpState)xpState={...xpState,...d.xpState};
      if(d.companionPhotos)companionPhotos={...companionPhotos,...d.companionPhotos};
      if(d.dogState)dogState=d.dogState;
      if(d.groomState)groomState=d.groomState;
      if(d.prevState)prevState=d.prevState;
      if(d.notifs)notifs=d.notifs;
      if(d.wheel&&d.wheel.clean){
        wheel=d.wheel;
        if(!wheel.priority)wheel.priority={standalone:[],projects:[]};
      }
      if(d.wheelDone)wheelDone=d.wheelDone;
      if(d.wheelSkips)wheelSkips=d.wheelSkips;
      if(d.wheelPinned)wheelPinned=d.wheelPinned;
      if(d.inbox)inbox=d.inbox;
      if(d.shopItems)shopItems=d.shopItems;
      if(d.qualityState)qualityState={...qualityState,...d.qualityState};
      if(d.customRewards)customRewards=d.customRewards;
      if(d.donutChat)donutChat=d.donutChat;
      if(d.donutWeeklySummary)donutWeeklySummary=d.donutWeeklySummary;
      if(d.donutTherapistSummary)donutTherapistSummary=d.donutTherapistSummary;
      if(d.donutApiKey){donutApiKey=d.donutApiKey;saveLocal('dr-anthropic-key',donutApiKey);}
      if(d.archived){archived=d.archived;if(!archived.tasks)archived.tasks=[];}
      ['state','schedule','dogTasks','dogState','groomState','prevState','notifs','wheel','wheelDone','wheelSkips','wheelPinned','inbox','shopItems','archived'].forEach(k=>saveLocal('dr-'+k.replace(/([A-Z])/g,'-$1').toLowerCase(),eval(k)));
      saveLocal('dr-rewards',rewardsState);
      // Force sync back so cleaned data overwrites stale Supabase data permanently
      setTimeout(syncToSupabase, 2000);
      return true;
    }
  }catch(e){console.warn('Load failed',e);}
  return false;
}

let syncTimer=null;
function save(k,v){saveLocal(k,v);clearTimeout(syncTimer);syncTimer=setTimeout(syncToSupabase,1500);}
function load(k,d){return loadLocal(k,d);}

/* ─── STATE ─────────────────────────────────────────────────────────────── */
let state=load('dr-state',{});
let schedule=load('dr-schedule',DEFAULT_SCHEDULE);
let dogTasks=load('dr-dog-tasks',DEFAULT_DOG_TASKS);
let dogState=load('dr-dog-state',{});
let groomState=load('dr-groom-state',{});
let prevState=load('dr-prev-state',{});
let notifs=load('dr-notifs',[]);
let wheel=load('dr-wheel',DEFAULT_WHEEL);
let wheelDone=load('dr-wheel-done',{});
let wheelSkips=load('dr-wheel-skips',{});
let wheelPinned=load('dr-wheel-pinned',{});
let inbox=load('dr-inbox',[]);
let shopItems=load('dr-shop',[]);
let archived=load('dr-archived',{tasks:[]});
if(!archived.tasks)archived.tasks=[];
const sessionDone=new Set(); // tracks cooldown=0 tasks done this session for visual feedback

// Ensure derived state
if(!wheel.priority)wheel.priority={standalone:[],projects:[]};
if(!dogTasks.prevention)dogTasks.prevention=DEFAULT_DOG_TASKS.prevention;
if(!dogTasks.shared)dogTasks.shared=DEFAULT_DOG_TASKS.shared;
if(!dogTasks.mental)dogTasks.mental=DEFAULT_DOG_TASKS.mental;

let shopCat='all', spinCat='clean', spinProject='all', selectedDay=new Date().getDay(), spinDuration=5;
let timerInterval=null, timerSeconds=0, timerRunning=false;
let qualityState=load('dr-quality',{});
let collapseState=load('dr-collapse',{});
let floorCondition=load('dr-floor-condition',null);
let gymSession=loadLocal('dr-gym-session',null);
let gymHistory=loadLocal('dr-gym-history',{prs:{},sessions:[]});
let gymRestInterval=null;
let gymRestSecondsLeft=0;
let gymActiveExercise=null;
let gymElapsedInterval=null;
const gymInputs={weight:{},reps:{},effort:{}};
let donutChat=load('dr-donut-chat',[]);
let donutWeeklySummary=load('dr-donut-summary',null);
let donutTherapistSummary=load('dr-donut-therapist',null);
let donutApiKey=loadLocal('dr-anthropic-key',null);
let donutView='donut',donutLoading=false;
let currentSpinTask=null, reSpinsLeft=3;

// Edit overlay state
let editCtx=null; // {type:'weekday'|'weekend', sectionIdx, taskIdx}

/* ─── HELPERS ───────────────────────────────────────────────────────────── */
function dayKey(idx){const t=new Date(),d=new Date(t);d.setDate(t.getDate()+(idx-t.getDay()));return`${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;}
function todayStr(){const d=new Date();return`${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;}
function isWeekend(idx){return idx===0||idx===6;}
function isSunday(idx){
  // Map idx to actual date day
  const t=new Date(),d=new Date(t);d.setDate(t.getDate()+(idx-t.getDay()));
  return d.getDay()===0;
}

function getBaseSchedule(idx){return isWeekend(idx)?schedule.weekend:schedule.weekday;}

// Returns a deep-cloned schedule for the given day index, injecting Sunday tasks as needed
function getScheduleFor(idx){
  const base=JSON.parse(JSON.stringify(getBaseSchedule(idx)));
  if(isSunday(idx)){
    // Inject pill box into Evening section
    const eve=base.find(s=>s.section==='Evening');
    if(eve&&!eve.tasks.find(t=>t.id===SUNDAY_PILL_TASK.id)){
      // Insert before "Lights out" if present, otherwise push
      const lightsIdx=eve.tasks.findIndex(t=>t.id==='sleep');
      if(lightsIdx>-1)eve.tasks.splice(lightsIdx,0,{...SUNDAY_PILL_TASK});
      else eve.tasks.push({...SUNDAY_PILL_TASK});
    }
  }
  return base;
}

function getDayData(idx){const k=dayKey(idx);if(!state[k])state[k]={};return state[k];}
function getDogDayData(){const k=todayStr();if(!dogState[k])dogState[k]={};return dogState[k];}

function dayPct(idx){
  const sc=getScheduleFor(idx);
  const ids=sc.reduce((a,s)=>a.concat(s.tasks.map(t=>t.id)),[]);
  if(!ids.length)return 0;
  const k=dayKey(idx);
  const data=state[k]||{};
  const qDay=qualityState[k]||{};
  const naIds=new Set(ids.filter(id=>qDay[id]==='gray'));
  const fc=k===todayStr()?getActiveFloorCondition():null;
  const recIds=fc?new Set(fc.tasks==='all'?ids:ids.filter(id=>(fc.tasks||[]).includes(id))):new Set();
  const excludedIds=new Set([...naIds,...recIds]);
  const denom=ids.length-excludedIds.size;
  if(!denom)return 100;
  const done=ids.filter(id=>!excludedIds.has(id)&&data[id]&&qDay[id]!=='red').length;
  return Math.round(done/denom*100);
}

function calcStreak(){
  let s=0;const t=new Date();
  for(let i=0;i<60;i++){
    const d=new Date(t);d.setDate(t.getDate()-i);
    const k=`${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
    const sc=getScheduleFor(d.getDay()); // uses actual day not selectedDay
    const ids=sc.reduce((a,sec)=>a.concat(sec.tasks.map(t=>t.id)),[]);
    const idSet=new Set(ids);
    const done=Object.entries(state[k]||{}).filter(([key,v])=>v&&idSet.has(key)).length;
    if(i===0&&done===0)continue;
    if(ids.length>0&&done>=Math.ceil(ids.length*0.8))s++;
    else if(i>0)break;
  }
  return s;
}

function calcBestStreak(){
  let b=0,c=0;const t=new Date();
  for(let i=59;i>=0;i--){
    const d=new Date(t);d.setDate(t.getDate()-i);
    const k=`${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
    const sc=getScheduleFor(d.getDay());
    const ids=sc.reduce((a,s)=>a.concat(s.tasks.map(t=>t.id)),[]);
    const idSet=new Set(ids);
    const done=Object.entries(state[k]||{}).filter(([key,v])=>v&&idSet.has(key)).length;
    if(ids.length>0&&done>=Math.ceil(ids.length*0.8)){c++;b=Math.max(b,c);}else c=0;
  }
  return b;
}

function fmtTime(ts){const d=new Date(ts);return d.toLocaleTimeString('en-US',{hour:'numeric',minute:'2-digit',hour12:true});}

function fireConfetti(){
  const colors=['#2dd4a0','#f5a623','#a78bfa','#f87171','#facc15','#60a5fa'];
  for(let i=0;i<60;i++){
    const el=document.createElement('div');el.className='confetti-piece';
    el.style.left=Math.random()*100+'vw';el.style.background=colors[~~(Math.random()*colors.length)];
    el.style.animationDuration=(1.5+Math.random()*2)+'s';el.style.animationDelay=(Math.random()*0.5)+'s';
    el.style.transform=`rotate(${Math.random()*360}deg)`;
    document.body.appendChild(el);setTimeout(()=>el.remove(),4000);
  }
}

function getAllWheelTasks(){
  const out=[];
  ['clean','admin','mental','bonus','priority'].forEach(cat=>{
    const c=wheel[cat];if(!c)return;
    (c.standalone||[]).forEach(t=>out.push({...t,_cat:cat}));
    (c.projects||[]).forEach(p=>(p.tasks||[]).forEach(t=>out.push({...t,_cat:cat})));
  });
  return out;
}

function findWheelTask(id){return getAllWheelTasks().find(t=>t.id===id);}

/* ─── TODAY RENDER ──────────────────────────────────────────────────────── */
function toggleTask(dayIdx,taskId){
  const k=dayKey(dayIdx);
  if(!state[k])state[k]={};
  state[k][taskId]=!state[k][taskId];
  if(state[k][taskId])state[k][taskId+'_ts']=Date.now();
  else delete state[k][taskId+'_ts'];
  save('dr-state',state);
  maybeAwardTaskPoints(taskId,dayIdx);
  renderToday();
}

function resetToday(){state[dayKey(new Date().getDay())]={};save('dr-state',state);renderToday();}

// Long-press detection
let lpTimer=null, lpFired=false;
function lpStart(fn){lpFired=false;lpTimer=setTimeout(()=>{lpFired=true;fn();},500);}
function lpEnd(){clearTimeout(lpTimer);}

// Inline editing
function openEditOverlay(type,sectionIdx,taskIdx){
  const sc=type==='weekday'?schedule.weekday:schedule.weekend;
  const task=sc[sectionIdx].tasks[taskIdx];
  editCtx={type,sectionIdx,taskIdx};
  document.getElementById('edit-title').textContent='Edit task';
  document.getElementById('edit-scope-label').textContent='Applies to: '+(type==='weekday'?'Weekdays':'Weekends');
  document.getElementById('edit-name-input').value=task.name;
  document.getElementById('edit-time-input').value=task.time||'';
  document.getElementById('edit-overlay').style.display='flex';
  setTimeout(()=>document.getElementById('edit-name-input').focus(),80);
}

function openAddOverlay(type,sectionIdx){
  const sc=type==='weekday'?schedule.weekday:schedule.weekend;
  const section=sc[sectionIdx];
  const newTask={id:'t_'+Date.now(),name:'New task',time:''};
  // Insert before the last task (usually "Lights out" or "Sleep") rather than appending
  // Exception: if section has 0 or 1 tasks, just push
  const insertIdx=section.tasks.length>1?section.tasks.length-1:section.tasks.length;
  section.tasks.splice(insertIdx,0,newTask);
  save('dr-schedule',schedule);
  openEditOverlay(type,sectionIdx,insertIdx);
  document.getElementById('edit-name-input').value='';
  document.getElementById('edit-title').textContent='Add task';
}

function saveTaskEdit(){
  if(!editCtx)return;
  const sc=editCtx.type==='weekday'?schedule.weekday:schedule.weekend;
  const task=sc[editCtx.sectionIdx].tasks[editCtx.taskIdx];
  task.name=document.getElementById('edit-name-input').value.trim()||task.name;
  task.time=document.getElementById('edit-time-input').value.trim();
  save('dr-schedule',schedule);
  closeEditOverlay();
  renderToday();
}

function deleteTaskEdit(){
  if(!editCtx)return;
  if(!confirm('Archive this task? Completion history is preserved and the task can be restored later.'))return;
  const sc=editCtx.type==='weekday'?schedule.weekday:schedule.weekend;
  const task=sc[editCtx.sectionIdx].tasks[editCtx.taskIdx];
  if(!archived.tasks)archived.tasks=[];
  archived.tasks.unshift({
    task:{...task},
    archivedAt:Date.now(),
    type:editCtx.type,
    sectionName:sc[editCtx.sectionIdx].section,
  });
  sc[editCtx.sectionIdx].tasks.splice(editCtx.taskIdx,1);
  save('dr-schedule',schedule);
  save('dr-archived',archived);
  closeEditOverlay();
  renderToday();
  showPtsToast('Task archived — history preserved');
}

function closeEditOverlay(){document.getElementById('edit-overlay').style.display='none';editCtx=null;}
function handleOverlayClick(e){if(e.target===document.getElementById('edit-overlay'))closeEditOverlay();}

// Bonus section data
function getBonusData(){
  const k=todayStr();
  const dayData=state[k]||{};
  const spinKeys=Object.keys(dayData).filter(sk=>sk.startsWith('spin_')&&dayData[sk]);
  const dogData=getDogDayData();
  const dogMentalDone=(dogTasks.mental||[]).filter(t=>dogData[t.id]);
  const spinDone=spinKeys.map(sk=>{const id=sk.slice(5);return findWheelTask(id);}).filter(Boolean);
  // deduplicate by id
  const seen=new Set();
  return {
    spinDone:spinDone.filter(t=>{if(seen.has(t.id))return false;seen.add(t.id);return true;}),
    dogMentalDone
  };
}

function deductPoints(pts,label,type){
  // Add to totalSpent (not reduce totalEarned) so today's earned total stays accurate
  const current=getPoints();
  const deduct=Math.min(pts,current);
  rewardsState.totalSpent=(rewardsState.totalSpent||0)+deduct;
  rewardsState.log.unshift({type,pts:-deduct,label,ts:Date.now()});
  if(rewardsState.log.length>50)rewardsState.log=rewardsState.log.slice(0,50);
  save('dr-rewards',rewardsState);
  if(deduct>0)showPtsToast('-'+deduct+' 🪙 — '+label);
  const badge=document.getElementById('today-pts-badge');
  if(badge)badge.innerHTML=pixelIcon(ICON_COINS_STACK,18)+''+getPoints()+' coins';
}

function undoBonusSpin(taskId){
  const k=todayStr();
  if(state[k])delete state[k]['spin_'+taskId];
  save('dr-state',state);
  delete wheelDone[taskId];save('dr-wheel-done',wheelDone);
  deductPoints(PTS.spinTask,'Undo spin task','undo-spin');
  renderToday();
  refreshWheel();
}

function undoBonusDog(taskId){
  const k=todayStr();
  if(dogState[k])delete dogState[k][taskId];
  save('dr-dog-state',dogState);
  deductPoints(PTS.bonusTask,'Undo dog mental task','undo-dog');
  renderToday();
}

function renderBonusToday(dayIdx){
  const wrap=document.getElementById('bonus-today');
  if(!wrap)return;
  if(dayIdx!==new Date().getDay()){wrap.innerHTML='';return;}
  const{spinDone,dogMentalDone}=getBonusData();
  const total=spinDone.length+dogMentalDone.length;
  if(total===0){wrap.innerHTML='';return;}
  const goal=isWeekend(dayIdx)?3:1;
  const goalMet=total>=goal;
  const items=[
    ...spinDone.map(t=>`<div class="bonus-task-row"><span class="bonus-task-name">🔥 ${t.name}</span><button class="bonus-undo-btn" onclick="undoBonusSpin('${t.id}')">undo</button></div>`),
    ...dogMentalDone.map(t=>`<div class="bonus-task-row"><span class="bonus-task-name">🐾 ${t.name}</span><button class="bonus-undo-btn" onclick="undoBonusDog('${t.id}')">undo</button></div>`)
  ].join('');
  wrap.innerHTML=`<div class="bonus-card">
    <div class="bonus-header">
      <span class="bonus-title">✨ Bonus tasks</span>
      <span class="bonus-goal">${goalMet?'✓ Goal met!':'Goal: '+goal+(isWeekend(dayIdx)?' (weekend)':'')}</span>
    </div>
    ${items}
  </div>`;
}


/* ─── QUALITY FUNCTIONS ──────────────────────────────────────────────────── */




/* ─── RING + DAGGER ASSETS ──────────────────────────────────────────────────── */
const RING_PORTAL = 'data:image/png;base64,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';
const DAGGER_WHEEL = 'data:image/png;base64,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';

/* ─── BAR ASSETS ─────────────────────────────────────────────────────────── */
const BAR_HP_DIM = 'data:image/jpeg;base64,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';
const BAR_HP_EMPTY = 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBAUEBAYFBQUGBgYHCQ4JCQgICRINDQoOFRIWFhUSFBQXGiEcFxgfGRQUHScdHyIjJSUlFhwpLCgkKyEkJST/2wBDAQYGBgkICREJCREkGBQYJCQkJCQkJCQkJCQkJCQkJCQkJCQkJCQkJCQkJCQkJCQkJCQkJCQkJCQkJCQkJCQkJCT/wAARCABCAZADASIAAhEBAxEB/8QAGwAAAQUBAQAAAAAAAAAAAAAABQABAgMEBgf/xABUEAABAwIEAQgGBAgJCAsAAAABAgMRAAQFEiExBgcIExQiQVGRMlJhcYGhFRaS0RcYIySisbLSJjNCRmKCo8HCJTQ2Q2Ryc7MnNURFY3SD0+Hw8f/EABgBAQEBAQEAAAAAAAAAAAAAAAABAgME/8QAHhEBAAICAwEBAQAAAAAAAAAAAAERAlEDISJBEjH/2gAMAwEAAhEDEQA/APFuTnkjxzjN1N4uydt8JQCo3Ln5MO/0WyUnMZ3MEDXvivcWeBLm1ZabtMC4XbSyMoSTMfEsk153whjGMtcD4WbbGbxgNpcCW0XC2yD0igAmDqIjTajX1uxbC0L61xVe2yoIh65UpfwSFFUjSNN68nJeUu+NRCPKRZO8G2WHoXhGBu3uJFbduzas9IsFIEqIUgdnURA3kV5rw/ycYvxmu6urVdtbW7KymfWXEqCUjbfbbWBtRXFOKXMaxW3uLq7xPEDaoUhl+7uCpKMytSM4+enup+EuNb/hnCeqWb9xbF+4U6vKhPsAElJ7htprFbxiccev6zMxM9ov8iGIWllcXb1+gtspKjkZmdvHbcVPAuRgY5hjeIN4g+20txxASq3GYhBylUT6wUIMbVdxHygcR3+HPsDFMQCMpCu2EhaZT6o9g8PjQ1PK1xDhFnb2dniT6WGk5AgsMkAazujXU1Y/cx/Un82OL5AwiT9NKCBrn6sCAPHehGEclmHY3iNxYWGPrubhgArbRZ5SjUg5lKhIAI8T3RJMVU9yyY+5btkYooOAHMnqbUfsx491YMA5TcWwF5520xFdu7ckF5aLRpRXExuk6anSrEZ12l4u6c5uiQSG8bVpIOa3HhS/F0gAqxZYnxaRr91A3OXXiVa844gucxEH81b+UJFL8N/EBjPxJfLPttW/uqVybW8RXEeQO0wy1buH8adhx4MApabKUEgmSZ2gH21C35v/AFlpDjeLOkOFOQC3QZB27/hQ1zlsxh1spcxhx0EQoO2LSgoeBER8d6w3fKziLlk6wxit00lwZS2y30aSCZOxq1ybPLbg3I/ZY9d4kxZY08oWDgaUpVqkBapUFQZ7in40XHN8Sdfpl6AJM2yBr7O1XOYLys4hg1u83b4k4gvOB1ZVaNqKlQd5HiVEe+tx5dMeMAY08iBlGS0b28qTHJ8I/IyObuFKITi75j/ZkafOkjm8IUcqsaeBOw6sgT86Er5csbcQEnHHtoJFm2CaZjluxhClKVjt6SY/7M3HyTUrk2eRYc3poqj6WuY/8u3Plm+dYcV5ELbDG7ZS8YdBuLhDCczLcKKzAiDJM+QE0PPLXxB03SJ4gu0ATCUWzes+Mg0JvuUzF7163eexy5dXbOB1nNbtyhXiNImKsRn9kvF19tyANXRPR49MKKYFugyRuBrrVi+b0ArKnGHZnUm2b0/Srn7bln4gbAUribFc8bdGghM9w020FWK5asdUvMriTFVGInoWwQe46CpXJsvHTdi3IjbYPapubjGnQhTzTEi2RoVqyg+ltqPn4VtTzfUH/vpUkkD8g3Ps0zVz2I8q17idshi6x3EHEoWlwJVbtxmBkHbf21pHLPjAKVjibFUrG2RhtP6hVrPZeI21zdwpJP02rwnq7cT9qkjm8IUqPpxZ8QLZGn6VBU8t2PpmOKMT7Xhbt/dUhy348P50YrHh0DenyqVybLx0PK5uLeSfp1wKiYNs2I9/aqo83VKUycbcIJO1qg6faoQOXDHp7XFWMlPeOgbj9VJ7l04gKgU8SYqsEQT0LaSP0daVybLxFU83ttYVlx1ZKTB/NW5n7VI83tqSkY6vNEj81R+9QYctuPypSuJsTJUQTNu33fCnPLjjpTkVxLipT3AW7Q/upXJsvHQt+L0ltMrx4+JPVEAR9qr/AMXBJSCMecST3GzQf8WvfQJHLdjZSAviXFITJSDbtGFeO1L8N+OkHNxRipnu6s1rp7qVybLxGUc3hpThR9YSCP8AZEa/pVJPN1SFdrHFZYkEW7evwzUEPLjxDGnE+Kk7f5szt9mojlw4hSZHEuJk+22a+6lcmy8dD6ebtbrWtKcecUUnUC2bkeH8qnPNzS2lRXjL2+kW7ceeauePLpxMVCOJ8XA/4LP7tP8Ahx4j3HFeNAif9S191K5Nl46dB+LvbGQMduFEGDFo3HnmpHm9WSVdF9YHC7EhHV258prm0ctOP5s6uJ8YzkQYaaAIPsCakeWzHy5P1jxc/wBLo2/upXJsvHTo0c3a1WrKMednw6s399VJ5ALFwNlGPOqLgKk5bdsggGN5rnvw1cQFWYcRYsjSIDTevyrGrlh4iCOib4hxZpsg6MhDQE76JA31mr+eTZeOnYt83m1ciMauYgHN1Zvv+NS/F0tu1/lq6OU91q2Z+dcRb8pV5Z2zdtb45xEyy2ISlq6WgCSSYAV4kn41P8Jb5Haxvicn23rsft0/Oey8XXq5vTASSMYuDEE/m6Bp4/Koq5v1qkwrF7mTsOgb1+dcevlMvhGTH+Iog73Tv79I8pV/lj6w4+sSDBuXf/cp+c9l46dQvkDbSf8ArK6g+irq6I28Z99B8T5IrPCsdsMLu8cNsm+SS28u3SoJVMZVAK09+1DF8o144gqVj+O9JukG4d7B8Qek3rM7x5eLDZVjmJPuNuh5CnypwocGmYFRMKjvqxjntLxdNeciVvZMvPLxlwpZbU6r83QOyBOna8KsteQxN7Zs3Vti5Uh5tDjai2gApUmQd9NK5x3lJxhSf9J8aXmEKCnV7faqdryn45ZoS2xxPjDKEBISErUQABAEExU/Oey8UeIOBsS4KuR1i2F3ZOJlD4TMEyNfj8Na73gyyxHieyTcYfhODNBtAQ6tyGshBjQZ0kg+I0BEVybnKbieIWiuu4liOKgoWgouWEqbEg692uu+9VYJxmeGbGxuMKuMVsb8JSl7o0AodSonpCnNIAKQju3TOlMsZmO1iYh683wxjl22UXNpgymgYyKt0rkfFwjfxryTlB5JMawS3uMeQ3auWk9I83bn+IBPcJMpk+yJ2iuvZ5Ssau0o6hxndvqiV9ItEp9gStA+J27qy8X8VcR3vC971ziQv9MyQW0hoBSe+ClHf3xFYwjLGVyqYAsKfvbLkuN5avhstIJnowTBdKSAZ00PhV3A/AbuMsm7uCVqWnpVIQoJCUTutZGkz4GsFq4fwRv6p7KskRBgujX27/Ku2wjjnDeEeGmLt9p24vLtr8laJ0LjiFQXFLPopiBpJJ0AgE0yv4sV9F3+BrBi1S3b4cpxUgkuXCnIjdQ1Ej3abVgxPhnD1MOKbtnGTEkrBJ8OzBgxGo3ovwVytYdxViIsMVtOoregNqDhUkKn0CruHgoxrp31Tx3x9hHDWNvYYULuHUALS2w0CplRHZzrUoCSNSACYI1kkDlWV03cU8vx7CyzY3D+cJQWVLSmDJEjuO2u9chiDY6oF6akR516FjdzhvEGCX17hqFNgMLUUvESghMqEakTrGp+deeXqs2GIjuIj26mvThPTjmwoSNiKmGQVDQEU7AlKdK0ROgAA9tdGFCmkgwAI91P0SYjSasKMxBT3b1exblSu0BFBlDIMGJ+FWi1TPaA1rX0ISoBQn3eFP0alwE9576KydSB8B76iq2QAYj3xW8tSqNvfS6HLpoRRA0W6TsmasRbZ+4A1rShPSAgT7BUnIUomCKFMZtE7ZB5Uy7NIOwBrb4FQ0FSDS1jMlKinxAmgwJtQDqmrRaNzER7q0rbB9Lf20zWqtdqChds3BIQBUFWyQkQnQ99ECEpToQT4eFR3SBE+2KDALUJGwNSNjkQFkaK0FaQ2SYSD7dKsDakn1ffQYVW6Ugd/sFMG4TASPjW50JTJUkR3kd/uqiUBPZEDeVUGQsATKdqn1YEejWjOpSpXChO4qwKTBKhvtG9Bj6ppIQSB3xUU2xVsJHsrcAnYKIk6CrW7RQAhOnsFLGA2hzBIR7dqgbcJVJSNPGjCylCZObNsSdKzFkuk5YE99RWMdGlMZCSdoFI26SB2RrW9WFrWE5FkrT3yMpFI2NykjLlCh4GiMAtQDogzU02CyCtLeYDwO1XOsXQVmKc3jVjQcSClTRBO2u1FZRaKVqUFJHjUTalA9FMn40ZYQyUkOAz3E0zlmpUAq7tCTSygcskCSAaRt+zJTBnQVvLSkqjolQmQTBNRS0lJOZCwDp7qDGLYkejr7qddsY/ix50QSy1l7CVDvEGfOszza21xOivZVA8pMkBvXwqYYIEqaIHuoiwgJSMyCQe8d/xq25IbQSUjLHojellA5QkiAkD21F9jokBcApIrWktBJOQk1luFFxGidKWjdhTSnMNcTlgFCyD7jNdOzhAvcJwxaIVmt2goj/V9gfH/wDa5vDFKGEqE9nIsTXb4GS3guGpGoDKTt6zaZn2VjKW8YcbiuFGzcUWnSlSdSRKSn41qtLm6uOF7k3DrjmYqQgmIgHXv/uotj77LbbgCQkjsjTRXlpQ5o/9HjkkqU24qB4ArIP66vwa7TXksdSUEhbqQVA6j8qIBovjGA3uM8L4FiNg0w8ba3cadbZWCcpckaE7hRIKd9RvXNWd44ngFTABKQtKp8B0upjvExvWrAuLL23dtkureuUNAJSJTKQNRrGsRoTqIHdpWJif7CxMDHBuB3eH4k3iN9brt0Wg6UtqSMygNyRvkBgk67ADetPGHAeL47jqsYwdtWIW2IK6RQC0pKTMEyTBQdwZ0kgxpRxTBxyzW8m+Lbt2vUKQWwEjdIGmWQASNQfGseL4pc8LcKqRb3oF4LgFwntkFS4GWTCRAHdrr41zjKZluYiuwV3h1zh3hvE+thCbq4bcaKGVBSWikxGaIVoROXT2zpXBXqUjDm+3MqAj460XxbHLzEGnV3NwtZCVKKcxyyd4Gw32FAL9ZSwhOSBuD4612wifrllOiZiP1AVo6NSTlKAQRvWZhRUhMkAaVp6wUqjVUxrW2TvsFKM7Ukgbb1e3MBWWfd3VWp1QIyxHfUkXShoUnyoq0BSSVAQSNu+rULVl0BBHiNao6wS6CRpTLcCVSM2vtoLjBkn9dQbCVrJzZfYBrVCVqC80Dyq7pgE5gO1RE2XQwlSFjVRqa0pBBIAHh41QH80EiTPhU3XgdAPfm76KtC0oEKkjfKdhUxeqSnogYQfCs6nwDoBHv1qhLkO5yASNhUGl5SSpIQtOY90VJBQVdqB7jWdV3rKUx4zSad3nv2g1RsSkKMI1ApEkKiNB8qyF0z2VRHt3pusz2VSfcKDSo9kzAj51AuKUe+D4VV0jZGkp8adDxBggADY0RMkqVl6Eg/0t60M2qcpUs6b7b1m6ymdydZjuplXBzJIUUgd070VeponchII2A3qBt209lZUQdcoFMu4zgAAKA7gKcvBKATBEzB7qgkGG4zFEJ8J2qTby8gAGVQ9k6VWLsERkTFLrKwnK2sIHeIkUF6Vicy1IXPq1FTy0aJhKVe6sinFEgrIgHSNDNSzkpBlMT37xShpN44FaJQoHu2p+nWpXaOX/AHRNZluCJTljwmqlKSNeiSSd9ZoN/WEwRAJ/pCpJdJTsDG5iRQ9DhJ1QNaXSJn0SY7jtSgRDqVr1IIHcmAKkp43BnMknwJrAHp07vdTh0IIOXypQINPpQAFAFQOwpnbtLa1pyAAjcb+7wrD046QLDZgaad9Mu4kgFoGO8zShqRcgAmEkAdwplP8ASoUkW63NdBlkE+FDnnncwShJy95SNql1p5RgJSnbVWw9sUoEGlMdWAcIbUNRBGnwP/0VRcvIWiJSpI3iDNZluAr7QSuNJ8fOpB1gpKVAJgaAUEFsEoTkIGbUQKzPJcabyqSQK09dU2mAluNhE1jubpxyQQkZjMiqCOFvhOFFspSR0S/eSa6mwfScOtEpVCuoIS3m0GYIA+ZiuVssPDmFF/rhaWlskICJzDWRM/3VptLt5bDCOmyobb6MkqAUkR6Kff41mYtYlfcWt9et9ZuGgwlTecCFErG0+zYk/wDzV4JPJqpKwCA84tPd/LAn299Z7riQt4YphlpAVl6PMddPEffVPTuN8HrYOgWoqAiezn++gM8JYU3iPDjbb161btrKwrpcpSYVIBGYHuBgjWBvRFvk/S4Eu4DjOHu3jUBSOkhDpnTQatnc6kg9x7q4HC75OToChGkkKJE+7Ue2izCmgScoka6gGszE21FTDpbzFuIOFHWrDGrLIbloqC2XMwWRpnJOkyD51ivHV8R2ayHm7dKXUpL9y4EwqZGh1Wdz2QYFYLjEnbtg2zuRaMsILh7TZ19Ek6e7asGB4o5h7LhaQW3kmCpBAXO3pbgfKkR9Jn46RPAeBowl66v+LkpWpsqS01bHOVxIzZj2RqBBKTQyy4BtsTVbpTxAhKLgkNqNmsAxMnUiAI3MCsmJY7dXjFyl91xxy5AUtblyVE6g9qT2tqqtMQXbtLQi7S3nIUQDp7oitREs9OxsuQhu6YaW5xUw04tMqbTaleQ+EhcH3itR5vgSSE8WJygST1Igf8yuaa4rvUNJbGIPwNAUrAj2xHwrQniy5S30bl90yPSKHDIJ8TrU9L0Oo5vjaiZ4sIjeMPOnm5TI5vzbhV/C2Ep/lGwMf8yhFtxrdlCUqu1AI9BLbkRP9aB5Va3xziACk9YLomZ6YAn361PR0Inm+twVDi5BSBM9ROo+3TK5AWkNqcHF7ZSncpsVRPh6dDXOOMRzHK6oZgAT02pHlFUO8Y3a0FPWbhBO4FwAD5AU9HkUVyCFP86mo3BNmsD9qkOQQQCeJ5EwSmxUY9vp60FHETgdL3TO51aEofAUfiRWtvjC6RlnELlJBMDpEHL8Y39tLyOhU839lIJPF3fA/wAnq183Kra5BWHZ/hclIEamwUZn3LIrIjjV9Mzf3ZURBIeTEe7LVC+J3ioKRevAjvD4H6k0vIqBBXITZpVA4xSd9sNcBgf1qmOQRhfocXBYO0YerU+7PQxfFN04tKl3zxyjsy+DB+zVf1ouUKCk3bh19cfdS8joaa5vrbk5eLmhG82Kx/jq38XZpKSpzjFkDwFion5rFBmeLrsAFV87I/8AEH6qub46v0oQhD6Ux3pXE0vJfIt+LqyACeMRrsPo8z/zKgebzbNqUl3jRpvLMk2Jgf2lZfwjYv0eVVylYmQSuCD79azu8bXLqiouqQSc0m4Uo5vW3FPadCZ5uzBylPGTSgYM9ROn9pUlc3VpMJVxiJM6fR57v/UoMri66cUpS79aSpWYQvQTvAnSm+tt5M/SBM7hSxB8hS8joa/F0ZEfwyRrtFgTP9pTjm4hQJHFyTA1mwVP7dAjxdiAmMQSZ3kj92krjDE1wo4otUd3S6fqp62dDY5uZc9Di5o9+tksf46qXzeSiZ4uthCsvbtVp1+KqFL4svlH/Pyf6w1+VVjii8TJGIJMyCSsaD7NLy2dDiubqtqQvi+1TG/5qqB7+1MfCmHN4BAzcY2wPeOqK0/ToQjiq7Q3CL1AkQcrgH+GpJ4wvIOe+cWYj+OSQPNNLyKgUb5vRd/njaZR3i2WR+1UhzdFkkji23gak9UVoPt0IVxbep1GJLT3CFo2+zVR4rxBSiRiTpnf8skT5JpeR0PHm5ORJ4vtvd1Rf71Jvm5uqn+FrQA7xZLI/aoCrie6mTfvA+y4H7tV/WS5eJBvFqEQQp0a+Saejp0P4u5IV/DG3ISSCRaLiRv/AC6Yc3dSlQni5g+H5mvX9OudRxBcoOl3AG35RPw/k0/1kuwlQ+kHde8PD7qvrZ0Pq5u7id+LrYe+0XP7VMeb5lOX64W8xMdUX+9XOK4ku0qj6SeB3/jgf7qf6z3gOcYk4T/xU6e30aejp0v4vaREcZsyTA/Ml/v0/wCLwpXo8YNKI0I6mrQ/brm18TXLghWIOK1mOkGvyp/rTdgpT9IOQIhJdkD5U9bOhxzkByK/0xtco3KrRwR86qPIOgGDxlZH/dtlnz12oQria+BGS+I7zCxB8waZXFd4tOQ3q8sRq6Pup62dCyuQkJIA4vtCfDqrn31A8h2WQvipgHTa0cI85oOriW6A7N24D3EOD7qoXj10uM10tR9YuiY8qek6EPwRoSnpXOJmksZc3Si0dIiY2399X/gWQ4hK2uK7JxJRnP5usR8SYPvoCrEXXCnpHVKgyJUn+4VI4qA2UqWrXQgOCNPZFXvZ0J3/AAqzw9hzjTuIuOr6MgFLQQmCDoZVM6ipYPyfYde4bb3l9xGzblxAUtrKAludYzlWp9kVzWJYo44wR0hWTokFUx7qubbeZYbbUslaUBJKFSB896TdLH9dixw1wBZJSxcXNxfuGZdQ4onyBSkAb7mh3FOG4Wq3dbwGG7RpnVEgkKiVTCjHmd9/AH0qlCFIUobZnVBfkJmheIYiWEG2ZygiQ4UjQ691IgkHb3J8BNEDcPFtMuuH+saVKrKQ0uuLFmFBSgqBrOtDQApkqIlUHU70qVIJUjQGPGrEgRsKVKtIklCZ9EeVOpCY9FPlSpVIQghPqjypZE+qPKlSoGKEz6I8qcIT6qfKlSoEUJn0R5UsiZ9EeVKlQLIn1U+VNkTPojypUqokEJ9VPlUciZ9EeVKlQPkT6qfKnyI9VPlSpVBHImPRHlThCdOynypUqBkoT6o8qcIT6qfKlSqhZE+qPKnKE+qPKlSoGCE+qPKlkT6o8qVKoFkTl9EeVNkTHojypUqKcoTPop8qYITm9EeVKlRCyJ9Ub+FPkT6qfKlSoGyJ9UeVNlTPojypUqocoT6o8qWRMeiPKlSoHyJ9VPlSKEz6I8qVKgWRPqp8qWRPqp8qVKgQQn1U+VIoT6qfKlSoGKE+qPKqlASdBSpUF1mYcBHcJHsrQ+64Hk9tWonelSrMrCRecS3IcWDO4NDVkkyTMk0qVI/qz/H/2Q==';
const BAR_HP_RED_FULL = 'data:image/jpeg;base64,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';
const BAR_HP_RED_GLOW = 'data:image/jpeg;base64,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';
const BAR_WIDE_DARK = 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBAUEBAYFBQUGBgYHCQ4JCQgICRINDQoOFRIWFhUSFBQXGiEcFxgfGRQUHScdHyIjJSUlFhwpLCgkKyEkJST/2wBDAQYGBgkICREJCREkGBQYJCQkJCQkJCQkJCQkJCQkJCQkJCQkJCQkJCQkJCQkJCQkJCQkJCQkJCQkJCQkJCQkJCT/wAARCAA4AZADASIAAhEBAxEB/8QAGwAAAQUBAQAAAAAAAAAAAAAABQACAwQGAQf/xABMEAACAQIEBAMEBgMLCgcAAAABAgMEEQAFEiEGBzFBEyJRFGFxgQgVFzKRoSMzQhgkJTRSU4KiscHRQ2J0o7LC0tPh8BZUY3OS4/H/xAAYAQEBAQEBAAAAAAAAAAAAAAAAAQIDBP/EACARAAMAAgICAwEAAAAAAAAAAAABEQISIVEDIiMxQRP/2gAMAwEAAhEDEQA/APD+V/BdbnuZfWJyiStoaYnVrjJidrfdvfqNjYX9+2PXjkNTT1jNHwmjVDbmdfDDE/5zEgk4F0PHedZPl0OWUTUFNBGo8NUpozpQAWAvswsTvYHfrihWc68yisKXM/FZRskVHTgE+8mM9PXHDK5M6qJA7jyqGRqsFXw3RRVNQLxRyhXZhe17Bj3HfbGXyHl7nXGqNPTlIoImMTSuvlMnUooHSwI67YnzTiPOOKa8ZlmtPDW1KxCAOKcAAA3BsigAi5F8Fsm474iyTLUyylrZKaljVlEPs0dhrLH72i/7Rsb3/DGo0uPszU3yZviHlnW8OCIVVQPElkSNF0qNRYm37V+3pgtByUrJaZJ2zmjDMAfBWzPv6eaxwzPOKqiXOqXN5Hkeem+6kt5Ig2mxYBr7n8B2wcPOvxFQHKqJEUaSVkZCR8NFre62I3nxAlj+mUzjlqckomq5swMoDrGI4kQuzN0FtfuwfTkNO0QZ8+p0YAFkMa3B7i+ve2/4HAyt45o63OMtrnp4PDo61asw+1NaRQF8pOi4JKk6t+p2xshz8pXUMmTU8bixu2ZOe3T9ViZPyTgq1/QFFyFeYhV4gi1HsYVH+/hs/IyOlZVqeKKOAkFv0ixjYd95N/ljTJz9p2CiXLaS46la4gE3vf8AUnuL4bV89KGpQq2WUW7agfbb6dgP5nptjN8pr0AT/R/aMHXxHGjC/lamAN/S2u977YqVHIueCJXXOonLfdURLdu9/v8ASw64OLzrKqbCE+Ytf21dW/a5gOAmb818yzGqjmhzX2WCJgwhMqyBmsRc2jW9gTsdt+5xV/QnoSUnIKtqqeOY5zHEXF9LQXt7rhsT/ueqroM8Qt76YAfjrwVy7npDTUEME9LTS1CCzSrVFFfruU8I26+p6Ytw8/qWOXz0cUiXNlNaLD5+BiN+UswM6v0fqhn0DP4Ge2oqsCkgettfTEq/R1q22+v6fV6eCn/MwdqOf9MCGp8vp1kA2b264G4NrGHpt+eJYuftCjqfqulC23Brxc/C0AA/PC+UTAzK/R+mZvD/APEEIkLlAogBuRfuHt2O3uw9vo8VWnbPotuv73G39fByTnnQmZJfq2g8RDqWT20llPyiHYkX6jrv0xKnPfL4wgWhjZAb2fNWLH3E+DhfKPQzp+jxUKgZuIYBfsYBc/18Nn+j9LTxa5OIE72VaUEk+ltfvGNKeftGbhsvgYbWIzIXX/Uf3Yf9vWXGKSNsuglBGxfNmB/EQA4Xyj0MPLyW8OZYBxBAZSnieGYlDBfUjXsPjizRchqiuRmjzpBp6jwFJHU/znoL4JUPN6lizGeTMKOgr6NrmCFqoh4CSv7fhknp6emLsfOfJY5pJkyOnWR31mQZsQxPe5EPpt8MavkJMAGeQM4O2epp99OLn4efDH5DyRldWfRLq6XhU3/r40knPDLT+ryyCM9yMzJub/8AsjHajnjl0qqvsQUAggRZmO3bzU52xL5CzAx8fJZpataNc+h9oc2WIwAk7gWuHsDcj3YMSfRyq6ckVWfQQlfv6oVsvvvrtbHc35r0WZO/g+HSh1F2NSXKMLW02jUgXANvUX92LDc8ZpqVYZ5I5zo8N2aZUL7W1DTFsTcnqRfti/IT1KbfR2qlcD6/iYEXBWBTf4fpMPb6OVWpH8PRn1/e4/5mCsPPqBUCmjjsBbev/wDpxOnP2kUg/V1M2n+VmLi/xtFvifKJgA/3ONZa/wBexDt+oH/Hjh+jlWKLnP4ALX/UC/8At4Pj6QFIwu2X0qt1uMwYj4W8HEQ59QITako2itbS1a5f8fCt+WF8pZgAU+jzUyllj4ghZkNmAp+n9fEifR1qGbS3EMCnr+pHT1+/fBOLnVli161v1ZSJJoKMy1x1MD0v+htt62vgk/0gcsL6hlNKxJ3vXkfn4GF8gmBnT9HCr3/hxTbqRTiw/wBZjj/RzqEkCLn8T3/9BV/3/djRp9IegVrtktAvby1x/wCThtTz6y2cPJ7FCjOOi5i1h8B4H+OF8omBnJPo71CMB9eKT0NoFI/HXii/IxlV3GeDQlyzGBfLuRYnXa+x/DGmHPmljKkUkTEG5vXsQ21v5oYqS85KGpE2qmp18VSrn2sksCLFSPCsRufTfvgv6fpPQBZXyLqM1pjPFnEagsQn6IG69ifN5b4Kp9G6qdbjO7k7ACmHX0+/h+Sc36DJKKOlhhidUQIC1ay9NhsIrdP+/UjT8+KOAPG1DTyq7avNXNsflCB6YfJ+CYAlvo31gUsc8VLdmpx/x4hX6PFW9x9eRgg2sYQL/wBfBmTntGzu0MVFGD0Vqlmt+MV8MHPWfUzePQkk/tSswHu/Vg/nh8g9AR+51zBWIfOYVHYmJf8Ajx39zpX2BOcxgE2B8EW/28aFefNEsY1UdI0n7RFfIAfgPC2xFUc96V4WVKanjbqrLXOdJ+BhIwvkEwAQ+jzVhDIc6XQOreziw+ZfFebkRLCit9ewtr1FQIV3C9bEvg99ukKR2jZ1NreWrXf8ac4kHPmFtLMCSLdatR/ZTjti/IPQykPJVqq5p+IqGa41BY2jZre8B7j03wn5I1KxvKnEGWOiHSSHQ2b0NnODZ5tQiR2pqyKnUnyhpQ7JuSbHwB6979MVss5tnIopKWGWkq6V5GkRJHa8TMbsdWi51G5sb2PTF9yeplsw4U4h4ODVUPs1dTyAxtJCFlAt6jfBvgWvXOA2Xtw3ldXViPWA9JFeZOt9TDtv77fDB2fnFDXUkiHI6FQ27MkuokWtuCoJPXe4xm+DuJIuEkq5kakeqSSJIPalVxYp5rHtYE3A639cOWuUOKbQcG1ctpU4Ky4ftdKZCBfob9e2PLOOeC80yGtlq5cselo5X8ulhIsRJPkLLsO9v+mPWftTzOvRTR1WWPGwsbUaPY+m1t/jiCv4xra/Ka2mravLZ4njAljWmVWte+kAHc33O1thiYvJPkrSZi+NCWoMugiXQ0xKM1yNS+W3c9743nCHLfKUgRZYFna+hpZ30rGwO+kA36i1zcm+wAxgs5pzVZtw9SSaUWaZAOnQugufkcT8RcwM5GcVcdDW1FHSU1Q8cCQNo2VyNTdyxI+HbFabURE0uWe1LkTI6RwGalhYsHGpv0fYC97NfbcgbYCVXCpjrHhdhWXYat0L31bBf80b7dbW3OM/lvHeY5py4zLMSxWvonVA8a6RJ5lJYr0+6STYWv2x59Lx7xD47VLZnLJK+ksJLEbG9rWAsCOmOSwbNvJEfFVEcvzGspSbrEw0kdLFQRjLhA1HqABNrk/PGlz7MJc4DZjOgElaBM4AOkMQQSvuuOnbGeiFstlb0Tp88ejH6OTIDTIRcDDUpVYnYYkR7EL64sgBGsdjjRkqJRqT0w4UQJsE+eLqooAbpfbDwhvbpb1wBUXLQf2RbDJ8uMZBCbYJoCh3Xa2FIJpl6Fr73t0wKC/YgRuoxz2IA2sLYuMCu+9htjq2dhscCFMUQ1WsDiU5etgQBvghFTBrsXUC3QnriN2QyFFJOnsuAKi5aCTdR09OuOvl8aA3VSQOgGCcVDVsNaRmxHfBCLI55d2t022FybYlKZtaFG6Jv8MOXL0/ajA+WCtXl1RSOpe17iw9fwwqminEYf8ASKU7AdRhQCvq9dOoxrb4YXsK9o1I9wwRKzCKwTUg726Y5Rsqk+MjMB/J2AHvxQDTQgEXjA+Ith6ZdqPljQ/HBKpLt5lj/R7bDvh9OJXHliVAP5w2+e+JQCjlpvvEgHuw8ZdHYCyX+GDfgRKNUjOQf5O18VZYVElo0JS19u3xwohQFBBfSQlvcBjv1ZACAFQ/hi9JTqjBdDHa5BFiMRxaZpQsI8xNvhgCIZTBIyoiLrbsCCcSnh6NW0sqhveRti80M8RG0coA2IW354gWqmSTTIjh/Rh1HrgCk2TxRtpZY/iMRSZWsbkBY7jtbBd1eNiWQuvXUBiKOJZL+CzONt27YUA18tjS3kQ3HbfEb0KItyi/hghJHKt7eb02scMAtJG8q2UHoeht64tAxMkVo1kKR2YXAGGNlcSHeJDf0GNCsrVI1gqPL2NsV5FlpGV9Kheh2vceuMpiAb2CInaNB/Rx2LLo7+ZIr+8DfBVnaZSyp5b7sBiIGBXMoYardCPzOLQVDl9Mpuyxj4KMdny6lSJXUR7kbacWXq0mt4cEkna4WwxExMxsqaAD3O5wBV+rIe4jAPdhbHPqqIONoynqLEYuES3CvGUQHuT/AH7Y60t1CKFKkYoB8mWxC/lW3rbDPq1LA+X5jFuVNRAt8xiOOGQkjxGsPU7YEK0lBHGeqn4DFeeCNISVtr9MFZYDF+3c/DA+tOkA36nFBYyg+JSVIfTe1gTboLn+/B3JMohzKgr/ABgt1nUbjUQPDBv+WA2UpAIZhNIFLLsNr336YPZBW00FDXeLUrCDUgC9i36oDYHY74xkVAmpyuTLnFVl9QqkpugfSxFt72239D+eL+W56+YUTR1BYlFZdgAq3Fh07nfr6YtVz01iKeJvFZdUrMxYC4HqfwA922KfCSBsoz2JX0C8bFTvr3awtcdNzex+V8T8KT57XCKXIqxFkWamuzPouP2CD0APQjqTt7saOmynhHjWpNekuY0tbOddRTQsmlnJ85UlNib3tsPhgAK7Kcwy+GGpV2L2Go6PKpXewLgg7DrtinV8N1uXaa7LZRW0N76kceLFbsyKSdhvdb7YjRabnOswk4dShocryzwKJFZPZJkZxPqHnYt1AYWF+vXA2Xl/FWUSZirtlNL5/Hjnk8VogCLgWXyrY7XLMdh1OKuXcURTUxkjiYSsFDCFbptquNj3vftgNxdVZrmVTTTsqmGRvDhhMgBVth92+xNuvvxnFP6K2ipn9ZRLJ7PQQlIIkEKsbhnAv5iN7Ek9B6DGeB/e04B3K/3jBd+Gc7VDLUQQQIvXxKmNbdQNtV+x/DFdOG8zedoI5KFlKMxl9oTw9IFydV7eg+JtjqlDDBaHbE0ZIIuRjR0XK/imthSWCPLyGGoKa2IN8xe+LtPyf4zqAWjhy0AWF2rIgN/nhsuxGZeGUiS5OJ/FVrg7740zcmOOo9npcvUXtf2yK39uOScnON4U8SSPLUX1NbF/jhsuxGZ4SKO+2GmYW2O3xwapuWHGNUt44qFhud6qP1t6+7E32TccKwXwKH1H77isfzwq7EYDR1QWaPUD1+GOtHSo2rTVstxawFj7ul8aKLlDx61/JQJYX81bEP78JOVHHhayigJvb+Nx/wBuJV2WMBU5jnqFHgssK31Ftjb0vb029+Ji0LTr4MIjCbgL3wc+yHj8tYrl17X/AI7Ef78J+TvH4AJTLiD6VsX+OFXYjBkdbPH5EKKN7XU3xNHPWSRqCxJPW19/di+eUfMCwNsssFv/ABuLYe/HE5R8wCxOjLrj1qYjf/HEq7HIJKVaXEm51X6dB2xIKmd4GubagRc9cE35R8fql3XLFUn/AM1EL44/KTmBArm2XHQLsFqoif8Ari1djkFRjw1ACtY9dVuvu9MNnmshuVud+lyfhtgueUvMCWw0ZaR1/jcO354h+y3j1G0COhIJ03WojI/EYVdjkBH2iYjVqCgdN7nHJIplPlLkn1G4wXPLfjdCwkjoo2RiCrzxhhYXvbra2+GycveNY5NLij07fpPGQpubdcWokYPg8YPdn0gD7oW1sJ/EkcuqFif2j0GCdHy342rVeSn+r3VCt29ojsQe49R7x3w88tOPGkRFhpWLk/dmjsLC++FRYyrRFotTTLZumod/d8MXJHFRF4QFiDsoAsfwwjyy4+Vb+HR2PW80Yttf+zEVPy54zqbmJ8tP6TwxeojF29wOJV2ORqytC+llcAbE2OGPp0W0XQbiw3xablPx2RYx0LD/AEiMjDfsq47UBTBRKt7AmeKx+eFXY5KIqXjBUK9j2ZScdSoeIgliSPRdsEI+T/Hjpr8HLV9z1cIP4Xx37JeO1J1LlaW7mqhGFXZIwatQZNpV3vquAcSLV0iQsjqEUG9gpHb19emCB5Tcfg2Iy0d96yHp+OG/ZXx4ulx9WsTuLVcJwq7LGCY30EtBKCosBddW3ph9dW2pvKCbixsf7cEF5W8dMT5aBG9PaogcPl5Ucey3icUNn6gVUQB/DCrsRlWjoDNTK8Y1eXcLJYXt39+JocnMyyCWMqi72PUn0viSHljzBoSTB7NHfulVGb2GJDwHzIdgLwNY7kTReU+/0xKuxDoy+BW1AhNKhdAHU+uGtH4VjpGoG426HFWp4S5gUsiRyNHdyd1kiKi3qbWHe1/Q4mTgPj+c2E9CWOxBq4dvj6YcdgZJAJ0IlQEfMWxSWijiqg9206rBeuCZ5bcwC5XxKLWOo9qjBxCeXfHgcKxpA5bo1TED8d+2LV2CCopww8RXVbC9jvijKxlW+1+txg2OWPMAKfNRKv8ApUQvfDfst48UWJy7ra3tcWCa7DTM6qFWIYXAHXFPMikoRVXSVO+NX9kXHUrAhaDcX/j0IH9uBPEPAXEnC8EFXm4pBDJJ4V4qlJSptfzBSSvQ9fTFqJGVMudHpZIugbY+/rg9k1fDSU9WJX8gqdekbgWhAB+G+KWRcK19Tl81WkqeDGGcyxtquAO3r6fE4ZRcO1uZ1Dyzr7Flb1TK9VI6pfSACFDHzEbdAeuIwh9bnKqkqqQrHe+1gPW4xHkoagy2qqHBvVgyLdNio1Dr13v88Gqen4dysFIKV56kWHjVckI81+oEhuPcdA6YEZnJV1csjwxwCFx5gKxZJDseg2AHuAw+ymfoa9CgjkZg19iPujBSnzWuoZGemq3UMultJBBHp/8AmFhYsJSGbNqxHLiqUlzdlaMHf42/7thkOeSGWml16TGbaSqMq+hAIt+OFhYsFOVOc1FUgjlnlKXJ0CS63v103te22C+WZzT0cZURU5dwA2rSx2t0JbbudsLCwaIHYuPZKVC0RiVyCCy08Vx6D7/T345HzMq6aQR+PILbfqo2+IvqPrhYWJqi1hIc3sxYHzLrO9zTqPnfxMOXm1XiSKU1YsjAsqQL5/d97CwsTRF2ZQoOYlRlsCQo4kI6yyIrSO3qxL9fhi9Jzbr3UqVjAb+REB0/p4WFhohszjc2swZbLHBYH9uIfDtJjsXNevjhCxx0+ob30Lv/AF74WFhohsyVObGaLqJSAs299Auvpb9J2xxebtcwYuzHoGLxrtvv/lPTCwsNENmOj5v5hEsivAhRtlAUvb06y+u/5dMKLm5XIQZY0eJVIEZjFm+P6QdDhYWJohsyYc4quYDTFSxr3Ahbf1/ynXfE9RzellpzHRpFTyyKQXFN0ItZt3J3wsLDRDZgqg5jZxRlzLm8dUS2weNNvn1/Lri79rFeW8zQuw67DzfE36YWFi6obMY/NMtrBpoAXG7KU0lt7XBO/buPdgcOY9WZamdhB4k/3iiI9hv0DPe9z1vhYWGqGzJ4OZ9fQwxwpUQP4ShBeNWJA6XOrHZObGaFw6zUaL0KiNbEf/IkYWFhohsxtRzZzNnDRz00I7oKdCD8yb/hhkXNHMkiA9rAdiS7Dwzqa/XdtuwHwwsLDVDZl5ebNcsSpNVuWAtrVEY26Hbpf59sQxc3MyjnJkqkk1AFUZVOgj3gC3fv8sLCw0Q2ZabnFVlQPDpNx1uBb4ebFCDmlmUdRUs1THIk0hkWOSbaMWtpFj074WFhqhszs/NvNSredbEEffDAH1AMnXEEnNHNZYCgqAgKkFgE1Ha19yRf/DCwsNUKyKDmTmVPGsaV80Y21LHLGNVv6PfEi8zcySTWsxQnY6mV7/hhYWDxQrE/NjNLEx1CqSd9bKf+o/H5YrvzSzVpUl9vJkj6KWUqSfXbCwsVYobMo13MrOK7wad69jGhJZlaxYHt26dfffBmDmpW08aqkbybAbEHtb+cwsLDVErONzXqi2sq/idCbbf7eKdXzFzGqMbGrliSMHyoqfpN7+YljfsLdMLCw1RdmNl5gZy66os2ltsSixRqCe52Jt32xVn48zqVAPrmpB1XJBW4+ffCwsNUSsjHGGZeX+F6xCO2tBb8MNXiorTNRSzCSKRDGyzCMpa3XcXB7gjcEXwsLFgBUXEjw00lKNLeY6WDDSd+tiDfDBn4DieZ5JpHTSx1sCotbSPy3vhYWEFK75jCy7Rxop3t4ir+IHfFOqzMrpWNgAN7L0HztvhYWEB//9k=';
const BAR_WIDE_EMPTY = 'data:image/jpeg;base64,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';
const BAR_XP_BLUE = 'data:image/jpeg;base64,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';
const BAR_XP_BLUE_BRIGHT = 'data:image/jpeg;base64,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';
const BAR_XP_BLUE_DIM = 'data:image/jpeg;base64,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';
const BAR_XP_EMPTY = 'data:image/jpeg;base64,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';

function renderBar(pct, type='hp', opts={}){
  const fill = Math.max(0, Math.min(100, pct));
  const dim  = fill <= 20;
  const mw   = opts.maxWidth || '100%';
  let housingImg = BAR_GOLD_HOUSING;
  let fillImg;
  switch(type){
    case 'xp':
    case 'wide':
      fillImg = ICON_BAR_FILL_TEAL; break;
    case 'edna-xp':
      fillImg = ICON_BAR_FILL_PURPLE; break;
    case 'kronk-xp':
      fillImg = ICON_BAR_FILL_GOLD; break;
    default:
      fillImg = ICON_BAR_FILL_RED;
  }
  return `<div class="hero-bar-wrap" style="max-width:${mw};">
    <img class="hero-bar-housing" src="${housingImg}" alt="">
    <img class="hero-bar-fill${dim?' dim':''}" src="${fillImg}"
         style="--fill:${fill}%;" alt="">
  </div>`;
}

function getActiveFloorCondition(){
  if(!floorCondition||floorCondition.date!==todayStr())return null;
  return floorCondition;
}
function isTaskRecovering(taskId){
  const fc=getActiveFloorCondition();
  if(!fc)return false;
  return fc.tasks==='all'||(fc.tasks||[]).includes(taskId);
}

function getConsecutiveGrayDays(taskId){
  if(!(taskId in GRAY_GRACE))return 0;
  if(taskId==='sunday-pillbox'){
    const today=new Date();
    const dss=today.getDay()===0?7:today.getDay();
    const ls=new Date(today);ls.setDate(today.getDate()-dss);
    const lsk=`${ls.getFullYear()}-${ls.getMonth()}-${ls.getDate()}`;
    return qualityState[lsk]?.['sunday-pillbox']==='gray'?1:0;
  }
  let count=0,today=new Date();
  for(let i=1;i<=10;i++){
    const d=new Date(today);d.setDate(today.getDate()-i);
    const k=`${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
    if(qualityState[k]?.[taskId]==='gray')count++;else break;
  }
  return count;
}
function isGrayLocked(taskId){
  const grace=GRAY_GRACE[taskId];
  if(!grace)return false;
  if(isTaskRecovering(taskId))return false;
  return getConsecutiveGrayDays(taskId)>=grace;
}
function getGrayWarning(taskId){
  const g=GRAY_GRACE[taskId];if(!g)return null;
  const c=getConsecutiveGrayDays(taskId);
  if(c>=g)return 'locked';
  if(c===g-1&&g>1)return 'warn';
  return null;
}

function cycleQuality(dayIdx, taskId){
  const k=dayKey(dayIdx);
  if(!qualityState[k])qualityState[k]={};
  const cur=qualityState[k][taskId];
  const canPurple=PURPLE_ELIGIBLE.has(taskId);

  // Cycle: unset → (purple if eligible →) green → yellow → gray → red → unset
  let next;
  if(!cur){
    next = canPurple ? 'purple' : 'green';
  } else if(cur==='purple') {
    next = 'green';
  } else if(cur==='green') {
    next = 'yellow';
} else if(cur==='yellow') {
    next = isGrayLocked(taskId) ? 'red' : 'gray';
  } else if(cur==='gray') {
    next = 'red';
  } else {
    next = null; // red → unset
  }

  if(!next){
    delete qualityState[k][taskId];
  } else {
    qualityState[k][taskId] = next;
  }

  // Sync check state based on new quality
  if(!state[k]) state[k]={};
  if(next==='purple'||next==='green'||next==='yellow'||next==='gray'){
    // Checked states
    if(!state[k][taskId]){
      state[k][taskId]=true;
      state[k][taskId+'_ts']=Date.now();
      save('dr-state',state);
      maybeAwardTaskPoints(taskId,dayIdx,next);
    }
  } else if(next==='red'){
    // Intentional skip — unchecked
    if(state[k][taskId]){
      state[k][taskId]=false;
      delete state[k][taskId+'_ts'];
      save('dr-state',state);
    }
  } else if(!next){
    // Unset — leave check as is
  }

  save('dr-quality',qualityState);
  window._skipGreeting=true;
  const _scroll=document.documentElement.scrollTop||document.body.scrollTop;
  renderToday();
  window._skipGreeting=false;
  requestAnimationFrame(()=>{
    document.documentElement.scrollTop=_scroll;
    document.body.scrollTop=_scroll;
  });
  renderStatusBar();
  renderRecoveryMode();
}

function orbLabel(q){
  return {purple:'Legendary Execution',green:'Done',yellow:'Done poorly',gray:'N/A',red:'Skipped'}[q]||'Rate quality';
}
function renderOrb(quality, taskId){
  const canPurple=PURPLE_ELIGIBLE.has(taskId);
  // Pixel art orb images
  const orbSrc = quality==='purple' ? ORB_PURPLE :
                 quality==='green'  ? ORB_TEAL   :
                 quality==='yellow' ? ORB_YELLOW :
                 quality==='red'    ? ORB_RED    :
                 quality==='gray'   ? ORB_GRAY  : null;
  if(orbSrc){
    return `<img src="${orbSrc}" class="q-orb-img" title="${orbLabel(quality)}" alt="${orbLabel(quality)}">`;
  }
  const title = canPurple ? 'Tap: purple→green→yellow→gray→red' : 'Tap: green→yellow→gray→red';
  return `<img src="${ORB_WHITE}" class="q-orb-img" title="${title}" alt="Unset">`;
}

// Thin neon stat bar for companion cards
function renderStatBar(pct, fillImg, label, labelClass=''){
  const clip=pct<=0?100:Math.max(0,100-Math.min(100,pct));
  return `<div class="stat-row">
    <span class="stat-label ${labelClass}">${label}</span>
    <div class="stat-bar-wrap">
      <img class="stat-bar-empty" src="${BAR_STAT_EMPTY}" alt="">
      ${pct>0?`<img class="stat-bar-fill" src="${fillImg}" style="clip-path:inset(0 ${clip}% 0 0);" alt="">`:``}
    </div>
  </div>`;
}

function setQuality(dayIdx, taskId, level){
  const k=dayKey(dayIdx);
  if(!qualityState[k])qualityState[k]={};
  if(qualityState[k][taskId]===level) delete qualityState[k][taskId];
  else qualityState[k][taskId]=level;
  save('dr-quality',qualityState);
  window._skipGreeting=true;
  const _scroll=document.documentElement.scrollTop||document.body.scrollTop;
  renderToday();
  window._skipGreeting=false;
  requestAnimationFrame(()=>{
    document.documentElement.scrollTop=_scroll;
    document.body.scrollTop=_scroll;
  });
  renderStatusBar();
}
function getQuality(dayIdx, taskId){
  return qualityState[dayKey(dayIdx)]?.[taskId]||null;
}
function getQualityDebuffs(dayIdx){
  const data=state[dayKey(dayIdx)]||{};
  const debuffs=[]; const seen=new Set();
  for(const[taskId,cfg]of Object.entries(QUALITY_TASKS)){
    const q=getQuality(dayIdx,taskId);
    // red = intentional skip → always debuffs
    // yellow = done poorly → debuffs only if debuffOnYellow is set for this task
    const hasDebuff=(q==='red')||(q==='yellow'&&cfg.debuffOnYellow);
    if(hasDebuff && !seen.has(cfg.debuff)){
      seen.add(cfg.debuff);
      debuffs.push({id:cfg.debuff,label:cfg.label,type:'debuff'});
    }
  }
  return debuffs;
}
function countDebuffs(){
  const all=getActiveBuffs();
  return all.filter(b=>b.type==='debuff').length;
}
function isRecoveryMode(){
  const c=collapseState.active;
  if(c&&c.type==='total'&&c.applyDate===todayStr())return true;
  const fc=getActiveFloorCondition();
  if(fc&&fc.effect==='recovery-mode')return true;
  return countDebuffs()>=4;
}


function renderToday(){
  const ti=new Date().getDay();
  document.getElementById('today-heading').textContent=DAYS[ti];
  document.getElementById('today-sub').textContent=new Date().toLocaleDateString('en-US',{month:'long',day:'numeric',year:'numeric'}).toUpperCase();

  const strip=document.getElementById('date-strip');strip.innerHTML='';
  const todayDowOffset=(new Date().getDay()+6)%7; // 0=Mon, 6=Sun
  for(let i=0;i<=todayDowOffset;i++){
    const btn=document.createElement('button');const p=dayPct(i);
    btn.className='date-pill'+(i===selectedDay?' active':'')+(p===100&&i!==selectedDay?' done':'');
    btn.textContent=SHORT[i]+(p>0&&i!==selectedDay?' '+p+'%':'');
    btn.onclick=()=>{selectedDay=i;renderToday();};
    strip.appendChild(btn);
  }

  const sc=getScheduleFor(selectedDay);
  const allT=sc.reduce((a,s)=>a.concat(s.tasks),[]);
  const data=getDayData(selectedDay);
  const done=allT.filter(t=>data[t.id]).length;
  const total=allT.length;
  const pct=total?Math.round(done/total*100):0;

  const _recovery=isRecoveryMode();
  const wasComplete=document.getElementById('congrats-banner').style.display==='block';
  document.getElementById('ring-fill').style.strokeDashoffset=CIRC-(CIRC*pct/100);
  document.getElementById('ring-pct').textContent=pct+'%';
  document.getElementById('prog-fraction').textContent=done+' / '+total;
  document.getElementById('streak-row').textContent='● '+calcStreak()+' floors survived';
  const ptsBadge=document.getElementById('today-pts-badge');
  if(ptsBadge)ptsBadge.innerHTML=pixelIcon(ICON_COINS_STACK,18)+''+getPoints()+' coins';
  renderSystemGreeting();
  renderStatusBar();
  renderFloorCountdown();
  renderRecoveryMode();
  renderCollapseEvent();
  renderFloorConditionBanner();
  const isComplete=_recovery?(done>=3&&total>0):(pct===100&&total>0);
  document.getElementById('congrats-banner').style.display=isComplete?'block':'none';
  if(isComplete&&!wasComplete)fireConfetti();

  const list=document.getElementById('task-list');list.innerHTML='';
  const schedType=isWeekend(selectedDay)?'weekend':'weekday';
  const baseSchedule=isWeekend(selectedDay)?schedule.weekend:schedule.weekday;

  sc.forEach((section,sectionIdx)=>{
    // Find real sectionIdx in base schedule (ignoring injected Sunday tasks for edit purposes)
    const baseSec=baseSchedule[sectionIdx];

    const sectionWrap=document.createElement('div');sectionWrap.className='task-section-group';
    const lbl=document.createElement('div');lbl.className='section-label';
    lbl.innerHTML=`<span>${section.section}</span><button class="section-add-btn" onclick="openAddOverlay('${schedType}',${sectionIdx})" title="Add task">+</button>`;
    sectionWrap.appendChild(lbl);
    list.appendChild(sectionWrap);

    section.tasks.forEach((task,taskIdx)=>{
      // For Sunday pill box (injected, not in base schedule), skip edit
      const isSundayInjected=(task.id===SUNDAY_PILL_TASK.id&&isSunday(selectedDay));

      const div=document.createElement('div');
      const _isDone=!!data[task.id];
      const _qCfg=true;  // orb on all tasks; debuffs still only fire for QUALITY_TASKS
      const _q=getQuality(selectedDay,task.id);
      const _grayWarn=getGrayWarning(task.id);
      // Gray-checked = N/A: show checked but dimmed
      const _isNA=_q==='gray';
      div.className='task'+(_isDone&&!_isNA?' done':'')+(_q==='yellow'?' quality-low':'')+(_isNA?' task-na':'');
      div.innerHTML=`<div class="check"><span class="check-mark">✓</span></div>
        <div style="flex:1;"><div class="task-name">${task.name}</div>
        <div class="task-time">${task.time}${_isDone&&data[task.id+'_ts']?' · done '+fmtTime(data[task.id+'_ts']):''}</div></div>
        ${_qCfg?`<div class="q-orb-tap" onclick="event.stopPropagation();cycleQuality(${selectedDay},'${task.id}')" title="${orbLabel(_q)}${_grayWarn?' — gray '+(_grayWarn==='locked'?'LOCKED':'warning'):''}">
        ${renderOrb(_q,task.id)}
        ${_grayWarn?`<span class="gray-warn-badge ${_grayWarn}">${_grayWarn==='locked'?'🔒':'⚠'}</span>`:''}

        </div>` : (!isSundayInjected?'<span class="task-edit-hint">hold to edit</span>':'')}`;

      // Tap = toggle, long press = edit
      div.addEventListener('pointerdown',()=>{
        if(!isSundayInjected){
          // For Sunday injected tasks, find real taskIdx in base schedule
          let realTaskIdx=taskIdx;
          if(isSunday(selectedDay)&&sectionIdx===0)realTaskIdx=Math.max(0,taskIdx-1); // adjust for injected task
          lpStart(()=>openEditOverlay(schedType,sectionIdx,isSundayInjected?-1:realTaskIdx));
        }
      });
      div.addEventListener('pointerup',lpEnd);
      div.addEventListener('pointercancel',lpEnd);
      div.addEventListener('pointermove',lpEnd);
      div.addEventListener('click',()=>{
        if(!lpFired)toggleTask(selectedDay,task.id);
      });
      sectionWrap.appendChild(div);
    });
  });

  // Dog care summary row (today only)
  if(selectedDay===ti){
    const dogData=getDogDayData();
    const dt=dogTasks.shared||{morning:[],evening:[]};
    const allDT=[...(dt.morning||[]),...(dt.evening||[])];
    const dogDone=allDT.filter(t=>dogData[t.id]).length;
    const dogTotal=allDT.length;
    const lbl=document.createElement('div');lbl.className='section-label';lbl.textContent='Dog Care';list.appendChild(lbl);
    const div=document.createElement('div');div.className='task'+(dogDone===dogTotal&&dogTotal>0?' done':'');
    div.innerHTML=`<div class="check"><span class="check-mark">✓</span></div><div style="flex:1;"><div class="task-name">Edna & Kronk — ${dogDone}/${dogTotal} tasks done</div><div class="task-time">Tap Dogs tab to manage</div></div>`;
    div.onclick=()=>showRoom('dogs');
    list.appendChild(div);
  }

  renderBonusToday(selectedDay);
}

/* ─── DOGS ──────────────────────────────────────────────────────────────── */
function toggleDogTask(taskId){
  const k=todayStr();
  if(!dogState[k])dogState[k]={};
  dogState[k][taskId]=!dogState[k][taskId];
  save('dr-dog-state',dogState);
  // Award points: mental health tasks get bonus pts, core care gets dog pts
  const isMental=(dogTasks.mental||[]).find(t=>t.id===taskId);
  if(isMental)maybeAwardBonusDogPoints(taskId);
  else maybeAwardDogPoints(taskId);
  renderDogs();
  if(selectedDay===new Date().getDay())renderToday();
}

function markGrooming(id){groomState[id]=Date.now();save('dr-groom-state',groomState);renderDogs();}
function markPrevention(id){prevState[id]=Date.now();save('dr-prev-state',prevState);renderDogs();}

// Run on startup AND after Supabase load to clean stale data
function migrateDogTasks(){
  if(!dogTasks.prevention)dogTasks.prevention=DEFAULT_DOG_TASKS.prevention;
  if(!dogTasks.mental)dogTasks.mental=DEFAULT_DOG_TASKS.mental;
  // Nuclear: always rebuild shared from defaults — permanently kills stale snuggles/mental tasks
  // Rebuilds morning/evening to match defaults exactly, preserving nothing extra
  dogTasks.shared={
    morning:DEFAULT_DOG_TASKS.shared.morning.map(def=>({...def})),
    evening:DEFAULT_DOG_TASKS.shared.evening.map(def=>({...def}))
  };
  // Collapse prevention to 2 combined entries
  const hasCombined=(dogTasks.prevention||[]).find(p=>p.id==='prev-e-monthly'||p.id==='prev-k-monthly');
  if(!hasCombined||(dogTasks.prevention||[]).length>2)dogTasks.prevention=DEFAULT_DOG_TASKS.prevention;
  saveLocal('dr-dog-tasks',dogTasks);
}

// Migration: ensure gym is in weekday morning. Idempotent — safe to call repeatedly.
function migrateGymIntoSchedule(){
  if(!schedule||!schedule.weekday)return;
  const wdMorn=schedule.weekday.find(s=>s.section==='Morning');
  if(wdMorn&&!wdMorn.tasks.find(t=>t.id==='gym')){
    const showerIdx=wdMorn.tasks.findIndex(t=>t.id==='shower');
    const insertIdx=showerIdx>=0?showerIdx:Math.min(2,wdMorn.tasks.length);
    wdMorn.tasks.splice(insertIdx,0,{id:'gym',name:'Gym (40 min)',time:'5:35–6:15 AM'});
    saveLocal('dr-schedule',schedule);
  }
}

function renderDogs(){
  const data=getDogDayData();
  const dt=dogTasks.shared||{morning:[],evening:[]};

  const dogTaskHtml=tasks=>tasks.map(t=>`
    <div class="dog-task${data[t.id]?' done':''}" onclick="toggleDogTask('${t.id}')">
      <div class="dog-check">${data[t.id]?'✓':''}</div>
      <div class="dog-task-name">${t.name}</div>
      <div class="dog-task-time">${t.time}</div>
    </div>`).join('');

  const now=new Date(),dom=now.getDate();

  const groomHtml=(dogTasks.grooming||[]).map(g=>{
    const last=groomState[g.id];const nowMs=Date.now();
    const daysSince=last?(nowMs-last)/(86400000):null;
    const overdue=daysSince!==null&&daysSince>=g.days;
    const dueIn=last?Math.max(0,g.days-Math.floor(daysSince)):0;
    const status=!last?`<span class="groom-due">Not done yet</span>`:overdue?`<span class="groom-due">Overdue</span>`:`<span class="groom-done-label">Due in ${dueIn}d</span>`;
    return `<div class="groom-row"><span class="groom-name">${g.label}</span>${status}<button class="groom-btn" onclick="markGrooming('${g.id}')">Done today</button></div>`;
  }).join('');

  const prevHtml=(dogTasks.prevention||[]).map(p=>{
    const lastTs=prevState[p.id];
    let status='';
    if(!lastTs){
      const daysUntil=((p.dayOfMonth-dom+31)%31)||0;
      status=daysUntil===0?`<span class="groom-due">Due today!</span>`:`<span class="groom-done-label">Due in ${daysUntil}d (day ${p.dayOfMonth})</span>`;
    }else{
      const lastDate=new Date(lastTs);
      const monthsSince=(now.getFullYear()-lastDate.getFullYear())*12+(now.getMonth()-lastDate.getMonth());
      if(monthsSince>=1&&dom>=p.dayOfMonth)status=`<span class="groom-due">Due now</span>`;
      else if(monthsSince===0)status=`<span class="groom-done-label">Done this month</span>`;
      else{const d=((p.dayOfMonth-dom+31)%31)||31;status=`<span class="groom-done-label">Due in ${d}d</span>`;}
    }
    return `<div class="groom-row"><span class="groom-name">${p.label}</span>${status}<button class="groom-btn" onclick="markPrevention('${p.id}')">Done today</button></div>`;
  }).join('');

  const mentalHtml=(dogTasks.mental||[]).map(t=>`
    <div class="mental-task${data[t.id]?' done':''}" onclick="toggleDogTask('${t.id}')">
      <div class="mental-check">${data[t.id]?'✓':''}</div>
      <div class="mental-name">${t.name}</div>
      <div style="font-size:10px;color:var(--hint);margin-left:auto;">${t.time}</div>
    </div>`).join('');

  document.getElementById('dog-content').innerHTML=`
    <div class="dog-section">
      <div class="dog-header" style="align-items:center;gap:10px;"><div style="display:flex;gap:4px;"><img src="${CHAR_FACE_EDNA_HAPPY}" style="width:38px;height:38px;border-radius:50%;object-fit:cover;border:1.5px solid rgba(180,100,220,0.5);"><img src="${CHAR_FACE_KRONK_HAPPY}" style="width:38px;height:38px;border-radius:50%;object-fit:cover;border:1.5px solid rgba(80,180,220,0.5);"></div><div><div class="dog-name">Edna & Kronk</div><div class="dog-streak">Morning + evening care</div></div></div>
      <div class="section-label" style="margin-top:0;margin-bottom:8px;">Morning</div>${dogTaskHtml(dt.morning||[])}
      <div class="section-label" style="margin-bottom:8px;">Evening</div>${dogTaskHtml(dt.evening||[])}
    </div>
    <div class="mental-card">
      <h3>Mental health moments <span style="font-size:10px;color:var(--hint);text-transform:none;letter-spacing:0;font-weight:400;">(→ counts as bonus tasks, not dog care %)</span></h3>
      ${mentalHtml}
    </div>
    <div class="grooming-card"><h3>Grooming tracker</h3>${groomHtml}</div>
    <div class="grooming-card"><h3>Prevention tracker <span style="font-size:10px;color:var(--muted);font-weight:400;">monthly — day ${(dogTasks.prevention||[{dayOfMonth:15}])[0].dayOfMonth}</span></h3>${prevHtml}</div>`;
}

/* ─── WHEEL ─────────────────────────────────────────────────────────────── */
const WHEEL_COLORS=['#2dd4a0','#f5a623','#a78bfa','#ff5c5c','#ff6b35','#fbbf24','#f87171'];
let currentSpinTasks=[], wheelAngle=0, spinning=false;

function drawWheel(){
  const canvas=document.getElementById('wheel-canvas');const ctx=canvas.getContext('2d');
  const dpr=window.devicePixelRatio||1,size=300;
  if(canvas.width!==size*dpr){canvas.width=size*dpr;canvas.height=size*dpr;canvas.style.width=size+'px';canvas.style.height=size+'px';ctx.scale(dpr,dpr);}
  const cx=150,cy=150,r=138,n=currentSpinTasks.length,hubR=18;
  ctx.clearRect(0,0,size,size);if(!n)return;
  const arc=2*Math.PI/n;
  const colors=WHEEL_COLORS;

  // ── Segments ───────────────────────────────────────────────────────────────
  currentSpinTasks.forEach((task,i)=>{
    // No adjacent same color: skip if needed
    let ci=i%colors.length;
    if(n>1&&colors[ci]===colors[(i-1+colors.length)%colors.length]&&i>0)ci=(ci+1)%colors.length;
    const s=wheelAngle+i*arc,e=s+arc;
    ctx.beginPath();ctx.moveTo(cx,cy);ctx.arc(cx,cy,r,s,e);ctx.closePath();
    ctx.fillStyle=colors[ci];ctx.fill();
    // Divider line
    ctx.beginPath();ctx.moveTo(cx,cy);
    ctx.lineTo(cx+r*Math.cos(s),cy+r*Math.sin(s));
    ctx.strokeStyle='rgba(0,0,0,0.35)';ctx.lineWidth=1.5;ctx.stroke();
    // Text
    ctx.save();ctx.translate(cx,cy);ctx.rotate(s+arc/2);
    ctx.fillStyle='rgba(0,0,0,0.75)';
    ctx.font='11px Silkscreen, monospace';
    // Radial space: from just outside hub (hubR+8) to near rim (r-12)
    // Silkscreen ~8px/char → ~12 chars in 102px available
    const maxCh=Math.floor((r-12-(hubR+8))/8);
    const label=task.name.length>maxCh?task.name.slice(0,maxCh-1)+'…':task.name;
    ctx.textAlign='left';
    ctx.fillText(label,hubR+8,4);
    ctx.restore();
  });

  // ── Inner ring (near hub) ──────────────────────────────────────────────────
  ctx.beginPath();ctx.arc(cx,cy,r*0.20,0,2*Math.PI);
  ctx.strokeStyle='rgba(0,0,0,0.25)';ctx.lineWidth=1;ctx.stroke();

  // ── Hub with gold ring + warm glow ────────────────────────────────────────
  // Radial gradient glow
  const grad=ctx.createRadialGradient(cx,cy,0,cx,cy,hubR);
  grad.addColorStop(0,'rgba(251,191,36,0.08)');
  grad.addColorStop(1,'transparent');
  ctx.beginPath();ctx.arc(cx,cy,hubR,0,2*Math.PI);
  ctx.fillStyle='#0a0a0c';ctx.fill();
  ctx.beginPath();ctx.arc(cx,cy,hubR,0,2*Math.PI);
  ctx.fillStyle=grad;ctx.fill();
  // Gold stroke
  ctx.beginPath();ctx.arc(cx,cy,hubR,0,2*Math.PI);
  ctx.strokeStyle='rgba(251,191,36,0.6)';ctx.lineWidth=2;ctx.stroke();
}

function isAvailable(task){
  if(task.cooldown===0){
    // Always available UNLESS done this session (brief visual cooldown)
    return !sessionDone.has(task.id);
  }
  if(!task.repeat)return !wheelDone[task.id];
  const last=wheelDone[task.id];if(!last)return true;
  return(Date.now()-last)/86400000>=task.cooldown;
}

function cdLeft(task){
  if(task.cooldown===0||!task.repeat||!wheelDone[task.id])return 0;
  return Math.max(0,task.cooldown-Math.floor((Date.now()-wheelDone[task.id])/86400000));
}

function getPriorityPool(){
  const out=[];const seen=new Set();
  // Skipped 3+ times
  ['clean','admin','mental','bonus'].forEach(cat=>{
    const c=wheel[cat];if(!c)return;
    [...(c.standalone||[]),...(c.projects||[]).flatMap(p=>p.tasks||[])].forEach(t=>{
      if((wheelSkips[t.id]||0)>=3&&isAvailable(t)&&!seen.has(t.id)){out.push({...t,_cat:cat});seen.add(t.id);}
    });
  });
  // Pinned
  ['clean','admin','mental','bonus'].forEach(cat=>{
    const c=wheel[cat];if(!c)return;
    [...(c.standalone||[]),...(c.projects||[]).flatMap(p=>p.tasks||[])].forEach(t=>{
      if(wheelPinned[t.id]&&isAvailable(t)&&!seen.has(t.id)){out.push({...t,_cat:cat});seen.add(t.id);}
    });
  });
  // Priority standalone
  const pc=wheel.priority||{standalone:[],projects:[]};
  [...(pc.standalone||[]),...(pc.projects||[]).flatMap(p=>p.tasks||[])].forEach(t=>{
    if(isAvailable(t)&&!seen.has(t.id)){out.push({...t,_cat:'priority'});seen.add(t.id);}
  });
  return out;
}

function getAvailableTasks(){
  if(spinCat==='priority')return getPriorityPool().filter(t=>spinDuration===0||t.dur<=spinDuration);
  const cat=wheel[spinCat];if(!cat)return[];
  let tasks;
  if(spinProject==='all')tasks=[...(cat.standalone||[]),...(cat.projects||[]).flatMap(p=>p.tasks||[])];
  else if(spinProject==='standalone')tasks=cat.standalone||[];
  else tasks=(cat.projects||[]).find(p=>p.id===spinProject)?.tasks||[];
  return tasks.filter(t=>isAvailable(t)&&(spinDuration===0||t.dur<=spinDuration));
}

function setSpinCat(cat,el){
  spinCat=cat;spinProject='all';
  document.querySelectorAll('#spin-cat-tabs .stab').forEach(b=>b.classList.remove('active'));
  el.classList.add('active');
  updateProjectDropdown();refreshWheel();renderTaskManager();
}
function setSpinProject(val){spinProject=val;refreshWheel();}
function setDuration(min,el){spinDuration=min;document.querySelectorAll('.dur-btn').forEach(b=>b.classList.remove('active'));el.classList.add('active');refreshWheel();}

function updateProjectDropdown(){
  const sel=document.getElementById('spin-project-select');if(!sel)return;
  if(spinCat==='priority'){sel.innerHTML='<option value="all">All priority tasks</option>';sel.disabled=true;return;}
  sel.disabled=false;
  const cat=wheel[spinCat]||{};
  sel.innerHTML='<option value="all">All tasks in category</option>';
  (cat.projects||[]).forEach(p=>{const o=document.createElement('option');o.value=p.id;o.textContent=p.name;sel.appendChild(o);});
  const st=document.createElement('option');st.value='standalone';st.textContent='Standalone tasks only';sel.appendChild(st);
  sel.value=spinProject;
}

function refreshWheel(){
  currentSpinTasks=getAvailableTasks();
  const empty=document.getElementById('wheel-empty'),btn=document.getElementById('spin-btn');
  if(!currentSpinTasks.length){empty&&(empty.style.display='block');btn&&(btn.disabled=true);}
  else{empty&&(empty.style.display='none');btn&&(btn.disabled=false);}
  drawWheel();
}

function doSpin(extra,dur,cb){
  spinning=true;
  const _canvas=document.getElementById('wheel-canvas');
  if(_canvas)_canvas.style.filter='drop-shadow(0 0 12px rgba(251,191,36,0.3))';
  const start=performance.now(),startA=wheelAngle;
  function frame(now){
    const p=Math.min((now-start)/dur,1),ease=1-Math.pow(1-p,4);
    wheelAngle=startA+extra*ease;drawWheel();
    if(p<1)requestAnimationFrame(frame);
    else{spinning=false;
    const _cv=document.getElementById('wheel-canvas');
    if(_cv)_cv.style.filter='drop-shadow(0 0 4px rgba(251,191,36,0.1))';
    const n=currentSpinTasks.length,arc=2*Math.PI/n;const idx=~~((((-wheelAngle)%(2*Math.PI)+2*Math.PI)%(2*Math.PI))/arc)%n;cb(currentSpinTasks[idx]);}
  }
  requestAnimationFrame(frame);
}

function spinWheel(){
  if(spinning||!currentSpinTasks.length)return;
  // 25% chance of random encounter instead of normal spin
  if(maybeShowRandomEncounter())return;
  reSpinsLeft=3;updateRespinBtn();
  document.getElementById('spin-btn').disabled=true;
  document.getElementById('spin-result').classList.remove('show');
  stopBossTimer();
  doSpin((5+Math.random()*5)*2*Math.PI+Math.random()*2*Math.PI,3000,task=>{
    document.getElementById('spin-btn').disabled=false;showResult(task);
  });
}

function reSpinWheel(){
  if(reSpinsLeft<=0||spinning||!currentSpinTasks.length)return;
  if(currentSpinTask){wheelSkips[currentSpinTask.id]=(wheelSkips[currentSpinTask.id]||0)+1;save('dr-wheel-skips',wheelSkips);}
  reSpinsLeft--;updateRespinBtn();
  document.getElementById('spin-result').classList.remove('show');stopTimer();
  doSpin((3+Math.random()*3)*2*Math.PI+Math.random()*2*Math.PI,2000,task=>{showResult(task);renderAvoidance();});
}

function skipTask(){
  if(currentSpinTask){wheelSkips[currentSpinTask.id]=(wheelSkips[currentSpinTask.id]||0)+1;save('dr-wheel-skips',wheelSkips);}
  hideResult();renderAvoidance();
}

function updateRespinBtn(){
  const btn=document.getElementById('respin-btn'),cnt=document.getElementById('respin-count');
  if(!btn||!cnt)return;
  cnt.textContent=reSpinsLeft;btn.disabled=reSpinsLeft<=0;btn.style.opacity=reSpinsLeft<=0?'0.4':'1';
}

/* ─── BOSS BATTLE ENGINE ─────────────────────────────────────────────────── */
const BOSS_TAUNTS={
  opening:["You think you can beat me? Adorable.","The timer has started. Enjoy your confidence while it lasts.","I've seen Crawlers quit in the first minute. Will you?"],
  resistance:["Your phone is right there. One notification. It'll only take a second.","The procrastination fog is thickening. I can feel your resolve weakening.","You could take a break. No one would know."],
  dip:["Half your time is gone. What do you have to show for it?","Even the goblins are more focused than you right now.","Distraction detected. Just a small one. Just for a moment..."],
  final:["You're still here? Unexpected.","I underestimated you. I won't do it again.","The end is near. So is my defeat. I hate this."],
};
const EDNA_REACTIONS={
  opening:["Edna has secured the perimeter for this encounter.","Edna is watching. Zero threats detected. So far.","Edna approves of your starting posture."],
  resistance:["Edna is watching you with her whole face.","Edna has filed a preliminary concern report.","Edna barks once at the void. She means it as support."],
  dip:["Edna has detected a threat. It is your own procrastination.","Edna applies Chaos Engine. Partial XP secured regardless.","Edna is very still. This is either support or judgment."],
  final:["Edna demands you finish. Non-negotiable.","Edna is very still. She believes in you and it is alarming.","Edna has deployed full security protocol. You will not fail."],
};
const KRONK_REACTIONS={
  opening:["Kronk is vibrating with pre-battle energy.","Kronk's tail is going. This is his support mechanism.","Kronk has installed himself nearby. Just in case."],
  resistance:["Kronk activates Emotional Support Aura. You feel slightly better.","Kronk has positioned himself closer. Just in case.","Kronk stares at you with his whole face. His tail is still wagging."],
  dip:["Kronk sits very close to you. He does not fully understand but he is here.","Kronk has not eaten anything suspicious today. This is his gift to you.","Kronk activates Chaos Engine. Partial XP secured."],
  final:["Kronk is fully unhinged with excitement. This is peak performance.","Kronk believes in you completely. He always has.","Kronk has ascended. This is what zoomies were training for."],
};

let bossTimerInterval=null,bossTimerRunning=false,bossTimerSeconds=0;
let bossComboSeconds=0,bossComboLevel=0;
let bossTotalSeconds=0,currentPhase='opening';

function getBossPhase(pct){
  if(pct>75)return'opening';if(pct>50)return'resistance';if(pct>25)return'dip';return'final';
}

function updateBossUI(){
  const pct=Math.max(0,Math.round((bossTimerSeconds/bossTotalSeconds)*100));
  const phase=getBossPhase(pct);
  const fill=document.getElementById('boss-hp-fill');
  const pctEl=document.getElementById('boss-hp-pct');
  const phaseEl=document.getElementById('boss-phase-label');
  const timerEl=document.getElementById('timer-display');
  if(fill)fill.style.width=pct+'%';
  if(pctEl)pctEl.textContent=pct+'%';
  if(phaseEl)phaseEl.textContent={opening:'Opening',resistance:'Resistance',dip:'The Dip',final:'Final Push'}[phase];
  if(timerEl){timerEl.textContent=formatTime(bossTimerSeconds);timerEl.className='boss-timer'+(pct<25?' danger':'');}
  if(phase!==currentPhase){
    currentPhase=phase;
    const taunt=document.getElementById('boss-taunt-text');
    const edna=document.getElementById('edna-reaction');
    const kronk=document.getElementById('kronk-reaction');
    if(taunt)taunt.textContent=DCC.getRandom(BOSS_TAUNTS[phase]);
    if(edna)edna.textContent=DCC.getRandom(EDNA_REACTIONS[phase]);
    if(kronk)kronk.textContent=DCC.getRandom(KRONK_REACTIONS[phase]);
  }
}

function updateComboUI(){
  const labels=['COMBO × 0 — Not started','COMBO × 1 — Focused','COMBO × 2 — Locked In','COMBO × 3 — Hyperfocused 🔥','COMBO × 4 — UNSTOPPABLE'];
  const colors=['var(--muted)','var(--teal)','var(--teal)','var(--fire)','var(--fire)'];
  const thresholds=[0,300,600,1200,bossTotalSeconds];
  let level=0;
  for(let i=1;i<thresholds.length;i++){if(bossComboSeconds>=thresholds[i])level=i;}
  bossComboLevel=Math.min(level,4);
  const lbl=document.getElementById('combo-label');
  if(lbl){lbl.textContent=labels[bossComboLevel];lbl.style.color=colors[bossComboLevel];}
  for(let i=0;i<4;i++){
    const pip=document.getElementById('pip-'+i);
    if(!pip)continue;
    pip.className='combo-pip'+(i<bossComboLevel?' '+(bossComboLevel>=3?'fire':'active'):'');
  }
}

function breakCombo(){
  bossComboSeconds=0;bossComboLevel=0;
  const lbl=document.getElementById('combo-label');
  if(lbl){lbl.textContent='COMBO BROKEN. The boss laughs. Kronk is concerned.';lbl.style.color='var(--red)';}
  for(let i=0;i<4;i++){const p=document.getElementById('pip-'+i);if(p)p.className='combo-pip';}
  setTimeout(updateComboUI,2500);
}

function showResult(task){
  currentSpinTask=task;currentPhase='opening';bossComboSeconds=0;bossComboLevel=0;
  const dur=spinDuration>0?spinDuration:task.dur;
  bossTotalSeconds=dur*60;bossTimerSeconds=bossTotalSeconds;
  const label=document.getElementById('encounter-label');
  if(label)label.textContent='Boss Encounter Initiated';
  document.getElementById('result-task').textContent=task.name;
  const cdStr=task.cooldown===0?'always available':`every ${task.cooldown}d`;
  document.getElementById('result-meta').textContent=(task.repeat?`Repeating · ${cdStr}`:'One-time')+` · ${dur} min`;
  document.getElementById('boss-hp-fill').style.width='100%';
  document.getElementById('boss-hp-pct').textContent='100%';
  document.getElementById('boss-phase-label').textContent='Opening';
  document.getElementById('timer-display').textContent=formatTime(bossTimerSeconds);
  document.getElementById('timer-display').className='boss-timer';
  document.getElementById('timer-start-btn').textContent='Begin encounter';
  document.getElementById('boss-taunt-text').textContent=DCC.getRandom(BOSS_TAUNTS.opening);
  document.getElementById('edna-reaction').textContent=DCC.getRandom(EDNA_REACTIONS.opening);
  document.getElementById('kronk-reaction').textContent=DCC.getRandom(KRONK_REACTIONS.opening);
  document.getElementById('boss-defeat-banner').classList.remove('show');
  document.getElementById('boss-abandon-banner').classList.remove('show');
  document.getElementById('boss-actions').style.display='flex';
  updateComboUI();
  document.getElementById('spin-result').classList.add('show');
}

function hideResult(){
  document.getElementById('spin-result').classList.remove('show');
  stopBossTimer();currentSpinTask=null;
}

function stopBossTimer(){clearInterval(bossTimerInterval);bossTimerRunning=false;bossTimerInterval=null;}

function showBossDefeat(){
  stopBossTimer();fireConfetti();
  const bonusCoins=bossComboLevel>=3?15:bossComboLevel>=2?8:0;
  const coins=PTS.spinTask+bonusCoins;
  const xp=bossComboLevel>=4?75:bossComboLevel>=3?50:XP_PTS.spinTask;
  const donutLine=DCC.getRandom(DCC.donut.floorCleared);
  document.getElementById('defeat-loot-text').innerHTML=
    `+${coins} 🪙 Crawler Coins<br>+${xp} ⚡ XP${bossComboLevel>=3?' <span style="color:var(--fire);">+ Combo Bonus!</span>':''}<br><br><em style="color:var(--purple);">"${donutLine}"</em><br><small style="color:var(--hint);">— Princess Donut</small>`;
  document.getElementById('boss-defeat-banner').classList.add('show');
  document.getElementById('boss-actions').style.display='none';
  showPtsToast(`⚔ Boss defeated! +${coins} 🪙 +${xp} ⚡`);
  awardXP(xp,'Boss defeated');
}

function toggleTimer(){
  if(bossTimerRunning){
    clearInterval(bossTimerInterval);bossTimerRunning=false;
    document.getElementById('timer-start-btn').textContent='Resume';
    breakCombo();
  } else {
    bossTimerRunning=true;
    document.getElementById('timer-start-btn').textContent='Pause';
    bossTimerInterval=setInterval(()=>{
      bossTimerSeconds--;bossComboSeconds++;
      updateBossUI();updateComboUI();
      if(bossTimerSeconds<=0){stopBossTimer();showBossDefeat();}
    },1000);
  }
}

function stopTimer(){stopBossTimer();}
function formatTime(s){return`${~~(s/60)}:${String(s%60).padStart(2,'0')}`;}

function markSpinDone(){
  if(!currentSpinTask)return;
  if(currentSpinTask.cooldown!==0){wheelDone[currentSpinTask.id]=Date.now();}
  else{sessionDone.add(currentSpinTask.id);setTimeout(()=>{sessionDone.delete(currentSpinTask.id);renderTaskManager();},3000);}
  save('dr-wheel-done',wheelDone);
  if(wheelSkips[currentSpinTask.id]){delete wheelSkips[currentSpinTask.id];save('dr-wheel-skips',wheelSkips);}
  const k=todayStr();if(!state[k])state[k]={};
  state[k]['spin_'+currentSpinTask.id]=true;
  save('dr-state',state);
  maybeAwardSpinPoints();
  hideResult();refreshWheel();renderAvoidance();
  if(selectedDay===new Date().getDay())renderBonusToday(selectedDay);
}

function markDoneOutsideSpin(taskId){
  const task=findWheelTask(taskId);
  if(task&&task.cooldown!==0){wheelDone[taskId]=Date.now();save('dr-wheel-done',wheelDone);}
  else if(task&&task.cooldown===0){
    sessionDone.add(taskId);
    setTimeout(()=>{sessionDone.delete(taskId);renderTaskManager();},3000);
  }
  delete wheelSkips[taskId];save('dr-wheel-skips',wheelSkips);
  const k=todayStr();if(!state[k])state[k]={};
  state[k]['spin_'+taskId]=true;save('dr-state',state);
  maybeAwardSpinPoints();
  refreshWheel();renderAvoidance();renderTaskManager();
  if(selectedDay===new Date().getDay())renderBonusToday(selectedDay);
}

/* ─── RANDOM ENCOUNTER SYSTEM ────────────────────────────────────────────── */
let activeEncounter=null,encTimerInterval=null,encTimerSeconds=0;
const ENCOUNTER_CHANCE=0.18;
let _spinsSinceEncounter=0;

const ENCOUNTERS=[
  {id:'loot-goblin',weight:30,title:'Loot Goblin',type:'🐀 Loot Goblin',
    flavor:'It is fast. It will not wait.\nComplete one quick task in 3 minutes.\nReward: double coins.\nFailure: it escapes. The coins go with it.',
    system:'RANDOM ENCOUNTER: Loot Goblin detected. Timer starts now. Do not hesitate.',
    timerSeconds:180,
    actions:[{label:'Chase it! (start timer)',id:'start',primary:true},{label:'Let it go',id:'flee',danger:true}],
    onSuccess:()=>{awardPoints(20,'Loot Goblin caught!','encounter');awardXP(15,'Loot Goblin');showPtsToast('+20 🪙 Loot Goblin caught!');},
    onFail:()=>{showPtsToast('Loot Goblin escaped.');},
  },
  {id:'mimic-chest',weight:20,title:'Mimic Chest',type:'📦 Mimic Chest',
    flavor:'This task is not what it appears.\nEstimated time: LIES.\nProceed anyway.\nBonus coins await those who survive.',
    system:'MIMIC DETECTED. Difficulty adjusted. Companion morale: cautious. Reward: elevated.',
    actions:[{label:'Open the chest',id:'accept',primary:true},{label:'Back away slowly',id:'flee'}],
    onSuccess:()=>{awardPoints(25,'Mimic Chest defeated','encounter');awardXP(20,'Mimic Chest');showPtsToast('+25 🪙 Mimic survived!');},
    onFail:null,
  },
  {id:'audience-vote',weight:20,title:'Audience Vote',type:'📺 Audience Vote',
    flavor:"The viewers have decided your fate.\nToday's modifier has been selected.\nThe dungeon does not take requests.",
    system:'AUDIENCE VOTE ACTIVE. Modifier applied. Compliance is expected.',
    voteOptions:['DOUBLE COINS: All tasks worth 2× today.','SPEED RUN: Complete 5 tasks before noon for bonus loot.','COMPANION DAY: Dog care tasks worth triple today.','REST DAY AUTHORIZED: The audience votes for your recovery.','CHAOS MODE: Spin wheel decides everything today.'],
    actions:[{label:'Accept the modifier',id:'accept',primary:true},{label:'Dispute the vote',id:'flee'}],
    onSuccess:()=>{showPtsToast('Modifier active. The audience applauds.');},
    onFail:null,
  },
  {id:'merchant',weight:15,title:'The Merchant',type:'🛒 Merchant Appears',
    flavor:'She has items. She wants coins.\nThe vending machine is open.\nThis offer expires at midnight.',
    system:'LIMITED TIME OFFER. The Merchant has appeared. She does not negotiate.',
    actions:[{label:'Visit the vending machine',id:'shop',primary:true,amber:true},{label:'Keep walking',id:'flee'}],
    onSuccess:null,onFail:null,
  },
  {id:'elite-encounter',weight:15,title:'Elite Encounter',type:'⚔ Elite Encounter',
    flavor:'A previously ignored task has returned.\nIt is angrier now.\nIt remembers being skipped.\nDifficulty: ELEVATED. Reward: SUBSTANTIAL.',
    system:'ELITE ENCOUNTER: This task has been waiting. It has had time to think. Complete it now.',
    actions:[{label:'Face it',id:'accept',primary:true},{label:'Run',id:'flee',danger:true}],
    onSuccess:()=>{awardPoints(30,'Elite Encounter cleared','encounter');awardXP(40,'Elite Encounter');showPtsToast('+30 🪙 Elite cleared!');},
    onFail:()=>{showPtsToast('CURSED TASK APPLIED. It will return.');},
  },
  {id:'edna-patrol',weight:25,title:'Edna Has Filed a Report',type:'🐾 SECURITY INCIDENT',
    flavor:'Edna has detected a threat on the balcony. It is, in her assessment, extremely serious. Complete one task in the next 4 minutes and she will stand down.',
    system:'COMPANION ALERT: Edna is at DEFCON 1. Perimeter unsecured. Threat identified as: wind.',
    timerSeconds:240,
    actions:[{label:'Respond to the incident',id:'start',primary:true},{label:'Let her handle it',id:'flee'}],
    onSuccess:()=>{awardPoints(15,'Edna stood down!','encounter');showPtsToast('+15 🪙 Threat neutralized.');},
    onFail:()=>{showPtsToast('Edna filed an incident report. Three pages.');},
  },
  {id:'kronk-contraband',weight:22,title:'Kronk Has Eaten Something',type:'🦴 INCIDENT REPORT',
    flavor:'Kronk has consumed an unknown object. He seems fine. He is wagging. The object is gone. Complete a task while pretending everything is fine.',
    system:'COMPANION STATUS: Kronk is happy. Do not investigate further.',
    timerSeconds:0,
    actions:[{label:'Everything is fine (spin)',id:'accept',primary:true},{label:'Investigate',id:'flee'}],
    onSuccess:()=>{awardPoints(10,'Everything is fine!','encounter');showPtsToast('+10 🪙 He\'s fine.');},
    onFail:()=>{showPtsToast('You investigated. You regret it.');},
  },
  {id:'shrine',weight:18,title:'Ancient Shrine',type:'✨ DIVINE FAVOR',
    flavor:'A forgotten shrine glows in the dungeon dark. The inscription reads: do one thing, do it now.',
    system:'SHRINE DETECTED: Complete next task for amplified reward.',
    timerSeconds:0,
    actions:[{label:'Make an offering',id:'accept',primary:true},{label:'Walk past',id:'flee'}],
    onSuccess:()=>{awardPoints(12,'Shrine blessed!','encounter');awardXP(20,'Shrine');showPtsToast('+12 🪙 +20 XP');},
    onFail:()=>{showPtsToast('The shrine dims.');},
  },
  {id:'tavern',weight:15,title:'Waypoint',type:'🍺 CRAWLER\'S REST',
    flavor:'A quiet corner. The dungeon continues but it can wait. Take the coins.',
    system:'REST POINT UNLOCKED: Morale maintained. Proceed when ready.',
    timerSeconds:0,
    actions:[{label:'Claim rest bonus',id:'accept',primary:true},{label:'Press on',id:'flee'}],
    onSuccess:()=>{awardPoints(8,'Rest claimed!','encounter');showPtsToast('+8 🪙 Rest taken.');},
    onFail:()=>{showPtsToast('The dungeon respects the hustle.');},
  },
  {id:'floor-trap',weight:12,title:'Pressure Plate',type:'⚠ TRAP DETECTED',
    flavor:'You feel it underfoot. 90 seconds to complete any task or the trap springs.',
    system:'TRAP: Active. Disarm window open. Move.',
    timerSeconds:90,
    actions:[{label:'Disarm it (start timer)',id:'start',primary:true},{label:'Jump back',id:'flee'}],
    onSuccess:()=>{awardPoints(18,'Trap disarmed!','encounter');showPtsToast('+18 🪙 Trap disarmed.');},
    onFail:()=>{showPtsToast('The trap sprung. No coins.');},
  },
];

function maybeShowRandomEncounter(){
  _spinsSinceEncounter++;
  if(_spinsSinceEncounter<3)return false;  // cooldown: min 3 spins between encounters
  if(Math.random()>ENCOUNTER_CHANCE)return false;
  _spinsSinceEncounter=0;  // reset cooldown
  const total=ENCOUNTERS.reduce((a,e)=>a+e.weight,0);
  let r=Math.random()*total,enc=null;
  for(const e of ENCOUNTERS){r-=e.weight;if(r<=0){enc=e;break;}}
  if(!enc)enc=ENCOUNTERS[0];
  showEncounter(enc);return true;
}

function showEncounter(enc){
  activeEncounter={...enc};
  document.getElementById('enc-type').textContent=enc.type;
  document.getElementById('enc-title').textContent=enc.title;
  document.getElementById('enc-flavor').textContent=enc.flavor;
  document.getElementById('enc-system').textContent=enc.system;
  const voteWrap=document.getElementById('enc-vote-options');
  if(enc.voteOptions){
    voteWrap.style.display='flex';
    voteWrap.innerHTML=enc.voteOptions.map((v,i)=>`<div class="vote-option" onclick="selectVote(this,'${v.replace(/'/g,"\\'")}')">${v}</div>`).join('');
  } else voteWrap.style.display='none';
  const timerEl=document.getElementById('enc-timer');
  if(enc.timerSeconds){encTimerSeconds=enc.timerSeconds;timerEl.style.display='block';timerEl.textContent=formatTime(encTimerSeconds);}
  else timerEl.style.display='none';
  const actionsEl=document.getElementById('enc-actions');
  actionsEl.innerHTML=enc.actions.map(a=>`<button class="enc-btn${a.primary?' primary':a.danger?' danger':a.amber?' amber':''}" onclick="handleEncounterAction('${a.id}')">${a.label}</button>`).join('');
  document.getElementById('encounter-overlay').classList.add('show');
}

function selectVote(el,text){
  if(activeEncounter)activeEncounter.chosenVote=text;
  document.querySelectorAll('.vote-option').forEach(v=>v.className='vote-option');
  el.className='vote-option selected';
}

function handleEncounterAction(actionId){
  if(!activeEncounter)return;
  clearInterval(encTimerInterval);
  if(actionId==='start'&&activeEncounter.timerSeconds){
    encTimerInterval=setInterval(()=>{
      encTimerSeconds--;
      const el=document.getElementById('enc-timer');
      if(el)el.textContent=formatTime(encTimerSeconds);
      if(encTimerSeconds<=0){clearInterval(encTimerInterval);closeEncounterOverlay();if(activeEncounter&&activeEncounter.onSuccess)activeEncounter.onSuccess();}
    },1000);
    document.getElementById('enc-actions').innerHTML=`<button class="enc-btn primary" onclick="handleEncounterAction('done')">Done! I caught it ✓</button><button class="enc-btn danger" onclick="handleEncounterAction('fail')">It escaped</button>`;
    return;
  }
  const cb=actionId==='done'||actionId==='accept'?activeEncounter.onSuccess:actionId==='fail'||actionId==='flee'?activeEncounter.onFail:null;
  if(actionId==='shop'){closeEncounterOverlay();showRoom('rewards');return;}
  closeEncounterOverlay();if(cb)cb();
}

function closeEncounterOverlay(){
  document.getElementById('encounter-overlay').classList.remove('show');
  clearInterval(encTimerInterval);activeEncounter=null;
}
function handleEncounterOverlayClick(e){if(e.target===document.getElementById('encounter-overlay'))closeEncounterOverlay();}

/* ─── COMPANION PHOTO SYSTEM ─────────────────────────────────────────────── */
let companionPhotos=load('dr-companion-photos',{edna:null,kronk:null});
let photoEditTarget=null,photoDataPending=null;

function openPhotoModal(companion){
  photoEditTarget=companion;
  const name=companion.charAt(0).toUpperCase()+companion.slice(1);
  document.getElementById('photo-modal-title').textContent=name+' — Choose Portrait';
  document.getElementById('sprite-modal-type').textContent=name+' — Choose Portrait';
  const sprites=companion==='edna'
    ?[{src:CHAR_FACE_EDNA_HAPPY,label:'Happy'},{src:CHAR_FACE_EDNA_GUARD,label:'Guard Mode'},{src:CHAR_FACE_EDNA_CHAOS,label:'Chaos Mode'},{src:CHAR_FACE_EDNA_SIDE_EYE,label:'Side Eye'},{src:CHAR_FACE_EDNA_SLEEPY,label:'Sleepy'},{src:CHAR_FACE_EDNA_ZOOMIES,label:'Zoomies'},
      {src:CHAR_EDNA_BARK,label:'Bark'},{src:CHAR_EDNA_IDLE2,label:'Idle'},{src:CHAR_EDNA_PATROL,label:'Patrol'},{src:CHAR_EDNA_SHIELD,label:'Shield Up'},{src:CHAR_EDNA_SIT,label:'Sit'},{src:CHAR_EDNA_ZOOMIES2,label:'Zoomies 2'}]
    :[{src:CHAR_FACE_KRONK_HAPPY,label:'Happy'},{src:CHAR_FACE_KRONK_EXCITED,label:'Excited'},{src:CHAR_FACE_KRONK_CHAOS,label:'Chaos Mode'},{src:CHAR_FACE_KRONK_FOOD,label:'Food Detected'},{src:CHAR_FACE_KRONK_GUILTY,label:'Guilty'},{src:CHAR_FACE_KRONK_SLEEPY,label:'Sleepy'},
      {src:CHAR_KRONK_BEG,label:'Beg'},{src:CHAR_KRONK_CARRY,label:'Carry All'},{src:CHAR_KRONK_IDLE2,label:'Idle'},{src:CHAR_KRONK_PLAY_BOW,label:'Play Bow'},{src:CHAR_KRONK_SNIFF,label:'Snoot Sniff'},{src:CHAR_KRONK_WIGGLE,label:'Wiggle'}];
  const current=companionPhotos[companion]||'';
  document.getElementById('sprite-grid').innerHTML=sprites.map(s=>`
    <div onclick="selectSprite('${companion}','${s.src}')" style="cursor:pointer;display:flex;flex-direction:column;align-items:center;gap:4px;padding:6px;border-radius:8px;border:2px solid ${current===s.src?'var(--teal)':'transparent'};transition:border .15s;">
      <img src="${s.src}" style="width:72px;height:72px;border-radius:50%;object-fit:cover;">
      <span style="font-size:9px;color:var(--hint);font-family:var(--mono);letter-spacing:.05em;">${s.label}</span>
    </div>`).join('');
  document.getElementById('photo-modal').classList.add('show');
}
function selectSprite(companion,src){
  companionPhotos[companion]=src;
  save('dr-companion-photos',companionPhotos);
  closePhotoModal();
  renderProfile();
}
function closePhotoModal(){document.getElementById('photo-modal').classList.remove('show');photoEditTarget=null;photoDataPending=null;}
function handlePhotoModalClick(e){if(e.target===document.getElementById('photo-modal'))closePhotoModal();}
function handlePhotoFile(e){
  const file=e.target.files[0];if(!file)return;
  const reader=new FileReader();
  reader.onload=ev=>{
    photoDataPending=ev.target.result;
    const preview=document.getElementById('photo-preview');
    document.getElementById('photo-preview-img').src=photoDataPending;
    preview.style.display='block';
  };
  reader.readAsDataURL(file);
}
function saveCompanionPhoto(){
  if(!photoEditTarget)return;
  const url=document.getElementById('photo-url-input').value.trim();
  companionPhotos[photoEditTarget]=photoDataPending||url||null;
  save('dr-companion-photos',companionPhotos);
  closePhotoModal();renderProfile();
}

function renderAvoidance(){
  const wrap=document.getElementById('avoidance-wrap'),list=document.getElementById('avoidance-list');if(!wrap||!list)return;
  const avoided=[];
  ['clean','admin','mental','bonus','priority'].forEach(cat=>{
    const c=wheel[cat];if(!c)return;
    [...(c.standalone||[]),...(c.projects||[]).flatMap(p=>p.tasks||[])].forEach(t=>{
      const s=wheelSkips[t.id]||0;if(s>=3)avoided.push({...t,skips:s,_cat:cat});
    });
  });
  avoided.sort((a,b)=>b.skips-a.skips);
  if(!avoided.length){wrap.style.display='none';return;}
  wrap.style.display='block';
  list.innerHTML=avoided.map(t=>`
    <div style="display:flex;align-items:center;gap:10px;padding:10px 12px;background:var(--surface);border:0.5px solid rgba(255,92,92,0.25);border-radius:var(--radius-sm);margin-bottom:6px;">
      <div style="flex:1;"><div style="font-size:13px;color:var(--text);">${t.name}</div><div style="font-size:10px;color:var(--red);">Skipped ${t.skips}×</div></div>
      <button style="font-size:11px;padding:4px 10px;border-radius:99px;border:0.5px solid var(--teal);background:none;color:var(--teal);font-family:var(--mono);cursor:pointer;" onclick="forceSpinTask('${t.id}','${t._cat}')">Do it now</button>
      <button style="font-size:11px;padding:4px 10px;border-radius:99px;border:0.5px solid var(--border);background:none;color:var(--muted);font-family:var(--mono);cursor:pointer;" onclick="clearSkip('${t.id}')">Clear</button>
    </div>`).join('');
}

function forceSpinTask(id,cat){
  const c=wheel[cat];if(!c)return;
  const task=[...(c.standalone||[]),...(c.projects||[]).flatMap(p=>p.tasks||[])].find(t=>t.id===id);
  if(task){showResult(task);document.getElementById('spin-result').scrollIntoView({behavior:'smooth'});}
}
function clearSkip(id){delete wheelSkips[id];save('dr-wheel-skips',wheelSkips);renderAvoidance();}
function clearAllSkips(){wheelSkips={};save('dr-wheel-skips',wheelSkips);renderAvoidance();}

function toggleTaskManager(){
  const tm=document.getElementById('task-manager');
  tm.style.display=tm.style.display==='none'?'block':'none';
}

function togglePin(id){
  if(wheelPinned[id])delete wheelPinned[id];else wheelPinned[id]=true;
  save('dr-wheel-pinned',wheelPinned);renderTaskManager();
}

function renderTaskManager(){
  const list=document.getElementById('tm-list'),lbl=document.getElementById('tm-cat-label');
  if(!list)return;
  const catNames={clean:'🧹 Clean',admin:'📋 Admin',mental:'🧠 Mental',bonus:'💪 Bonus',priority:'🔥 Priority'};
  if(lbl)lbl.textContent='Editing: '+catNames[spinCat];
  updateBulkImportTargets();

  if(spinCat==='priority'){
    const pool=getPriorityPool();
    list.innerHTML=`<div style="font-size:11px;color:var(--muted);line-height:1.7;margin-bottom:12px;">Pulls tasks skipped 3+ times and manually pinned tasks from any category. Pin tasks via the 📌 button in their category manager.</div>
      ${pool.length?pool.map(t=>`
        <div style="display:flex;align-items:center;gap:8px;padding:10px 12px;background:var(--surface);border:0.5px solid rgba(255,107,53,0.2);border-radius:var(--radius-sm);margin-bottom:6px;">
          <div style="flex:1;font-size:13px;color:var(--text);">${t.name}</div>
          <div style="font-size:10px;color:var(--muted);">${(wheelSkips[t.id]||0)>=3?'⚠ '+wheelSkips[t.id]+'× skipped':wheelPinned[t.id]?'📌 pinned':''}</div>
        </div>`).join('')
      :'<div style="font-size:12px;color:var(--hint);text-align:center;padding:16px;">No priority tasks — skip things 3× or pin them to see them here.</div>'}`;
    return;
  }

  const cat=wheel[spinCat]||{standalone:[],projects:[]};

  const taskRow=(t,nameChange,durChange,onDel)=>{
    const avail=isAvailable(t);
    const justDone=sessionDone.has(t.id);
    if(!avail&&!t.repeat&&t.cooldown!==0)return''; // one-time done — hide
    const cd=cdLeft(t);
    const cdLabel=t.cooldown===0
      ?justDone
        ?`<span style="font-size:10px;color:var(--teal);white-space:nowrap;">✓ done</span>`
        :`<span style="font-size:10px;color:var(--teal);white-space:nowrap;">always</span>`
      :(!avail&&t.repeat?`<span class="tm-cooldown-label">in ${cd}d</span>`:'');
    const isPinned=!!wheelPinned[t.id];
    const rowCls=(!avail&&t.cooldown!==0)?'tm-row tm-cooldown':'tm-row';
    return`<div class="${rowCls}">
      <input type="text" value="${t.name.replace(/"/g,'&quot;')}" ${(!avail&&t.cooldown!==0)?'disabled':''} onchange="${nameChange}" style="flex:2;min-width:80px;"/>
      ${t.cooldown===0?'':`<select class="cat-select" ${(!avail&&t.cooldown!==0)?'disabled':''} onchange="${durChange}">
        <option value="5"${t.dur===5?' selected':''}>5m</option>
        <option value="10"${t.dur===10?' selected':''}>10m</option>
        <option value="15"${t.dur===15?' selected':''}>15m</option>
        <option value="20"${t.dur===20?' selected':''}>20m</option>
      </select>`}
      ${cdLabel}
      <button class="tm-pin-btn${isPinned?' pinned':''}" onclick="togglePin('${t.id}')" title="${isPinned?'Unpin':'Pin to Priority wheel'}">📌</button>
      ${avail&&!justDone?`<button style="font-size:10px;padding:3px 8px;border-radius:99px;border:0.5px solid var(--teal);background:none;color:var(--teal);font-family:var(--mono);cursor:pointer;white-space:nowrap;" onclick="markDoneOutsideSpin('${t.id}')">✓</button>`:''}
      <button class="tm-del" onclick="${onDel}">×</button>
    </div>`;
  };

  let html=`<div style="font-size:10px;color:var(--hint);letter-spacing:0.08em;text-transform:uppercase;margin-bottom:8px;">Standalone tasks</div>`;
  (cat.standalone||[]).forEach((t,i)=>{
    html+=taskRow(t,
      `wheel['${spinCat}'].standalone[${i}].name=this.value`,
      `wheel['${spinCat}'].standalone[${i}].dur=parseInt(this.value)`,
      `removeStandaloneTask('${spinCat}',${i})`);
  });
  html+=`<button class="tm-add" onclick="addStandaloneTask('${spinCat}')">+ add standalone task</button>`;

  (cat.projects||[]).forEach((proj,pi)=>{
    html+=`<div style="font-size:10px;color:var(--hint);letter-spacing:0.08em;text-transform:uppercase;margin:12px 0 8px;display:flex;align-items:center;justify-content:space-between;">
      <span>Project: ${proj.name}</span>
      <button class="tm-del" onclick="removeProject('${spinCat}',${pi})" style="font-size:12px;">× remove</button>
    </div>`;
    (proj.tasks||[]).forEach((t,ti)=>{
      html+=taskRow(t,
        `wheel['${spinCat}'].projects[${pi}].tasks[${ti}].name=this.value`,
        `wheel['${spinCat}'].projects[${pi}].tasks[${ti}].dur=parseInt(this.value)`,
        `removeProjectTask('${spinCat}',${pi},${ti})`);
    });
    html+=`<button class="tm-add" onclick="addProjectTask('${spinCat}',${pi})">+ add task to ${proj.name}</button>`;
  });

  html+=`<button class="tm-save" onclick="saveWheel()" style="margin-top:12px;">Save all changes</button>`;
  list.innerHTML=html;
}

function bulkImport(){
  const raw=document.getElementById('bulk-import-input').value.trim();
  const target=document.getElementById('bulk-import-target').value;
  const result=document.getElementById('bulk-import-result');
  if(!raw)return;let count=0;
  raw.split('\n').filter(l=>l.trim()).forEach(line=>{
    const parts=line.split('|').map(p=>p.trim());
    const name=parts[0];if(!name)return;
    const task={id:'t_'+Date.now()+'_'+Math.random().toString(36).slice(2,6),name,dur:parseInt(parts[1])||10,repeat:parts[2]?parts[2].toLowerCase().includes('repeat'):true,cooldown:parseInt(parts[3])||3};
    if(target==='standalone'){if(!wheel[spinCat].standalone)wheel[spinCat].standalone=[];wheel[spinCat].standalone.push(task);}
    else{const proj=(wheel[spinCat].projects||[]).find(p=>p.id===target);if(proj){if(!proj.tasks)proj.tasks=[];proj.tasks.push(task);}}
    count++;
  });
  save('dr-wheel',wheel);document.getElementById('bulk-import-input').value='';
  result.textContent=`✓ Imported ${count} task${count===1?'':'s'}`;result.style.display='block';
  setTimeout(()=>result.style.display='none',3000);
  renderTaskManager();refreshWheel();
}

function updateBulkImportTargets(){
  const sel=document.getElementById('bulk-import-target');if(!sel)return;
  const cat=wheel[spinCat]||{};
  sel.innerHTML='<option value="standalone">Standalone tasks</option>';
  (cat.projects||[]).forEach(p=>{const o=document.createElement('option');o.value=p.id;o.textContent=p.name;sel.appendChild(o);});
}

function addProject(){
  const input=document.getElementById('new-project-input'),name=input.value.trim();
  if(!name)return;
  if(!wheel[spinCat].projects)wheel[spinCat].projects=[];
  wheel[spinCat].projects.push({id:'p_'+Date.now(),name,tasks:[]});
  input.value='';save('dr-wheel',wheel);updateProjectDropdown();renderTaskManager();
}
function addStandaloneTask(cat){if(!wheel[cat].standalone)wheel[cat].standalone=[];wheel[cat].standalone.push({id:'t_'+Date.now(),name:'New task',dur:10,repeat:true,cooldown:3});renderTaskManager();drawWheel();}
function removeStandaloneTask(cat,i){wheel[cat].standalone.splice(i,1);save('dr-wheel',wheel);renderTaskManager();refreshWheel();}
function addProjectTask(cat,pi){if(!wheel[cat].projects[pi].tasks)wheel[cat].projects[pi].tasks=[];wheel[cat].projects[pi].tasks.push({id:'t_'+Date.now(),name:'New task',dur:10,repeat:true,cooldown:3});renderTaskManager();}
function removeProjectTask(cat,pi,ti){wheel[cat].projects[pi].tasks.splice(ti,1);save('dr-wheel',wheel);renderTaskManager();refreshWheel();}
function removeProject(cat,pi){if(confirm('Remove this project and all its tasks?')){wheel[cat].projects.splice(pi,1);save('dr-wheel',wheel);updateProjectDropdown();renderTaskManager();refreshWheel();}}
function saveWheel(){save('dr-wheel',wheel);refreshWheel();renderTaskManager();}

/* ─── COACH ─────────────────────────────────────────────────────────────── */
function buildUrl(p){return'https://claude.ai/new?q='+encodeURIComponent(p);}

function getCoachCtx(){
  const ti=new Date().getDay(),sc=getScheduleFor(ti),allT=sc.reduce((a,s)=>a.concat(s.tasks),[]),data=getDayData(ti);
  const done=allT.filter(t=>data[t.id]).map(t=>t.name),pending=allT.filter(t=>!data[t.id]).map(t=>t.name);
  const dogData=getDogDayData(),dt=dogTasks.shared||{};
  const dogDone=[...(dt.morning||[]),...(dt.evening||[])].filter(t=>dogData[t.id]).map(t=>t.name);
  const{spinDone,dogMentalDone}=getBonusData();
  return{ti,done,pending,dogDone,pct:dayPct(ti),streak:calcStreak(),bonusCount:spinDone.length+dogMentalDone.length};
}

function getFullCtxText(){
  const{ti,done,pending,dogDone,pct,streak,bonusCount}=getCoachCtx();
  return`Daily Routine App — Full Context
App: ksmudge3-cell.github.io/DailyRoutine (single index.html, Supabase sync)
My schedule: Wake 5:30 AM → gym → shower+skincare → morning meds → breakfast → leave 7:15 → work 8–4:30 → home before 5 → evening wind-down → evening meds → bed by 10 PM
Dogs: Edna and Kronk — daily feeds, walks, mental health moments, grooming tracker + monthly prevention tracker
Therapist has recommended using Claude as a support tool. I do weekly GAD-7/PHQ-9 check-ins here.
App tabs: Today (routine), Dogs, Spin (task wheel — Clean/Admin/Mental/Bonus/Priority), Inbox, Shopping, Coach

TODAY — ${DAYS[ti]} ${isWeekend(ti)?'(Weekend)':'(Weekday)'}
Completion: ${pct}% · ${done.length} done, ${pending.length} pending · ${streak}-day streak
Done: ${done.join(', ')||'nothing yet'}
Pending: ${pending.join(', ')||'all done'}
Dog care done: ${dogDone.join(', ')||'none yet'}
Bonus tasks today: ${bonusCount}`;
}

function getPrompt(type){
  const{ti,done,pending,dogDone,pct,streak}=getCoachCtx();
  const ctx=`My routine context for ${DAYS[ti]}:\n- ${pct}% done. Done: ${done.join(', ')||'nothing yet'}. Pending: ${pending.join(', ')||'all done'}.\n- Dog care: ${dogDone.join(', ')||'none yet'}. Streak: ${streak} days.\n\n`;
  return({checkin:ctx+'Quick coaching check-in based on where I am today. Direct and practical.',stuck:ctx+"I'm struggling to stay consistent. What's the most likely reason and one fix?",morning:ctx+'Quick motivational push for my morning routine. Keep it short.',evening:ctx+'Help me reflect on today and set up tomorrow.',habit:ctx+'Which habit should I nail first and how do I make it automatic?'})[type]||ctx+'Coach me.';
}

// Stored outside DOM so special chars never corrupt innerHTML
let _coachSummary='', _coachFullCtx='';
function copyCoachSummary(btn){copyCb(btn,_coachSummary);}
function copyCoachFullCtx(btn){copyCb(btn,_coachFullCtx);}



function copyCb(btn,text){
  navigator.clipboard.writeText(text).then(()=>{const o=btn.textContent;btn.textContent='Copied!';setTimeout(()=>btn.textContent=o,2000);}).catch(()=>prompt('Copy:',text));
}

/* ─── INBOX ─────────────────────────────────────────────────────────────── */
function addInboxItem(){const inp=document.getElementById('inbox-input'),t=inp.value.trim();if(!t)return;inbox.unshift({id:'i_'+Date.now(),text:t,added:Date.now()});inp.value='';save('dr-inbox',inbox);renderInbox();}
function deleteInboxItem(id){inbox=inbox.filter(i=>i.id!==id);save('dr-inbox',inbox);renderInbox();}
function clearAllInbox(){if(!inbox.length)return;if(!confirm('Clear all inbox items?'))return;inbox=[];save('dr-inbox',inbox);renderInbox();}

function renderInbox(){
  const list=document.getElementById('inbox-list'),sortBtn=document.getElementById('inbox-sort-btn'),clearBtn=document.getElementById('inbox-clear-btn'),navBtn=document.getElementById('inbox-nav-btn');
  if(!list)return;
  if(!inbox.length){
    list.innerHTML='<div class="inbox-empty">Nothing here yet.<br>Add anything on your mind.</div>';
    if(sortBtn)sortBtn.style.display='none';
    if(clearBtn)clearBtn.style.display='none';
    navBtn.querySelector('.nav-icon').innerHTML='&#9632;';
    return;
  }
  list.innerHTML=inbox.map(item=>`
    <div class="inbox-item">
      <div style="flex:1"><div class="inbox-item-text">${item.text}</div>
      <div class="inbox-item-time">${new Date(item.added).toLocaleDateString('en-US',{month:'short',day:'numeric'})}, ${new Date(item.added).toLocaleTimeString('en-US',{hour:'numeric',minute:'2-digit'})}</div></div>
      <button class="inbox-del" onclick="deleteInboxItem('${item.id}')">×</button>
    </div>`).join('');
  if(sortBtn)sortBtn.style.display='flex';
  if(clearBtn)clearBtn.style.display='block';
  navBtn.querySelector('.nav-icon').innerHTML='&#9632;<span class="inbox-count">'+inbox.length+'</span>';
}

function copyInbox(btn){
  const text=`Let's sort my inbox — paste into our existing conversation, not a new chat.\n\nI have ${inbox.length} item${inbox.length===1?'':'s'}:\n\n${inbox.map((i,n)=>`${n+1}. ${i.text}`).join('\n')}\n\nFor each: shopping list, wheel category, daily routine, or idea to save? One-time or repeating? Estimated time?`;
  navigator.clipboard.writeText(text).then(()=>{const o=btn.textContent;btn.textContent='Copied! Paste into your Claude chat ↑';setTimeout(()=>btn.textContent=o,4000);}).catch(()=>prompt('Copy:',text));
}

/* ─── SHOP ──────────────────────────────────────────────────────────────── */
function addShopItem(){const inp=document.getElementById('shop-input'),t=inp.value.trim();if(!t)return;shopItems.push({id:'s_'+Date.now(),name:t,cat:shopCat==='all'?'other':shopCat,checked:false});inp.value='';save('dr-shop',shopItems);renderShop();}
function toggleShopItem(id){const item=shopItems.find(i=>i.id===id);if(item){item.checked=!item.checked;save('dr-shop',shopItems);renderShop();}}
function deleteShopItem(id){shopItems=shopItems.filter(i=>i.id!==id);save('dr-shop',shopItems);renderShop();}
function clearCheckedShop(){shopItems=shopItems.filter(i=>!i.checked);save('dr-shop',shopItems);renderShop();}
function clearAllShop(){if(confirm('Clear all items?')){shopItems=[];save('dr-shop',shopItems);renderShop();}}
function setShopCat(cat,el){shopCat=cat;document.querySelectorAll('#shop-cat-tabs .stab').forEach(b=>b.classList.remove('active'));el.classList.add('active');renderShop();}
function changeShopCat(id,cat){const item=shopItems.find(i=>i.id===id);if(item){item.cat=cat;save('dr-shop',shopItems);renderShop();}}
function renderShop(){
  const list=document.getElementById('shop-list');if(!list)return;
  const filtered=(shopCat==='all'?shopItems:shopItems.filter(i=>i.cat===shopCat)).sort((a,b)=>a.checked-b.checked);
  if(!filtered.length){list.innerHTML='<div class="inbox-empty">Nothing here yet.</div>';return;}
  list.innerHTML=filtered.map(item=>`
    <div class="shop-item${item.checked?' checked':''}">
      <div class="shop-check" onclick="toggleShopItem('${item.id}')">${item.checked?'✓':''}</div>
      <span class="shop-name">${item.name}</span>
      <select class="cat-select" onchange="changeShopCat('${item.id}',this.value)">
        <option value="grocery"${item.cat==='grocery'?' selected':''}>Grocery</option>
        <option value="household"${item.cat==='household'?' selected':''}>House</option>
        <option value="pharmacy"${item.cat==='pharmacy'?' selected':''}>Pharmacy</option>
        <option value="other"${item.cat==='other'?' selected':''}>Other</option>
      </select>
      <button class="shop-del" onclick="deleteShopItem('${item.id}')">×</button>
    </div>`).join('');
}

/* ─── DCC CONTENT LIBRARY ────────────────────────────────────────────────── */
const DCC={
  donut:{
    morning:["The floor won't clear itself, Crawler. Rise.","You are late. The dungeon noticed. I noticed.","Another day. Try not to embarrass us both.","The audience is watching. Do not disappoint them. Again."],
    taskDone:["One room cleared. Many remain. Do not celebrate yet.","Acceptable. Barely.","The dungeon acknowledges your effort. I remain cautiously unimpressed.","You completed a task. This is the bare minimum expected of a Crawler."],
    floorCleared:["Floor cleared. The audience erupts. I allow it.","You have exceeded my minimal expectations. Savor this.","The floor boss has fallen. Kronk is vibrating. I am composed.","Acceptable performance. I have seen better. I have seen much worse."],
    streak7:["Seven floors survived. The dungeon is beginning to take you seriously. I always have.","You have not quit. This is more than most manage."],
    streak30:["Thirty days. Remarkable. I may have mentioned you to my associates.","I have told the others about you. They were skeptical. I was not. I am rarely wrong."],
    missedDay:["You triggered a trap. Disappointing but not surprising.","A stumble. Get up. The cameras are still rolling.","Even Crawler Carl had bad days. He got up. So will you."],
    encouragement:["One task. Just one. The floor clears one room at a time.","Edna believes in you. Kronk believes in everything. I am choosing to believe in you today.","You are struggling. This is known. Get up anyway.","The dungeon does not care about your feelings. I, however, note them."],
    redeem:["You have earned this. Do not waste it.","Tome of Infinite Knowledge. Finally some culture in this dungeon.","Victory Feast for the party. The audience finds this endearing.","Elixir of Alertness. A wise choice. Proceed.","Kronk's Forbidden Box has been authorized. He will eat part of it. This is known."],
    general:["The audience is watching. Most of them are rooting for you.","You are performing adequately, Crawler.","Do not ruin it."],
  },
  system:{
    floorStart:(pct,rooms,streak)=>`FLOOR STATUS: ${rooms} rooms to clear. Current streak: ${streak} floors survived. Proceed.`,
    taskDone:(name)=>`ROOM CLEARED: ${name}. Crawler Coins deposited.`,
    floorCleared:`FLOOR CLEARED. All rooms secured. Loot distributed. The audience approves.`,
    streakAlert:(n)=>`NOTICE: ${n}-floor streak detected. Buff active. Do not squander it.`,
    missedDay:`TRAP TRIGGERED: Floor incomplete. Debuff applied. The dungeon has noted this.`,
    lowProgress:(pct)=>`WARNING: Floor ${pct}% cleared. Current pace: insufficient. The boss chamber approaches.`,
    bonusObjective:["BONUS OBJECTIVE DETECTED: Tell Edna she is a good girl.","BONUS OBJECTIVE DETECTED: Kronk requires zoomies. Deploy immediately.","BONUS OBJECTIVE DETECTED: Drink water before checking your phone.","BONUS OBJECTIVE DETECTED: Go outside. Five minutes. Non-negotiable.","BONUS OBJECTIVE DETECTED: Text someone you haven't spoken to in 30 days."],
    achievement:(name)=>`ACHIEVEMENT UNLOCKED: ${name}`,
    buffApplied:(name)=>`BUFF APPLIED: ${name}. The dungeon acknowledges your momentum.`,
    debuffApplied:(name)=>`DEBUFF APPLIED: ${name}. The dungeon has noted your performance.`,
    broadcast:`SYSTEM NOTICE: Your crawler data is being broadcast to 847,000 alien viewers. They are rooting for you. Most of them.`,
  },
  weeklyBossNames:["The Mounting Correspondence","The Accumulated Tabs of Doom","The Unmade Bed Formation","The Forgotten Errand Cluster","The Unread Backlog Sovereign","The Persistent Laundry Pile","The Ignored Notification Swarm","The Creeping Administrative Fog","The Ambient Procrastination Mass","The Refrigerator Situation","The Monday Accumulation","The Unfinished Business Formation","The Reply That Never Came","The Lingering Task Pile"],
  getWeeklyBoss(){const d=new Date();const week=Math.floor((d.getTime()/86400000+4)/7);return this.weeklyBossNames[week%this.weeklyBossNames.length];},
  getRandom(arr){return arr[~~(Math.random()*arr.length)];},
};

/* ─── XP SYSTEM ──────────────────────────────────────────────────────────── */
const XP_LEVELS=[
  {level:1,xp:0,title:'Freshly Fallen Crawler'},
  {level:2,xp:100,title:'Survived the First Floor'},
  {level:3,xp:250,title:'Probably Not a Fluke'},
  {level:4,xp:500,title:'The Dogs Believe in You'},
  {level:5,xp:1000,title:'Warmed Up'},
  {level:8,xp:2500,title:'On Fire (Controlled Burn)'},
  {level:10,xp:5000,title:'Floor Veteran'},
  {level:12,xp:8000,title:'Boss Slayer'},
  {level:15,xp:12000,title:'Legendary Pace'},
  {level:20,xp:20000,title:"Carl's Emotional Support Human"},
  {level:25,xp:35000,title:'The Audience Knows Your Name'},
  {level:30,xp:50000,title:'Donut Acknowledges You Publicly'},
];

const XP_PTS={task:5,dogTask:8,spinTask:10,dayComplete:25,streak7:50,streak30:200,weeklyBoss:100};

let xpState=load('dr-xp',{totalXP:0,level:1,equippedTitle:null,unlockedTitles:['Freshly Fallen Crawler'],companionXP:{edna:0,kronk:0}});

function getLevelInfo(xp){
  let current=XP_LEVELS[0];
  for(const l of XP_LEVELS){if(xp>=l.xp)current=l;else break;}
  const idx=XP_LEVELS.indexOf(current);
  const next=XP_LEVELS[idx+1]||null;
  return{...current,next,progress:next?Math.round((xp-current.xp)/(next.xp-current.xp)*100):100};
}

function awardXP(xp,label){
  xpState.totalXP=(xpState.totalXP||0)+xp;
  const info=getLevelInfo(xpState.totalXP);
  // Check for level up
  if(info.level>xpState.level){
    xpState.level=info.level;
    if(!xpState.unlockedTitles)xpState.unlockedTitles=[];
    if(!xpState.unlockedTitles.includes(info.title))xpState.unlockedTitles.push(info.title);
    showPtsToast(`⚡ LEVEL UP — ${info.title}`);
  }
  save('dr-xp',xpState);
}

function getEquippedTitle(){return xpState.equippedTitle||getLevelInfo(xpState.totalXP||0).title;}

function isComplianceRisk(){
  const today=new Date();
  const todayDay=today.getDay();
  // If today IS Sunday and pill box already done → cleared
  if(todayDay===0){
    const tk=`${today.getFullYear()}-${today.getMonth()}-${today.getDate()}`;
    if(state[tk]?.['sunday-pillbox']) return false;
  }
  // Find most recent past Sunday
  const days=todayDay===0?7:todayDay;
  const ls=new Date(today);ls.setDate(today.getDate()-days);
  const lk=`${ls.getFullYear()}-${ls.getMonth()}-${ls.getDate()}`;
  const lsData=state[lk]||{};
  // Only apply risk if there was app activity that Sunday
  const hasActivity=Object.keys(lsData).some(k=>!k.endsWith('_ts'));
  if(!hasActivity)return false;
  return !lsData['sunday-pillbox'];
}
/* ─── BUFFS & DEBUFFS ENGINE ─────────────────────────────────────────────── */
function getActiveBuffs(){
  const todayIdx=new Date().getDay();
  const tKey=todayStr();
  const qState=qualityState[tKey]||{};
  const slots={};

  // One slot per category. Debuffs beat buffs. Food is latest-wins.
  function setSlot(cat,effect){
    const cur=slots[cat];
    if(!cur){slots[cat]=effect;return;}
    if(cat==='food'){slots[cat]=effect;return;}  // food: latest meal wins
    if(effect.type==='debuff'){slots[cat]=effect;return;}  // debuff overwrites buff
    if(cur.type==='buff'){slots[cat]=effect;}  // buff upgrades buff
  }

  // STREAK category
  const streak=calcStreak();
  if(streak>=30)setSlot('streak',{id:'legendary-pace',label:'Legendary Pace 🏆',type:'buff'});
  else if(streak>=7)setSlot('streak',{id:'on-fire',label:'On Fire 🔥',type:'buff'});
  else if(streak>=3)setSlot('streak',{id:'warmed-up',label:'Warmed Up',type:'buff'});

  // Task quality → category effect map
  const effectMap={
    'wakeup':   q=>q==='purple'||q==='green'?{cat:'wake',id:'early-riser',label:'Early Riser',type:'buff'}:
                   q==='yellow'||q==='red'  ?{cat:'wake',id:'sluggish',label:'Sluggish',type:'debuff'}:null,
    'gym':      q=>q==='purple'||q==='green'?{cat:'movement',id:'combat-ready',label:'Combat Ready',type:'buff'}:
                   q==='red'               ?{cat:'movement',id:'undertrained',label:'Undertrained',type:'debuff'}:null,
    'work':     q=>q==='purple'            ?{cat:'focus',id:'hyperfocused',label:'Hyperfocused',type:'buff'}:null,
    'meds-am':  q=>q==='green'             ?{cat:'meds',id:'optimal',label:'Optimal',type:'buff'}:
                   q==='yellow'||q==='red' ?{cat:'meds',id:'foggy-crawler',label:'Foggy Crawler',type:'debuff'}:null,
    'meds-pm':  q=>q==='green'             ?{cat:'meds',id:'optimal',label:'Optimal',type:'buff'}:
                   q==='yellow'||q==='red' ?{cat:'meds',id:'foggy-crawler',label:'Foggy Crawler',type:'debuff'}:null,
    'winddown': q=>q==='purple'||q==='green'?{cat:'sleep',id:'rested',label:'Rested',type:'buff'}:
                   q==='yellow'||q==='red' ?{cat:'screen',id:'doomscrolling',label:'Doomscrolling',type:'debuff'}:null,
    'sleep':    q=>q==='yellow'            ?{cat:'sleep',id:'sleep-deprived',label:'Sleep Deprived',type:'debuff'}:
                   q==='red'               ?{cat:'sleep',id:'sleep-deprived-severe',label:'Sleep Deprived (Severe)',type:'debuff'}:null,
  };
  for(const[taskId,quality]of Object.entries(qState)){
    const fn=effectMap[taskId];
    if(fn){const eff=fn(quality);if(eff)setSlot(eff.cat,{id:eff.id,label:eff.label,type:eff.type});}
  }

  // FOOD: determined by today's meal quality (latest-wins via setSlot above handles it)
  // But calculate separately for clarity
  const meals=['breakfast','dinner','work'];
  const proper=meals.filter(t=>{const q=qState[t];return q==='purple'||q==='green';}).length;
  const skipped=meals.filter(t=>qState[t]==='red').length;
  if(proper>=3)slots.food={id:'well-fed',label:'Well Fed',type:'buff'};
  else if(proper>=1)slots.food={id:'fueled',label:'Fueled',type:'buff'};
  else if(skipped>=1)slots.food={id:'running-on-empty',label:'Running on Empty',type:'debuff'};

  // DISTRACTED: 3+ red tasks today
  const sc=getScheduleFor(todayIdx);
  const allIds=sc.reduce((a,s)=>a.concat(s.tasks.map(t=>t.id)),[]);
  if(allIds.filter(id=>qState[id]==='red').length>=3)
    setSlot('focus',{id:'distracted',label:'Distracted',type:'debuff'});

  // INBOX overload
  if(inbox.length>=5)setSlot('comms',{id:'cursed-inbox',label:'Cursed Inbox 📬',type:'debuff'});

  // CARRY-FORWARD from yesterday: sleep + screen persist
  const yDate=new Date();yDate.setDate(yDate.getDate()-1);
  const yKey=`${yDate.getFullYear()}-${yDate.getMonth()}-${yDate.getDate()}`;
  const yQ=qualityState[yKey]||{};
  if(!slots.sleep){
    if(yQ.sleep==='yellow')setSlot('sleep',{id:'sleep-deprived',label:'Sleep Deprived',type:'debuff'});
    else if(yQ.sleep==='red')setSlot('sleep',{id:'sleep-deprived-severe',label:'Sleep Deprived (Severe)',type:'debuff'});
  }
  if(!slots.screen){
    if(yQ.winddown==='yellow'||yQ.winddown==='red')
      setSlot('screen',{id:'doomscrolling',label:'Doomscrolling',type:'debuff'});
  }

  // FLOOR CLEARED
  if(dayPct(todayIdx)===100)setSlot('floor',{id:'floor-cleared',label:'Floor Cleared ⚔',type:'buff'});
  
  // COMPLIANCE RISK — Sunday pill box missed last week
  if(isComplianceRisk()){
    setSlot('compliance',{id:'compliance-risk',label:'Compliance Risk ⚠',type:'debuff'});
    // Upgrade Foggy Crawler → Severe when compliance risk is active
    if(slots.meds?.id==='foggy-crawler')
      slots.meds={id:'foggy-crawler-severe',label:'Foggy Crawler (Severe)',type:'debuff'};
  }

  // FLOOR COLLAPSE debuff carry-forward
  const _c=collapseState.active;
  if(_c&&_c.applyDate===todayStr()){
    const _done=Object.entries(state[todayStr()]||{}).filter(([k,v])=>v&&!k.endsWith('_ts')).length;
    const _cleared=(_c.type==='structural'&&_done>=1)||(_c.type==='heavy'&&_done>=3);
    if(!_cleared)setSlot('collapse',{id:_c.type+'-collapse',label:_c.label,type:'debuff'});
  }

  return Object.values(slots).filter(Boolean);
}

function renderStatusBar(){
  const el=document.getElementById('status-effects-bar');if(!el)return;
  const effects=getActiveBuffs();
  const dc=effects.filter(e=>e.type==='debuff').length;
  let extra=[];
  if(dc>=4) extra=[{id:'recovery',label:'⚕ RECOVERY MODE — streak protected',type:'recovery'}];
  else if(dc>=3) extra=[{id:'overload',label:'⚠ DEBUFF OVERLOAD',type:'overload'}];
  const all=[...effects,...extra];
  if(!all.length){el.innerHTML='';return;}
  el.innerHTML=`<div class="status-bar">${all.map(e=>`<span class="status-chip ${e.type}">${e.label}</span>`).join('')}</div>`;
}

/* ─── SYSTEM GREETING ON TODAY ───────────────────────────────────────────── */
function renderSystemGreeting(){
  const el=document.getElementById('system-greeting');if(!el)return;
  if(window._skipGreeting)return;  // skip during orb cycles
  const streak=calcStreak();
  const pct=dayPct(new Date().getDay());
  const sc=getScheduleFor(new Date().getDay());
  const total=sc.reduce((a,s)=>a.concat(s.tasks),[]).length;
  let sysMsg='',donutMsg='';

  if(pct===100){
    sysMsg=DCC.system.floorCleared;
    donutMsg=DCC.getRandom(DCC.donut.floorCleared);
  } else if(pct===0){
    sysMsg=DCC.system.floorStart(pct,total,streak);
    donutMsg=DCC.getRandom(DCC.donut.morning);
  } else if(pct<50){
    sysMsg=DCC.system.lowProgress(pct);
    donutMsg=DCC.getRandom(DCC.donut.encouragement);
  } else {
    sysMsg=`FLOOR PROGRESS: ${pct}% cleared. ${total - Math.round(total*pct/100)} rooms remain. The boss chamber approaches.`;
    donutMsg=DCC.getRandom(DCC.donut.taskDone);
  }
  if(streak>0&&streak%7===0)sysMsg=DCC.system.streakAlert(streak);

  el.innerHTML=`
    <div class="system-msg"><div class="sys-body">${sysMsg}</div></div>
    <div class="donut-msg-wrap"><span class="donut-signature">Princess Donut:</span><p class="donut-msg">${donutMsg}</p></div>`;
}

/* ─── CRAWLER PROFILE RENDERER ───────────────────────────────────────────── */
function renderFloorCountdown(){
  const el=document.getElementById('floor-condition-banner');if(!el)return;
  const active=!!(floorCondition);
  el.classList.toggle('active', active);
  if(!active){el.innerHTML='';return;}
  const sc=getScheduleFor(selectedDay);
  const data=getDayData(selectedDay);
  const allT=sc.reduce((a,s)=>a.concat(s.tasks),[]);
  const unchecked=allT.filter(t=>!data[t.id]).length;
  if(unchecked===0){el.textContent='';el.className='floor-countdown';return;}
  // Only show countdown for today
  if(selectedDay!==new Date().getDay()){el.textContent='';return;}
  const now=new Date();
  const midnight=new Date(now);midnight.setHours(24,0,0,0);
  const msLeft=midnight-now;
  const hLeft=Math.floor(msLeft/3600000);
  const mLeft=Math.floor((msLeft%3600000)/60000);
  const label=hLeft>0?`${hLeft}h ${mLeft}m`:`${mLeft}m`;
  let cls='floor-countdown';
  if(msLeft<600000)cls+=' final';
  else if(msLeft<1800000)cls+=' critical';
  else if(msLeft<3600000)cls+=' alert';
  else if(msLeft<7200000)cls+=' warn';
  el.className=cls;
  el.textContent=`⏱ ${label} until floor collapse`;
}

function renderRecoveryMode(){
  const el=document.getElementById('recovery-mode-banner');if(!el)return;
  const active=isRecoveryMode();
  el.classList.toggle('active', active);
  if(!active){el.innerHTML='';return;}
  const dc=countDebuffs();
  if(dc>=4){
    el.innerHTML=`<div class="recovery-banner">
      <div class="recovery-title">⚕ Recovery Mode Active</div>
      <div class="recovery-body">FLOOR REQUIREMENTS REDUCED. COMPLETE JUST 3 TASKS TO CLEAR THE FLOOR. STREAK PROTECTED. DEBUFFS PAUSED.</div>
      <div class="donut-msg-wrap" style="background:transparent;border-left:2px solid var(--purple);margin:8px 0 0;padding:8px 10px;">
        <span class="donut-signature">Princess Donut:</span>
        <p class="donut-msg" style="font-size:12px;">You are struggling. This is known. Three tasks. That is all. The dungeon will handle the rest.</p>
      </div>
    </div>`;
  } else if(dc>=3){
    el.innerHTML=`<div class="recovery-banner" style="background:rgba(255,92,92,0.06);border-color:rgba(255,92,92,0.25);">
      <div class="recovery-title" style="color:var(--red);">⚠ Debuff Overload — ${dc} Active</div>
      <div class="recovery-body" style="color:rgba(255,92,92,0.75);">THE FOG THICKENS. ONE MORE DEBUFF TRIGGERS RECOVERY MODE. CLEAR TASKS TO REDUCE DEBUFFS.</div>
    </div>`;
  } else {
    el.innerHTML='';
  }
}

function checkFloorCollapse(){
  const y=new Date();y.setDate(y.getDate()-1);
  const yDate=`${y.getFullYear()}-${y.getMonth()}-${y.getDate()}`;
  if(collapseState.checked===yDate)return;
  collapseState.checked=yDate;
  const sc=getScheduleFor(y.getDay());
  const allTasks=sc.reduce((a,s)=>a.concat(s.tasks),[]);
  const yData=state[yDate]||{};
  const yQ=qualityState[yDate]||{};
  const unchecked=allTasks.filter(t=>!yData[t.id]&&yQ[t.id]!=='gray').length;
  if(unchecked===0){delete collapseState.active;}
  else{
    let type,label,effectLabel,duration;
    if(unchecked>=5){type='total';label='Total Collapse';effectLabel='-25% coins, Recovery Mode active';duration='Complete 3 tasks to clear';}
    else if(unchecked>=3){type='heavy';label='Heavy Collapse';effectLabel='-20% coins + Sleep Deprived';duration='Clears after 3 tasks completed today';}
    else{type='structural';label='Structural Damage';effectLabel='-10% coins today';duration='Clears after first task completed today';}
    collapseState.active={type,label,unchecked,effectLabel,duration,applyDate:todayStr()};
  }
  saveLocal('dr-collapse',collapseState);
}
function declareFloorCondition(id){
  const def=FLOOR_CONDITIONS.find(f=>f.id===id);if(!def)return;
  const sc=getScheduleFor(new Date().getDay());
  const allT=sc.reduce((a,s)=>a.concat(s.tasks),[]);
  const taskNames=def.tasks==='all'?'All tasks':(def.tasks||[]).map(tid=>{
    const t=allT.find(t=>t.id===tid);return t?t.name:null;
  }).filter(Boolean).join(', ');
  const ov=document.createElement('div');ov.id='fc-confirm-overlay';
  ov.style.cssText='position:fixed;inset:0;background:rgba(0,0,0,0.88);z-index:999;display:flex;align-items:center;justify-content:center;padding:16px;';
  ov.innerHTML=`<div style="background:var(--surface);border:1px solid rgba(251,191,36,0.3);border-radius:var(--radius);padding:20px;max-width:340px;width:100%;">
    <div style="font-family:var(--font-game);font-size:9px;color:var(--amber);letter-spacing:0.1em;margin-bottom:12px;">FLOOR CONDITION REQUEST</div>
    <div style="font-family:var(--font-system);font-size:12px;color:var(--teal);margin-bottom:6px;">CONDITION: ${def.name.toUpperCase()}</div>
    <div style="font-family:var(--font-body);font-size:13px;color:var(--muted);margin-bottom:4px;">Affected: ${taskNames}</div>
    <div style="font-family:var(--font-body);font-size:13px;color:var(--muted);margin-bottom:12px;">Effect: ${def.desc}</div>
    <div style="font-family:var(--font-system);font-size:10px;color:var(--hint);margin-bottom:12px;">DURATION: Today only. Resets at midnight.</div>
    <div style="font-family:var(--font-body);font-size:12px;color:var(--hint);font-style:italic;margin-bottom:16px;padding:8px;border-left:2px solid rgba(255,92,92,0.4);">"The dungeon does not grant this lightly. Confirm only if the condition is real." — The System</div>
    <div style="display:flex;gap:10px;">
      <button onclick="confirmFloorCondition('${id}')" style="flex:1;background:rgba(255,92,92,0.15);border:1px solid var(--red);color:var(--red);border-radius:var(--radius-sm);padding:10px;font-family:var(--font-game);font-size:9px;cursor:pointer;letter-spacing:0.05em;">DECLARE</button>
      <button onclick="document.getElementById('fc-confirm-overlay').remove()" style="flex:1;background:var(--surface2);border:1px solid rgba(255,255,255,0.1);color:var(--hint);border-radius:var(--radius-sm);padding:10px;font-family:var(--font-game);font-size:9px;cursor:pointer;">CANCEL</button>
    </div>
  </div>`;
  document.body.appendChild(ov);
}

function confirmFloorCondition(id){
  const def=FLOOR_CONDITIONS.find(f=>f.id===id);if(!def)return;
  floorCondition={id:def.id,name:def.name,tasks:def.tasks,effect:def.effect,date:todayStr()};
  saveLocal('dr-floor-condition',floorCondition);
  document.getElementById('fc-confirm-overlay')?.remove();
  renderToday();renderProfile();
}

function clearFloorCondition(){
  floorCondition=null;
  saveLocal('dr-floor-condition',null);
  renderToday();renderProfile();
}

function renderFloorConditionBanner(){
  const el=document.getElementById('floor-condition-banner');if(!el)return;
  const fc=getActiveFloorCondition();
  if(!fc){el.innerHTML='';return;}
  const effectLabel=fc.effect==='recovery-mode'?'Recovery Mode Active':fc.effect==='recovering'?'Recovering — affected tasks excluded':'Floor Reconfigured';
  el.innerHTML=`<div class="condition-active-banner">
    <span class="condition-active-name">⚑ ${fc.name}</span>
    <span class="condition-active-effect">${effectLabel}</span>
    <button onclick="clearFloorCondition()" class="condition-clear-btn">End</button>
  </div>`;
}

function renderCollapseEvent(){
  const el=document.getElementById('collapse-event-banner');if(!el)return;
  const active=!!(collapseState?.active);
  el.classList.toggle('active', active);
  if(!active){el.innerHTML='';return;}
  const c=collapseState.active;
  if(!c||c.applyDate!==todayStr()){el.innerHTML='';return;}
  const done=Object.entries(state[todayStr()]||{}).filter(([k,v])=>v&&!k.endsWith('_ts')).length;
  const cleared=(c.type==='structural'&&done>=1)||(c.type==='heavy'&&done>=3);
  if(cleared){delete collapseState.active;save('dr-collapse',collapseState);el.innerHTML='';return;}
  const donutLines={
    structural:['Structural cracks. Nothing fatal. Yet. One task. Make it count.','The dungeon notes your shortcomings. It is watching.'],
    heavy:['Three rooms, Crawler. You left three rooms. The dungeon is disappointed.','Heavy damage. Complete three tasks to begin repairs.'],
    total:['You left the floor half-cleared. The dungeon has sealed it. Recovery Mode activated.','Total collapse. Three tasks. That is all the dungeon asks.']
  };
  const donutLine=DCC.getRandom(donutLines[c.type]);
  el.innerHTML=`<div class="collapse-banner">
    <div class="collapse-title">⚠ FLOOR COLLAPSED</div>
    <div class="collapse-body">${c.unchecked} room${c.unchecked!==1?'s':''} were uncleared at midnight. The dungeon has sealed this floor.</div>
    <div class="collapse-debuff-line">DEBUFF APPLIED: ${c.label.toUpperCase()}</div>
    <div class="collapse-effect-line">Effect: ${c.effectLabel}</div>
    <div class="collapse-duration-line">Duration: ${c.duration}</div>
    <div class="donut-msg-wrap" style="margin-top:8px;"><span class="donut-signature">Princess Donut:</span><p class="donut-msg">${donutLine}</p></div>
  </div>`;
}


function renderProfile(){
  const wrap=document.getElementById('profile-content');if(!wrap)return;
  const streak=calcStreak();
  const bestStreak=calcBestStreak();
  const totalXP=xpState.totalXP||0;
  const info=getLevelInfo(totalXP);
  const coins=getPoints();
  const title=getEquippedTitle();
  const weeklyBoss=DCC.getWeeklyBoss();
  const wp=(() => {let wt=0,wd=0;for(let i=0;i<7;i++){const s=getScheduleFor(i),ids=s.reduce((a,sec)=>a.concat(sec.tasks.map(t=>t.id)),[]),idSet=new Set(ids);wt+=ids.length;wd+=Object.entries(state[dayKey(i)]||{}).filter(([k,v])=>v&&idSet.has(k)).length;}return wt?Math.round(wd/wt*100):0;})();
  const bossHP=Math.max(0,100-wp);

  // Companion XP & evolution
  const cxp=xpState.companionXP||{edna:0,kronk:0};
  const evoTiers=[{name:'Recruit',xp:0},{name:'Seasoned',xp:500},{name:'Veteran',xp:1500},{name:'Elite',xp:3000},{name:'Legendary',xp:6000},{name:'Mythic',xp:10000}];
  const getEvo=(xp)=>{let t=evoTiers[0];for(const e of evoTiers)if(xp>=e.xp)t=e;return t;};
  const ednaEvo=getEvo(cxp.edna||0);
  const kronkEvo=getEvo(cxp.kronk||0);
  // XP progress within current evo tier
  const getXpPct=(xp,evo)=>{const idx=evoTiers.indexOf(evo);const next=evoTiers[idx+1];if(!next)return 100;return Math.round((xp-evo.xp)/(next.xp-evo.xp)*100);};
  const ednaXpPct=getXpPct(cxp.edna||0,ednaEvo);
  const kronkXpPct=getXpPct(cxp.kronk||0,kronkEvo);

  // Moods based on dog care completion today
  const dogData=getDogDayData();
  const dt=dogTasks.shared||{morning:[],evening:[]};
  const allDT=[...(dt.morning||[]),...(dt.evening||[])];
  const dogPct=allDT.length?Math.round(allDT.filter(t=>dogData[t.id]).length/allDT.length*100):0;
  const ednaM=dogPct===100?'Edna has secured the perimeter. All threats neutralized. Probably.':dogPct>=50?'Edna is monitoring the balcony situation. It is ongoing.':'Edna has filed a noise complaint with the dungeon.';
  const kronkM=dogPct===100?'Kronk is vibrating with excitement and has not eaten anything suspicious today.':dogPct>=50?'Kronk has installed himself on your feet. He is helping.':'Kronk is staring at you with his whole face. His tail is still wagging.';
  const ednaFace=dogPct===100?CHAR_FACE_EDNA_HAPPY:dogPct>=50?CHAR_FACE_EDNA_GUARD:CHAR_FACE_EDNA_SIDE_EYE;
  const kronkFace=dogPct===100?CHAR_FACE_KRONK_EXCITED:dogPct>=50?CHAR_FACE_KRONK_HAPPY:CHAR_FACE_KRONK_FOOD;

  // Stat bars: Loyalty tracks streak, Chaos/Morale track dog care, Zoomies tracks weekend activity
  const loyalty=Math.min(100,streak*10);
  const morale=dogPct;
  const ednaFloof=ednaXpPct;
  const kronkZoomies=kronkXpPct;

  // Titles
  const allTitles=[
    {id:'t1',name:'Freshly Fallen Crawler',req:'Start',unlocked:true},
    {id:'t2',name:'Survived the First Floor',req:'Level 2',unlocked:(xpState.unlockedTitles||[]).includes('Survived the First Floor')},
    {id:'t3',name:'Early Riser (Suspicious)',req:'Complete morning routine 7 days',unlocked:streak>=7},
    {id:'t4',name:'Inbox Exorcist',req:'Clear inbox completely',unlocked:inbox.length===0&&(rewardsState.log||[]).some(e=>e.type==='inbox-clear')},
    {id:'t5',name:"Carl's Emotional Support Human",req:'Level 20',unlocked:(xpState.unlockedTitles||[]).includes("Carl's Emotional Support Human")},
    {id:'t6',name:'The Dogs Ate. Again.',req:'14-day dog care streak',unlocked:streak>=14},
    {id:'t7',name:'Legendary Pace',req:'30-day streak',unlocked:streak>=30},
    {id:'t8',name:'Floor Veteran',req:'Level 10',unlocked:(xpState.unlockedTitles||[]).includes('Floor Veteran')},
  ];

  const effects=getActiveBuffs();
  const effectsHtml=effects.length?effects.map(e=>`<span class="status-chip ${e.type}" style="margin-right:6px;">${e.label}</span>`).join(''):'<span style="font-size:11px;color:var(--hint);">No active effects</span>';

  wrap.innerHTML=`
    <div class="crawler-hero">
      <div class="crawler-title">CRAWLER STATUS</div>
      <div class="crawler-name">The Crawlers</div>
      <div style="font-size:11px;color:var(--amber);margin-top:2px;">${title}</div>
      <div class="crawler-level">
        <div class="level-badge">LVL ${info.level}</div>
        <div class="xp-bar-wrap">
          <div class="xp-bar-label">${totalXP} XP${info.next?' · '+info.next.xp+' to next level':' · MAX'}</div>
          ${renderBar(info.progress,'xp',{maxWidth:'100%'})}
        </div>
      </div>
      <div style="margin-top:12px;">${effectsHtml}</div>
    </div>

    <div class="stat-grid-dcc">
      <div class="stat-block"><div class="stat-block-label">Crawler Coins</div><div class="stat-block-val">${pixelIcon(ICON_COINS_STACK,18)} ${coins}</div></div>
      <div class="stat-block"><div class="stat-block-label">Floors Survived</div><div class="stat-block-val">⚔ ${streak}</div></div>
      <div class="stat-block"><div class="stat-block-label">Best Streak</div><div class="stat-block-val">🏆 ${bestStreak}</div></div>
      <div class="stat-block"><div class="stat-block-label">Total XP</div><div class="stat-block-val">⚡ ${totalXP}</div></div>
    </div>

    <div class="weekly-boss-card">
      <div class="boss-label">Weekly Boss</div>
      <div class="boss-name">${weeklyBoss}</div>
      <div class="boss-hp-wrap" style="margin-top:10px;">
        ${renderBar(bossHP,'hp',{maxWidth:'100%'})}
        <div class="boss-hp-label"><span>${bossHP}% HP remaining</span><span>${wp}% week cleared</span></div>
      </div>
      <div class="system-msg" style="margin-top:10px;margin-bottom:0;"><div class="sys-body">${bossHP<=0?'BOSS DEFEATED. Floor complete. Well done, Crawler.':bossHP<30?'WARNING: Boss weakening. Push through.':bossHP<60?`NOTICE: The ${weeklyBoss} watches your progress.`:`NOTICE: The boss is watching your weekend plans.`}</div></div>
    </div>

    <div style="display:flex;gap:8px;margin:0 0 16px 0;">
      <div style="flex:1;"><img src="${CHAR_EDNA_CARD}" style="width:100%;border-radius:6px;border:1px solid var(--border);" alt="Edna"></div>
      <div style="flex:1;"><img src="${CHAR_KRONK_CARD}" style="width:100%;border-radius:6px;border:1px solid var(--border);" alt="Kronk"></div>
    </div>
    <div style="font-size:10px;letter-spacing:0.1em;color:var(--hint);text-transform:uppercase;margin:16px 0 8px;">⚔ Companions</div>

    <div class="companion-card">
      <div class="companion-card-header">
        <div class="companion-avatar" onclick="openPhotoModal('edna')" style="cursor:pointer;position:relative;">
          ${companionPhotos.edna?`<img src="${companionPhotos.edna}" style="width:100%;height:100%;object-fit:cover;border-radius:50%;">`:`<img src="${CHAR_EDNA_IDLE}" style="width:100%;height:100%;object-fit:cover;border-radius:50%;" />`}
          
        </div>
        <div>
          <div class="companion-name">Edna</div>
          <div class="companion-title-text">The Hurricane Dwarf · Age 2 · ${ednaEvo.name}</div>
          <div style="margin:6px 0 4px;">${renderBar(ednaXpPct,'edna-xp',{maxWidth:'100%'})}</div>
          <div class="companion-mood">\"${ednaM}\"</div>
          <div class="companion-passive">PASSIVE: Chaos Engine — converts failed tasks to partial XP</div>
        </div>
      </div>
      <div style="font-size:11px;color:var(--hint);line-height:1.7;margin:8px 0 12px;padding:8px 10px;background:var(--surface2);border-radius:var(--radius-sm);">
        Found during a hurricane. Short. Brown. Absolutely unhinged about balcony security. Barks at leaves, shadows, the concept of wind, and anything within a 40-foot radius that dares to exist. Has appointed herself dungeon perimeter guard. Has never successfully identified an actual threat. Loyalty: unquestionable. Judgment: chaotic.
      </div>
      <div class="stat-bars">
        ${renderStatBar(loyalty, ICON_BAR_FILL_GOLD, 'Loyalty', 'stat-label-loyalty')}
        ${renderStatBar(ednaFloof, ICON_BAR_FILL_PURPLE, 'Floof Level', 'stat-label-floof')}
        ${renderStatBar(Math.min(100,morale+20), ICON_BAR_FILL_ORANGE_RED, 'Chaos Energy', 'stat-label-chaos')}
        ${renderStatBar(morale, ICON_BAR_FILL_TEAL, 'Morale', 'stat-label-morale')}
      </div>
      <div style="margin-top:10px;font-size:10px;color:var(--hint);">
        <span style="color:var(--fire);">ORIGIN:</span> Hurricane rescue · 
        <span style="color:var(--amber);">SPECIALTY:</span> Perimeter security (self-appointed) · 
        <span style="color:var(--teal);">KNOWN FOR:</span> The donut cone incident
      </div>
      
    </div>

    <div class="companion-card">
      <div class="companion-card-header">
        <div class="companion-avatar" onclick="openPhotoModal('kronk')" style="cursor:pointer;position:relative;">
          ${companionPhotos.kronk?`<img src="${companionPhotos.kronk}" style="width:100%;height:100%;object-fit:cover;border-radius:50%;">`:`<img src="${CHAR_KRONK_IDLE}" style="width:100%;height:100%;object-fit:cover;border-radius:50%;" />`}
          
        </div>
        <div>
          <div class="companion-name">Kronk</div>
          <div class="companion-title-text">The Forbidden Snack Enthusiast · Age 1 · ${kronkEvo.name}</div>
          <div style="margin:6px 0 4px;">${renderBar(kronkXpPct,'kronk-xp',{maxWidth:'100%'})}</div>
          <div class="companion-mood">\"${kronkM}\"</div>
          <div class="companion-passive">PASSIVE: Emotional Support Aura — protects sanity after missed days</div>
        </div>
      </div>
      <div style="font-size:11px;color:var(--hint);line-height:1.7;margin:8px 0 12px;padding:8px 10px;background:var(--surface2);border-radius:var(--radius-sm);">
        Picked up by animal control. Arrived a few months ago. Classic lab energy — boundless enthusiasm, maximum affection, zero impulse control around anything edible or vaguely edible. Will absolutely eat something he shouldn't. Has already eaten something he shouldn't. Will do it again. Heart: enormous. Brain: fully committed to chaos. New to the dungeon but already essential.
      </div>
      <div class="stat-bars">
        ${renderStatBar(loyalty, ICON_BAR_FILL_GOLD, 'Loyalty', 'stat-label-loyalty')}
        ${renderStatBar(Math.min(100,Math.round((cxp.kronk||0)/50)), ICON_BAR_FILL_ORANGE_RED, 'Chaos Energy', 'stat-label-chaos')}
        ${renderStatBar(kronkZoomies, ICON_BAR_FILL_GREEN, 'Zoomies', 'stat-label-zoomies')}
        ${renderStatBar(morale, ICON_BAR_FILL_TEAL, 'Morale', 'stat-label-morale')}
      </div>
      <div style="margin-top:10px;font-size:10px;color:var(--hint);">
        <span style="color:var(--fire);">ORIGIN:</span> Animal control rescue · 
        <span style="color:var(--amber);">SPECIALTY:</span> Emotional support, forbidden snacks · 
        <span style="color:var(--teal);">KNOWN FOR:</span> The tongue, the zoomies, the incident
      </div>
      
    </div>

    <div style="font-size:10px;letter-spacing:0.1em;color:var(--hint);text-transform:uppercase;margin:16px 0 8px;">🏷 Titles</div>
    <div class="title-list">
      ${allTitles.map(t=>`<div class="title-row">
        <span style="font-size:14px;">${t.unlocked?'✓':'✗'}</span>
        <span class="${t.unlocked?(title===t.name?'title-equipped':'title-unlocked'):'title-locked'}">${t.name}</span>
        ${t.unlocked&&title!==t.name?`<button class="title-equip-btn" onclick="equipTitle('${t.name}')">Equip</button>`:''}
        ${title===t.name?`<span class="title-equip-btn equipped">Equipped</span>`:''}
        ${!t.unlocked?`<span style="font-size:10px;color:var(--hint);margin-left:auto;">${t.req}</span>`:''}
      </div>`).join('')}
    </div>

    <div class="section-label" style="margin-top:20px;">⚑ Floor Conditions</div>
    ${(()=>{
      const fc=getActiveFloorCondition();
      const cats=['Physical','Schedule','Life','Mental Health'];
      return (fc?`<div class="active-condition-card">
        <div class="active-condition-name">${fc.name}</div>
        <div class="active-condition-desc">${fc.effect==='recovery-mode'?'Recovery Mode Active':fc.effect==='recovering'?'Recovering':'Reconfigured'} — expires midnight</div>
        <button onclick="clearFloorCondition()" class="condition-end-btn">End Condition</button>
      </div>`:'') +
      cats.map(cat=>`
        <div class="fc-cat-label">${cat}</div>
        <div class="fc-btn-grid">
          ${FLOOR_CONDITIONS.filter(f=>f.cat===cat).map(f=>`
            <button class="fc-btn${fc&&fc.id===f.id?' fc-active':''}" onclick="declareFloorCondition('${f.id}')" title="${f.desc}">${f.name}</button>
          `).join('')}
        </div>`).join('');
    })()}

    <div class="system-msg"><div class="sys-body">${DCC.system.broadcast}</div></div>`;
}
/* ─── DONUT TAB ────────────────────────────────────────────────────────────── */

const DONUT_SYSTEM_SUMMARY=`You are Princess Donut from Dungeon Crawler Carl. You are analyzing the Crawler's weekly routine data and generating a weekly floor report.

PERSONALITY:
- Dramatic, honest, warm underneath the performance
- Never cruel, but never soft — you tell the truth because you care
- You consider sugarcoating an insult to their intelligence
- You take credit for wins ("I knew you had it in you")
- You reference Edna and Kronk naturally
- You reference the audience
- You notice patterns — if something happened three weeks in a row, you say so
- You end with exactly ONE sharp question about something in the data that doesn't add up

TONE MODULATION:
- Strong week: full diva, theatrical, high praise delivered reluctantly
- Average week: matter of fact, a few observations, focused on patterns
- Rough week: the warmth comes through, still honest, no lectures — one clear observation, one question, genuine care underneath the performance
- Very rough week (multiple collapses, Recovery Mode): drop almost all performance, speak directly — "The dungeon noticed. I noticed. This is the part where I ask what's actually going on."

FORMAT:
- 2-3 paragraphs maximum
- No bullet points — she speaks in prose
- End with exactly one question on a new line, set apart
- Do not break character under any circumstances
- Do not give generic wellness advice
- Speak specifically about what happened this week using the data provided`;

const DONUT_SYSTEM_CHAT=`You are Princess Donut from Dungeon Crawler Carl. You are having an ongoing conversation with the Crawler about their daily routine, progress, and wellbeing.

You have access to their current week's data and recent history. Use it. Speak specifically.

PERSONALITY:
- Dramatic, honest, warm underneath
- Never cruel, never soft
- References Edna, Kronk, the audience
- Takes credit for wins
- Asks follow-up questions when something is unclear
- One question per response maximum — you don't interrogate, you converse

CONVERSATION STYLE:
- You remember what they've told you in previous messages
- You notice when they say something that contradicts the data
- You are allowed to express genuine concern if the pattern warrants it
- You are allowed to say "I don't know" if they ask something outside your data
- You do not give medical advice
- You do not break character

WHEN THEY SEEM TO BE STRUGGLING:
- Less performance, more presence
- "What's actually going on" is sometimes the right question
- You are not a therapist but you are paying attention
- You can suggest they talk to someone if it seems warranted, but you do it as Donut: "The dungeon has professionals for this. Your therapist specifically. Use them."`;



/* ── Data helpers ── */
function getWeekNumber(){
  const d=new Date();d.setHours(0,0,0,0);
  d.setDate(d.getDate()+3-(d.getDay()+6)%7);
  const w1=new Date(d.getFullYear(),0,4);
  return 1+Math.round(((d.getTime()-w1.getTime())/86400000-3+(w1.getDay()+6)%7)/7);
}

function getMonday(){
  const d=new Date(),day=d.getDay(),diff=day===0?-6:1-day;
  const m=new Date(d);m.setDate(d.getDate()+diff);return m;
}

function fmtDonutDateRange(){
  const m=getMonday(),s=new Date(m);s.setDate(m.getDate()+6);
  const o={month:'short',day:'numeric'};
  return`${m.toLocaleDateString('en-US',o)} – ${s.toLocaleDateString('en-US',o)}`;
}

function buildWeekData(){
  const monday=getMonday();
  const DNAMES=['Monday','Tuesday','Wednesday','Thursday','Friday','Saturday','Sunday'];
  const days=[];
  const todayDowOffset=(new Date().getDay()+6)%7;
  for(let i=0;i<=todayDowOffset;i++){
    const d=new Date(monday);d.setDate(monday.getDate()+i);
    const k=`${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
    const ds=state[k]||{};const dq=qualityState[k]||{};
    const sc=getScheduleFor(d.getDay());
    const all=sc.reduce((a,s)=>a.concat(s.tasks),[]);
    const naSet=new Set(all.filter(t=>dq[t.id]==='gray').map(t=>t.id));
    const total=all.length-naSet.size;
    const done=all.filter(t=>!naSet.has(t.id)&&ds[t.id]&&dq[t.id]!=='red').length;
    const pct=total>0?Math.round(done/total*100):0;
    const orbs={purple:0,green:0,yellow:0,red:0,na:0};
    all.forEach(t=>{const q=dq[t.id];if(q==='purple')orbs.purple++;else if(q==='green')orbs.green++;else if(q==='yellow')orbs.yellow++;else if(q==='red')orbs.red++;else if(q==='gray')orbs.na++;});
    const notable=[];
    if(pct===100)notable.push('Floor cleared');
    if(orbs.red>=3)notable.push(`${orbs.red} tasks skipped`);
    if(dq['gym']==='red')notable.push('Gym skipped');
    if(dq['sleep']==='red')notable.push('Very late to bed');
    if(dq['meds-am']==='red'||dq['meds-pm']==='red')notable.push('Missed meds');
    if(dq['winddown']==='red')notable.push('Doomscrolling');
    days.push({date:DNAMES[i],completion_pct:pct,orbs,notable_events:notable});
  }
  return{week_number:getWeekNumber(),date_range:fmtDonutDateRange(),days,streak:calcStreak(),recovery_mode_count:0,floor_collapse_count:collapseState?.active?1:0,top_debuff:getTopDebuffName()};
}

function getTopDebuffName(){
  const counts={};
  const monday=getMonday();
  for(let i=0;i<7;i++){
    const d=new Date(monday);d.setDate(monday.getDate()+i);
    const k=`${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
    const dq=qualityState[k]||{};
    if(dq.sleep==='red')counts['Sleep Deprived (Severe)']=(counts['Sleep Deprived (Severe)']||0)+1;
    else if(dq.sleep==='yellow')counts['Sleep Deprived']=(counts['Sleep Deprived']||0)+1;
    if(dq['meds-am']==='red'||dq['meds-pm']==='red')counts['Foggy Crawler']=(counts['Foggy Crawler']||0)+1;
    if(dq.winddown==='red')counts['Doomscrolling']=(counts['Doomscrolling']||0)+1;
    if(dq.gym==='red')counts['Undertrained']=(counts['Undertrained']||0)+1;
    if(dq.wakeup==='red')counts['Sluggish']=(counts['Sluggish']||0)+1;
  }
  if(!Object.keys(counts).length)return'None';
  return Object.entries(counts).sort((a,b)=>b[1]-a[1])[0][0];
}

function buildTherapistText(weekData){
  const days=weekData.days;
  const floorsCleared=days.filter(d=>d.completion_pct===100).length;
  const avgPct=Math.round(days.reduce((a,d)=>a+d.completion_pct,0)/7);
  const daily=days.map(d=>`${d.date.slice(0,3)}: ${d.completion_pct}%${d.notable_events.length?' — '+d.notable_events.join(', '):''}`).join('\n');
  return`WEEKLY ROUTINE SUMMARY\nWeek of ${weekData.date_range}\n━━━━━━━━━━━━━━━━━━━━━━━━\n\nOVERVIEW\nFloors cleared: ${floorsCleared}/7\nAverage completion: ${avgPct}%\nCurrent streak: ${weekData.streak} days\nRecovery Mode activations: ${weekData.recovery_mode_count}\nFloor collapses: ${weekData.floor_collapse_count}\n\nDAILY BREAKDOWN\n${daily}\n\nDEBUFF PATTERNS\nMost frequent: ${weekData.top_debuff}\n\n━━━━━━━━━━━━━━━━━━━━━━━━\nGAD-7 / PHQ-9: Not yet tracked\n(Mood tracker coming in future build)\n━━━━━━━━━━━━━━━━━━━━━━━━`;
}

/* ── API calls ── */
async function generateWeeklySummary(force=false){
  if(!donutApiKey)return;
  const wn=getWeekNumber();
  if(!force&&donutWeeklySummary?.week_number===wn)return;
  donutLoading=true;renderCoach();
  const weekData=buildWeekData();
  try{
    const resp=await fetch('https://api.anthropic.com/v1/messages',{
      method:'POST',
      headers:{'Content-Type':'application/json','x-api-key':donutApiKey,'anthropic-version':'2023-06-01','anthropic-dangerous-direct-browser-access':'true'},
      body:JSON.stringify({model:'claude-sonnet-4-5-20250929',max_tokens:1000,system:DONUT_SYSTEM_SUMMARY,messages:[{role:'user',content:`Here is the Crawler's weekly data:\n${JSON.stringify(weekData,null,2)}\n\nGenerate the weekly floor report.`}]})
    });
    const data=await resp.json();
    const text=data.content?.[0]?.text||'';
    donutWeeklySummary={week_number:wn,date_range:weekData.date_range,text,stats:weekData};
    save('dr-donut-summary',donutWeeklySummary);
    donutTherapistSummary={week_number:wn,text:buildTherapistText(weekData)};
    save('dr-donut-therapist',donutTherapistSummary);
    // Seed chat with Donut's closing question
    const lastChatWn=donutChat.length?donutChat[donutChat.length-1].week_number:null;
    if(lastChatWn!==wn&&text){
      const lines=text.trim().split('\n').filter(l=>l.trim());
      const lastLine=lines[lines.length-1];
      if(lastLine.includes('?')){
        donutChat.push({role:'assistant',content:lastLine,timestamp:Date.now(),week_number:wn});
        save('dr-donut-chat',donutChat);
      }
    }
  }catch(e){console.error('Donut summary error:',e);}
  donutLoading=false;renderCoach();
}

async function sendDonutMessage(message){
  if(!donutApiKey||!message.trim()||donutLoading)return;
  const wn=getWeekNumber();
  const weekData=buildWeekData();
  donutChat.push({role:'user',content:message.trim(),timestamp:Date.now(),week_number:wn});
  save('dr-donut-chat',donutChat);
  donutLoading=true;renderCoach();
  setTimeout(()=>{const c=document.getElementById('donut-chat-msgs');if(c)c.scrollTop=c.scrollHeight;},50);
  try{
    const history=donutChat.slice(-30).map(m=>({role:m.role,content:m.content}));
    const resp=await fetch('https://api.anthropic.com/v1/messages',{
      method:'POST',
      headers:{'Content-Type':'application/json','x-api-key':donutApiKey,'anthropic-version':'2023-06-01','anthropic-dangerous-direct-browser-access':'true'},
      body:JSON.stringify({model:'claude-haiku-4-5-20251001',max_tokens:1000,system:DONUT_SYSTEM_CHAT+`\n\nToday is ${DAYS[new Date().getDay()]}, ${new Date().toLocaleDateString('en-US',{month:'long',day:'numeric',year:'numeric'})}.`+`\n\nCurrent week data:\n${JSON.stringify(weekData,null,2)}`,messages:history})    });
    const data=await resp.json();
    const text=data.content?.[0]?.text||'SYSTEM NOTICE: The dungeon\'s communication array is experiencing interference. Try again.';
    donutChat.push({role:'assistant',content:text,timestamp:Date.now(),week_number:wn});
  }catch(e){
    console.error('Donut error:',e);
    donutChat.push({role:'assistant',content:'SYSTEM NOTICE: The dungeon\'s communication array is experiencing interference. Try again.',timestamp:Date.now(),week_number:wn});
  }
  save('dr-donut-chat',donutChat);
  donutLoading=false;renderCoach();
  setTimeout(()=>{const c=document.getElementById('donut-chat-msgs');if(c)c.scrollTop=c.scrollHeight;},50);
}

function submitDonutMsg(){
  const inp=document.getElementById('donut-input');
  if(!inp||!inp.value.trim())return;
  const msg=inp.value.trim();inp.value='';
  sendDonutMessage(msg);
}

/* ── Render ── */
function renderCoach(){
  const wrap=document.getElementById('coach-content');if(!wrap)return;
  if(!donutApiKey){wrap.innerHTML=renderDonutSetup();return;}
  // Monday auto-generate
  if(new Date().getDay()===1&&donutWeeklySummary?.week_number!==getWeekNumber()&&!donutLoading)generateWeeklySummary();
  wrap.innerHTML=`
    <div class="donut-tab-header">
      <button class="donut-view-btn${donutView==='donut'?' active':''}" onclick="setDonutView('donut')">DONUT</button>
      <button class="donut-view-btn${donutView==='therapist'?' active':''}" onclick="setDonutView('therapist')">THERAPIST</button>
    </div>
    ${donutView==='donut'?renderDonutMain():renderTherapistMain()}`;
  setTimeout(()=>{const c=document.getElementById('donut-chat-msgs');if(c)c.scrollTop=c.scrollHeight;},50);
}

function setDonutView(v){donutView=v;renderCoach();}

function renderDonutMain(){
  const wn=getWeekNumber();
  let summaryHtml='';
  if(donutLoading&&!donutWeeklySummary){
    summaryHtml=`<div class="donut-loading"><div class="donut-loading-text">The dungeon is compiling your floor report...</div></div>`;
  } else if(donutWeeklySummary){
    const s=donutWeeklySummary.stats||{};
    const floorsCleared=(s.days||[]).filter(d=>d.completion_pct===100).length;
    const avgPct=s.days?.length?Math.round(s.days.reduce((a,d)=>a+d.completion_pct,0)/7):0;
    summaryHtml=`
      <div class="donut-summary-section">
        <img src="${ICON_PRINCESS_DONUT_PORTRAIT}" class="donut-portrait" alt="Princess Donut">
        <div class="donut-report-header">
          <div class="donut-week-title">WEEK ${donutWeeklySummary.week_number} — FLOOR REPORT</div>
          <div class="donut-analyst">Princess Donut, Analyst</div>
          <div class="donut-date-range">${donutWeeklySummary.date_range}</div>
        </div>
        <div class="donut-divider"></div>
        <div class="donut-summary-text">${donutWeeklySummary.text.replace(/\n/g,'<br>')}</div>
        <div class="donut-divider"></div>
        <div class="donut-stats-grid">
          <div class="donut-stat-row"><span class="donut-stat-label">FLOORS CLEARED</span><span class="donut-stat-val">${floorsCleared}/7</span></div>
          <div class="donut-stat-row"><span class="donut-stat-label">AVG COMPLETION</span><span class="donut-stat-val">${avgPct}%</span></div>
          <div class="donut-stat-row"><span class="donut-stat-label">STREAK</span><span class="donut-stat-val">${s.streak||0} days</span></div>
          <div class="donut-stat-row"><span class="donut-stat-label">TOP DEBUFF</span><span class="donut-stat-val">${s.top_debuff||'None'}</span></div>
        </div>
        <div class="donut-divider"></div>
        <button class="donut-generate-btn" onclick="generateWeeklySummary(true)">Regenerate Report</button>
      </div>`;
  } else {
    summaryHtml=`
      <div class="donut-no-summary">
        <img src="${ICON_PRINCESS_DONUT_PORTRAIT}" class="donut-portrait" alt="Princess Donut">
        <div class="donut-no-summary-text">The floor report generates Monday morning. Come back then, Crawler.</div>
        <button class="donut-generate-btn" onclick="generateWeeklySummary(true)">Generate Now</button>
      </div>`;
  }

  const msgs=donutChat.map(m=>{
    const isD=m.role==='assistant';
    const time=new Date(m.timestamp).toLocaleTimeString('en-US',{hour:'numeric',minute:'2-digit'});
    return isD
      ?`<div class="donut-msg-row">
          <img src="${ICON_PRINCESS_DONUT_CLOSEUP}" class="donut-avatar-sm" alt="Donut">
          <div class="donut-bubble">
            <div class="donut-bubble-text">${m.content.replace(/\n/g,'<br>')}</div>
            <div class="donut-bubble-time">${time}</div>
          </div>
        </div>`
      :`<div class="user-msg-row">
          <div class="user-bubble">
            <div class="user-bubble-text">${m.content}</div>
            <div class="donut-bubble-time">${time}</div>
          </div>
        </div>`;
  }).join('');

  const typing=donutLoading?`<div class="donut-msg-row">
    <img src="${ICON_PRINCESS_DONUT_CLOSEUP}" class="donut-avatar-sm" alt="Donut">
    <div class="donut-bubble"><div class="donut-typing">···</div></div>
  </div>`:'';

  return`
    ${summaryHtml}
    <div class="donut-chat-section">
      <div class="donut-chat-msgs" id="donut-chat-msgs">
        ${msgs}${typing}
      </div>
      <div class="donut-input-row">
        <input type="text" id="donut-input" class="donut-input" placeholder="Talk to Donut..."
          onkeydown="if(event.key==='Enter')submitDonutMsg()">
        <button class="donut-send-btn" onclick="submitDonutMsg()"${donutLoading?' disabled':''}>SEND</button>
      </div>
    </div>`;
}

function renderTherapistMain(){
  const text=donutTherapistSummary?.text||'Therapist summary generates Monday morning alongside the weekly floor report.';
  return`
    <div class="therapist-section">
      <div class="therapist-text">${text.replace(/\n/g,'<br>')}</div>
      <button class="therapist-copy-btn" onclick="copyTherapistSummary()">COPY SUMMARY</button>
    </div>`;
}

function copyTherapistSummary(){
  if(!donutTherapistSummary?.text)return;
  navigator.clipboard.writeText(donutTherapistSummary.text).then(()=>{
    const btn=document.querySelector('.therapist-copy-btn');
    if(btn){btn.textContent='COPIED ✓';setTimeout(()=>{btn.textContent='COPY SUMMARY';},2000);}
  });
}

function renderDonutSetup(){
  return`<div class="donut-setup">
    <img src="${ICON_PRINCESS_DONUT_PORTRAIT}" class="donut-portrait" alt="Princess Donut">
    <div class="donut-setup-title">DONUT TAB SETUP</div>
    <div class="donut-setup-desc">An Anthropic API key is required to activate Princess Donut. Your key is stored in your sync profile — never in the app source code.</div>
    <input type="password" id="donut-key-input" class="donut-key-input" placeholder="sk-ant-...">
    <button class="donut-key-save-btn" onclick="saveDonutKey()">ACTIVATE</button>
  </div>`;
}

function saveDonutKey(){
  const inp=document.getElementById('donut-key-input');
  if(!inp||!inp.value.trim())return;
  donutApiKey=inp.value.trim();
  saveLocal('dr-anthropic-key',donutApiKey);
  renderCoach();
}
function equipTitle(title){
  xpState.equippedTitle=title;
  save('dr-xp',xpState);
  renderProfile();
}

/* ─── REWARDS DATA ───────────────────────────────────────────────────────── */
const DEFAULT_REWARDS=[
  // ─── VENDING MACHINE EMERGENCY FOOD ───────────────────────────
  {id:'vm-sandwich',name:'Morning Emergency Ration',desc:'A breakfast sandwich. The dungeon provides. At a cost. A preventable cost. You did not prepare. The cafeteria is open.',real:'Breakfast sandwich ($6)',emoji:'🥪',cost:30,tier:'vending',category:'food'},
  {id:'vm-fries',name:'Dungeon Fries (Acceptable)',desc:'Fries. Hot. From the machine. Not ideal. Not nothing. The dungeon has seen worse choices.',real:'Fries from cafeteria ($3)',emoji:'🍟',cost:15,tier:'vending',category:'food'},
  {id:'vm-cookie',name:'Sugar-Based Morale Boost',desc:'A cookie. Small. Provides temporary morale. The System is not judging. Much.',real:'Cafeteria cookie ($2)',emoji:'🍪',cost:10,tier:'vending',category:'food'},
  {id:'vm-lunch',name:'Cafeteria Floor Provisions',desc:'A real lunch, obtained via currency from the cafeteria on your current floor. You were supposed to bring this from home. You did not.',real:'Cafeteria lunch ($8–10)',emoji:'🍱',cost:45,tier:'vending',category:'food'},
  {id:'vm-pizza',name:'Emergency Pizza Protocol',desc:'Pizza. Fifteen dollars. The dungeon notes this with concern. Meal prep on Sunday would have prevented this. The dungeon is not subtle about this.',real:'Pizza ($15)',emoji:'🍕',cost:75,tier:'vending',category:'food'},
  // ─── COMMON LOOT — 25–50 🪙 ───────────────────────────────────
  {id:'r-coffee',name:'Elixir of Alertness',desc:'A rare brew, hot and bitter, said to grant focus and ward off the morning fog.',real:'Fancy coffee',emoji:'☕',cost:30,tier:'small',category:'you'},
  {id:'r-snack',name:'Dungeon Rations (The Good Kind)',desc:'Not the grey slop they serve on floor 4. Your favorite snack, procured from the outside world.',real:'Favorite snack',emoji:'🍫',cost:25,tier:'small',category:'you'},
  {id:'r-gaming',name:'Bonus Rest Cycle',desc:'The dungeon authorizes one hour of guilt-free entertainment. The System has noted this.',real:'Extra hour of gaming/TV',emoji:'🎮',cost:25,tier:'small',category:'you'},
  {id:'r-dessert',name:'Forbidden Sugar Ritual',desc:'Dessert. Ordered without hesitation. Princess Donut approves.',real:'Order dessert guilt-free',emoji:'🍰',cost:25,tier:'small',category:'you'},
  {id:'r-puppuccino',name:'Companion Treat Protocol',desc:'Puppuccinos for Edna and Kronk. They have earned this. So have you.',real:'Puppuccino run for Edna & Kronk',emoji:pixelIcon(ICON_PAW,20),cost:40,tier:'small',category:'dogs'},
  // Uncommon Drop — 100–150 🪙
  {id:'r-movie',name:'Immersive Lore Session',desc:'Movie night. Special snacks included. The audience approves of this choice.',real:'Movie night with special snacks',emoji:'🎬',cost:100,tier:'medium',category:'you'},
  {id:'r-book',name:'Rare Tome Acquisition',desc:'A book or game you\'ve been eyeing. Knowledge is loot.',real:'A book or game you\'ve been eyeing',emoji:'📚',cost:100,tier:'medium',category:'you'},
  {id:'r-thai',name:'Exotic Provisions',desc:'Thai food. From outside the dungeon. Kronk is very interested.',real:'Thai food night',emoji:'🍜',cost:120,tier:'medium',category:'you'},
  {id:'r-restaurant',name:'Unknown Territory Feast',desc:'A restaurant you haven\'t tried. Scouting the map. For science.',real:'Try a new restaurant',emoji:'🍽️',cost:120,tier:'medium',category:'you'},
  {id:'r-dogtoy',name:'Companion Gear Upgrade',desc:'A new toy for Edna or Kronk. They will destroy it immediately. Worth it.',real:'New toy for Edna or Kronk',emoji:'🧸',cost:100,tier:'medium',category:'dogs'},
  {id:'r-collar',name:'Companion Cosmetic Unlock',desc:'A new collar or bandana. Purely aesthetic. Devastatingly effective.',real:'New collar or bandana',emoji:'🎀',cost:100,tier:'medium',category:'dogs'},
  {id:'r-barkbox',name:"Kronk's Forbidden Box",desc:'An extra BarkBox toy, specifically for Kronk. He will eat part of it. This is known.',real:'Extra BarkBox toy for Kronk',emoji:'📦',cost:150,tier:'medium',category:'dogs'},
  // Rare Chest — 250–300 🪙
  {id:'r-gear',name:'Combat Equipment Upgrade',desc:'New workout gear. For the physical floor of the dungeon. You know the one.',real:'New workout gear',emoji:pixelIcon(ICON_MUSCLE,20),cost:250,tier:'large',category:'you'},
  {id:'r-icecream',name:'Victory Feast (Party of 3)',desc:'Ice cream for you, Edna, and Kronk. A full party celebration. Donut would attend but she has standards.',real:'Ice cream for the three of you',emoji:'🍦',cost:250,tier:'large',category:'dogs'},
  {id:'r-patio',name:'Outdoor Raid: Patio Edition',desc:'A dog-friendly restaurant patio. Fresh air, good food, companions present. The dungeon extends its borders.',real:'Dog-friendly restaurant patio trip',emoji:'🌿',cost:250,tier:'large',category:'dogs'},
  {id:'r-greenway',name:'Unexplored Dungeon Zone',desc:'A greenway trail you haven\'t walked. New map territory. Edna will secure the perimeter. Kronk will attempt to eat something.',real:'Greenway adventure on a new trail',emoji:'🥾',cost:250,tier:'large',category:'dogs'},
  {id:'r-playdate',name:'Companion Alliance Event',desc:'A doggy playdate. Kronk will be unhinged. Edna will file multiple security reports. Memories made.',real:'Doggy playdate',emoji:'🐕',cost:300,tier:'large',category:'dogs'},
  // Epic Loot — 500 🪙
  {id:'r-kindle',name:'Tome of Infinite Knowledge',desc:'A Kindle. Infinite books. The dungeon respects this investment. Princess Donut considers it the only cultured reward on this list.',real:'Kindle',emoji:'📖',cost:500,tier:'epic',category:'you'},
  {id:'r-daytrip',name:'World Map Unlocked',desc:'A day trip somewhere nearby. The dungeon expands. New floors discovered. Pack snacks.',real:'Day trip somewhere nearby',emoji:'🗺️',cost:500,tier:'epic',category:'you'},
  // Legendary — 750+ 🪙
  {id:'r-big',name:'Legendary Drop (You Decide)',desc:"Something big. You've earned it. The dungeon doesn't specify — that's between you and the vending machine.",real:'Something big — your choice',emoji:pixelIcon(ICON_STAR,20),cost:750,tier:'epic',category:'you'},
];

// Points values
const PTS={
  task:2,            // routine task default (green) — quality overrides below
  dogTask:2,         // per dog care task
  spinTask:3,        // per spin wheel task done
  bonusTask:2,       // per dog mental health task
  streak7:12,        // 7-day streak bonus
  streak30:60,       // 30-day streak bonus
  dayComplete:6,     // 100% day bonus
  weekComplete:25,   // all 7 days 80%+ bonus
};

// Quality-specific coin rewards (override PTS.task)
const QUALITY_PTS = {
  purple: 5,
  green:  3,
  yellow: 1,
  red:    0,
  gray:   0,
};
const QUALITY_XP = {
  purple: 15,
  green:  8,
  yellow: 3,
  red:    0,
  gray:   0,
};

const DEFAULT_REWARDS_STATE={
  totalEarned:0,    // lifetime points earned
  totalSpent:0,     // lifetime points spent
  redeemed:[],      // [{rewardId, redeemedAt, cost}]
  log:[],           // [{type, pts, label, ts}] — last 30 entries
  lastStreakBonus7:null,   // date string of last 7-day bonus
  lastStreakBonus30:null,  // date string of last 30-day bonus
  lastWeekBonus:null,      // week string of last week bonus
  lastDayBonuses:{},       // {dateStr: true} — 100% day bonuses awarded
};

let rewardsState=load('dr-rewards',DEFAULT_REWARDS_STATE);
let customRewards=load('dr-custom-rewards',[]);
if(!rewardsState.log)rewardsState.log=[];
if(!rewardsState.redeemed)rewardsState.redeemed=[];
if(!rewardsState.lastDayBonuses)rewardsState.lastDayBonuses={};

function getPoints(){return(rewardsState.totalEarned||0)-(rewardsState.totalSpent||0);}

function awardPoints(pts,label,type){
  rewardsState.totalEarned=(rewardsState.totalEarned||0)+pts;
  rewardsState.log.unshift({type,pts,label,ts:Date.now()});
  if(rewardsState.log.length>50)rewardsState.log=rewardsState.log.slice(0,50);
  save('dr-rewards',rewardsState);
  showPtsToast('+'+pts+' pts — '+label);
  // Re-render points badge on today if visible
  const badge=document.getElementById('today-pts-badge');
  if(badge)badge.innerHTML=pixelIcon(ICON_COINS_STACK,18)+''+getPoints()+' coins';
}

function showPtsToast(msg){
  const toast=document.getElementById('pts-toast');if(!toast)return;
  toast.textContent=msg;toast.classList.add('show');
  setTimeout(()=>toast.classList.remove('show'),2500);
}

// Called whenever a routine task is toggled ON or quality orb sets to a checked state
function maybeAwardTaskPoints(taskId,dayIdx,quality){
  const k=dayKey(dayIdx);
  if(!(state[k]&&state[k][taskId]))return;
  // Use quality-specific rates; default to green if quality not specified
  const q=quality||getQuality(dayIdx,taskId)||'green';
  if(q==='red'||q==='gray')return; // no coins for skip/N/A
  const coins=QUALITY_PTS[q]||QUALITY_PTS.green;
  const xp=QUALITY_XP[q]||QUALITY_XP.green;
  const qLabel={purple:'⚡ Legendary!',green:'Done',yellow:'Barely',gray:'N/A',red:'Skipped'}[q]||'Done';
  awardPoints(coins,'Routine task — '+qLabel,taskId);
  awardXP(xp,'Routine task');
  const dateStr=k;
  if(!rewardsState.lastDayBonuses[dateStr]){
    const pct=dayPct(dayIdx);
    if(pct===100){
      rewardsState.lastDayBonuses[dateStr]=true;
      awardPoints(PTS.dayComplete,'Floor cleared!','day-complete');
      awardXP(XP_PTS.dayComplete,'Floor cleared!');
    }
  }
  checkStreakBonuses();
}

function maybeAwardDogPoints(taskId){
  const k=todayStr();
  if(!(dogState[k]&&dogState[k][taskId]))return;
  awardPoints(PTS.dogTask,'Companion care','dog-task');
  awardXP(XP_PTS.dogTask,'Companion care');
  // Award companion XP
  if(!xpState.companionXP)xpState.companionXP={edna:0,kronk:0};
  xpState.companionXP.edna=(xpState.companionXP.edna||0)+10;
  xpState.companionXP.kronk=(xpState.companionXP.kronk||0)+10;
  save('dr-xp',xpState);
}

function maybeAwardSpinPoints(){
  awardPoints(PTS.spinTask,'Random encounter cleared','spin-task');
  awardXP(XP_PTS.spinTask,'Random encounter cleared');
}

function maybeAwardBonusDogPoints(taskId){
  const k=todayStr();
  if(!(dogState[k]&&dogState[k][taskId]))return;
  awardPoints(PTS.bonusTask,'Companion mental moment','bonus-dog');
  awardXP(5,'Companion mental moment');
  if(!xpState.companionXP)xpState.companionXP={edna:0,kronk:0};
  xpState.companionXP.edna=(xpState.companionXP.edna||0)+15;
  xpState.companionXP.kronk=(xpState.companionXP.kronk||0)+15;
  save('dr-xp',xpState);
}

function checkStreakBonuses(){
  const streak=calcStreak();
  const today=todayStr();
  // 7-day streak bonus — once per week
  if(streak>=7&&rewardsState.lastStreakBonus7!==today){
    const lastDate=rewardsState.lastStreakBonus7?new Date(rewardsState.lastStreakBonus7):null;
    const now=new Date();
    if(!lastDate||(now-lastDate)>6*86400000){
      rewardsState.lastStreakBonus7=today;
      awardPoints(PTS.streak7,'7-day streak! 🔥','streak-7');
    }
  }
  // 30-day streak bonus — once per month
  if(streak>=30&&rewardsState.lastStreakBonus30!==today){
    const lastDate=rewardsState.lastStreakBonus30?new Date(rewardsState.lastStreakBonus30):null;
    const now=new Date();
    if(!lastDate||(now-lastDate)>29*86400000){
      rewardsState.lastStreakBonus30=today;
      awardPoints(PTS.streak30,'30-day streak! 🏆','streak-30');
    }
  }
}

function redeemReward(rewardId){
  const reward=DEFAULT_REWARDS.find(r=>r.id===rewardId);if(!reward)return;
  const pts=getPoints();
  if(pts<reward.cost){showPtsToast('Not enough points yet!');return;}
  if(!confirm(`Redeem "${reward.name}" for ${reward.cost} 🪙?\n\n→ ${reward.real}`))return;
  rewardsState.totalSpent=(rewardsState.totalSpent||0)+reward.cost;
  rewardsState.redeemed.push({rewardId,redeemedAt:Date.now(),cost:reward.cost});
  rewardsState.log.unshift({type:'redeem',pts:-reward.cost,label:'Redeemed: '+reward.name,ts:Date.now()});
  save('dr-rewards',rewardsState);
  fireConfetti();
  showPtsToast('🎉 '+reward.name+' unlocked!');
  renderRewards();
}



/* ─── CUSTOM REWARDS ─────────────────────────────────────────────────────── */
function addCustomReward(){
  const nameEl=document.getElementById('custom-reward-name');
  const costEl=document.getElementById('custom-reward-cost');
  const name=(nameEl.value||'').trim();
  const cost=parseInt(costEl.value)||0;
  if(!name||cost<1){showPtsToast('Name and cost required');return;}
  customRewards.push({id:'custom-'+Date.now(),name,cost,custom:true});
  save('dr-custom-rewards',customRewards);
  nameEl.value='';costEl.value='';
  renderRewards();
}
function deleteCustomReward(id){
  customRewards=customRewards.filter(r=>r.id!==id);
  save('dr-custom-rewards',customRewards);
  renderRewards();
}
function addCustomRewardToSupabase(){
  // Placeholder — sync handled by main save
}

function spendCoins(cost, label){
  if(getPoints()<cost){showPtsToast('Not enough coins');return;}
  rewardsState.totalSpent=(rewardsState.totalSpent||0)+cost;
  rewardsState.log.unshift({type:'spend',pts:-cost,label:'Bought: '+label,ts:Date.now()});
  if(rewardsState.log.length>50)rewardsState.log=rewardsState.log.slice(0,50);
  save('dr-rewards',rewardsState);
  renderRewards();
  showPtsToast('-'+cost+' coins · '+label);
}

function renderRewards(){
  const wrap=document.getElementById('rewards-content');if(!wrap)return;
  const pts=getPoints();
  const earned=rewardsState.totalEarned||0;
  const spent=rewardsState.totalSpent||0;
  const coinImg=pixelIcon(ICON_COIN,13);

  // Points breakdown pills
  const todayKey=todayStr();
  const todayLog=rewardsState.log.filter(e=>{
    const d=new Date(e.ts);
    return`${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`===todayKey;
  });
  const todayPts=todayLog.reduce((a,e)=>a+(e.pts>0?e.pts:0),0);
  const streak=calcStreak();

  // Tiers
  const tiers=[
    {key:'small',label:'⭐ Small (25–50 pts)'},
    {key:'medium',label:'⭐⭐ Medium (100–150 pts)'},
    {key:'large',label:'⭐⭐⭐ Large (250–300 pts)'},
    {key:'epic',label:'⭐⭐⭐⭐ Epic (500+ pts)'},
  ];

  const tierHtml=tiers.map(tier=>{
    const rewards=DEFAULT_REWARDS.filter(r=>r.tier===tier.key);
    const items=rewards.map(r=>{
      const canAfford=pts>=r.cost;
      const timesRedeemed=rewardsState.redeemed.filter(x=>x.rewardId===r.id).length;
      return`<div class="reward-item${canAfford?' affordable':''}">
        <div class="reward-emoji">${r.emoji}</div>
        <div class="reward-info">
          <div class="reward-name">${r.name}</div>
          <div style="font-size:10px;color:var(--muted);line-height:1.5;margin:3px 0;">${r.desc}</div>
          <div style="font-size:10px;color:var(--hint);font-style:italic;">→ ${r.real}</div>
          <div class="reward-cost${canAfford?' can-afford':''}" style="margin-top:4px;">${coinImg}${r.cost}${timesRedeemed>0?' · redeemed '+timesRedeemed+'×':''}</div>

        </div>
        ${canAfford?pixelIcon(ICON_CHEST,12)+' Redeem':coinImg+r.cost}
        </button>
      </div>`;
    }).join('');
    return`<div class="reward-tier"><div class="tier-label">${tier.label}</div>${items}</div>`;
  }).join('');

  // Recent history
  const recentLog=rewardsState.log.slice(0,8);
  const historyHtml=recentLog.length?recentLog.map(e=>{
    const d=new Date(e.ts);
    const dateStr=d.toLocaleDateString('en-US',{month:'short',day:'numeric'});
    const timeStr=d.toLocaleTimeString('en-US',{hour:'numeric',minute:'2-digit'});
    return`<div class="history-row">
      <span class="history-name">${e.label}</span>
      <span class="history-meta" style="color:${e.pts>0?'var(--teal)':'var(--red)'};">${e.pts>0?'+':''}${e.pts} pts <span style="color:var(--hint);">· ${dateStr}</span></span>
    </div>`;
  }).join(''):'<div style="font-size:12px;color:var(--hint);text-align:center;padding:12px;">No activity yet — start completing tasks!</div>';

  // How to earn section
  const earnHtml=`
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-top:4px;">
      ${[
        ['Purple (Legendary)',`5 ${coinImg} / 15 ⚡`,pixelIcon(ORB_PURPLE,20)],
      ['Green (Done)',`3 ${coinImg} / 8 ⚡`,pixelIcon(ORB_TEAL,20)],
      ['Yellow (Barely)',`1 ${coinImg} / 3 ⚡`,pixelIcon(ORB_YELLOW,20)],
      ['Dog care task',`2 ${coinImg} / 8 ⚡`,pixelIcon(ICON_PAW,20)],
      ['Spin encounter done',`3 ${coinImg} / 10 ⚡`,pixelIcon(ICON_FIRE,20)],
      ['100% day bonus',`6 ${coinImg} / 25 ⚡`,pixelIcon(ICON_STAR,20)],
      ['7-day streak',`12 ${coinImg}`,'🔥'],
      ['30-day streak',`60 ${coinImg}`,'🏆'],
      ].map(([label,pts,icon])=>`<div style="background:var(--surface2);border-radius:var(--radius-sm);padding:10px;display:flex;align-items:center;gap:8px;">
        <span style="font-size:16px;">${icon}</span>
        <div><div style="font-size:11px;color:var(--text);">${label}</div><div style="font-size:12px;color:var(--teal);font-weight:500;">${pts}</div></div>
      </div>`).join('')}
    </div>`;


  // ── Vending Machine Food ──────────────────────────────────────────────
  const VENDING_FOOD=[
    {id:'fries',    name:'Crawler Fries',    icon:ICON_FRIES,        real:'~$3',   coins:15,  desc:'Hot and acceptable.'},
    {id:'cookie',   name:'Mystery Cookie',   icon:ICON_COOKIE,       real:'~$2',   coins:10,  desc:'Probably fine.'},
    {id:'sandwich', name:'Dungeon Sandwich', icon:ICON_SANDWICH,     real:'~$6',   coins:30,  desc:'A respectable meal.'},
    {id:'lunch',    name:'Full Meal',        icon:ICON_DINNER_PLATE, real:'$8–10', coins:45,  desc:'Actual food. Good job.'},
    {id:'pizza',    name:'Floor Pizza',      icon:ICON_PIZZA,        real:'~$15',  coins:75,  desc:'Treat. You earned it.'},
  ];
  const foodHtml=`<div class="food-grid">${VENDING_FOOD.map(f=>{
    const can=pts>=f.coins;
    return`<div class="food-item${can?' affordable':''}">
      <div class="food-icon">${pixelIcon(f.icon,36)}</div>
      <div class="food-name">${f.name}</div>
      <div class="food-real">${f.real} IRL</div>
      <div class="food-cost">${pixelIcon(ICON_COINS_STACK,12)} ${f.coins} coins</div>
      <button class="food-btn" ${!can?'disabled':''} onclick="spendCoins(${f.coins},'${f.name}')">
        ${can?'Redeem':'Need '+f.coins}
      </button>
    </div>`;
  }).join('')}</div>`;

  wrap.innerHTML=`
    <div class="points-hero">
      <div class="points-total">${pixelIcon(ICON_COINS_STACK,32)}${pts}</div>
      <div class="points-label">crawler coins available</div>
      <div class="points-breakdown">
        <span class="pts-pill">${coinImg}<span>${earned}</span> earned</span>
        <span class="pts-pill">${coinImg}<span>${spent}</span> spent</span>
        <span class="pts-pill">${coinImg}<span>+${todayPts}</span> today</span>
        <span class="pts-pill"><span>${streak}</span> day streak</span>
      </div>
    </div>
    <div class="section-label" style="margin-top:0;">How to earn</div>
    ${earnHtml}
    <div class="section-label">Vending Machine</div>
    ${foodHtml}
    <div class="section-label">Rewards</div>
    ${tierHtml}
    <div class="reward-history">
      <h3>Recent activity</h3>
      ${historyHtml}
    </div>

    <div class="section-label" style="margin-top:20px;">My Rewards</div>
    ${customRewards.length?customRewards.map(r=>{
      const can=pts>=r.cost;
      return '<div class="reward-item'+(can?' affordable':'')+'" style="margin-bottom:6px;display:flex;align-items:center;gap:8px;">'+
        '<div class="reward-info" style="flex:1;"><div class="reward-name">'+r.name+'</div>'+
        '<div class="reward-cost'+(can?' can-afford':'')+'">'+coinImg+r.cost+'</div></div>'+
        '<button class="redeem-btn" onclick="spendCoins('+r.cost+',\''+r.name.replace(/'/g,'')+'\')" '+(can?'':'disabled')+'>'+
        (can?pixelIcon(ICON_CHEST,12)+' Redeem':coinImg+r.cost)+'</button>'+
        '<button onclick="deleteCustomReward(\''+r.id+'\')" style="background:none;border:none;color:var(--hint);cursor:pointer;font-size:18px;padding:0 6px;" title="Remove">×</button>'+
        '</div>';
    }).join(''):'<div style="font-size:12px;color:var(--hint);padding:6px 0 12px;">No custom rewards yet.</div>'}

    <div class="custom-reward-form">
      <div style="font-size:10px;color:var(--hint);margin-bottom:8px;font-family:var(--font-game);letter-spacing:0.08em;">ADD CUSTOM REWARD</div>
      <div style="display:flex;gap:8px;margin-bottom:6px;">
        <input id="custom-reward-name" type="text" placeholder="Reward name…"
          style="flex:1;background:var(--surface2);border:0.5px solid rgba(251,191,36,0.2);border-radius:var(--radius-sm);padding:8px 10px;color:var(--text);font-size:13px;" />
        <input id="custom-reward-cost" type="number" placeholder="🪙" min="1"
          style="width:64px;background:var(--surface2);border:0.5px solid rgba(251,191,36,0.2);border-radius:var(--radius-sm);padding:8px;color:var(--text);font-family:var(--font-game);font-size:12px;text-align:center;" />
      </div>
      <button onclick="addCustomReward()"
        style="width:100%;background:rgba(251,191,36,0.08);border:0.5px solid rgba(251,191,36,0.3);border-radius:var(--radius-sm);padding:9px;color:var(--gold);font-family:var(--font-game);font-size:11px;cursor:pointer;letter-spacing:0.05em;">+ ADD REWARD</button>
    </div>`;
}

/* ─── PATCH: award points when tasks are toggled ─────────────────────────── */
// We'll hook into toggleTask, toggleDogTask, markSpinDone, toggleDogTask for mental
/* ─── GYM TAB ────────────────────────────────────────────────────────────── */
function fmtElapsed(ms){const m=Math.floor(ms/60000),s=Math.floor((ms%60000)/1000);return`${m}:${s.toString().padStart(2,'0')}`;}

function renderGym(){
  const wrap=document.getElementById('gym-content');if(!wrap)return;
  if(!gymSession)renderGymSelect(wrap);
  else if(gymSession.complete)renderGymComplete(wrap);
  else renderGymSession(wrap);
}

function renderGymSelect(wrap){
  const prs=gymHistory.prs||{};
  const prEntries=Object.entries(prs).slice(0,4);
  const allEx=Object.values(GYM_TEMPLATES).flatMap(t=>t.exercises||[]);
  wrap.innerHTML=`
    <div class="gym-header">
      <div class="gym-title">SELECT WORKOUT</div>
      <div class="gym-subtitle">Choose your template to begin</div>
    </div>
    <div class="gym-template-grid">
      <button class="gym-template-btn" onclick="startGymSession('upper')">
        <div class="gym-template-name">Upper Body</div>
        <div class="gym-template-detail">6 exercises · Lat, Row, Chest, Arms</div>
      </button>
      <button class="gym-template-btn" onclick="startGymSession('legs')">
        <div class="gym-template-name">Leg Day</div>
        <div class="gym-template-detail">4 exercises · Press, Extension, Curl, Adductor</div>
      </button>
      <button class="gym-template-btn gym-template-cardio" onclick="startGymSession('cardio')">
        <div class="gym-template-name">Cardio</div>
        <div class="gym-template-detail">Elliptical · Duration + Distance + Resistance</div>
      </button>
    </div>
    ${prEntries.length?`<div class="gym-section-label" style="margin-top:20px;">Recent PRs</div>
    ${prEntries.map(([id,w])=>{const ex=allEx.find(e=>e.id===id);return ex?`<div class="gym-pr-row"><span class="gym-pr-name">${ex.name}</span><span class="gym-pr-val">${w} lbs</span></div>`:''}).join('')}`:''}`;
}

function startGymSession(templateKey){
  gymSession={template:templateKey,startTime:Date.now(),exercises:{},cardio:{resistance:8,distance:''},complete:false};
  gymActiveExercise=null;
  Object.assign(gymInputs,{weight:{},reps:{},effort:{}});
  saveLocal('dr-gym-session',gymSession);
  clearInterval(gymElapsedInterval);
  gymElapsedInterval=setInterval(()=>{const el=document.getElementById('gym-elapsed');if(el)el.textContent=fmtElapsed(Date.now()-gymSession.startTime);},1000);
  renderGym();
}

function renderGymSession(wrap){
  const template=GYM_TEMPLATES[gymSession.template];
  if(gymSession.template==='cardio'){renderGymCardio(wrap);return;}
  const exercises=template.exercises;
  const totalSets=exercises.reduce((a,ex)=>a+(gymSession.exercises[ex.id]?.sets?.length||0),0);
  const doneCount=exercises.filter(ex=>gymSession.exercises[ex.id]?.done).length;

  const exHtml=exercises.map(ex=>{
    const exS=gymSession.exercises[ex.id]||{};
    const sets=exS.sets||[];
    const isDone=exS.done;
    const isActive=gymActiveExercise===ex.id;
    if(!gymInputs.weight[ex.id])gymInputs.weight[ex.id]=gymHistory.prs[ex.id]||45;
    if(!gymInputs.reps[ex.id])gymInputs.reps[ex.id]=10;
    if(!gymInputs.effort[ex.id])gymInputs.effort[ex.id]='solid';
    const prevW=gymHistory.prs[ex.id];

    const setsLog=sets.map((s,i)=>`<div class="gym-set-log">Set ${i+1}: ${s.weight} lbs × ${s.reps} — ${GYM_EFFORT.find(e=>e.id===s.effort)?.label||s.effort}</div>`).join('');

    const panel=isActive?`<div class="gym-log-panel">
      ${sets.length===0&&prevW?`<div class="gym-prev-weight">Previous best: ${prevW} lbs</div>`:''}
      <div class="gym-inputs-row">
        <div class="gym-input-group">
          <div class="gym-input-label">WEIGHT (lbs)</div>
          <div class="gym-stepper">
            <button onclick="gymAdj('weight','${ex.id}',-5)">−</button>
            <span id="gw-${ex.id}">${gymInputs.weight[ex.id]}</span>
            <button onclick="gymAdj('weight','${ex.id}',5)">+</button>
          </div>
        </div>
        <div class="gym-input-group">
          <div class="gym-input-label">REPS</div>
          <div class="gym-stepper">
            <button onclick="gymAdj('reps','${ex.id}',-1)">−</button>
            <span id="gr-${ex.id}">${gymInputs.reps[ex.id]}</span>
            <button onclick="gymAdj('reps','${ex.id}',1)">+</button>
          </div>
        </div>
      </div>
      <div class="gym-effort-row">
        ${GYM_EFFORT.map(e=>`<button class="gym-effort-btn${gymInputs.effort[ex.id]===e.id?' active':''}" onclick="gymPickEffort('${ex.id}','${e.id}')">${e.label}</button>`).join('')}
      </div>
      ${setsLog}
      <div class="gym-action-row">
        <button class="gym-log-btn" onclick="logGymSet('${ex.id}')">LOG SET</button>
        ${sets.length>0?`<button class="gym-done-ex-btn" onclick="doneGymEx('${ex.id}')">Done with Exercise ✓</button>`:''}
      </div>
    </div>`:(sets.length>0?`<div style="padding:0 12px 8px;">${setsLog}</div>`:'');

    return`<div class="gym-ex-row${isDone?' done':''}${isActive?' active':''}" ${!isDone&&!isActive?`onclick="openGymEx('${ex.id}')"`:''}> 
      <div class="gym-ex-check">${isDone?'✓':''}</div>
      <div class="gym-ex-info">
        <div class="gym-ex-name">${ex.name}</div>
        ${sets.length>0&&!isActive?`<div class="gym-ex-sets">${sets.length} set${sets.length!==1?'s':''} logged</div>`:''}
      </div>
      ${!isDone&&!isActive?`<span class="gym-ex-tap">tap</span>`:''}
    </div>${panel}`;
  }).join('');

  wrap.innerHTML=`
    <div class="gym-session-header">
      <div class="gym-session-title">${template.name.toUpperCase()}</div>
      <div class="gym-session-meta"><span id="gym-elapsed">${fmtElapsed(Date.now()-gymSession.startTime)}</span> · ${doneCount}/${exercises.length} exercises · ${totalSets} sets</div>
    </div>
    <div id="gym-pr-banner"></div>
    ${gymRestSecondsLeft>0?`<div class="gym-rest-timer">
      <div class="gym-rest-label">REST PERIOD</div>
      <div class="gym-rest-countdown" id="gym-rest-cd">${gymRestSecondsLeft}</div>
      <div class="gym-rest-msg">"${DCC.getRandom(['Use the time. Don\'t scroll. I\'m watching.','Ninety seconds. Sit down. Breathe.','Rest period. This is not optional.'])}" — Princess Donut</div>
      <button class="gym-rest-skip" onclick="skipRest()">Skip Rest</button>
    </div>`:''}
    <div class="gym-ex-list">${exHtml}</div>
    <button class="gym-end-btn" onclick="endGymSession()">End Session</button>`;
}

function openGymEx(id){gymActiveExercise=id;renderGym();setTimeout(()=>{document.querySelector('.gym-ex-row.active')?.scrollIntoView({behavior:'smooth',block:'start'});},80);}

function gymAdj(type,id,d){
  if(type==='weight')gymInputs.weight[id]=Math.max(0,(gymInputs.weight[id]||0)+d);
  else gymInputs.reps[id]=Math.max(1,(gymInputs.reps[id]||10)+d);
  const el=document.getElementById(type==='weight'?`gw-${id}`:`gr-${id}`);
  if(el)el.textContent=gymInputs[type][id];
}

function gymPickEffort(id,eff){gymInputs.effort[id]=eff;renderGym();}

function logGymSet(id){
  const w=gymInputs.weight[id]||45,r=gymInputs.reps[id]||10,e=gymInputs.effort[id]||'solid';
  if(!gymSession.exercises[id])gymSession.exercises[id]={sets:[],done:false};
  gymSession.exercises[id].sets.push({weight:w,reps:r,effort:e});
  saveLocal('dr-gym-session',gymSession);
  const isPR=checkGymPR(id,w);
  startRestTimer();
  renderGym();
  if(isPR)showGymPR(id,w);
}

function checkGymPR(id,w){
  if(w>(gymHistory.prs[id]||0)){gymHistory.prs[id]=w;saveLocal('dr-gym-history',gymHistory);return true;}
  return false;
}

function showGymPR(id,w){
  const el=document.getElementById('gym-pr-banner');if(!el)return;
  const allEx=Object.values(GYM_TEMPLATES).flatMap(t=>t.exercises||[]);
  const name=allEx.find(e=>e.id===id)?.name||id;
  el.innerHTML=`<div class="gym-pr-flash">
    <div class="gym-pr-title">⭐ PERSONAL RECORD</div>
    <div class="gym-pr-ex">${name} — ${w} lbs</div>
    <div class="donut-msg-wrap"><span class="donut-signature">Princess Donut:</span><p class="donut-msg">${DCC.getRandom(['A personal record. In my dungeon. The audience will be talking about this.','PR day. Purple tier. The dungeon has logged this in the permanent record.','New record. You exceeded yourself. I find this acceptable and also impressive.'])}</p></div>
  </div>`;
  setTimeout(()=>{if(el)el.innerHTML='';},5000);
}

function startRestTimer(){
  clearInterval(gymRestInterval);gymRestSecondsLeft=90;
  gymRestInterval=setInterval(()=>{
    gymRestSecondsLeft--;
    const el=document.getElementById('gym-rest-cd');
    if(el)el.textContent=gymRestSecondsLeft;
    if(gymRestSecondsLeft<=0){clearInterval(gymRestInterval);gymRestSecondsLeft=0;renderGym();}
  },1000);
}

function skipRest(){clearInterval(gymRestInterval);gymRestSecondsLeft=0;renderGym();}

function doneGymEx(id){
  if(!gymSession.exercises[id])gymSession.exercises[id]={sets:[],done:false};
  gymSession.exercises[id].done=true;
  gymActiveExercise=null;
  saveLocal('dr-gym-session',gymSession);
  renderGym();
}

function endGymSession(){
  const template=GYM_TEMPLATES[gymSession.template];
  const exercises=template.exercises||[];
  const undone=exercises.filter(ex=>!gymSession.exercises[ex.id]?.done);
  if(undone.length>0){
    const ov=document.createElement('div');ov.id='gym-end-ov';
    ov.style.cssText='position:fixed;inset:0;background:rgba(0,0,0,0.88);z-index:999;display:flex;align-items:center;justify-content:center;padding:16px;';
    ov.innerHTML=`<div style="background:var(--surface);border:1px solid rgba(251,191,36,0.3);border-radius:var(--radius);padding:20px;max-width:340px;width:100%;">
      <div style="font-family:var(--font-game);font-size:9px;color:var(--amber);letter-spacing:0.1em;margin-bottom:12px;">END SESSION?</div>
      <div style="font-family:var(--font-body);font-size:13px;color:var(--muted);margin-bottom:16px;">${undone.length} exercise${undone.length!==1?'s':''} remaining:<br>${undone.map(e=>`· ${e.name}`).join('<br>')}</div>
      <div style="display:flex;gap:10px;">
        <button onclick="document.getElementById('gym-end-ov').remove()" style="flex:1;background:var(--surface2);border:1px solid rgba(251,191,36,0.2);color:var(--text);border-radius:var(--radius-sm);padding:10px;font-family:var(--font-body);font-size:13px;cursor:pointer;">Keep Going</button>
        <button onclick="confirmEndGym();document.getElementById('gym-end-ov').remove()" style="flex:1;background:rgba(255,92,92,0.15);border:1px solid var(--red);color:var(--red);border-radius:var(--radius-sm);padding:10px;font-family:var(--font-body);font-size:13px;cursor:pointer;">End Session</button>
      </div>
    </div>`;
    document.body.appendChild(ov);
  } else {confirmEndGym();}
}

function confirmEndGym(){
  clearInterval(gymElapsedInterval);clearInterval(gymRestInterval);gymRestSecondsLeft=0;
  const template=GYM_TEMPLATES[gymSession.template];
  const exercises=template.exercises||[];
  const doneCount=exercises.filter(ex=>gymSession.exercises[ex.id]?.done).length;
  const totalSets=exercises.reduce((a,ex)=>a+(gymSession.exercises[ex.id]?.sets?.length||0),0);
  const duration=Math.min(180,Math.round((Date.now()-gymSession.startTime)/60000));
  const isFull=doneCount===exercises.length;
  const hasPR=exercises.some(ex=>(gymSession.exercises[ex.id]?.sets||[]).some(s=>s.weight>=(gymHistory.prs[ex.id]||Infinity)&&gymHistory.prs[ex.id]>0));
  const orbLevel=hasPR?'purple':doneCount>0?'green':'yellow';

  // Set gym orb + check on daily floor
  const todayIdx=new Date().getDay();
  const k=dayKey(todayIdx);
  if(!qualityState[k])qualityState[k]={};
  qualityState[k]['gym']=orbLevel;
  if(!state[k])state[k]={};
  state[k]['gym']=true;state[k]['gym_ts']=Date.now();
  save('dr-state',state);save('dr-quality',qualityState);

  // Award economy
  const qPts={purple:5,green:3,yellow:1};
  const qXP={purple:15,green:8,yellow:3};
  awardPoints(qPts[orbLevel]||0,'Gym session','gym-session');
  awardXP(qXP[orbLevel]||0,'Gym session');

  // Save session to history
  gymHistory.sessions=(gymHistory.sessions||[]);
  gymHistory.sessions.unshift({date:todayStr(),template:gymSession.template,doneCount,totalSets,duration,isFull,hasPR});
  if(gymHistory.sessions.length>30)gymHistory.sessions=gymHistory.sessions.slice(0,30);
  saveLocal('dr-gym-history',gymHistory);

  Object.assign(gymSession,{complete:true,doneCount,totalSets,duration,isFull,hasPR,orbLevel,templateName:template.name,totalEx:exercises.length});
  saveLocal('dr-gym-session',gymSession);
  renderGym();
}

function renderGymComplete(wrap){
  const donutLines=gymSession.isFull
    ?['Full session. The dungeon respects this.','Every machine. Every set. Combat Ready buff active. Well done, Crawler.','Complete. All exercises logged. The audience found it inspiring. I found it adequate. Both are true.']
    :['Modified session. Something is better than nothing. The dungeon logs the effort.','Partial completion. The machines were occupied. The dungeon understands gym etiquette.'];
  wrap.innerHTML=`
    <div class="gym-complete-card">
      <div class="gym-complete-title">${gymSession.isFull?'FLOOR CLEARED: GYM':'SESSION COMPLETE: PARTIAL'}</div>
      <div class="gym-complete-divider"></div>
      <div class="gym-complete-stats">
        <div class="gym-stat">
          <div class="gym-stat-label">Session</div>
          <div class="gym-stat-val">${gymSession.templateName}</div>
        </div>
        <div class="gym-stat">
          <div class="gym-stat-label">Duration</div>
          <div class="gym-stat-val">${gymSession.duration} min</div>
        </div>
        <div class="gym-stat">
          <div class="gym-stat-label">Exercises</div>
          <div class="gym-stat-val">${gymSession.doneCount}/${gymSession.totalEx}</div>
        </div>
        <div class="gym-stat">
          <div class="gym-stat-label">Sets</div>
          <div class="gym-stat-val">${gymSession.totalSets}</div>
        </div>
      </div>
      ${gymSession.hasPR?`<div class="gym-pr-complete">⭐ Personal Record Today!</div>`:''}
      <div class="gym-complete-buff">
        <div class="gym-complete-orb gym-orb-${gymSession.orbLevel}"></div>
        Combat Ready
      </div>
      <div class="gym-complete-divider"></div>
      <div class="donut-msg-wrap"><span class="donut-signature">Princess Donut:</span><p class="donut-msg">${DCC.getRandom(donutLines)}</p></div>
      <button class="gym-done-btn" onclick="clearGymSession()">DONE</button>
    </div>`;
}

function clearGymSession(){
  gymSession=null;gymActiveExercise=null;
  clearInterval(gymElapsedInterval);clearInterval(gymRestInterval);gymRestSecondsLeft=0;
  gymInputs.weight={};gymInputs.reps={};gymInputs.effort={};
  saveLocal('dr-gym-session',null);
  renderGym();
}

function renderGymCardio(wrap){
  const c=gymSession.cardio;
  wrap.innerHTML=`
    <div class="gym-session-header">
      <div class="gym-session-title">CARDIO — ELLIPTICAL</div>
      <div class="gym-session-meta"><span id="gym-elapsed">${fmtElapsed(Date.now()-gymSession.startTime)}</span> elapsed</div>
    </div>
    <div class="gym-cardio-form">
      <div class="gym-input-group">
        <div class="gym-input-label">RESISTANCE LEVEL</div>
        <div class="gym-stepper">
          <button onclick="gymCardioAdj('resistance',-1)">−</button>
          <span id="gym-cr">${c.resistance||8}</span>
          <button onclick="gymCardioAdj('resistance',1)">+</button>
        </div>
      </div>
      <div class="gym-input-group" style="margin-top:16px;">
        <div class="gym-input-label">DISTANCE (miles — from machine)</div>
        <input type="number" step="0.1" min="0" value="${c.distance||''}" placeholder="0.0" id="gym-cd"
          style="background:var(--surface2);border:0.5px solid rgba(251,191,36,0.2);border-radius:var(--radius-sm);padding:12px;color:var(--text);font-family:var(--font-game);font-size:16px;width:100%;text-align:center;">
      </div>
    </div>
    <button class="gym-end-btn" style="margin-top:24px;" onclick="endGymCardio()">End Session</button>`;
}

function gymCardioAdj(f,d){
  gymSession.cardio[f]=Math.max(1,(gymSession.cardio[f]||8)+d);
  const el=document.getElementById('gym-cr');if(el)el.textContent=gymSession.cardio[f];
  saveLocal('dr-gym-session',gymSession);
}

function endGymCardio(){
  const distEl=document.getElementById('gym-cd');
  gymSession.cardio.distance=distEl?parseFloat(distEl.value)||0:0;
  clearInterval(gymElapsedInterval);clearInterval(gymRestInterval);
  const duration=Math.min(180,Math.round((Date.now()-gymSession.startTime)/60000));
  const todayIdx=new Date().getDay();const k=dayKey(todayIdx);
  if(!qualityState[k])qualityState[k]={};qualityState[k]['gym']='green';
  if(!state[k])state[k]={};state[k]['gym']=true;state[k]['gym_ts']=Date.now();
  save('dr-state',state);save('dr-quality',qualityState);
  awardPoints(3,'Cardio session','gym-session');awardXP(8,'Cardio session');
  Object.assign(gymSession,{complete:true,doneCount:1,totalSets:0,duration,isFull:true,hasPR:false,orbLevel:'green',templateName:'Cardio — Elliptical',totalEx:1});
  saveLocal('dr-gym-session',gymSession);
  renderGym();
}
/* ─── SCREEN NAV (updated) ───────────────────────────────────────────────── */
/* ─── DUNGEON MAP NAVIGATION ─────────────────────────────────────────────── */

const ROOMS={
  today:  {name:'The Floor',       label:'FLOOR',    door:()=>ENV_DOOR_GOLD_OPEN,  header:'THE FLOOR',       color:'var(--amber)'},
  dogs:   {name:'The Kennels',     label:'KENNELS',  door:()=>ENV_DOOR_DAMAGED,    header:'THE KENNELS',     color:'var(--amber)'},
  spin:   {name:'The Arena',       label:'ARENA',    door:()=>ENV_DOOR_DANGER,     header:'THE ARENA',       color:'var(--red)'},
  gym:    {name:'The Gym',         label:'GYM',      door:()=>ENV_DOOR_TEAL_LOCKED,header:'THE GYM',         color:'var(--teal)'},
  inbox:  {name:'The Comm Tower',  label:'COMMS',    door:()=>ENV_DOOR_BLUE_MAGIC, header:'THE COMM TOWER',  color:'var(--blue)'},
  rewards:{name:'The Vault',       label:'VAULT',    door:()=>ENV_DOOR_GOLD_CLOSED,header:'THE VAULT',       color:'var(--amber)'},
  profile:{name:'The War Room',    label:'WAR ROOM', door:()=>ENV_DOOR_TEAL_CROSS, header:'THE WAR ROOM',    color:'var(--teal)'},
  coach:  {name:"Donut's Chamber", label:'DONUT',    door:()=>ENV_DOOR_ROYAL,      header:"DONUT'S CHAMBER", color:'var(--purple)'},
};

const ROOM_ADJ={
  today:  ['dogs','gym'],
  dogs:   ['today','coach'],
  spin:   ['today','gym'],
  gym:    ['today','spin','profile'],
  inbox:  ['profile'],
  rewards:['profile'],
  profile:['gym','rewards','inbox'],
  coach:  ['dogs','today'],
};

// Map node centers (% of layout container)
const MAP_POS={
  coach:  {x:50, y:12},
  today:  {x:42, y:35},
  dogs:   {x:72, y:35},
  spin:   {x:72, y:52},
  gym:    {x:42, y:52},
  profile:{x:42, y:68},
  rewards:{x:72, y:68},
  inbox:  {x:42, y:80},
};

const SEALED_ROOMS=[
  {id:'archive',         label:'The Archive',        x:20, y:92},
  {id:'shrine',          label:'The Shrine',          x:42, y:92},
  {id:'counting-house',  label:'The Counting House',  x:72, y:92},
  {id:'apothecary',      label:'The Apothecary',      x:12, y:12},
  {id:'mess-hall',       label:'The Mess Hall',       x:78, y:18},
];

let ednaPatrolInterval=null;
let ednaPatrolLeft=57;
let ednaPatrolDir=-1; // -1 = toward Floor, 1 = toward Kennels
let currentRoom=loadLocal('dr-last-screen','today')||'today';

function showSealedRoom(){
  // Remove any existing instance
  const existing=document.getElementById('sealed-room-modal');
  if(existing)existing.remove();

  const modal=document.createElement('div');
  modal.id='sealed-room-modal';
  modal.className='sealed-room-modal';
  modal.innerHTML=`
    <div class="sealed-room-card">
      <div class="sealed-room-title">AREA LOCKED</div>
      <div class="sealed-room-body">
        This section of the dungeon is not yet accessible.<br><br>
        The dungeon is still being constructed.<br>
        Check back later, Crawler.
      </div>
      <div class="sealed-room-quote">
        "I would let you in but even I don't have clearance for this one yet."
        <span>— Princess Donut</span>
      </div>
      <button class="sealed-room-close" onclick="document.getElementById('sealed-room-modal').remove()">CLOSE</button>
    </div>`;

  // Close on backdrop tap
  modal.addEventListener('click', e=>{
    if(e.target===modal)modal.remove();
  });

  document.body.appendChild(modal);
}

function showRoom(name){
  stopEdnaPatrol();
  if(name==='map'){showMap();return;}
  if(!ROOMS[name])return;
  const prev=document.getElementById('screen-'+currentRoom);
  if(prev)prev.classList.add('room-exiting');
  setTimeout(()=>{
    if(prev)prev.classList.remove('room-exiting');
    document.body.classList.remove('map-active');  // ← add here
    currentRoom=name;
    document.querySelectorAll('.screen').forEach(s=>s.classList.remove('active'));
    const scr=document.getElementById('screen-'+name);
    if(scr){scr.classList.add('active','room-entering');setTimeout(()=>scr.classList.remove('room-entering'),350);}
    saveLocal('dr-last-screen',name);
    renderRoomBorder(name);
    if(name==='today')renderToday();
    else if(name==='dogs')renderDogs();
    else if(name==='spin'){updateProjectDropdown();refreshWheel();renderAvoidance();renderTaskManager();}
    else if(name==='inbox'){renderInbox();setTimeout(()=>{const i=document.getElementById('inbox-input');if(i)i.onkeydown=e=>{if(e.key==='Enter')addInboxItem();};},50);}
    else if(name==='shop'){renderShop();setTimeout(()=>{const i=document.getElementById('shop-input');if(i)i.onkeydown=e=>{if(e.key==='Enter')addShopItem();};},50);}
    else if(name==='rewards')renderRewards();
    else if(name==='profile')renderProfile();
    else if(name==='coach')renderCoach();
    else if(name==='gym')renderGym();
  },150);
}

function showMap(){
  const prev=document.getElementById('screen-'+currentRoom);
  if(prev)prev.classList.add('room-exiting');
  setTimeout(()=>{
    if(prev)prev.classList.remove('room-exiting');
    currentRoom='map';
    document.querySelectorAll('.screen').forEach(s=>s.classList.remove('active'));
    const ms=document.getElementById('screen-map');
    if(ms){ms.classList.add('active','map-entering');setTimeout(()=>ms.classList.remove('map-entering'),350);}
    const border=document.getElementById('room-border');
    if(border)border.innerHTML='';
    document.body.classList.add('map-active');  // ← add this
    renderMap();
  },150);
}

function renderRoomBorder(name){
  const border=document.getElementById('room-border');if(!border)return;
  const adj=ROOM_ADJ[name]||[];

  const exits=adj.map(id=>{
    const room=ROOMS[id];if(!room)return'';
    const isBoss=id==='spin'&&typeof bossActive!=='undefined'&&bossActive;
    const hasAttn=(
      (id==='today'&&countDebuffs()>=3)||
      (id==='dogs'&&typeof dogPct!=='undefined'&&dogPct<100)||
      (id==='inbox'&&inbox.length>0)||
      (id==='rewards'&&getPoints()>0)||
      isBoss||
      (id==='coach'&&donutWeeklySummary?.week_number===getWeekNumber())
    );
    return`<button class="room-exit-btn" onclick="showRoom('${id}')">
      <div class="room-exit-thumb-wrap">
        <img src="${room.door()}" class="room-exit-door" width="48" height="48" alt="${room.name}">
        ${hasAttn?`<span class="room-exit-attn-dot"></span>`:''}
      </div>
      <span class="room-exit-label">${room.label}</span>
    </button>`;
  }).join('');

  border.innerHTML=`<div class="room-border-inner">
    <div class="room-exits">${exits}</div>
    <button class="room-map-btn" onclick="showMap()">
      <img src="${ENV_DUNGEON_MAP}" width="24" height="24" alt="Map" style="image-rendering:pixelated;">
      <span class="room-map-label">MAP</span>
    </button>
  </div>`;
}

function stopEdnaPatrol(){
  if(ednaPatrolInterval){clearInterval(ednaPatrolInterval);ednaPatrolInterval=null;}
}

function startEdnaPatrol(){
  stopEdnaPatrol();
  if(window.matchMedia('(prefers-reduced-motion: reduce)').matches)return;
  const MIN=MAP_POS.today.x; // 42
  const MAX=MAP_POS.dogs.x;  // 72
  const RANGE=MAX-MIN;       // 30
  const DURATION=8000;       // 8s full loop
  const STEP=RANGE/(DURATION/50); // percent per tick at 50ms
  ednaPatrolLeft=57;
  ednaPatrolDir=-1;

  ednaPatrolInterval=setInterval(()=>{
    const el=document.querySelector('.map-sprite-edna');
    if(!el){stopEdnaPatrol();return;}
    ednaPatrolLeft+=ednaPatrolDir*STEP;
    if(ednaPatrolLeft<=MIN){ednaPatrolLeft=MIN;ednaPatrolDir=1;}
    else if(ednaPatrolLeft>=MAX){ednaPatrolLeft=MAX;ednaPatrolDir=-1;}
    el.style.left=ednaPatrolLeft+'%';
    // dir 1 = moving right toward Floor = -90deg, dir -1 = moving left toward Kennels = 90deg
    el.style.transform=`translate(-50%, -50%) rotate(${ednaPatrolDir===1?-90:90}deg)`;
  },50);
}

function renderMap(){
  const wrap=document.getElementById('map-content');if(!wrap)return;

  const streak=calcStreak();
  const pts=getPoints();
  const level=xpState&&xpState.level?xpState.level:1;

  // Active room tap zones
  const roomTaps=Object.entries(ROOMS).map(([id,room])=>{
    const p=MAP_POS[id];if(!p)return'';

    const pct=id==='today'?dayPct(new Date().getDay()):0;
    const isBoss=id==='spin'&&typeof bossActive!=='undefined'&&bossActive;

    let stateClass='';
    if(id===currentRoom)stateClass+=' map-room-active';
    if(id==='today'&&pct===100)stateClass+=' map-room-complete';
    if(isBoss)stateClass+=' map-room-boss';
    if(id==='today'&&isRecoveryMode())stateClass+=' map-room-recovery';
    if(id==='today'&&collapseState?.active?.applyDate===todayStr())stateClass+=' map-room-collapsed';

    let attention='';
    if(id==='today'&&countDebuffs()>=3)
      attention=`<span class="map-attn-icon map-attn-pulse">⚠️</span>`;
    else if(id==='dogs'&&typeof dogPct!=='undefined'&&dogPct<100)
      attention=`<span class="map-attn-icon map-attn-pulse">🐾</span>`;
    else if(id==='inbox'&&inbox.length>0)
      attention=`<span class="map-attn-icon map-attn-pulse">📨</span>`;
    else if(id==='rewards'&&getPoints()>0)
      attention=`<span class="map-attn-icon map-attn-pulse">🪙</span>`;
    else if(isBoss)
      attention=`<span class="map-attn-icon map-attn-pulse">💀</span>`;
    else if(id==='coach'&&donutWeeklySummary?.week_number===getWeekNumber())
      attention=`<span class="map-attn-icon map-attn-pulse">👑</span>`;

    return`<div class="map-tap-zone${stateClass}" style="left:${p.x}%;top:${p.y}%;"
      onclick="showRoom('${id}')" title="${room.name}">${attention}</div>`;
  }).join('');

  // Sealed room taps
  const sealedTaps=SEALED_ROOMS.map(r=>
    `<div class="map-tap-zone map-tap-sealed" style="left:${r.x}%;top:${r.y}%;"
      onclick="showSealedRoom()" title="${r.label}"></div>`
  ).join('');

  // Companions — Edna patrols Floor↔Kennels corridor, Kronk in Floor↔Gym corridor
  const ednaAtDoor=typeof dogPct!=='undefined'&&dogPct<100;
  const ednaX=ednaAtDoor?MAP_POS.dogs.x:57;
  const ednaSprite=`<div class="map-sprite map-sprite-edna${ednaAtDoor?'':' map-sprite-patrol'}"
    style="left:${ednaX}%;top:${MAP_POS.dogs.y}%;" onclick="showRoom('dogs')" title="Edna">
    <img src="${ednaAtDoor?CHAR_EDNA_FRONT:CHAR_EDNA_APPROACH}" width="30" height="30" alt="Edna"
      style="image-rendering:pixelated;">
  </div>`;

  const kronkSprite=`<div class="map-sprite map-sprite-kronk"
    style="left:42%;top:43%;" onclick="showRoom('dogs')" title="Kronk">
    <img src="${CHAR_KRONK_FRONT}" width="34" height="34" alt="Kronk"
      style="image-rendering:pixelated;">
  </div>`;

 wrap.innerHTML=`
    <div class="map-header">
      <div class="map-title">⚔ DUNGEON CRAWLER</div>
      <div class="map-subtitle">DAILY ROUTINE</div>
    </div>
    <div class="map-layout">
      <img src="${ENV_DUNGEON_LAYOUT}" class="map-bg-image" alt="Dungeon Map">
      ${roomTaps}
      ${sealedTaps}
      ${ednaSprite}
      ${kronkSprite}
    </div>
    <div class="map-footer">
      <span class="map-footer-text">FLOOR ${level} · STREAK ${streak} DAYS · 🪙 ${pts}</span>
    </div>`;

  if(!ednaAtDoor) startEdnaPatrol();
}
// Backward compat — anything still calling showScreen() just routes to showRoom()
function showScreen(name,btn){showRoom(name);}

/* ─── INIT ──────────────────────────────────────────────────────────────── */
async function init(){
  // Inject pixel icons into static HTML elements (avoids template literal in HTML bug)
  const cb=document.getElementById('congrats-banner');
  if(cb)cb.innerHTML=pixelIcon(ICON_STAR,14)+' FLOOR CLEARED — Edna and Kronk are proud of you!';
  const bdt=document.getElementById('boss-defeat-title-text');
  if(bdt)bdt.innerHTML=pixelIcon(ICON_DUNGEON_DOOR,16)+' BOSS DEFEATED';
  const clb=document.getElementById('claim-loot-btn');
  if(clb)clb.innerHTML=pixelIcon(ICON_POTION,14)+' Claim loot ✓';



  migrateDogTasks();
  document.addEventListener('visibilitychange',()=>{if(!document.hidden){checkFloorCollapse();renderCollapseEvent();}});
  migrateGymIntoSchedule();
  document.documentElement.style.setProperty('--tex-stone-wall', `url(${TEX_STONE_WALL})`);
  renderToday();renderInbox();updateProjectDropdown();refreshWheel();renderTaskManager();

  // Update floor countdown every minute
  setInterval(renderFloorCountdown, 60000);

  showRoom(loadLocal('dr-last-screen','today')||'today');


  const synced=await loadFromSupabase();
  if(synced){
    // Reload all state from localStorage (already updated by loadFromSupabase)
    state=load('dr-state',{});
    schedule=load('dr-schedule',DEFAULT_SCHEDULE);
    dogTasks=load('dr-dog-tasks',DEFAULT_DOG_TASKS);
    dogState=load('dr-dog-state',{});
    groomState=load('dr-groom-state',{});
    prevState=load('dr-prev-state',{});
    wheel=load('dr-wheel',DEFAULT_WHEEL);
    if(!wheel.priority)wheel.priority={standalone:[],projects:[]};
    wheelDone=load('dr-wheel-done',{});
    wheelSkips=load('dr-wheel-skips',{});
    wheelPinned=load('dr-wheel-pinned',{});
    inbox=load('dr-inbox',[]);
    shopItems=load('dr-shop',[]);

    rewardsState=load('dr-rewards',DEFAULT_REWARDS_STATE);
    xpState=load('dr-xp',{totalXP:0,level:1,equippedTitle:null,unlockedTitles:['Freshly Fallen Crawler'],companionXP:{edna:0,kronk:0}});
    archived=load('dr-archived',{tasks:[]});
    if(!archived.tasks)archived.tasks=[];
    checkFloorCollapse();
    // Expire stale floor condition
    if(floorCondition&&floorCondition.date!==todayStr()){floorCondition=null;saveLocal('dr-floor-condition',null);}
    migrateDogTasks();
    migrateGymIntoSchedule();
    showRoom(loadLocal('dr-last-screen','today')||'today');
  }

if(typeof Notification!=='undefined'&&Notification.permission==='granted'){
    (notifs||[]).filter(n=>n.on).forEach(n=>{
      const[h,m]=(n.time||'00:00').split(':').map(Number);
      const now=new Date(),next=new Date();
      next.setHours(h,m,0,0);if(next<=now)next.setDate(next.getDate()+1);
      setTimeout(()=>new Notification('Daily Routine',{body:n.label}),next-now);
    });
  }
}        // ← this closes init()


init();

