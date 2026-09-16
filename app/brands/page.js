import {requireUser} from '../../lib/require-user';
import Brands from './Brands';
export const dynamic='force-dynamic';
export default async function Page(){const {user}=await requireUser();return <main className="shell hubShell"><h1>แบรนด์ / เพจ</h1><p>ข้อมูลชุดเดียว ใช้ได้ทั้งสคริปต์และแคปชั่น</p><Brands userId={user.id}/></main>;}
