-- Fix the tasks assignment_type check constraint to include "everyone"
ALTER TABLE public.tasks DROP CONSTRAINT IF EXISTS tasks_assignment_type_check;

ALTER TABLE public.tasks ADD CONSTRAINT tasks_assignment_type_check 
CHECK (assignment_type IN ('individual', 'group', 'rank', 'everyone'));