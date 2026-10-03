-- BASGO order flow and stable live-tracking token
alter table public.ride_requests add column if not exists tracking_token text;
update public.ride_requests set tracking_token=encode(gen_random_bytes(18),'hex') where tracking_token is null;
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