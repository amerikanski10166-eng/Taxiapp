"use client";

import { useEffect, useMemo, useState } from "react";
import { MapPin, Navigation, Search, Mic, Menu, Layers3, Download, Car, Footprints, BusFront, Fuel, Coffee, Hospital, Wrench, Globe2, ShieldCheck, WifiOff, Route, ChevronRight, X, LocateFixed, Map, Mountain, Languages, Database, Truck, Compass } from "lucide-react";

const regions = [
  "Абайская область","Акмолинская область","Актюбинская область","Алматинская область","Атырауская область",
  "Восточно-Казахстанская область","Жамбылская область","Жетысуская область","Западно-Казахстанская область",
  "Карагандинская область","Костанайская область","Кызылординская область","Мангистауская область",
  "Павлодарская область","Северо-Казахстанская область","Туркестанская область","Ұлытау облысы",
  "Астана","Алматы","Шымкент"
];

const places = [
  {name:"Байтерек", type:"Достопримечательности", city:"Астана"},
  {name:"Хан Шатыр", type:"Торговые центры", city:"Астана"},
  {name:"Hazret Sultan", type:"Мечети", city:"Астана"},
  {name:"EXPO", type:"Достопримечательности", city:"Астана"},
  {name:"Медеу", type:"Туризм", city:"Алматы"},
  {name:"Чарынский каньон", type:"Туризм", city:"Алматинская область"},
];

const categories = [
  {label:"АЗС", icon:Fuel},{label:"СТО", icon:Wrench},{label:"Кафе", icon:Coffee},
  {label:"Больницы", icon:Hospital},{label:"Автобусы", icon:BusFront},{label:"Туризм", icon:Mountain}
];

