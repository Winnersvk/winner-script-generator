import {requireUser} from '../../lib/require-user';
import Calendar from './Calendar';
export const dynamic='force-dynamic';
export default async function Page(){await requireUser();return <Calendar/>;}
