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
```

## Admin Setup

To create an admin user:
1. Go to Authentication in your Supabase dashboard
2. Add a new user with email and password
3. This user can login to the admin panel
