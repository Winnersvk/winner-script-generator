'use client';
import {useEffect,useRef,useState} from 'react';
import {normalizeProfile,parseProfiles,profileFields,STORAGE_KEY} from '../lib/profiles.mjs';

export default function ProfilePicker({onChange,userId}) {
  const storageKey=STORAGE_KEY+':'+userId;
  const [profiles,setProfiles]=useState([]), [selected,setSelected]=useState('');
  const [draft,setDraft]=useState({}), [message,setMessage]=useState(''), [ready,setReady]=useState(false);
  const dialog=useRef(null), importer=useRef(null);
  useEffect(()=>{
    try {
      const raw=localStorage.getItem(storageKey);
      if(raw){const data=JSON.parse(raw); const list=parseProfiles(raw).map((p,i)=>({...p,id:typeof data.profiles[i].id==='string'?data.profiles[i].id:crypto.randomUUID()}));
        setProfiles(list); const p=list.find(p=>p.id===data.selected); setSelected(p?.id||''); onChange(p||null);}
    }catch{setMessage('อ่านข้อมูลเดิมไม่ได้ กรุณานำเข้าไฟล์สำรอง ข้อมูลเดิมยังไม่ถูกเขียนทับ');}
    let cancelled=false;
    (async()=>{try{
      const r=await fetch('/api/brands');const j=await r.json();if(!r.ok)throw new Error();
      let saved={profiles:[],selected:''};try{saved=JSON.parse(localStorage.getItem(storageKey)||'{}');}catch{localStorage.setItem(storageKey+':recovery',localStorage.getItem(storageKey)||'');}
      const pending=JSON.parse(localStorage.getItem(storageKey+':pending')||'[]');const cloud=j.profiles;const missing=(saved.profiles||[]).filter(p=>pending.includes(p.id)||!cloud.some(c=>c.id===p.id));
      if(missing.length){const sync=await fetch('/api/brands',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({profiles:missing})});if(!sync.ok)throw new Error();localStorage.removeItem(storageKey+':pending');}
      if(cancelled)return;const list=[...cloud.filter(c=>!missing.some(p=>p.id===c.id)),...missing];const chosen=list.find(p=>p.id===saved.selected);
      localStorage.setItem(storageKey,JSON.stringify({version:2,profiles:list,selected:chosen?.id||''}));
      setProfiles(list);setSelected(chosen?.id||'');onChange(chosen||null);setMessage('โปรไฟล์เชื่อมกับบัญชีแล้ว');
    }catch{if(!cancelled)setMessage('ยังเชื่อมโปรไฟล์บนบัญชีไม่ได้ ข้อมูลในเครื่องยังใช้สร้างสคริปต์ได้');}finally{if(!cancelled)setReady(true);}})();
    return ()=>{cancelled=true;};
  },[onChange,storageKey]);
  function persist(list,id) {
    try {localStorage.setItem(storageKey,JSON.stringify({version:2,profiles:list,selected:id}));}
    catch {setMessage('บันทึกไม่สำเร็จ พื้นที่เครื่องเต็มหรือเบราว์เซอร์ไม่อนุญาต');return false;}
    const changed=list.filter(p=>JSON.stringify(p)!==JSON.stringify(profiles.find(x=>x.id===p.id)));
    if(changed.length){const pending=JSON.parse(localStorage.getItem(storageKey+':pending')||'[]');localStorage.setItem(storageKey+':pending',JSON.stringify([...new Set([...pending,...changed.map(p=>p.id)])]));}
    if(changed.length)fetch('/api/brands',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({profiles:changed})}).then(r=>{if(!r.ok)throw new Error();const pending=JSON.parse(localStorage.getItem(storageKey+':pending')||'[]');const latest=JSON.parse(localStorage.getItem(storageKey)||'{}');localStorage.setItem(storageKey+':pending',JSON.stringify(pending.filter(id=>!changed.some(p=>p.id===id&&JSON.stringify(p)===JSON.stringify((latest.profiles||[]).find(x=>x.id===id))))));setMessage('บันทึกในบัญชีแล้ว ใช้ได้ทั้งสคริปต์และโพสต์');}).catch(()=>setMessage('บันทึกในเครื่องแล้ว แต่ยังส่งขึ้นบัญชีไม่สำเร็จ กรุณาเปิดหน้านี้ใหม่เพื่อลองอีกครั้ง'));
    setProfiles(list);setSelected(id);onChange(list.find(p=>p.id===id)||null);return true;
  }
  function edit(p={}){setDraft(p);setMessage('');dialog.current.showModal();}
  function save(e){e.preventDefault();try{
    const p={...normalizeProfile(draft),id:draft.id||crypto.randomUUID()};
    const list=draft.id?profiles.map(x=>x.id===p.id?p:x):[...profiles,p];
    if(list.length>100)throw new Error('บันทึกได้สูงสุด 100 เพจ');
    if(persist(list,p.id)){dialog.current.close();setMessage('บันทึกโปรไฟล์แล้ว');}
  }catch(e){setMessage(e.message);}}
  function exportFile(){const blob=new Blob([JSON.stringify({version:2,profiles},null,2)],{type:'application/json'});const url=URL.createObjectURL(blob);const a=document.createElement('a');a.href=url;a.download='winner-profiles.json';a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);}
  async function importFile(e){const file=e.target.files?.[0];if(!file)return;try{
    if(file.size>4*1024*1024)throw new Error('ไฟล์ใหญ่เกิน 4 MB');
    const incoming=parseProfiles(await file.text()).map(p=>({...p,id:crypto.randomUUID()}));
    if(profiles.length+incoming.length>100)throw new Error('รวมแล้วเกิน 100 เพจ');
    if(persist([...profiles,...incoming],selected||incoming[0]?.id||''))setMessage(`นำเข้า ${incoming.length} เพจแล้ว`);
  }catch(e){setMessage(e.message||'อ่านไฟล์ไม่ได้');}finally{e.target.value='';}}
  const active=profiles.find(p=>p.id===selected);
  return <section className="profilePanel" aria-label="โปรไฟล์เพจ">
    <div className="profileHeading"><div><span className="eyebrow">YOUR BRAND VOICE</span><h2>เลือกเพจที่จะเล่า</h2></div><span className="badge">{profiles.length} เพจ</span></div>
    <label className="label" htmlFor="profile-select">โปรไฟล์เพจ / แบรนด์</label>
    <select id="profile-select" className="select" value={selected} disabled={!ready} onChange={e=>persist(profiles,e.target.value)}><option value="">ไม่ใช้โปรไฟล์</option>{profiles.map(p=><option key={p.id} value={p.id}>{p.pageName}</option>)}</select>
    {active&&<p className="profileSummary">{[active.brandName,active.personality,active.tone].filter(Boolean).join(' · ')||'เพิ่มบุคลิกและน้ำเสียง เพื่อให้สคริปต์เป็นตัวคุณ'}</p>}
    <div className="actions"><button className="secondary" disabled={!ready} onClick={()=>edit()}>＋ เพิ่มเพจ</button>{active&&<button className="secondary" onClick={()=>edit(active)}>แก้ไขเพจ</button>}<button className="textButton" disabled={!profiles.length} onClick={exportFile}>ส่งออก</button><button className="textButton" onClick={()=>importer.current.click()}>นำเข้า</button></div>
    <input ref={importer} type="file" accept="application/json,.json" hidden onChange={importFile}/>
    <p className="muted">ใช้ร่วมกันในบัญชีของคุณ • ส่งออกไฟล์เพื่อสำรองข้อมูลได้</p>
    <p role="status" className="status">{message}</p>
    <dialog ref={dialog} className="profileDialog">
      <form onSubmit={save}>
        <div className="cardHead"><h2>{draft.id?'แก้ไขโปรไฟล์':'เพิ่มเพจ / แบรนด์'}</h2><button type="button" className="secondary" onClick={()=>dialog.current.close()} aria-label="ปิดโปรไฟล์">✕</button></div>
        <div className="dialogBody"><p className="muted">กรอกครั้งเดียว แล้วเลือกใช้ได้ทุกสคริปต์ ช่องชื่อเพจจำเป็นต้องกรอก</p>
          {profileFields.map(([key,label])=><div className="field" key={key}><label className="label" htmlFor={'profile-'+key}>{label}</label>{['personality','tone','cta','keywords','avoid','notes'].includes(key)?<textarea id={'profile-'+key} className="textarea" maxLength={2000} value={draft[key]||''} onChange={e=>setDraft(d=>({...d,[key]:e.target.value}))}/>:<input id={'profile-'+key} className="input" type={key==='phone'?'tel':'text'} maxLength={2000} required={key==='pageName'} value={draft[key]||''} onChange={e=>setDraft(d=>({...d,[key]:e.target.value}))}/>}</div>)}
        </div><div className="dialogFooter"><p role="status">{message}</p><div className="actions"><button type="button" className="secondary" onClick={()=>dialog.current.close()}>ยกเลิก</button><button className="primary" type="submit">บันทึกโปรไฟล์</button></div></div>
      </form>
    </dialog>
  </section>;
}
