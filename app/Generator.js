'use client';

import { useMemo, useState } from 'react';
import ProfilePicker from './ProfilePicker';
import InstallApp from './InstallApp';
import AccountBar from './AccountBar';

const styles = [
  'Storytelling จริงใจ','Hook แรง / TikTok','เจ้าของแบรนด์เล่าเอง','ลูกค้าเล่าประสบการณ์',
  'Case Study','Problem → Solution','ให้ความรู้','Soft Sell','Hard Sell','Emotional','Professional'
];

const blank = {
  topic:'', product:'', story:'', problem:'', turningPoint:'', solution:'', result:'', keyMessage:'',
  audience:'', duration:'40', language:'ลาว', goal:'ให้ความรู้ + สร้างความน่าเชื่อถือ',
  hookType:'AI เลือกให้อัตโนมัติ'
};

export default function Home({user}){
  const [form,setForm]=useState(blank);
  const [profile,setProfile]=useState(null);
  const [copied,setCopied]=useState('');
  const [style,setStyle]=useState('Storytelling จริงใจ');
  const [data,setData]=useState(null);
  const [variant,setVariant]=useState(0);
  const [loading,setLoading]=useState(false);
  const [error,setError]=useState('');
  const current = useMemo(()=>data?.directions?.[variant] || null,[data,variant]);

  const set = (k,v)=>setForm(s=>({...s,[k]:v}));
  async function generate(){
    if(loading) return;
    if(!navigator.onLine){setError('กรุณาเชื่อมต่ออินเทอร์เน็ตก่อนสร้างสคริปต์');return;}
    setLoading(true); setError(''); setData(null); setVariant(0);
    try{
      const r=await fetch('/api/generate',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({...form,style,profile}),signal:AbortSignal.timeout(180000)});
      const j=await r.json().catch(()=>({error:'เซิร์ฟเวอร์ตอบกลับไม่สำเร็จ กรุณาลองอีกครั้ง'}));
      if(!r.ok) throw new Error(j.error || 'Generate ไม่สำเร็จ');
      setData(j);if(j.historyWarning)setError(j.historyWarning);
    }catch(e){setError(e.message || 'เกิดข้อผิดพลาด');}
    finally{setLoading(false)}
  }
  async function copy(text){try{await navigator.clipboard.writeText(text || '');setCopied('คัดลอกแล้ว');}catch{setCopied('คัดลอกไม่ได้ กรุณาเลือกข้อความแล้วคัดลอกเอง');}}
  function allText(){
    if(!current) return '';
    return `${current.title}\n\nHOOKS\n${current.hooks.map((x,i)=>`${i+1}. ${x}`).join('\n')}\n\nSCRIPT\n${current.script}\n\nTEXT ON SCREEN\n${current.textOnScreen.join('\n')}\n\nCOVER\n${current.coverHooks.join('\n')}\n\nCAPTION\n${current.caption}\n\nB-ROLL\n${current.broll.join('\n')}\n\nCTA\n${current.cta}`;
  }
  return <main className="shell">
    <div className="header">
      <div className="brand"><h1>Winner Script Generator</h1><p>สร้างสคริปต์ Short Video ไทย/ลาว จากเรื่องจริงของลูกค้าและธุรกิจ</p></div>
      <div className="headerTools"><div className="badge">v2 • Brand Profiles</div><InstallApp/></div>
    </div>
    <AccountBar email={user.email} onOpen={entry=>{setForm({...blank,...entry.input});setData(entry.output);setVariant(0);setError('');}}/>
    <ProfilePicker key={user.id} userId={user.id} onChange={setProfile}/>
    <div className="grid">
      <section className="card">
        <div className="cardHead"><h2>ข้อมูลต้นเรื่อง</h2><span className="muted">กรอกเท่าที่มีได้</span></div>
        <div className="cardBody">
          <div className="field"><label className="label">หัวข้อคลิป</label><input className="input" value={form.topic} onChange={e=>set('topic',e.target.value)} placeholder="เช่น ทำไมร้านกลางคืนต้องมีป้ายไฟ"/></div>
          <div className="field"><label className="label">สินค้า / บริการ</label><input className="input" value={form.product} onChange={e=>set('product',e.target.value)} placeholder={profile?.product||'เช่น ป้ายไฟหน้าร้าน'}/></div>
          <div className="field"><label className="label">เรื่องราวดิบ</label><textarea className="textarea big" value={form.story} onChange={e=>set('story',e.target.value)} placeholder="เล่าเหตุการณ์ทั้งหมดแบบภาษาพูดได้เลย ไม่ต้องเรียบเรียง..."/></div>
          <div className="row">
            <div className="field"><label className="label">ปัญหา</label><textarea className="textarea" value={form.problem} onChange={e=>set('problem',e.target.value)} placeholder="ถ้าไม่รู้ ปล่อยว่างได้"/></div>
            <div className="field"><label className="label">จุดเปลี่ยน</label><textarea className="textarea" value={form.turningPoint} onChange={e=>set('turningPoint',e.target.value)} placeholder="เหตุการณ์ที่ทำให้รู้ปัญหาจริง"/></div>
          </div>
          <div className="row">
            <div className="field"><label className="label">วิธีแก้</label><textarea className="textarea" value={form.solution} onChange={e=>set('solution',e.target.value)}/></div>
            <div className="field"><label className="label">ผลลัพธ์</label><textarea className="textarea" value={form.result} onChange={e=>set('result',e.target.value)}/></div>
          </div>
          <div className="field"><label className="label">Key Message ที่อยากให้คนดูจำ</label><input className="input" value={form.keyMessage} onChange={e=>set('keyMessage',e.target.value)} placeholder="เช่น กลางคืน ป้ายที่คนเห็น สำคัญกว่าป้ายที่แค่มี"/></div>
          <div className="row">
            <div className="field"><label className="label">กลุ่มเป้าหมาย</label><input className="input" value={form.audience} placeholder={profile?.audience||'เจ้าของร้าน / SME'} onChange={e=>set('audience',e.target.value)}/></div>
            <div className="field"><label className="label">เป้าหมาย</label><select className="select" value={form.goal} onChange={e=>set('goal',e.target.value)}><option>ให้ความรู้ + สร้างความน่าเชื่อถือ</option><option>ขายสินค้า</option><option>ให้คนทักแชต</option><option>สร้างแบรนด์</option><option>เพิ่มยอดดู / Retention</option></select></div>
          </div>
          <div className="row">
            <div className="field"><label className="label">ภาษา</label><select className="select" value={form.language} onChange={e=>set('language',e.target.value)}><option>ลาว</option><option>ไทย</option><option>ไทย + ลาว</option></select></div>
            <div className="field"><label className="label">ความยาว</label><select className="select" value={form.duration} onChange={e=>set('duration',e.target.value)}><option>15</option><option>30</option><option>40</option><option>60</option><option>90</option></select></div>
          </div>
          <div className="field"><label className="label">ประเภท Hook</label><select className="select" value={form.hookType} onChange={e=>set('hookType',e.target.value)}><option>AI เลือกให้อัตโนมัติ</option><option>เปิดด้วยปัญหา</option><option>เปิดด้วยความเข้าใจผิด</option><option>เปิดด้วยผลลัพธ์</option><option>เปิดด้วยคำถาม</option><option>Contrarian / หักมุม</option><option>เปิดด้วยบทสนทนา</option></select></div>
          <div className="field"><label className="label">แนวสคริปต์</label><div className="chips">{styles.map(x=><button key={x} className={`chip ${style===x?'active':''}`} onClick={()=>setStyle(x)}>{x}</button>)}</div></div>
          <div className="actions generateActions"><button className="primary" onClick={generate} disabled={loading || (!form.story.trim() && !form.topic.trim())}>{loading?<span className="loading"><span className="dot"/>กำลังเขียนสคริปต์...</span>:'✨ สร้างสคริปต์ 3 แนว'}</button><button className="secondary" onClick={()=>setForm(blank)}>ล้างฟอร์ม</button></div>
          {profile&&<p className="muted">ใช้เพจ {profile.pageName} • ช่องที่เว้นว่างจะใช้สินค้าและกลุ่มเป้าหมายจากโปรไฟล์</p>}
          <div className="notice">AI จะไม่สร้างตัวเลข/ยอดขาย/ผลลัพธ์ใหม่เอง ถ้าไม่ได้กรอกมา และจะพยายามเขียนภาษาลาวให้เป็นภาษาพูดธรรมชาติ ไม่แปลไทยแบบคำต่อคำ</div>
        </div>
      </section>

      <section className="card">
        <div className="cardHead"><h2>ผลลัพธ์</h2>{current&&<button className="secondary" onClick={()=>copy(allText())}>Copy All</button>}</div>
        <div className="cardBody">
          {error&&<div className="error" role="alert">{error}</div>}
          <p role="status" className="status">{copied}</p>
          {!current&&!loading&&<div className="empty"><div><strong>พร้อมสร้างสคริปต์</strong>กรอกเรื่องราวด้านซ้าย แล้วกด Generate<br/>ระบบจะสร้าง 3 แนวให้เลือกพร้อมนำไปใช้ทันที</div></div>}
          {loading&&<div className="empty"><div><strong>กำลังเปลี่ยนข้อมูลดิบให้เป็น Story</strong>กำลังหา Hook, Turning Point, Key Message และจังหวะสำหรับ Short Video</div></div>}
          {current&&<>
            <div className="outputTop" style={{marginBottom:14}}>{data.directions.map((x,i)=><button key={i} className={`tab ${variant===i?'active':''}`} onClick={()=>setVariant(i)}>แบบ {String.fromCharCode(65+i)} • {x.mode}</button>)}</div>
            <div className="result">
              <Box title="แนวทาง" text={`${current.title}\n${current.angle}`} copy={copy}/>
              <Box title="HOOK 3 แบบ" text={current.hooks.map((x,i)=>`${i+1}. ${x}`).join('\n\n')} copy={copy} hook/>
              <Box title={`FULL SCRIPT • ~${form.duration} วินาที`} text={current.script} copy={copy}/>
              <Box title="TEXT ON SCREEN" text={current.textOnScreen.map(x=>`• ${x}`).join('\n')} copy={copy}/>
              <Box title="COVER HOOK" text={current.coverHooks.map((x,i)=>`${i+1}. ${x}`).join('\n')} copy={copy}/>
              <Box title="CAPTION" text={current.caption} copy={copy}/>
              <Box title="B-ROLL / SHOT LIST" text={current.broll.map((x,i)=>`${i+1}. ${x}`).join('\n')} copy={copy}/>
              <Box title="CTA" text={current.cta} copy={copy}/>
            </div>
          </>}
        </div>
      </section>
    </div>
    <div className="footer">Winner Script Generator • API key ทำงานเฉพาะฝั่ง Server</div>
  </main>
}

function Box({title,text,copy,hook}) { return <div className="section"><div className="sectionHead"><h3>{title}</h3><button className="copy" onClick={()=>copy(text)}>Copy</button></div><div className={`content ${hook?'hook':''}`}>{text}</div></div> }
