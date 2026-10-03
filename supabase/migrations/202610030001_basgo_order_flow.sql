-- BASGO order flow and stable live-tracking token
alter table public.ride_requests add column if not exists tracking_token text;
update public.ride_requests set tracking_token=md5(random()::text || clock_timestamp()::text || txid_current()::text) where tracking_token is null;
create unique index if not exists ride_requests_tracking_token_key on public.ride_requests(tracking_token);
alter table public.ride_requests alter column tracking_token set default encode(gen_random_bytes(18),'hex');

create or replace function public.basgo_create_order(
  p_message text, p_pickup text, p_destination text, p_offer_price integer, p_payment_method text,
  p_passenger_name text default null, p_passenger_phone text default null,
  p_pickup_latitude double precision default null, p_pickup_longitude double precision default null,
  p_destination_latitude double precision default null, p_destination_longitude double precision default null
) returns jsonb
language plpgsql security definer set search_path=public
as $function$
declare r public.ride_requests;
begin
  if coalesce(trim(p_message),'')='' then raise exception 'MESSAGE_REQUIRED'; end if;
  if coalesce(trim(p_pickup),'')='' then raise exception 'PICKUP_REQUIRED'; end if;
  if coalesce(trim(p_destination),'')='' then raise exception 'DESTINATION_REQUIRED'; end if;
  if coalesce(p_offer_price,0)<=0 then raise exception 'PRICE_REQUIRED'; end if;
  if coalesce(trim(p_payment_method),'')='' then raise exception 'PAYMENT_REQUIRED'; end if;
  insert into public.ride_requests(driver_id,passenger_name,passenger_phone,message,pickup,destination,offer_price,payment_method,status,pickup_latitude,pickup_longitude,destination_latitude,destination_longitude,tracking_token)
  values(null,nullif(trim(p_passenger_name),''),nullif(trim(p_passenger_phone),''),trim(p_message),trim(p_pickup),trim(p_destination),p_offer_price,trim(p_payment_method),'pending',p_pickup_latitude,p_pickup_longitude,p_destination_latitude,p_destination_longitude,encode(gen_random_bytes(18),'hex'))
  returning * into r;
  insert into public.ride_messages(ride_id,sender,message) values(r.id,'passenger',trim(p_message));
  return jsonb_build_object('id',r.id,'status',r.status,'message',r.message,'pickup',r.pickup,'destination',r.destination,'offer_price',r.offer_price,'payment_method',r.payment_method,'created_at',r.created_at,'tracking_token',r.tracking_token);
end
$function$;

revoke execute on function public.basgo_create_order(text,text,text,integer,text,text,text,double precision,double precision,double precision,double precision) from public;
grant execute on function public.basgo_create_order(text,text,text,integer,text,text,text,double precision,double precision,double precision,double precision) to anon,authenticated;

create or replace function public.basgo_update_driver_location(
  p_token text,p_ride_id uuid,p_latitude double precision,p_longitude double precision,
  p_accuracy_meters double precision default null,p_heading_degrees double precision default null,p_speed_mps double precision default null
) returns public.order_tracking
language plpgsql security definer set search_path=public
as $function$
declare v_driver_id uuid; v_tracking_token text; v_row public.order_tracking;
begin
  select driver_id into v_driver_id from public.driver_sessions where token=p_token and expires_at>now();
  if v_driver_id is null then raise exception 'invalid_or_expired_session'; end if;
  select tracking_token into v_tracking_token from public.ride_requests where id=p_ride_id and (driver_id=v_driver_id or accepted_driver_id=v_driver_id) and status not in ('completed','cancelled','rejected');
  if v_tracking_token is null then raise exception 'driver_not_assigned_to_active_order'; end if;
  update public.drivers set latitude=p_latitude,longitude=p_longitude,location_accuracy_meters=p_accuracy_meters,heading_degrees=p_heading_degrees,speed_mps=p_speed_mps,last_location_at=now(),last_seen_at=now(),is_online=true where id=v_driver_id;
  insert into public.order_tracking(ride_id,driver_id,latitude,longitude,accuracy_meters,heading_degrees,speed_mps,tracking_token,status)
  values(p_ride_id,v_driver_id,p_latitude,p_longitude,p_accuracy_meters,p_heading_degrees,p_speed_mps,v_tracking_token,'active') returning * into v_row;
  return v_row;
end
$function$;

-- BASGO completion and payment confirmation
alter table public.ride_requests
  add column if not exists payment_status text not null default 'pending',
  add column if not exists completed_at timestamptz,
  add column if not exists payment_confirmed_at timestamptz,
  add column if not exists payment_confirmed_by text;

alter table public.ride_requests
  drop constraint if exists ride_requests_payment_status_check;
alter table public.ride_requests
  add constraint ride_requests_payment_status_check
  check (payment_status in ('pending','confirmed','failed'));

