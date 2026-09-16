import {requireUser} from '../../lib/require-user';
import Queue from './Queue';
export const dynamic='force-dynamic';
export default async function Page(){const {admin}=await requireUser();return <Queue admin={admin}/>;}
