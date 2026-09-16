-- Additive MKT Online migration. Existing accounts and script history are untouched.
begin;
create table if not exists public.mkt_brands (
 id uuid primary key, owner_id uuid not null references auth.users(id) on delete cascade,
 data jsonb not null check(jsonb_typeof(data)='object'), updated_at timestamptz not null default now()
);
create table if not exists public.mkt_posts (
 id uuid primary key, owner_id uuid not null references auth.users(id) on delete cascade,
 brand_id uuid not null references public.mkt_brands(id), caption text not null default '',
 images jsonb not null default '[]', style text not null default 'story',
 status text not null default 'draft' check(status in ('draft','pending','approved','scheduled','publishing','published','failed','cancelled')),
 scheduled_at timestamptz, published_at timestamptz, facebook_post_id text, last_error text,
 revision integer not null default 1, created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
create index if not exists mkt_posts_owner_date on public.mkt_posts(owner_id,created_at desc);
create index if not exists mkt_posts_due on public.mkt_posts(scheduled_at) where status='scheduled';
alter table public.mkt_brands enable row level security;
alter table public.mkt_posts enable row level security;
create policy mkt_brands_owner on public.mkt_brands for all to authenticated using(owner_id=auth.uid()) with check(owner_id=auth.uid());
create policy mkt_posts_read on public.mkt_posts for select to authenticated using(owner_id=auth.uid() or public.is_app_admin());
revoke all on public.mkt_brands,public.mkt_posts from anon,authenticated;
grant select,insert,update on public.mkt_brands to authenticated;
grant select on public.mkt_posts to authenticated;

-- All post writes pass through one state machine; clients cannot mark a post published.
create or replace function public.mkt_save_post(p_id uuid,p_revision integer,p_brand uuid,p_caption text,p_images jsonb,p_style text,p_action text,p_schedule timestamptz default null)
returns public.mkt_posts language plpgsql security definer set search_path=public as $$
declare old public.mkt_posts; result public.mkt_posts; target text; admin boolean:=public.is_app_admin();
begin
 if auth.uid() is null then raise exception 'UNAUTHORIZED'; end if;
 if p_id is null or p_revision is null or p_revision<0 or p_action is null or p_brand is null or p_caption is null or p_images is null or p_style is null or p_style not in ('sale','story','promo','education','portfolio','beforeafter','engagement') then raise exception 'INVALID_CONTENT'; end if;
 select * into old from public.mkt_posts where id=p_id for update;
 if found then
  if old.owner_id<>auth.uid() and not (admin and p_action='approve') then raise exception 'FORBIDDEN'; end if;
  if old.revision<>p_revision then raise exception 'CONFLICT'; end if;
  if old.status in ('publishing','published') then raise exception 'LOCKED'; end if;
 else
  if p_revision<>0 or p_action not in ('draft','pending') then raise exception 'NOT_FOUND'; end if;
 end if;
 if p_action='approve' then
  if not admin or old.status<>'pending' then raise exception 'FORBIDDEN'; end if;
  update public.mkt_posts set status='approved',revision=revision+1,updated_at=now() where id=p_id returning * into result;
  return result;
 end if;
 if p_action='cancel' then
  if old.id is null then raise exception 'NOT_FOUND'; end if;
  update public.mkt_posts set status='cancelled',scheduled_at=null,revision=revision+1,updated_at=now() where id=p_id returning * into result;
  return result;
 end if;
 if not exists(select 1 from public.mkt_brands where id=p_brand and owner_id=auth.uid()) then raise exception 'INVALID_BRAND'; end if;
 if length(p_caption)>10000 or jsonb_typeof(p_images)<>'array' or jsonb_array_length(p_images)>10 then raise exception 'INVALID_CONTENT'; end if;
 if exists(select 1 from jsonb_array_elements_text(p_images) x where x is null or x !~ ('^'||auth.uid()::text||'/[0-9a-f-]{36}\.(jpg|png)$')) then raise exception 'INVALID_IMAGE'; end if;
 if p_action not in ('draft','pending','scheduled') then raise exception 'INVALID_ACTION'; end if;
 if p_action<>'draft' and (length(trim(p_caption))=0 or jsonb_array_length(p_images)=0) then raise exception 'CONTENT_REQUIRED'; end if;
 if p_action='scheduled' then
  if old.id is null or (not admin and (old.status not in ('approved','scheduled') or old.caption is distinct from p_caption or old.images is distinct from p_images or old.brand_id is distinct from p_brand or old.style is distinct from p_style)) then raise exception 'APPROVAL_REQUIRED'; end if;
  if p_schedule is null or p_schedule<=now() then raise exception 'FUTURE_REQUIRED'; end if;
 end if;
 if old.id is null then
 insert into public.mkt_posts(id,owner_id,brand_id,caption,images,style,status,scheduled_at)
 values(p_id,auth.uid(),p_brand,p_caption,p_images,p_style,p_action,case when p_action='scheduled' then p_schedule end)
 returning * into result;
 else
 update public.mkt_posts set brand_id=p_brand,caption=p_caption,images=p_images,style=p_style,status=p_action,scheduled_at=case when p_action='scheduled' then p_schedule end,last_error=null,revision=revision+1,updated_at=now() where id=p_id returning * into result;
 end if;
 return result;
end $$;
revoke all on function public.mkt_save_post(uuid,integer,uuid,text,jsonb,text,text,timestamptz) from public,anon;
grant execute on function public.mkt_save_post(uuid,integer,uuid,text,jsonb,text,text,timestamptz) to authenticated;

insert into storage.buckets(id,name,public,file_size_limit,allowed_mime_types)
values('mkt-content','mkt-content',false,10485760,array['image/jpeg','image/png']) on conflict(id) do nothing;
create policy mkt_media_read on storage.objects for select to authenticated using(bucket_id='mkt-content' and ((storage.foldername(name))[1]=auth.uid()::text or public.is_app_admin()));
create policy mkt_media_insert on storage.objects for insert to authenticated with check(bucket_id='mkt-content' and (storage.foldername(name))[1]=auth.uid()::text);
commit;