create or replace function public.basgo_driver_complete_order(
  p_token text, p_ride_id uuid
) returns jsonb
language plpgsql security definer set search_path=public
as $function$
declare v_driver_id uuid; r public.ride_requests;
begin
  select driver_id into v_driver_id from public.driver_sessions where token=p_token and expires_at>now();
  if v_driver_id is null then raise exception 'invalid_or_expired_session'; end if;
  update public.ride_requests set status='completed',completed_at=now(),tracking_finished_at=now(),updated_at=now()
  where id=p_ride_id and (driver_id=v_driver_id or accepted_driver_id=v_driver_id)
    and status in ('accepted','in_progress','picked_up') returning * into r;
  if not found then raise exception 'order_not_active_or_not_assigned'; end if;
  insert into public.ride_messages(ride_id,sender,message) values(r.id,'driver','BASGO: заказ завершён исполнителем');
  return jsonb_build_object('id',r.id,'status',r.status,'payment_status',r.payment_status,'completed_at',r.completed_at,'tracking_finished_at',r.tracking_finished_at,'payment_method',r.payment_method,'agreed_price',coalesce(r.agreed_price,r.offer_price));
end $function$;

create or replace function public.basgo_confirm_payment(
  p_tracking_token text, p_ride_id uuid
) returns jsonb
language plpgsql security definer set search_path=public
as $function$
declare r public.ride_requests;
begin
  update public.ride_requests set payment_status='confirmed',payment_confirmed_at=now(),payment_confirmed_by='customer',updated_at=now()
  where id=p_ride_id and tracking_token=p_tracking_token and status='completed' and payment_status='pending'
  returning * into r;
  if not found then raise exception 'order_not_ready_for_payment_confirmation'; end if;
  insert into public.ride_messages(ride_id,sender,message) values(r.id,'passenger','BASGO: оплата подтверждена заказчиком');
  return jsonb_build_object('id',r.id,'status',r.status,'payment_status',r.payment_status,'payment_confirmed_at',r.payment_confirmed_at,'payment_method',r.payment_method,'agreed_price',coalesce(r.agreed_price,r.offer_price));
end $function$;

revoke execute on function public.basgo_driver_complete_order(text,uuid) from public;
grant execute on function public.basgo_driver_complete_order(text,uuid) to anon,authenticated;
revoke execute on function public.basgo_confirm_payment(text,uuid) from public;
grant execute on function public.basgo_confirm_payment(text,uuid) to anon,authenticated;


create or replace function public.basgo_get_order_status(p_tracking_token text)
returns jsonb language sql security definer set search_path=public
as $function$
  select jsonb_build_object(
    'id',r.id,'status',r.status,'payment_status',r.payment_status,
    'payment_method',r.payment_method,'offer_price',r.offer_price,
    'agreed_price',coalesce(r.agreed_price,r.offer_price),
    'driver_id',r.accepted_driver_id,'accepted_at',r.accepted_at,
    'completed_at',r.completed_at,'payment_confirmed_at',r.payment_confirmed_at
  )
  from public.ride_requests r where r.tracking_token=p_tracking_token limit 1
$function$;
revoke execute on function public.basgo_get_order_status(text) from public;
grant execute on function public.basgo_get_order_status(text) to anon,authenticated;


-- BASGO security hardening: accept orders only with an active driver session.
create or replace function public.basgo_driver_accept_order(p_token text,p_ride_id uuid,p_agreed_price integer)
returns jsonb language plpgsql security definer set search_path=public
as $function$
declare v_driver uuid; r public.ride_requests;
begin
  select driver_id into v_driver from public.driver_sessions where token=p_token and expires_at>now() limit 1;
  if v_driver is null then raise exception 'invalid_driver_session'; end if;
  if p_agreed_price is null or p_agreed_price <= 0 then raise exception 'invalid_agreed_price'; end if;
  update public.ride_requests
  set status='accepted',driver_id=v_driver,accepted_at=now(),accepted_driver_id=v_driver,
      driver_reply='BASGO: заказ принят исполнителем',agreed_price=p_agreed_price,updated_at=now()
  where id=p_ride_id and status='pending' and (driver_id is null or driver_id=v_driver)
  returning * into r;
  if not found then raise exception 'order_already_taken_or_unavailable'; end if;
  insert into public.ride_messages(ride_id,sender,message) values(r.id,'driver','BASGO: заказ принят исполнителем');
  return jsonb_build_object('id',r.id,'status',r.status,'offer_price',r.offer_price,'agreed_price',r.agreed_price,
    'driver_reply',r.driver_reply,'accepted_driver_id',r.accepted_driver_id,'accepted_at',r.accepted_at,'driver_id',r.driver_id);
end $function$;
revoke execute on function public.basgo_driver_accept_order(text,uuid,integer) from public;
grant execute on function public.basgo_driver_accept_order(text,uuid,integer) to anon,authenticated;
