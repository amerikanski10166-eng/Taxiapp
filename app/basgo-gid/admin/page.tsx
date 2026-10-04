"use client";
import { useEffect, useMemo, useState } from "react";
import { Activity, BarChart3, Compass, Globe2, Map as MapIcon, RefreshCw, Route, Users } from "lucide-react";

type Row={metric_date:string;region:string;metric:string;count:number};
const labels:Record<string,string>={app_open:"Открытия карты",map_search:"Поиски",route_build:"Маршруты",offline_use:"Offline",voice_search:"Голосовые запросы",business_view:"Просмотры бизнеса"};
const stats:Array<[string, keyof Record<string,number>, React.ElementType]>=[["Пользовательские сессии","app_open",Users],["Поиски","map_search",MapIcon],["Маршруты","route_build",Route],["Offline","offline_use",Activity]];
export default function BasgoGidAdminPage(){
 const [rows,setRows]=useState<Row[]>([]);
 const load=()=>fetch("/api/basgo-gid/admin/metrics").then(r=>r.json()).then(x=>setRows(x.rows??[]));
 useEffect(()=>{load()},[]);
 const totals=useMemo(()=>rows.reduce<Record<string,number>>((a,r)=>(a[r.metric]=(a[r.metric]||0)+Number(r.count),a),{}),[rows]);
 const regions=useMemo(()=>{const m=new globalThis.Map<string,number>();rows.filter(r=>r.metric==="app_open").forEach(r=>m.set(r.region,(m.get(r.region)||0)+Number(r.count)));return [...m.entries()].sort((a,b)=>b[1]-a[1]);},[rows]);
 return <main className="gidAdmin"><header className="gidAdminHeader"><div><div className="gidAdminBrand"><b>BASGO</b> GID</div><h1>Центр аналитики карты</h1><p>Агрегированные показатели BASGO GID · последние 30 дней</p></div><button onClick={load} className="gidAdminRefresh"><RefreshCw size={17}/>Обновить</button></header>
 <section className="gidAdminGrid">{stats.map(([title,key,Icon])=><div className="gidStat" key={title}><Icon size={19}/><span>{title}</span><strong>{(totals[key]||0).toLocaleString("ru-RU")}</strong><small>агрегировано</small></div>)}</section>
 <section className="gidAdminPanels"><div className="gidAdminCard"><div className="gidAdminCardTitle"><BarChart3 size={18}/>Метрики</div>{Object.entries(labels).map(([k,v])=><div className="gidMetricRow" key={k}><span>{v}</span><b>{(totals[k]||0).toLocaleString("ru-RU")}</b></div>)}</div><div className="gidAdminCard"><div className="gidAdminCardTitle"><Globe2 size={18}/>Регионы</div>{regions.length?regions.map(([r,c])=><div className="gidMetricRow" key={r}><span>{r}</span><b>{c.toLocaleString("ru-RU")}</b></div>):<div className="gidEmpty">Пока нет данных. Они появятся после реальных открытий BASGO GID.</div>}</div></section>
 <div className="gidAdminNote"><Compass size={17}/><span>Показываем только агрегированные показатели. Индивидуальные маршруты пользователей здесь не отображаются.</span></div></main>;
}
