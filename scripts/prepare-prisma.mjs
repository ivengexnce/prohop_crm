import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';

const schemaPath = path.join(process.cwd(), 'prisma', 'schema.prisma');

if (fs.existsSync(schemaPath)) {
  let schema = fs.readFileSync(schemaPath, 'utf8');
  const dbUrl = process.env.DATABASE_URL || '';
  const isPostgres = dbUrl.startsWith('postgres://') || dbUrl.startsWith('postgresql://');
  let changed = false;

  if (isPostgres && schema.includes('provider = "sqlite"')) {
    schema = schema.replace('provider = "sqlite"', 'provider = "postgresql"');
    fs.writeFileSync(schemaPath, schema, 'utf8');
    changed = true;
    console.log('🔄 Switched Prisma datasource provider to "postgresql" for production environment.');
  } else if (!isPostgres && schema.includes('provider = "postgresql"')) {
    schema = schema.replace('provider = "postgresql"', 'provider = "sqlite"');
    fs.writeFileSync(schemaPath, schema, 'utf8');
    changed = true;
    console.log('🔄 Switched Prisma datasource provider to "sqlite" for development environment.');
  }

  if (changed) {
    try {
      execSync('npx prisma generate', { stdio: 'inherit' });
    } catch (err) {
      console.warn('Prisma generate notification:', err.message);
    }
  }
}
