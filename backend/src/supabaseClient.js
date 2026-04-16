const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  'https://devdzbdqebcvdtnqigkm.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRldmR6YmRxZWJjdmR0bnFpZ2ttIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzYyOTc4MzcsImV4cCI6MjA5MTg3MzgzN30.yyHAA0yXLYJTO8rHmRkibnQ_XZQ7QFupnQJaqBV4v44'
);

module.exports = supabase;

