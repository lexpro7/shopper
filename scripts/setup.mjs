import { existsSync, copyFileSync, writeFileSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
if (!existsSync('.env')) copyFileSync('.env.example', '.env');
if (!existsSync('prisma/dev.db')) writeFileSync('prisma/dev.db', '');
const run = (args) => execFileSync(process.execPath, args, { stdio: 'inherit' });
run(['node_modules/prisma/build/index.js', 'generate']);
run(['node_modules/prisma/build/index.js', 'db', 'push']);
run(['node_modules/tsx/dist/cli.mjs', 'prisma/seed.ts']);
