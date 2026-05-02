import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/auth';
import { revokeProfessorDriveConnection } from '@/lib/google-drive';

export const dynamic = 'force-dynamic';

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const authError = await requireAdmin();
  if (authError) return authError;

  const { id } = await params;

  if (!id) {
    return NextResponse.json({ error: 'Missing professor ID' }, { status: 400 });
  }

  try {
    await revokeProfessorDriveConnection(id);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Google Drive disconnect error:', error);
    return NextResponse.json(
      { error: 'Unable to disconnect Google Drive' },
      { status: 500 }
    );
  }
}
