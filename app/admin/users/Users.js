'use client';
import {useRef,useState} from 'react';
export default function Users(){
 const pending=useRef(false);
 const [busy,setBusy]=useState(false),[error,setError]=useState(''),[created,setCreated]=useState('');
 async function submit(e){
  e.preventDefault();if(pending.current)return;
  const form=e.currentTarget,values=new FormData(form);
  setError('');setCreated('');
  if(values.get('password')!==values.get('confirm')){setError('รหัสผ่านทั้งสองช่องไม่ตรงกัน');return;}
  pending.current=true;setBusy(true);
  try{
   const r=await fetch('/api/admin/users',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({name:values.get('name'),email:values.get('email'),password:values.get('password')})});
   const j=await r.json();if(!r.ok)throw new Error(j.error||'สร้างบัญชีไม่สำเร็จ');
   setCreated(j.user.email);form.reset();
  }catch(e){setError(e.message||'เชื่อมต่อไม่ได้ กรุณาตรวจสอบว่าบัญชีถูกสร้างแล้วหรือไม่ก่อนลองอีกครั้ง');}
  finally{pending.current=false;setBusy(false);}
 }
 return <main className="shell hubShell" style={{maxWidth:640}}><a href="/settings">← กลับไปตั้งค่า</a><h1>จัดการผู้ใช้</h1><section className="card"><div className="cardHead"><h2>สร้างบัญชีพนักงาน</h2></div><form className="cardBody" onSubmit={submit} aria-busy={busy}><p>บัญชีใหม่เป็นสมาชิก เข้าถึงงานของตัวเองได้ และไม่มีสิทธิ์ผู้ดูแลระบบ</p><fieldset disabled={busy} style={{border:0,padding:0,margin:0,minWidth:0}}><div className="field"><label className="label" htmlFor="employee-name">ชื่อพนักงาน</label><input className="input" id="employee-name" name="name" autoComplete="off" required maxLength={100}/></div><div className="field"><label className="label" htmlFor="employee-email">อีเมลพนักงาน</label><input className="input" id="employee-email" name="email" type="email" autoComplete="off" required maxLength={254}/></div><div className="field"><label className="label" htmlFor="employee-password">รหัสผ่าน</label><input className="input" id="employee-password" name="password" type="password" autoComplete="new-password" required minLength={12} maxLength={128} aria-describedby="password-hint"/><small id="password-hint">12–128 ตัวอักษร ใช้รหัสผ่านที่ไม่ซ้ำกับบัญชีอื่น</small></div><div className="field"><label className="label" htmlFor="employee-confirm">ยืนยันรหัสผ่าน</label><input className="input" id="employee-confirm" name="confirm" type="password" autoComplete="new-password" required minLength={12} maxLength={128}/></div><p className="muted">ตรวจสอบอีเมลให้ถูกต้อง บัญชีจะเข้าใช้งานได้ทันทีโดยไม่ต้องกดยืนยันอีเมล ผู้ดูแลต้องส่งข้อมูลเข้าใช้ให้พนักงานด้วยตนเอง</p><button className="primary" disabled={busy}>{busy?'กำลังสร้างบัญชี…':'สร้างบัญชีพนักงาน'}</button></fieldset>{error&&<p role="alert">{error}</p>}{created&&<div role="status"><p>สร้างบัญชี {created} สำเร็จแล้ว</p><p>ให้พนักงานเข้าสู่ระบบด้วยอีเมลและรหัสผ่านที่กำหนด ที่ <a href="/login">หน้าเข้าสู่ระบบ</a></p></div>}</form></section></main>;
}
