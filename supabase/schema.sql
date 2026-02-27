create table if not exists prefectures (
  code char(2) primary key,
  name varchar(50) not null
);

create table if not exists municipalities (
  code char(5) primary key,
  prefecture_code char(2) references prefectures(code),
  name varchar(100) not null,
  rent_avg numeric,
  population integer,
  area_km2 numeric,
  geojson jsonb not null,
  updated_at timestamptz not null default now()
);

create table if not exists profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  username varchar(50),
  created_at timestamptz not null default now()
);

create table if not exists posts (
  id bigserial primary key,
  municipality_code char(5) references municipalities(code) not null,
  user_id uuid references profiles(id) not null,
  content text not null check (length(content) <= 1000),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table posts enable row level security;

create policy "read all posts"
  on posts for select
  using (true);

create policy "insert own posts"
  on posts for insert
  with check (auth.uid() = user_id);

create policy "delete own posts"
  on posts for delete
  using (auth.uid() = user_id);
