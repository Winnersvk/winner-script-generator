'use client';
import {useState} from 'react';
export default function Login(){
  const [busy,setBusy]=useState(false),[error,setError]=useState('');
  async function submit(e){e.preventDefault();setBusy(true);setError('');
    const form=new FormData(e.currentTarget);
    try{const r=await fetch('/api/auth',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({action:'login',email:form.get('email'),password:form.get('password')})});
      const j=await r.json();if(!r.ok)throw new Error(j.error);window.location.replace('/');
    }catch(e){setError(e.message||'เชื่อมต่อไม่ได้ กรุณาลองอีกครั้ง');setBusy(false);}
  }
  return <main className="shell" style={{maxWidth:480,paddingTop:70}}><section className="card"><div className="cardHead"><h1>เข้าสู่ระบบ</h1></div><form className="cardBody" onSubmit={submit}><p>Winner Script Generator • สำหรับผู้ใช้ที่ได้รับสิทธิ์จากเจ้าของร้าน</p><div className="field"><label htmlFor="email" className="label">อีเมล</label><input id="email" name="email" type="email" autoComplete="username" className="input" required maxLength={254}/></div><div className="field"><label htmlFor="password" className="label">รหัสผ่าน</label><input id="password" name="password" type="password" autoComplete="current-password" className="input" required maxLength={1024}/></div><p role="alert">{error}</p><button className="primary" disabled={busy}>{busy?'กำลังเข้าสู่ระบบ…':'เข้าสู่ระบบ'}</button><p className="muted">ยังไม่มีบัญชีหรือลืมรหัสผ่าน ติดต่อเจ้าของร้านเพื่อรับสิทธิ์เข้าใช้งาน</p></form></section></main>;
}
