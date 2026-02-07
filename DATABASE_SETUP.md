# Lapor JAMKOS - Environment Variables

## Create a `.env` file in the root directory with:

```
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

## Database Schema

Run the following SQL in your Supabase SQL Editor:

```sql
-- Create classes table
CREATE TABLE classes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  token UUID UNIQUE NOT NULL DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create reports table
CREATE TABLE reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  class_id UUID NOT NULL REFERENCES classes(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE classes ENABLE ROW LEVEL SECURITY;
ALTER TABLE reports ENABLE ROW LEVEL SECURITY;

-- Policies for classes (admin can do everything, public can read)
CREATE POLICY "Admin can do everything on classes" ON classes
  FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Public can read classes" ON classes
  FOR SELECT USING (true);

-- Policies for reports (admin can read, public can insert)
CREATE POLICY "Admin can read all reports" ON reports
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Public can insert reports" ON reports
  FOR INSERT WITH CHECK (true);

-- Allow authenticated users (Admins/Picket) to update reports
CREATE POLICY "Authenticated users can update reports" ON reports
  FOR UPDATE USING (auth.role() = 'authenticated');
```

## Admin Setup

To create an admin user:
1. Go to Authentication in your Supabase dashboard
2. Add a new user with email and password
3. This user can login to the admin panel

## Update 1: Picket Role & Enhanced Status (Run this!)

Run this in your SQL Editor to support the new features:

```sql
-- 1. Add new columns for Picket Officer details
ALTER TABLE reports 
ADD COLUMN IF NOT EXISTS picket_name TEXT,
ADD COLUMN IF NOT EXISTS missing_teacher_name TEXT;

-- 2. Update status constraint to allow new statuses
-- We drop the old check constraint (if it exists) and add a new comprehensive one
ALTER TABLE reports DROP CONSTRAINT IF EXISTS reports_status_check;

-- Ensure status column exists (if not present)
ALTER TABLE reports ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'pending';

-- Add the new constraint with all allowed values
ALTER TABLE reports ADD CONSTRAINT reports_status_check 
CHECK (status IN ('pending', 'resolved', 'giving_task', 'contacting_teacher'));
```

