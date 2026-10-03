create extension if not exists pgcrypto;

create table if not exists public.basgo_admin_users (
  id uuid primary key default gen_random_uuid(),
  password_hash text not null,
  created_at timestamptz not null default now()
);

create table if not exists public.basgo_admin_sessions (
  token text primary key,
  expires_at timestamptz not null,
  created_at timestamptz not null default now()
);

create table if not exists public.basgo_admin_settings (
  key text primary key,
  value text not null,
  updated_at timestamptz not null default now()
);

insert into public.basgo_admin_settings(key,value)
values ('commission_percent','0')
on conflict (key) do nothing;

alter table public.basgo_admin_users enable row level security;
alter table public.basgo_admin_sessions enable row level security;
alter table public.basgo_admin_settings enable row level security;

create or replace function public.basgo_admin_login(p_password text)
returns text language plpgsql security definer set search_path=public,extensions as $$
declare stored text; t text;
begin
  select password_hash into stored from public.basgo_admin_users order by created_at asc limit 1;
  if stored is null or encode(extensions.digest(coalesce(p_password,''),'sha256'),'hex')<>stored then return null; end if;
  t:=encode(extensions.gen_random_bytes(32),'hex');
  insert into public.basgo_admin_sessions(token,expires_at) values(t,now()+interval '12 hours');
  return t;
end; $$;

create or replace function public.basgo_admin_dashboard(p_token text)
returns jsonb language plpgsql security definer set search_path=public as $$
declare ok boolean; result jsonb;
begin
  select exists(select 1 from public.basgo_admin_sessions where token=p_token and expires_at>now()) into ok;
  if not ok then return jsonb_build_object('error','unauthorized'); end if;
  result:=jsonb_build_object(
    'stats',jsonb_build_object(
      'orders_total',(select count(*) from public.ride_requests),
      'orders_pending',(select count(*) from public.ride_requests where status='pending'),
      'orders_active',(select count(*) from public.ride_requests where status in ('accepted','in_progress','picked_up')),
      'orders_completed',(select count(*) from public.ride_requests where status='completed'),
      'revenue_completed',(select coalesce(sum(coalesce(agreed_price,offer_price)),0) from public.ride_requests where status='completed'),
      'couriers_total',(select count(*) from public.drivers),
      'couriers_online',(select count(*) from public.drivers where is_online=true)
    ),
    'couriers',(select coalesce(jsonb_agg(x order by x.name),'[]'::jsonb) from (
      select d.id,d.name,d.phone,d.status,d.is_online,d.latitude,d.longitude,d.last_location_at,
      coalesce((select count(*) from public.ride_requests r where r.driver_id=d.id),0) orders_count,
      coalesce((select sum(coalesce(r.agreed_price,r.offer_price)) from public.ride_requests r where r.driver_id=d.id and r.status='completed'),0) earnings
      from public.drivers d
    ) x),
    'orders',(select coalesce(jsonb_agg(x order by x.created_at desc),'[]'::jsonb) from (
      select r.id,r.created_at,r.status,r.payment_status,r.payment_method,r.pickup,r.destination,r.offer_price,r.agreed_price,r.passenger_name,r.passenger_phone,r.driver_id,d.name driver_name
      from public.ride_requests r left join public.drivers d on d.id=r.driver_id
      order by r.created_at desc limit 100
    ) x),
    'settings',jsonb_build_object('commission_percent',coalesce((select value::numeric from public.basgo_admin_settings where key='commission_percent'),0))
  );
  return result;
end; $$;

create or replace function public.basgo_admin_set_commission(p_token text,p_percent numeric)
returns boolean language plpgsql security definer set search_path=public as $$
begin
  if not exists(select 1 from public.basgo_admin_sessions where token=p_token and expires_at>now()) then return false; end if;
  if p_percent<0 or p_percent>100 then return false; end if;
  insert into public.basgo_admin_settings(key,value,updated_at) values('commission_percent',p_percent::text,now())
  on conflict(key) do update set value=excluded.value,updated_at=now();
  return true;
end; $$;

create or replace function public.basgo_admin_logout(p_token text)
returns boolean language plpgsql security definer set search_path=public as $$
begin delete from public.basgo_admin_sessions where token=p_token; return true; end; $$;

create or replace function public.basgo_driver_set_online(p_token text,p_online boolean)
returns jsonb language plpgsql security definer set search_path=public as $$
declare d_id uuid; result jsonb;
begin
  select driver_id into d_id from public.driver_sessions where token=p_token and expires_at>now();
  if d_id is null then return null; end if;
  update public.drivers set is_online=p_online,last_seen_at=now() where id=d_id;
  select jsonb_build_object('id',id,'name',name,'phone',phone,'is_online',is_online,'status',status) into result from public.drivers where id=d_id;
  return result;
end; $$;

grant execute on function public.basgo_admin_login(text) to anon,authenticated;
grant execute on function public.basgo_admin_dashboard(text) to anon,authenticated;
grant execute on function public.basgo_admin_set_commission(text,numeric) to anon,authenticated;
grant execute on function public.basgo_admin_logout(text) to anon,authenticated;
grant execute on function public.basgo_driver_set_online(text,boolean) to anon,authenticated;