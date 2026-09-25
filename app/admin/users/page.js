import {redirect} from 'next/navigation';
import {requireUser} from '../../../lib/require-user';
import Users from './Users';
export const dynamic='force-dynamic';
export default async function Page(){
 const {admin}=await requireUser();
 if(!admin)redirect('/');
 return <Users/>;
}
