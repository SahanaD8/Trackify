# PowerShell script to set up Render PostgreSQL database
# This will execute the schema file on your Render database

Write-Host "Setting up Render PostgreSQL database..." -ForegroundColor Green

# Your Render database connection string (External Database URL)
# Replace this with your actual connection string from Render dashboard
$DATABASE_URL = "postgresql://trackify_user:YOUR_PASSWORD@dpg-d4g4qd8gjchc73dpv16g-a.oregon-postgres.render.com/trackify_db_0mte"

# Path to schema file
$SCHEMA_FILE = Join-Path $PSScriptRoot "postgresql-schema.sql"

Write-Host "Connecting to database..." -ForegroundColor Yellow

# Execute the schema using psql (requires PostgreSQL client installed)
# If you don't have psql, install it from: https://www.postgresql.org/download/windows/

psql $DATABASE_URL -f $SCHEMA_FILE

if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ Database setup completed successfully!" -ForegroundColor Green
} else {
    Write-Host "❌ Database setup failed. Make sure PostgreSQL client (psql) is installed." -ForegroundColor Red
    Write-Host "Download from: https://www.postgresql.org/download/windows/" -ForegroundColor Yellow
}
