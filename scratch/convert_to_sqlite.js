const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const schemaPath = path.join(__dirname, '..', 'prisma', 'schema.prisma');
let schema = fs.readFileSync(schemaPath, 'utf8');

// 1. Switch Provider to sqlite
schema = schema.replace(/provider\s*=\s*"postgresql"/g, 'provider = "sqlite"');
schema = schema.replace(/url\s*=\s*env\("DATABASE_URL"\)/g, 'url = "file:./dev.db"');

// 2. Map Enum fields to String
schema = schema.replace(/role\s+Role\s+@default\(CUSTOMER\)/g, 'role String @default("CUSTOMER")');
schema = schema.replace(/type\s+ProfileType\s+@default\(PERSONAL\)/g, 'type String @default("PERSONAL")');
schema = schema.replace(/role\s+OrgRole\s+@default\(MEMBER\)/g, 'role String @default("MEMBER")');
schema = schema.replace(/status\s+CardStatus\s+@default\(UNASSIGNED\)/g, 'status String @default("UNASSIGNED")');
schema = schema.replace(/status\s+OrderStatus\s+@default\(PENDING\)/g, 'status String @default("PENDING")');

// 3. Remove enum blocks
schema = schema.replace(/enum Role \{[\s\S]*?\}/g, '');
schema = schema.replace(/enum CardStatus \{[\s\S]*?\}/g, '');
schema = schema.replace(/enum ProfileType \{[\s\S]*?\}/g, '');
schema = schema.replace(/enum OrgRole \{[\s\S]*?\}/g, '');
schema = schema.replace(/enum OrderStatus \{[\s\S]*?\}/g, '');

fs.writeFileSync(schemaPath, schema, 'utf8');
console.log('✅ prisma/schema.prisma converted to SQLite format.');

// 4. Update .env file
const envPath = path.join(__dirname, '..', '.env');
let envContent = '';
if (fs.existsSync(envPath)) {
  envContent = fs.readFileSync(envPath, 'utf8');
  envContent = envContent.replace(/DATABASE_URL=.*/, 'DATABASE_URL="file:./dev.db"');
} else {
  envContent = 'DATABASE_URL="file:./dev.db"';
}
fs.writeFileSync(envPath, envContent, 'utf8');
console.log('✅ .env updated with SQLite database path.');

// 5. Initialize database
try {
  console.log('Initializing SQLite database file...');
  execSync('npx prisma db push', { stdio: 'inherit', cwd: path.join(__dirname, '..') });
  console.log('Regenerating Prisma client...');
  execSync('npx prisma generate', { stdio: 'inherit', cwd: path.join(__dirname, '..') });
} catch (e) {
  console.error('Failed to run prisma tools:', e.message);
}
