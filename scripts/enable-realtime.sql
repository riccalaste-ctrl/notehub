-- Enable Realtime on tables used by the app
-- Run in Supabase SQL Editor

-- Enable publication for subject_professors
ALTER PUBLICATION supabase_realtime ADD TABLE subject_professors;

-- Enable publication for uploads
ALTER PUBLICATION supabase_realtime ADD TABLE uploads;

-- Enable publication for consigli
ALTER PUBLICATION supabase_realtime ADD TABLE consigli;

-- Enable publication for subjects
ALTER PUBLICATION supabase_realtime ADD TABLE subjects;
