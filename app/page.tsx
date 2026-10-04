"use client";
import { useEffect, useMemo, useState } from "react";
import { Heart, X, MessageCircle, UserRound, ShieldCheck, SlidersHorizontal, ArrowLeft, Flag, Ban, CheckCircle2 } from "lucide-react";

type Profile={id:string;name:string;birth:string;city:string;gender:string;looking:string;interests:string[];about:string;photo:string};
type Match={id:string;profile:Profile;messages:string[]};

const LEGAL_VERSION="2026-10-04-v2";
const LEGAL_DOCS={terms:{title:"Пользовательское соглашение",text:"JUP — сервис знакомств только для совершеннолетних. Пользователь обязуется указывать достоверные данные, уважать других людей и не использовать сервис для мошенничества, спама, угроз, шантажа или незаконного контента."},privacy:{title:"Политика конфиденциальности",text:"JUP обрабатывает данные, необходимые для работы сервиса: данные профиля, дату рождения, город, фотографии и сведения безопасности. Они используются для создания профиля, подбора анкет, защиты от мошенничества и обработки жалоб. Полный юридический текст политики должен быть утверждён перед публичным запуском с учётом законодательства Республики Казахстан."},rules:{title:"Правила безопасности и поведения 18+",text:"JUP предназначен только для людей, которым исполнилось 18 лет. Несовершеннолетним регистрация запрещена. Запрещены угрозы, преследование, шантаж, мошенничество, опасные действия и любой сексуальный контент с участием несовершеннолетних. При подозрении на несовершеннолетнего или опасное поведение нужно пожаловаться. JUP может запросить дополнительное подтверждение возраста."}};

const demo:Profile[]=[
 {id:"1",name:"Алия",birth:"1999-04-12",city:"Астана",gender:"Женщина",looking:"Мужчина",interests:["Путешествия","Кино","Кофе"],about:"Люблю хорошие разговоры, прогулки и новые места.",photo:"https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=900&q=85"},
 {id:"2",name:"Мадина",birth:"2000-08-21",city:"Алматы",gender:"Женщина",looking:"Мужчина",interests:["Музыка","Спорт","Книги"],about:"Ищу доброго и открытого человека для серьёзных отношений.",photo:"https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=900&q=85"},
 {id:"3",name:"Диана",birth:"1998-11-03",city:"Шымкент",gender:"Женщина",looking:"Мужчина",interests:["Кулинария","Путешествия","Фитнес"],about:"За честность, уважение и лёгкость в общении.",photo:"https://images.unsplash.com/photo-1529139574466-a303027c1d8b?auto=format&fit=crop&w=900&q=85"},
];

function age(b:string){const d=new Date(b),n=new Date();let a=n.getFullYear()-d.getFullYear();if(n.getMonth()<d.getMonth()||(n.getMonth()===d.getMonth()&&n.getDate()<d.getDate()))a--;return a}
function adult(b:string){return age(b)>=18}

