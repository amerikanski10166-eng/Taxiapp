"use client";

import { useMemo, useState } from "react";
import { MapPin, Navigation, Search, Mic, Menu, Layers3, Download, Car, Footprints, BusFront, Fuel, Coffee, Hospital, Wrench, Globe2, ShieldCheck, WifiOff, Route, ChevronRight, X, LocateFixed } from "lucide-react";

const places = [
  {name:"Байтерек", type:"Достопримечательности", icon:"pin"},
  {name:"Хан Шатыр", type:"Торговые центры", icon:"coffee"},
  {name:"Hazret Sultan", type:"Мечети", icon:"pin"},
  {name:"EXPO", type:"Достопримечательности", icon:"pin"},
];

const categories = [
  {label:"АЗС", icon:Fuel},
  {label:"СТО", icon:Wrench},
  {label:"Кафе", icon:Coffee},
  {label:"Больницы", icon:Hospital},
  {label:"Автобусы", icon:BusFront},
];

export default function BasgoGidPage(){
  const [query,setQuery]=useState("");
  const [mode,setMode]=useState<"car"|"walk">("car");
  const [panel,setPanel]=useState<"none"|"route"|"offline"|"layers"|"languages">("none");
  const [language,setLanguage]=useState("Русский");
  const [offline,setOffline]=useState(false);

  const filtered=useMemo(()=>places.filter(p=>p.name.toLowerCase().includes(query.toLowerCase())),[query]);

  return (
    <main className="gid">
      <section className="gidMap">
        <iframe
          title="BASGO GID — Астана"
          src="https://www.openstreetmap.org/export/embed.html?bbox=71.30%2C51.08%2C71.55%2C51.22&layer=mapnik"
          className="gidMapFrame"
        />
        <div className="gidMapShade"/>
        
        <header className="gidTop">
          <button className="gidIconBtn" onClick={()=>setPanel(panel==="layers"?"none":"layers")} aria-label="Меню"><Menu size={21}/></button>
          <div className="gidBrand"><b>BASGO</b><span>GID</span></div>
          <button className={"gidIconBtn "+(offline?"gidOnline":"")} onClick={()=>setPanel("offline")} aria-label="Офлайн-карты">{offline?<WifiOff size={19}/>:<Download size={19}/>}</button>
        </header>

        <div className="gidSearch">
          <Search size={19}/>
          <input value={query} onChange={e=>setQuery(e.target.value)} placeholder="Куда едем? Адрес, место или объект"/>
          <button onClick={()=>setPanel("languages")} aria-label="Язык"><Globe2 size={18}/></button>
          <button className="gidMic" onClick={()=>alert("Голосовой BASGO GID подготовлен для подключения голосового движка.")} aria-label="Голосовой поиск"><Mic size={18}/></button>
        </div>

        {query && <div className="gidSearchResults">
          {filtered.length ? filtered.map(p=><button key={p.name} onClick={()=>setQuery(p.name)}><MapPin size={16}/><span><b>{p.name}</b><small>{p.type} · Астана</small></span><ChevronRight size={16}/></button>) : <div className="gidNoResult">Ничего не найдено — попробуйте адрес или название места.</div>}
        </div>}

        <div className="gidCategoryRow">
          {categories.map(({label,icon:Icon})=><button key={label}><Icon size={16}/><span>{label}</span></button>)}
        </div>

        <div className="gidMapControls">
          <button onClick={()=>setPanel("layers")}><Layers3 size={18}/></button>
          <button onClick={()=>setPanel("offline")}><Download size={18}/></button>
          <button onClick={()=>alert("BASGO определит позицию после выдачи разрешения геолокации.")}><LocateFixed size={18}/></button>
        </div>

        <button className="gidRouteFab" onClick={()=>setPanel("route")}><Navigation size={18}/><span>Маршрут</span></button>

        <div className="gidBottomSheet">
          <div className="gidHandle"/>
          <div className="gidSheetTitle"><div><small>ВАШ ГОРОД</small><h1>Астана</h1></div><div className="gidStatus"><span/>Карта готова</div></div>
          <div className="gidModes">
            <button className={mode==="car"?"active":""} onClick={()=>setMode("car")}><Car size={17}/>Авто</button>
            <button className={mode==="walk"?"active":""} onClick={()=>setMode("walk")}><Footprints size={17}/>Пешком</button>
          </div>
          <div className="gidFeatureGrid">
            <button onClick={()=>setPanel("offline")}><div className="gidFeatureIcon"><WifiOff size={18}/></div><b>Офлайн</b><span>Карта Астаны</span></button>
            <button onClick={()=>setPanel("route")}><div className="gidFeatureIcon"><Route size={18}/></div><b>Умный маршрут</b><span>С учётом города</span></button>
            <button><div className="gidFeatureIcon"><ShieldCheck size={18}/></div><b>Для курьера</b><span>Подъезды и въезды</span></button>
          </div>
        </div>
      </section>

      {panel!=="none" && <div className="gidOverlay" onClick={()=>setPanel("none")}>
        <div className="gidPanel" onClick={e=>e.stopPropagation()}>
          <button className="gidClose" onClick={()=>setPanel("none")}><X size={20}/></button>
          {panel==="route" && <><div className="gidEyebrow">BASGO ROUTE</div><h2>Умный маршрут</h2><p>Пилот Астана: автомобильный и пешеходный режимы. Следующий слой — офлайн-граф дорог, подъезды, ограничения и актуальные данные.</p><div className="gidRouteLine"><div className="gidRouteDot"/>Моё местоположение<div className="gidRouteStroke"/><div className="gidRoutePin"><MapPin size={15}/></div>Байтерек, Астана</div><button className="gidPrimary"><Navigation size={17}/>Построить маршрут</button></>}
          {panel==="offline" && <><div className="gidEyebrow">OFFLINE FIRST</div><h2>Офлайн-карта Астаны</h2><p>Здесь будет пакет векторных данных города для работы без связи. Статус интерфейса уже готов.</p><div className="gidDownloadCard"><div><b>Астана · пилот</b><span>Карта, адреса, POI и дорожный граф</span></div><strong>Готовится</strong></div><button className="gidPrimary" onClick={()=>setOffline(true)}><Download size={17}/>Подготовить пакет</button></>}
          {panel==="layers" && <><div className="gidEyebrow">СЛОИ КАРТЫ</div><h2>Настроить BASGO GID</h2>{["Дороги и здания","Пробки и ограничения","АЗС и СТО","Кафе и сервисы","Подъезды и шлагбаумы","Общественный транспорт"].map((x,i)=><button className="gidLayerRow" key={x}><span>{x}</span><span className={i<3?"gidToggle on":"gidToggle"}><i/></span></button>)}</>}
          {panel==="languages" && <><div className="gidEyebrow">ALL LANGUAGES</div><h2>Язык BASGO GID</h2>{["Русский","Қазақша","English","中文","العربية","Türkçe"].map(x=><button className={"gidLang "+(language===x?"active":"")} key={x} onClick={()=>{setLanguage(x);setPanel("none")}}><span>{x}</span>{language===x&&<b>✓</b>}</button>)}</>}
        </div>
      </div>}
    </main>
  );
}
