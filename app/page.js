import {requireUser} from '../lib/require-user';
import InstallApp from './InstallApp';
export const dynamic='force-dynamic';
export default async function Home(){
  const {admin}=await requireUser();
  return <main className="shell hubShell"><div className="header"><div><p className="eyebrow">YOUR MARKETING WORKSPACE</p><h1>วันนี้อยากสร้างอะไร?</h1><p className="muted">จากไอเดียสู่คอนเทนต์ ในพื้นที่เดียวกัน</p></div><InstallApp/></div><div className="homeCards"><a className="homeCard" href="/scripts"><span className="homeSymbol">✎</span><h2>สร้างสคริปต์</h2><p>เล่าเรื่องให้น่าสนใจด้วยน้ำเสียงของแบรนด์คุณ</p><strong>เริ่มสร้างสคริปต์ →</strong></a><a className="homeCard mint" href="/publisher"><span className="homeSymbol">▧</span><h2>โพสต์คอนเทนต์</h2><p>เพิ่มรูป เขียนแคปชั่น ตรวจทาน และวางแผนโพสต์</p><strong>เตรียมโพสต์ใหม่ →</strong></a></div><div className="actions"><a className="secondary" href="/queue">คิวโพสต์</a><a className="secondary" href="/calendar">ปฏิทินคอนเทนต์</a><a className="secondary" href="/brands">จัดการแบรนด์ / เพจ</a>{admin&&<a className="secondary" href="/admin">รายงานการสร้างสคริปต์</a>}</div><p className="notice">การโพสต์อัตโนมัติต้องเชื่อมต่อ Facebook ก่อน คุณสามารถเตรียมเนื้อหาและวางแผนคิวได้</p></main>;
}
