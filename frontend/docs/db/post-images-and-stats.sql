begin;

alter table public.posts
  add column if not exists image_url text,
  add column if not exists likes_count integer not null default 0,
  add column if not exists comments_count integer not null default 0;

insert into storage.buckets (id, name, public)
values ('post-images', 'post-images', true)
on conflict (id) do nothing;

create index if not exists idx_comments_post_id
  on public.comments(post_id);

create index if not exists idx_votes_post_id
  on public.votes(post_id)
  where comment_id is null;

create index if not exists idx_votes_user_post_id
  on public.votes(user_id, post_id)
  where comment_id is null;

drop policy if exists "Public can view post images" on storage.objects;
create policy "Public can view post images"
on storage.objects
for select
to public
using (bucket_id = 'post-images');

drop policy if exists "Authenticated users can upload post images" on storage.objects;
create policy "Authenticated users can upload post images"
on storage.objects
for insert
to authenticated
with check (
  bucket_id = 'post-images'
  and (storage.foldername(name))[1] = auth.uid()::text
);

drop policy if exists "Authenticated users can update own post images" on storage.objects;
create policy "Authenticated users can update own post images"
on storage.objects
for update
to authenticated
using (
  bucket_id = 'post-images'
  and (storage.foldername(name))[1] = auth.uid()::text
)
with check (
  bucket_id = 'post-images'
  and (storage.foldername(name))[1] = auth.uid()::text
);

drop policy if exists "Authenticated users can delete own post images" on storage.objects;
create policy "Authenticated users can delete own post images"
on storage.objects
for delete
to authenticated
using (
  bucket_id = 'post-images'
  and (storage.foldername(name))[1] = auth.uid()::text
);

update public.posts as p
set
  likes_count = (
    select count(*)::integer
    from public.votes as v
    where v.post_id = p.id
      and v.comment_id is null
      and v.vote_type = 1
  ),
  comments_count = (
    select count(*)::integer
    from public.comments as c
    where c.post_id = p.id
  );

create or replace function public.sync_post_comments_count()
returns trigger
language plpgsql
as $$
begin
  if tg_op = 'INSERT' then
    if new.post_id is not null then
      update public.posts
      set comments_count = comments_count + 1
      where id = new.post_id;
    end if;
    return new;
  end if;

  if tg_op = 'DELETE' then
    if old.post_id is not null then
      update public.posts
      set comments_count = greatest(comments_count - 1, 0)
      where id = old.post_id;
    end if;
    return old;
  end if;

  if new.post_id is distinct from old.post_id then
    if old.post_id is not null then
      update public.posts
      set comments_count = greatest(comments_count - 1, 0)
      where id = old.post_id;
    end if;

    if new.post_id is not null then
      update public.posts
      set comments_count = comments_count + 1
      where id = new.post_id;
    end if;
  end if;

  return new;
end;
$$;

drop trigger if exists trigger_sync_post_comments_count on public.comments;

create trigger trigger_sync_post_comments_count
after insert or delete or update of post_id
on public.comments
for each row
execute function public.sync_post_comments_count();

create or replace function public.sync_post_likes_count()
returns trigger
language plpgsql
as $$
begin
  if tg_op = 'INSERT' then
    if new.post_id is not null and new.comment_id is null and new.vote_type = 1 then
      update public.posts
      set likes_count = likes_count + 1
      where id = new.post_id;
    end if;
    return new;
  end if;

  if tg_op = 'DELETE' then
    if old.post_id is not null and old.comment_id is null and old.vote_type = 1 then
      update public.posts
      set likes_count = greatest(likes_count - 1, 0)
      where id = old.post_id;
    end if;
    return old;
  end if;

  if old.post_id is not null and old.comment_id is null and old.vote_type = 1 then
    update public.posts
    set likes_count = greatest(likes_count - 1, 0)
    where id = old.post_id;
  end if;

  if new.post_id is not null and new.comment_id is null and new.vote_type = 1 then
    update public.posts
    set likes_count = likes_count + 1
    where id = new.post_id;
  end if;

  return new;
end;
$$;

drop trigger if exists trigger_sync_post_likes_count on public.votes;

create trigger trigger_sync_post_likes_count
after insert or delete or update of post_id, comment_id, vote_type
on public.votes
for each row
execute function public.sync_post_likes_count();

commit;
