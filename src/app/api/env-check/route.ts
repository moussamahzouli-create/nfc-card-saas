import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET() {
  const keys = Object.keys(process.env);
  const dbKeys = keys.filter(k => 
    k.includes('POSTGRES') || 
    k.includes('DATABASE') || 
    k.includes('NEON') || 
    k.includes('SUPABASE')
  );

  return NextResponse.json({
    hasPostgresPrismaUrl: !!process.env.POSTGRES_PRISMA_URL,
    hasPostgresUrl: !!process.env.POSTGRES_URL,
    hasDatabaseUrl: !!process.env.DATABASE_URL,
    databaseUrlPrefix: process.env.DATABASE_URL ? process.env.DATABASE_URL.split(':')[0] : null,
    dbKeys,
  });
}
