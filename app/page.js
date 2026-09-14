import {redirect} from 'next/navigation';
import {signedIn} from '../lib/auth';
import Generator from './Generator';
export const dynamic='force-dynamic';
export default async function Home(){
  let user;
  try{({user}=await signedIn());}catch{}
  if(!user)redirect('/login');
  return <Generator user={{id:user.id,email:user.email}}/>;
}
