import {requireUser} from '../../lib/require-user';
import Publisher from './Publisher';
export const dynamic='force-dynamic';
export default async function Page({searchParams}){const {user,admin}=await requireUser();const params=await searchParams;return <Publisher userId={user.id} admin={admin} editId={params.edit||''}/>;}
