import { NextRequest, NextResponse } from 'next/server';
export const dynamic = 'force-dynamic';
import { supabaseAdmin } from '@/lib/supabase';
import { z } from 'zod';

const uploadSchema = z.object({
  subjectId: z.string().uuid(),
  professorId: z.string().uuid().optional(),
  uploaderName: z.string().max(100).optional(),
  originalFilename: z.string().min(1).max(255),
  driveFileId: z.string().min(1),
  mimeType: z.string(),
  sizeBytes: z.number().positive(),
  downloadUrl: z.string().url().optional(),
  viewUrl: z.string().url().optional(),
});

const ALLOWED_TYPES = [
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'image/jpeg',
  'image/png',
];

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validation = uploadSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { error: 'Invalid input', details: validation.error.errors },
        { status: 400 }
      );
    }

    const {
      subjectId,
      professorId,
      uploaderName,
      originalFilename,
      driveFileId,
      mimeType,
      sizeBytes,
      downloadUrl,
      viewUrl,
    } = validation.data;

    if (!ALLOWED_TYPES.includes(mimeType)) {
      return NextResponse.json(
        { error: 'File type not allowed. Allowed: PDF, DOC, DOCX, JPG, PNG' },
        { status: 400 }
      );
    }

    const { data: subject, error: subjectError } = await supabaseAdmin
      .from('subjects')
      .select('id, name, enabled')
      .eq('id', subjectId)
      .eq('enabled', true)
      .single();

    if (subjectError || !subject) {
      return NextResponse.json(
        { error: 'Subject not found or disabled' },
        { status: 404 }
      );
    }

    const { data: upload, error: insertError } = await supabaseAdmin
      .from('uploads')
      .insert({
        subject_id: subjectId,
        professor_id: professorId || null,
        original_filename: originalFilename,
        drive_file_id: driveFileId,
        download_url: downloadUrl || `https://drive.google.com/uc?id=${driveFileId}&export=download`,
        view_url: viewUrl || `https://drive.google.com/file/d/${driveFileId}/view`,
        mime_type: mimeType,
        size_bytes: sizeBytes,
        uploader_name: uploaderName || null,
      })
      .select()
      .single();

    if (insertError) {
      console.error('Database insert error:', insertError);
      return NextResponse.json(
        { error: 'Failed to save upload metadata' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      upload,
    });
  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}