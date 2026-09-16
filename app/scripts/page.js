import {requireUser} from '../../lib/require-user';
import Generator from '../Generator';
export const dynamic='force-dynamic';
export default async function Page(){const {user}=await requireUser();return <Generator user={{id:user.id,email:user.email}}/>;}
