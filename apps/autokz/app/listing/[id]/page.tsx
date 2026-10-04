import { redirect } from "next/navigation";
import { supabase } from "../../../lib/supabase";

export async function generateMetadata({params}:{params:Promise<{id:string}>}){
  const {id}=await params;
  const {data}=await supabase.from("listings").select("title,price,city,year,mileage,photos,status").eq("id",id).eq("status","published").maybeSingle();
  const title=data?.title ? `${data.title} — AutoKZ` : "Объявление — AutoKZ";
  const description=data ? `${Number(data.price||0).toLocaleString("ru-RU")} ₸ · ${data.city||"Казахстан"} · ${data.year||""} · AutoKZ` : "Автомобили Казахстана на AutoKZ";
  const images=Array.isArray(data?.photos)?data.photos.filter(Boolean).slice(0,1):[];
  return {title,description,openGraph:{title,description,type:"website",siteName:"AutoKZ",images},twitter:{card:"summary_large_image",title,description,images}};
}

export default async function SharedListing({params}:{params:Promise<{id:string}>}){
  const {id}=await params;
  const {data}=await supabase.from("listings").select("id").eq("id",id).eq("status","published").maybeSingle();
  if(data) redirect(`/?listing=${encodeURIComponent(id)}`);
  return <main style={{minHeight:"100vh",display:"grid",placeItems:"center",fontFamily:"Arial,sans-serif",padding:24}}><div style={{textAlign:"center"}}><div style={{fontSize:34,fontWeight:900}}>AUTO<span style={{color:"#1687ff"}}>KZ</span></div><p>Объявление не найдено</p><a href="/" style={{color:"#1687ff"}}>Перейти на AutoKZ</a></div></main>;
}