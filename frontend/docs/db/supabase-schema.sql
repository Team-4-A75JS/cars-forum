-- =====================================================
-- Forum Management System - Database Schema
-- Supabase Postgres (public schema)
-- Core tables: profiles, posts, comments, votes
-- =====================================================

begin;

-- =====================================================
-- 1. Profiles table (extends Supabase auth.users)
-- =====================================================

create table if not exists public.profiles (
    
    -- Same ID as auth.users.id
    id uuid primary key
        references auth.users(id)
        on delete cascade,

    username text not null unique,

    first_name text not null,
    last_name text not null,

    phone text,

    role text not null default 'user'
        check (role in ('user', 'admin')),

    is_blocked boolean not null default false,

    avatar_url text,

    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now(),

    -- Constraints
    constraint username_length
        check (char_length(username) between 3 and 32),

    constraint first_name_length
        check (char_length(first_name) between 4 and 32),

    constraint last_name_length
        check (char_length(last_name) between 4 and 32)
);

-- Trigger to auto-update updated_at
create or replace function public.set_updated_at()
returns trigger as $$
begin
    new.updated_at = now();
    return new;
end;
$$ language plpgsql;

drop trigger if exists trigger_set_updated_at on public.profiles;

create trigger trigger_set_updated_at
before update on public.profiles
for each row
execute function public.set_updated_at();

-- ======================================================
-- Auto-create profile on new auth user
-- ======================================================

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
as $$
begin
  insert into public.profiles (id, username, first_name, last_name)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'username', 'user_' || substring(new.id::text, 1, 8)),
    coalesce(new.raw_user_meta_data->>'first_name', 'First'),
    coalesce(new.raw_user_meta_data->>'last_name', 'Last')
  )
  on conflict (id) do nothing;

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;

create trigger on_auth_user_created
after insert on auth.users
for each row
execute function public.handle_new_user();

-- =====================================================
-- 2. Posts table
-- =====================================================

create table if not exists public.posts (

    id uuid primary key default gen_random_uuid(),

    author_id uuid not null
        references public.profiles(id)
        on delete cascade,

    title text not null,
    content text not null,
    tags text not null default '',

    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now(),

    -- Constraints
    constraint title_length
        check (char_length(title) between 16 and 64),

    constraint content_length
        check (char_length(content) between 32 and 8192),

    constraint tags_length
        check (char_length(tags) <= 64)
);

-- Indexes for performance
create index if not exists idx_posts_author
    on public.posts(author_id);

create index if not exists idx_posts_created_at
    on public.posts(created_at desc);

-- Trigger to auto-update updated_at
drop trigger if exists trigger_set_updated_at_posts on public.posts;

create trigger trigger_set_updated_at_posts
before update on public.posts
for each row
execute function public.set_updated_at();

-- ======================================================
-- 3. Comments table
-- ======================================================

create table if not exists public.comments (

    id uuid primary key default gen_random_uuid(),

    post_id uuid not null
        references public.posts(id)
        on delete cascade,

    author_id uuid not null
        references public.profiles(id)
        on delete cascade,

    parent_comment_id uuid
        references public.comments(id)
        on delete cascade,

    content text not null,

    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now(),

    constraint comment_length
        check (char_length(content) between 2 and 2048)
);

drop trigger if exists trigger_set_updated_at_comments
on public.comments;

create trigger trigger_set_updated_at_comments
before update on public.comments
for each row
execute function public.set_updated_at();

-- ======================================================
-- 4. Votes table (posts + comments)
-- ======================================================

create table if not exists public.votes (

    id uuid primary key default gen_random_uuid(),

    user_id uuid not null
        references public.profiles(id)
        on delete cascade,

    post_id uuid
        references public.posts(id)
        on delete cascade,

    comment_id uuid
        references public.comments(id)
        on delete cascade,

    vote_type smallint not null
        check (vote_type in (1, -1)),

    created_at timestamptz not null default now(),

    constraint one_vote_target
        check (
            (post_id is not null and comment_id is null)
            or
            (post_id is null and comment_id is not null)
        ),

    constraint unique_vote_per_user
        unique (user_id, post_id, comment_id)
);

commit;
