-- Dedicated application administrator; client roles cannot edit this table.
create table if not exists public.app_admins (user_id uuid primary key references auth.users(id) on delete cascade);
alter table public.app_admins enable row level security;
revoke all on public.app_admins from anon, authenticated;
create or replace function public.is_app_admin() returns boolean language sql stable security definer set search_path = '' as $$
 select exists(select 1 from public.app_admins where user_id=(select auth.uid()));
$$;
revoke all on function public.is_app_admin() from public;
grant execute on function public.is_app_admin() to authenticated;
insert into public.app_admins(user_id)
select id from auth.users where id='52d693c9-b59c-40aa-ae90-787f259a85e2' and lower(email)='patamet.d@gmail.com'
on conflict do nothing;
drop policy if exists history_admin_read on public.script_history;
create policy history_admin_read on public.script_history for select to authenticated using ((select public.is_app_admin()));
create or replace function public.admin_usage_report(p_from date default null,p_to date default null,p_grain text default 'day',p_user uuid default null,p_page integer default 0)
returns jsonb language plpgsql stable security definer set search_path = '' as $$
declare report jsonb;
begin
 if not public.is_app_admin() then raise exception 'Forbidden' using errcode='42501'; end if;
 if p_grain not in ('day','month','year') or p_page<0 or p_page>100000 or (p_from is not null and p_to is not null and p_from>p_to) then raise exception 'Invalid filter'; end if;
 with filtered as (
  select h.id,h.user_id,h.created_at,h.title,u.email,
   case when jsonb_typeof(h.output->'directions')='array' then jsonb_array_length(h.output->'directions') else 0 end as scripts
  from public.script_history h left join auth.users u on u.id=h.user_id
  where (p_from is null or h.created_at >= (p_from::timestamp at time zone 'Asia/Bangkok'))
    and (p_to is null or h.created_at < ((p_to+1)::timestamp at time zone 'Asia/Bangkok'))
    and (p_user is null or h.user_id=p_user)
 ), periods as (
  select date_trunc(p_grain,created_at at time zone 'Asia/Bangkok')::date as period,count(*) as generations,sum(scripts) as scripts
  from filtered group by 1
 ), people as (
  select user_id,email,count(*) as generations,sum(scripts) as scripts from filtered group by user_id,email
 ), entries as (select * from filtered order by created_at desc,id limit 20 offset p_page*20)
 select jsonb_build_object(
  'generations',(select count(*) from filtered),
  'scripts',coalesce((select sum(scripts) from filtered),0),
  'periods',coalesce((select jsonb_agg(to_jsonb(p) order by period desc) from periods p),'[]'::jsonb),
  'people',coalesce((select jsonb_agg(to_jsonb(p) order by generations desc,email) from people p),'[]'::jsonb),
  'items',coalesce((select jsonb_agg(to_jsonb(e) order by created_at desc,id) from entries e),'[]'::jsonb)
 ) into report;
 return report;
end;
$$;
revoke all on function public.admin_usage_report(date,date,text,uuid,integer) from public;
grant execute on function public.admin_usage_report(date,date,text,uuid,integer) to authenticated;
