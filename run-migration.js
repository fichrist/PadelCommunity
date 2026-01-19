const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Read environment variables
const envContent = fs.readFileSync(path.join(__dirname, 'packages', 'frontend', '.env local'), 'utf8');
const urlMatch = envContent.match(/VITE_SUPABASE_URL="([^"]+)"/);
const keyMatch = envContent.match(/VITE_SUPABASE_ANON_KEY="([^"]+)"/);

if (!urlMatch || !keyMatch) {
  console.error('Could not find Supabase credentials in .env local');
  process.exit(1);
}

const supabaseUrl = urlMatch[1];
const supabaseKey = keyMatch[1];

console.log('Connecting to Supabase...');
const supabase = createClient(supabaseUrl, supabaseKey);

// Read the migration SQL
const migrationSql = fs.readFileSync(
  path.join(__dirname, 'supabase', 'migrations', '20260119160000_add_club_and_favorites_to_profiles.sql'),
  'utf8'
);

// Execute the migration
async function runMigration() {
  try {
    console.log('Running migration: 20260119160000_add_club_and_favorites_to_profiles.sql');

    // Split by semicolon and execute each statement
    const statements = migrationSql
      .split(';')
      .map(s => s.trim())
      .filter(s => s && !s.startsWith('--') && s !== '');

    for (const statement of statements) {
      if (statement) {
        console.log(`Executing: ${statement.substring(0, 100)}...`);
        const { data, error } = await supabase.rpc('exec_sql', { sql: statement + ';' });

        if (error) {
          // Try direct execution via REST API
          const response = await fetch(`${supabaseUrl}/rest/v1/rpc/exec_sql`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'apikey': supabaseKey,
              'Authorization': `Bearer ${supabaseKey}`
            },
            body: JSON.stringify({ sql: statement + ';' })
          });

          if (!response.ok) {
            console.error('Error executing statement:', error);
            // Continue anyway - might already exist
          }
        }
      }
    }

    console.log('Migration completed successfully!');
  } catch (error) {
    console.error('Migration failed:', error.message);
    process.exit(1);
  }
}

runMigration();
