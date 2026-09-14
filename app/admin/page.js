import {redirect} from 'next/navigation';
import {signedIn} from '../../lib/auth';
import Report from './Report';
export const dynamic='force-dynamic';
export default async function Admin(){
 const {db,user}=await signedIn();
 if(!user)redirect('/login');
 const {data,error}=await db.rpc('is_app_admin');
 if(error||!data)redirect('/');
 return <Report/>;
}
