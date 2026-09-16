'use client';
import {usePathname} from 'next/navigation';
import {useState} from 'react';
const links=[['/','หน้าหลัก'],['/scripts','สคริปต์'],['/publisher','โพสต์'],['/queue','คิวโพสต์'],['/calendar','ปฏิทิน'],['/brands','แบรนด์ / เพจ'],['/settings','ตั้งค่า']];
export default function HubNav(){const path=usePathname(),[more,setMore]=useState(false);if(path==='/login')return null;return <><header className="hubHeader"><a href="/" className="hubLogo">MKT <span>Online</span></a><span className="muted">ระบบจัดการการตลาดออนไลน์</span></header><nav className="hubNav" aria-label="เมนูหลัก">{links.map(([url,label],i)=><a key={url} href={url} aria-current={path===url?'page':undefined} className={i>3?'extraNav':''}>{label}</a>)}<button className="moreNav" onClick={()=>setMore(!more)} aria-expanded={more}>เพิ่มเติม</button></nav>{more&&<nav className="morePanel" aria-label="เมนูเพิ่มเติม">{links.slice(4).map(([url,label])=><a key={url} href={url}>{label}</a>)}</nav>}</>;}
