-- Enable RLS on posts table
ALTER TABLE public.posts ENABLE ROW LEVEL SECURITY;

-- Allow anyone to SELECT (view) posts
CREATE POLICY "Anyone can view posts" 
ON public.posts 
FOR SELECT 
USING (true);

-- Allow authenticated users to INSERT their own posts
CREATE POLICY "Authenticated users can create posts" 
ON public.posts 
FOR INSERT 
WITH CHECK (auth.uid() = author_id);

-- Allow users to UPDATE their own posts
CREATE POLICY "Users can update own posts" 
ON public.posts 
FOR UPDATE 
USING (auth.uid() = author_id)
WITH CHECK (auth.uid() = author_id);

-- Allow users to DELETE their own posts
CREATE POLICY "Users can delete own posts" 
ON public.posts 
FOR DELETE 
USING (auth.uid() = author_id);

-- Allow admins to delete any posts
CREATE POLICY "Admins can delete any posts"
ON public.posts
FOR DELETE
USING (
  exists(
    select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin'
  )
);

-- Enable RLS on comments table
ALTER TABLE public.comments ENABLE ROW LEVEL SECURITY;

-- Allow anyone to SELECT comments
CREATE POLICY "Anyone can view comments" 
ON public.comments 
FOR SELECT 
USING (true);

-- Allow authenticated users to INSERT comments
CREATE POLICY "Authenticated users can create comments" 
ON public.comments 
FOR INSERT 
WITH CHECK (auth.uid() = author_id);

-- Allow users to UPDATE their own comments
CREATE POLICY "Users can update own comments" 
ON public.comments 
FOR UPDATE 
USING (auth.uid() = author_id)
WITH CHECK (auth.uid() = author_id);

-- Allow users to DELETE their own comments
CREATE POLICY "Users can delete own comments" 
ON public.comments 
FOR DELETE 
USING (auth.uid() = author_id);

-- Allow admins to delete any comments
CREATE POLICY "Admins can delete any comments"
ON public.comments
FOR DELETE
USING (
  exists(
    select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin'
  )
);

-- Enable RLS on votes table
ALTER TABLE public.votes ENABLE ROW LEVEL SECURITY;

-- Allow anyone to SELECT votes
CREATE POLICY "Anyone can view votes" 
ON public.votes 
FOR SELECT 
USING (true);

-- Allow authenticated users to INSERT votes
CREATE POLICY "Authenticated users can create votes" 
ON public.votes 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

-- Allow users to DELETE their own votes
CREATE POLICY "Users can delete own votes" 
ON public.votes 
FOR DELETE 
USING (auth.uid() = user_id);

-- Enable RLS on profiles table
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Allow anyone to SELECT profiles
CREATE POLICY "Anyone can view profiles" 
ON public.profiles 
FOR SELECT 
USING (true);

-- Allow users to UPDATE their own profile
CREATE POLICY "Users can update own profile" 
ON public.profiles 
FOR UPDATE 
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);