export default function Jup(){
 const [legal,setLegal]=useState(false);
 const [accepted,setAccepted]=useState({terms:false,privacy:false,rules:false,adult:false});
 const [birth,setBirth]=useState("");
 const [openedDoc,setOpenedDoc]=useState<keyof typeof LEGAL_DOCS|null>(null);
 const [readDocs,setReadDocs]=useState<Record<string,boolean>>({terms:false,privacy:false,rules:false});
 const [profile,setProfile]=useState<Profile|null>(null);
 const [profiles,setProfiles]=useState<Profile[]>(demo);
 const [index,setIndex]=useState(0);
 const [matches,setMatches]=useState<Match[]>([]);
 const [tab,setTab]=useState<"discover"|"likes"|"chat"|"me">("discover");
 const [filter,setFilter]=useState(true);
 const [city,setCity]=useState("Все");
 const [minAge,setMinAge]=useState(18);
 const [maxAge,setMaxAge]=useState(70);
 const [chat,setChat]=useState<Match|null>(null);
 const [msg,setMsg]=useState("");
 const [notice,setNotice]=useState("");

 useEffect(()=>{try{const p=localStorage.getItem("jup-profile");if(p){const parsed=JSON.parse(p);if(parsed.birth&&adult(parsed.birth)&&localStorage.getItem("jup-legal-version")==LEGAL_VERSION)setProfile(parsed)}const m=localStorage.getItem("jup-matches");if(m)setMatches(JSON.parse(m));}catch{}},[]);
 useEffect(()=>{try{localStorage.setItem("jup-matches",JSON.stringify(matches));}catch{}},[matches]);

 const current=visible[index];
 const visible=useMemo(()=>profiles.filter(p=>(city==="Все"||p.city===city)&&age(p.birth)>=minAge&&age(p.birth)<=maxAge),[profiles,city,minAge,maxAge]);

 const action=(kind:"like"|"skip")=>{
   if(!current){setNotice("Анкеты закончились — попробуйте изменить фильтры.");return}
   if(kind==="like"){setNotice("Лайк отправлен ❤️");}
   setIndex(i=>i+1);
   setTimeout(()=>setNotice(""),1800);
 };

 const calculatedAge=birth?age(birth):0;
 const allRead=Object.values(readDocs).every(Boolean);
 const createProfile=()=>{
   if(!birth){setNotice("Укажите дату рождения.");return}
   if(!adult(birth)){setNotice("Регистрация доступна только с 18 лет.");return}
   if(!allRead){setNotice("Сначала откройте и прочитайте все документы.");return}
   if(!Object.values(accepted).every(Boolean)){setNotice("Подтвердите все обязательные условия.");return}
   const p:Profile={id:crypto.randomUUID(),name:"Мой профиль",birth,city:"Астана",gender:"Мужчина",looking:"Женщина",interests:["Общение"],about:"Заполните информацию о себе.",photo:"https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=900&q=85"};
   setProfile(p);try{localStorage.setItem("jup-profile",JSON.stringify(p));localStorage.setItem("jup-legal-version",LEGAL_VERSION)}catch{};setLegal(false);
 };

 if(!profile) return <main className="jupAuth">
   <div className="authLogo">JUP <span>♥</span></div>
   <h1>Найди своего<br/>человека.</h1>
   <p>Знакомства по Казахстану — с уважением, безопасностью и без лишнего шума.</p>
   <div className="safety"><ShieldCheck size={20}/><div><b>JUP — только 18+</b><small>Возраст проверяется до создания профиля.</small></div></div>
   <button className="mainBtn" onClick={()=>setLegal(true)}>Создать профиль</button>
   <small className="authFoot">Казахстан · JUP</small>
   {legal&&<div className="overlay"><section className="legal">
      <button className="iconBtn" onClick={()=>setLegal(false)}><X/></button>
      <div className="miniLogo">JUP ♥</div><h2>Сначала ознакомьтесь</h2>
      <p>Перед регистрацией укажите дату рождения и откройте каждый документ. Галочка станет доступна только после нажатия «Я прочитал документ».</p>
      <div className="birthBox"><label>Дата рождения</label><input type="date" value={birth} max={new Date().toISOString().slice(0,10)} onChange={e=>setBirth(e.target.value)}/>{birth&&<strong>{"Ваш возраст: "+calculatedAge+" лет"}</strong>}{birth&&!adult(birth)&&<em>Регистрация невозможна: сервис только для 18+.</em>}</div>
      <div className="legalDocs">{(Object.entries(LEGAL_DOCS) as [keyof typeof LEGAL_DOCS,typeof LEGAL_DOCS.terms][]).map(([k,d])=><div className="docRow" key={k}><div><b>{d.title}</b><span>{readDocs[k]?"✓ Прочитано":"Нужно открыть и прочитать"}</span></div><button onClick={()=>setOpenedDoc(k)}>Открыть</button></div>)}</div>
      <label className="check"><input type="checkbox" checked={accepted.adult} onChange={e=>setAccepted(a=>({...a,adult:e.target.checked}))}/><span>Я подтверждаю, что мне исполнилось 18 лет</span></label>
      <label className="check"><input type="checkbox" disabled={!readDocs.terms} checked={accepted.terms} onChange={e=>setAccepted(a=>({...a,terms:e.target.checked}))}/><span>Я прочитал и принимаю Пользовательское соглашение</span></label>
      <label className="check"><input type="checkbox" disabled={!readDocs.privacy} checked={accepted.privacy} onChange={e=>setAccepted(a=>({...a,privacy:e.target.checked}))}/><span>Я прочитал Политику конфиденциальности</span></label>
      <label className="check"><input type="checkbox" disabled={!readDocs.rules} checked={accepted.rules} onChange={e=>setAccepted(a=>({...a,rules:e.target.checked}))}/><span>Я прочитал и согласен с Правилами безопасности 18+</span></label>
      <button className="mainBtn" disabled={!birth||!adult(birth)||!allRead||!Object.values(accepted).every(Boolean)} onClick={createProfile}>Создать профиль и продолжить</button>
      <small className="legalNote">Версия документов: {LEGAL_VERSION}. Фиксируются дата рождения, версия документов, дата/время согласия и факт прочтения.</small>
      {openedDoc&&<div className="docOverlay"><section className="doc"><button className="iconBtn" onClick={()=>setOpenedDoc(null)}><X/></button><h3>{LEGAL_DOCS[openedDoc].title}</h3><p>{LEGAL_DOCS[openedDoc].text}</p><button className="mainBtn" onClick={()=>{setReadDocs(r=>({...r,[openedDoc]:true}));setOpenedDoc(null)}}>Я прочитал документ</button></section></div>}
   </section></div>}
 </main>;

 return <main className="jup">
   <header><div className="logo">JUP <span>♥</span></div><button className="filterBtn" aria-label="Настроить поиск" onClick={()=>setFilter(!filter)}><SlidersHorizontal size={18}/></button></header>
   {filter&&<div className="filters"><div className="filterIntro"><b>Настройте, кого вы хотите встретить</b><span>Эти настройки определяют, какие анкеты показывать вам. Например: Астана и возраст от 25 до 35 лет.</span></div><label>Город, где хотите знакомиться<select value={city} onChange={e=>{setCity(e.target.value);setIndex(0)}}><option>Все города</option><option>Астана</option><option>Алматы</option><option>Шымкент</option><option>Караганда</option><option>Актобе</option><option>Тараз</option></select></label><label>Возраст людей, которых хотите видеть<div className="ageRow"><div><small>От</small><input min="18" max="70" type="number" value={minAge} onChange={e=>setMinAge(Math.max(18,Math.min(70,+e.target.value||18)))}/></div><div><small>До</small><input min="18" max="70" type="number" value={maxAge} onChange={e=>setMaxAge(Math.max(18,Math.min(70,+e.target.value||70)))}/></div></div><span className="filterHint">Выберите желаемый диапазон возраста — например, от 25 до 35 лет.</span></label></div>}
   {tab==="discover"&&<section className="discover"><div className="titleRow"><div><small>ЗНАКОМСТВА В КАЗАХСТАНЕ</small><h2>Кто тебе понравится?</h2></div><span>{visible.length} анкет</span></div>
    {current?<div className="card"><img src={current.photo} alt={current.name}/><div className="shade"/><div className="cardInfo"><div className="verified"><CheckCircle2 size={14}/> Профиль подтверждён</div><h1>{current.name}, {age(current.birth)}</h1><b>{current.city}</b><p>{current.about}</p><div className="tags">{current.interests.map(x=><span key={x}>{x}</span>)}</div></div></div>:<div className="empty">Анкеты закончились.<br/>Измени фильтр и попробуй снова.</div>}
    <div className="actions"><button onClick={()=>action("skip")}><X/></button><button className="like" onClick={()=>action("like")}><Heart fill="currentColor"/></button></div>
   </section>}
   {tab==="likes"&&<section className="panel"><h2>Взаимные симпатии</h2>{matches.length===0?<div className="empty">Пока нет взаимных симпатий.<br/>Продолжай знакомиться ❤️</div>:matches.map(m=><button className="match" key={m.id} onClick={()=>setChat(m)}><img src={m.profile.photo}/><div><b>{m.profile.name}, {age(m.profile.birth)}</b><small>{m.profile.city}</small></div><MessageCircle/></button>)}</section>}
   {tab==="chat"&&<section className="panel"><h2>Сообщения</h2>{matches.length===0?<div className="empty">Когда появится взаимная симпатия, чат будет здесь.</div>:matches.map(m=><button className="match" key={m.id} onClick={()=>setChat(m)}><img src={m.profile.photo}/><div><b>{m.profile.name}</b><small>{m.messages.at(-1)||"Начните разговор"}</small></div><MessageCircle/></button>)}</section>}
   {tab==="me"&&<section className="panel"><div className="myProfile"><img src={profile.photo}/><div><h2>{profile.name}, {age(profile.birth)}</h2><p>{profile.city}</p><span><ShieldCheck size={14}/> 18+ безопасность включена</span></div></div><div className="safetyBox"><ShieldCheck/><div><b>Безопасность JUP</b><p>Блокировка, жалобы и защита от несовершеннолетних доступны на каждом профиле.</p></div></div><button className="danger" onClick={()=>{setProfile(null);localStorage.removeItem("jup-profile")}}>Выйти из профиля</button></section>}
   <nav><button className={tab==="discover"?"on":""} onClick={()=>setTab("discover")}><Heart/><span>Знакомства</span></button><button className={tab==="likes"?"on":""} onClick={()=>setTab("likes")}><Heart/><span>Симпатии</span></button><button className={tab==="chat"?"on":""} onClick={()=>setTab("chat")}><MessageCircle/><span>Чат</span></button><button className={tab==="me"?"on":""} onClick={()=>setTab("me")}><UserRound/><span>Профиль</span></button></nav>
   {chat&&<div className="overlay"><section className="chat"><button className="back" onClick={()=>setChat(null)}><ArrowLeft/> Назад</button><div className="chatHead"><img src={chat.profile.photo}/><div><b>{chat.profile.name}, {age(chat.profile.birth)}</b><small>{chat.profile.city}</small></div></div><div className="messages">{chat.messages.length?chat.messages.map((x,i)=><div className="bubble" key={i}>{x}</div>):<div className="empty">Вы понравились друг другу ❤️<br/>Поздоровайтесь.</div>}</div><div className="composer"><input value={msg} onChange={e=>setMsg(e.target.value)} placeholder="Написать сообщение…"/><button onClick={()=>{if(!msg.trim())return;setMatches(ms=>ms.map(m=>m.id===chat.id?{...m,messages:[...m.messages,msg.trim()]}:m));setMsg("")}}><MessageCircle/></button></div><div className="chatActions"><button><Flag size={15}/> Пожаловаться</button><button><Ban size={15}/> Заблокировать</button></div></section></div>}
   {notice&&<div className="toast">{notice}</div>}
 </main>;
}