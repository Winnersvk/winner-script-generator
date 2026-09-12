'use client';
import {useEffect,useState} from 'react';
export default function InstallApp(){
  const [prompt,setPrompt]=useState(null),[installed,setInstalled]=useState(false),[help,setHelp]=useState(false),[online,setOnline]=useState(true);
  useEffect(()=>{
    setInstalled(window.matchMedia('(display-mode: standalone)').matches||Boolean(navigator.standalone));setOnline(navigator.onLine);
    const before=e=>{e.preventDefault();setPrompt(e);};const done=()=>{setInstalled(true);setPrompt(null);};const connection=()=>setOnline(navigator.onLine);
    window.addEventListener('beforeinstallprompt',before);window.addEventListener('appinstalled',done);window.addEventListener('online',connection);window.addEventListener('offline',connection);
    if('serviceWorker' in navigator)navigator.serviceWorker.register('/sw.js').catch(()=>{});
    return ()=>{window.removeEventListener('beforeinstallprompt',before);window.removeEventListener('appinstalled',done);window.removeEventListener('online',connection);window.removeEventListener('offline',connection);};
  },[]);
  async function install(){if(!prompt){setHelp(!help);return;}await prompt.prompt();await prompt.userChoice;setPrompt(null);}
  return <div className="installArea">{!installed&&<button className="secondary" onClick={install}>ติดตั้งแอป</button>}{help&&!installed&&<p className="notice">iPhone: เปิดใน Safari → แชร์ → เพิ่มไปยังหน้าจอโฮม<br/>Android: เมนู Chrome → ติดตั้งแอป หรือ เพิ่มลงในหน้าจอหลัก</p>}{!online&&<p className="notice" role="status">ออฟไลน์ — จัดการโปรไฟล์ได้ การสร้างสคริปต์ต้องเชื่อมต่ออินเทอร์เน็ต</p>}</div>;
}
