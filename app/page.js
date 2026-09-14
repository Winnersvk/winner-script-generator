import {redirect} from 'next/navigation';
import {signedIn} from '../lib/auth';
import Generator from './Generator';
export const dynamic='force-dynamic';
export default async function Home(){
  let user,db;
  try{({user,db}=await signedIn());}catch{}
  if(!user)redirect('/login');
  const {data:admin}=await db.rpc('is_app_admin');
  return <><div className="shell" style={{paddingBottom:0}}>{admin&&<a className="secondary" href="/admin">รายงานแอดมิน</a>}</div><Generator user={{id:user.id,email:user.email}}/></>;
}