export default function BasgoGidPage(){
  const [query,setQuery]=useState("");
  const [mode,setMode]=useState<"car"|"walk">("car");
  const [panel,setPanel]=useState<"none"|"route"|"offline"|"layers"|"languages"|"regions">("none");
  const [language,setLanguage]=useState("Русский");
  const [offline,setOffline]=useState(false);
  const [region,setRegion]=useState("Весь Казахстан");
  const [activeCategory,setActiveCategory]=useState<string | null>(null);
  const [destination,setDestination]=useState("");
  const [notice,setNotice]=useState("");
  const [locationLoading,setLocationLoading]=useState(false);
  const [layers,setLayers]=useState<Record<string,boolean>>({});
  const showNotice=(message:string)=>{setNotice(message);window.setTimeout(()=>setNotice(""),2600)};
  const regionBbox:Record<string,string>={
    "Весь Казахстан":"46.45%2C40.50%2C87.35%2C55.45",
    "Астана":"71.20%2C51.05%2C71.65%2C51.30",
    "Алматы":"76.75%2C43.10%2C77.15%2C43.40",
    "Шымкент":"69.45%2C42.15%2C69.80%2C42.45"
  };
  const mapBbox=regionBbox[region] || regionBbox["Весь Казахстан"];
  const mapSrc=`https://www.openstreetmap.org/export/embed.html?bbox=${mapBbox}&layer=mapnik`;
  const requestLocation=()=>{
    if(!navigator.geolocation){showNotice("Геолокация недоступна на этом устройстве.");return;}
    setLocationLoading(true);
    navigator.geolocation.getCurrentPosition(
      ()=>{setLocationLoading(false);showNotice("Позиция получена. Подключение BASGO-навигации готовится.");},
      ()=>{setLocationLoading(false);showNotice("Не удалось получить позицию. Проверьте разрешение геолокации.");},
      {enableHighAccuracy:true,timeout:8000}
    );
  };

  const recordMetric = (metric: string) => { fetch("/api/basgo-gid/metric", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ metric, region }) }).catch(() => {}); };
  useEffect(() => { recordMetric("app_open"); }, []);

  const filtered=useMemo(()=>places.filter(p=>
    p.name.toLowerCase().includes(query.toLowerCase()) ||
    p.city.toLowerCase().includes(query.toLowerCase())
  ),[query]);

  return (
    <main className="gid">
      <section className="gidMap">
        <iframe
          title="BASGO GID — Казахстан"
          src={mapSrc}
          className="gidMapFrame"
        />
        <div className="gidMapShade"/>

        <header className="gidTop">
          <button className="gidIconBtn" onClick={()=>setPanel(panel==="layers"?"none":"layers")} aria-label="Меню"><Menu size={21}/></button>
          <div className="gidBrand"><b>BASGO</b><span>GID</span><small>КАЗАХСТАН</small></div>
          <button className={"gidIconBtn "+(offline?"gidOnline":"")} onClick={()=>setPanel("offline")} aria-label="Офлайн-карты">{offline?<WifiOff size={19}/>:<Download size={19}/>}</button>
        </header>

        <div className="gidSearch">
          <Search size={19}/>
          <input value={query} onChange={e=>setQuery(e.target.value)} placeholder="Куда едем? Адрес, город, село или объект"/>
          <button onClick={()=>setPanel("languages")} aria-label="Язык"><Globe2 size={18}/></button>
          <button className="gidMic" onClick={()=>{recordMetric("voice_search");showNotice("Голосовой BASGO GID готовится: поиск адресов, маршрутов и AI-гид.")}} aria-label="Голосовой поиск"><Mic size={18}/></button>
        </div>

        {query && <div className="gidSearchResults">
          {filtered.length ? filtered.map(p=><button key={p.name} onClick={()=>{setQuery(p.name);recordMetric("map_search")}}><MapPin size={16}/><span><b>{p.name}</b><small>{p.type} · {p.city}</small></span><ChevronRight size={16}/></button>) : <div className="gidNoResult">Ищем по всей стране: адрес, населённый пункт или объект.</div>}
        </div>}

        <div className="gidCategoryRow">
          {categories.map(({label,icon:Icon})=><button className={activeCategory===label?"active":""} key={label} onClick={()=>{setActiveCategory(label);setQuery(label);recordMetric("map_search")}}><Icon size={16}/><span>{label}</span></button>)}
        </div>

        <div className="gidMapControls">
          <button onClick={()=>setPanel("layers")}><Layers3 size={18}/></button>
          <button onClick={()=>setPanel("regions")}><Map size={18}/></button>
          <button onClick={()=>setPanel("offline")}><Download size={18}/></button>
          <button onClick={requestLocation} disabled={locationLoading} aria-label="Моё местоположение"><LocateFixed size={18}/></button>
        </div>

        <button className="gidRouteFab" onClick={()=>{recordMetric("route_build");setPanel("route")}}><Navigation size={18}/><span>Маршрут</span></button>

        <div className="gidNationalBadge"><Compass size={15}/><b>ВЕСЬ КАЗАХСТАН</b><span>20 регионов</span></div>

        <div className="gidBottomSheet">
          <div className="gidHandle"/>
          <div className="gidSheetTitle"><div><small>ВАША СТРАНА</small><h1>BASGO GID · Казахстан</h1></div><div className="gidStatus"><span/>Национальная карта</div></div>
          <div className="gidModes">
            <button className={mode==="car"?"active":""} onClick={()=>setMode("car")}><Car size={17}/>Авто</button>
            <button className={mode==="walk"?"active":""} onClick={()=>setMode("walk")}><Footprints size={17}/>Пешком</button>
          </div>
          <div className="gidFeatureGrid">
            <button onClick={()=>{recordMetric("offline_use");setPanel("offline")}}><div className="gidFeatureIcon"><WifiOff size={18}/></div><b>Офлайн First</b><span>Регионы без связи</span></button>
            <button onClick={()=>setPanel("route")}><div className="gidFeatureIcon"><Route size={18}/></div><b>Умный маршрут</b><span>Авто · пешком · курьер</span></button>
            <button onClick={()=>setPanel("regions")}><div className="gidFeatureIcon"><Map size={18}/></div><b>Карта страны</b><span>17 областей + 3 города</span></button>
          </div>
        </div>
      </section>

      {panel!=="none" && <div className="gidOverlay" onClick={()=>setPanel("none")}>
        <div className="gidPanel" onClick={e=>e.stopPropagation()}>
          <button className="gidClose" onClick={()=>setPanel("none")}><X size={20}/></button>

          {panel==="route" && <><div className="gidEyebrow">BASGO SMART ROUTE</div><h2>Умный маршрут</h2><p>Сейчас интерфейс готов; собственный дорожный граф BASGO подключим следующим этапом. Выберите пункт назначения, чтобы подготовить запрос.</p><div className="gidRouteLine"><div className="gidRouteDot"/>{region}<div className="gidRouteStroke"/><div className="gidRoutePin"><MapPin size={15}/></div><input className="gidRouteInput" value={destination} onChange={e=>setDestination(e.target.value)} placeholder="Адрес или объект назначения"/></div><button className="gidPrimary" onClick={()=>{recordMetric("route_build");showNotice(destination?`Маршрут подготовлен: ${destination}`:"Укажите пункт назначения")}}><Navigation size={17}/>Подготовить маршрут</button></>}

          {panel==="offline" && <><div className="gidEyebrow">OFFLINE FIRST · NATIONAL</div><h2>Офлайн-карта</h2><p>Подготовка региональных пакетов уже заложена в архитектуру. Реальные векторные данные и дорожный граф ещё подключаются.</p><div className="gidDownloadCard"><div><b>{region} · пакет BASGO</b><span>Дороги · здания · адреса · POI · routing graph</span></div><strong>{offline?"Готово":"Подготовка"}</strong></div><button className="gidPrimary" onClick={()=>{recordMetric("offline_use");setOffline(true);showNotice("Регион отмечен для офлайн-пакета.")}}><Download size={17}/>{offline?"Пакет отмечен":"Подготовить пакет"}</button></>}

          {panel==="regions" && <><div className="gidEyebrow">KAZAKHSTAN · 2026</div><h2>Выберите регион</h2><p>Архитектура BASGO GID сразу рассчитана на 17 областей и 3 города республиканского значения. По данным Бюро национальной статистики на 1 июля 2026 года — 20 административных единиц этого уровня.</p><div className="gidRegionGrid">{regions.map(x=><button key={x} className={region===x?"active":""} onClick={()=>{setRegion(x);setPanel("none")}}><MapPin size={14}/><span>{x}</span></button>)}</div></>}

          {panel==="layers" && <><div className="gidEyebrow">BASGO DATA LAYERS</div><h2>Настроить BASGO GID</h2>{["Дороги и здания","Адреса и населённые пункты","Пробки и ограничения","АЗС и СТО","Кафе и сервисы","Туризм и достопримечательности","Общественный транспорт","Курьерские подъезды","Зимние пешеходные маршруты"].map((x,i)=>{const enabled=layers[x] ?? i<6; return <button className="gidLayerRow" key={x} onClick={()=>setLayers(prev=>({...prev,[x]:!enabled}))}><span>{x}</span><span className={enabled?"gidToggle on":"gidToggle"}><i/></span></button>})}</>}

          {panel==="languages" && <><div className="gidEyebrow">AI GUIDE · LANGUAGES</div><h2>Язык BASGO GID</h2>{["Русский","Қазақша","English","中文","العربية","Türkçe"].map(x=><button className={"gidLang "+(language===x?"active":"")} key={x} onClick={()=>{setLanguage(x);setPanel("none")}}><span>{x}</span>{language===x&&<b>✓</b>}</button>)}<div className="gidAiCard"><Languages size={18}/><div><b>AI-гид</b><span>Голос, перевод и ответы о местах — следующий слой BASGO GID.</span></div></div></>}

        </div>
      </div>}

      <div className="gidAttribution">© OpenStreetMap contributors · BASGO GID</div>{notice&&<div className="gidToast">{notice}</div>}
    </main>
  );
}
