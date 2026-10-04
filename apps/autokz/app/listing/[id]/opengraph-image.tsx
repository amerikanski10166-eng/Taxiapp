import { ImageResponse } from "next/og";
import { supabase } from "../../../lib/supabase";

export const runtime="edge";
export const alt="AutoKZ — объявление автомобиля";
export const size={width:1200,height:630};
export const contentType="image/png";

export default async function Image({params}:{params:Promise<{id:string}>}){
  const {id}=await params;
  const {data}=await supabase.from("listings").select("title,price,city,photos").eq("id",id).eq("status","published").maybeSingle();
  const photo=Array.isArray(data?.photos)&&data.photos[0]?data.photos[0]:null;
  return new ImageResponse(<div style={{width:"100%",height:"100%",display:"flex",background:"#111827",color:"white",fontFamily:"Arial",position:"relative"}}>{photo&&<img src={photo} style={{position:"absolute",inset:0,width:"100%",height:"100%",objectFit:"cover",opacity:.5}}/>}<div style={{position:"absolute",inset:0,display:"flex",background:"linear-gradient(90deg,rgba(10,15,25,.95),rgba(10,15,25,.35))"}}/><div style={{position:"relative",display:"flex",flexDirection:"column",justifyContent:"center",padding:"70px",gap:"18px"}}><div style={{fontSize:42,fontWeight:900}}>AUTO<span style={{color:"#1687ff"}}>KZ</span></div><div style={{fontSize:58,fontWeight:800,maxWidth:"900px"}}>{data?.title||"Автомобиль"}</div><div style={{fontSize:42,fontWeight:700}}>{Number(data?.price||0).toLocaleString("ru-RU")} ₸</div><div style={{fontSize:28,opacity:.9}}>{data?.city||"Казахстан"} · Автомобили Казахстана</div></div></div>,{...size});
}