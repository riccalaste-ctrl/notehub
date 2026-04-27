import { NextRequest, NextResponse } from 'next/server';
export const dynamic = 'force-dynamic';
import { supabaseAdmin } from '@/lib/supabase';
import { z } from 'zod';

const uploadSchema = z.object({
  subjectId: z.string().uuid(),
  professorId: z.string().uuid().optional(),
  uploaderName: z.string().max(100).optional(),
  fileName: z.string().min(1).max(255),
  fileType: z.string(),
  fileData: z.string(),
});

const ALLOWED_TYPES = [
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'image/jpeg',
  'image/png',
];

const MAX_FILE_SIZE = 20 * 1024 * 1024; // 20MB

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

    const { subjectId, professorId, uploaderName, fileName, fileType, fileData } = validation.data;

    if (!ALLOWED_TYPES.includes(fileType)) {
      return NextResponse.json(
        { error: 'File type not allowed. Allowed: PDF, DOC, DOCX, JPG, PNG' },
        { status: 400 }
      );
    }

    const decodedData = Buffer.from(fileData, 'base64');
    if (decodedData.length > MAX_FILE_SIZE) {
      return NextResponse.json(
        { error: 'File too large. Maximum size is 20MB' },
        { status: 400 }
      );
    }

    const { data: subject, error: subjectError } = await supabaseAdmin
      .from('subjects')
      .select('*')
      .eq('id', subjectId)
      .eq('enabled', true)
      .single();

    if (subjectError || !subject) {
      return NextResponse.json(
        { error: 'Subject not found or disabled' },
        { status: 404 }
      );
    }

    if (!subject.gas_url || !subject.gas_secret) {
      return NextResponse.json(
        { error: 'Subject is not configured for uploads' },
        { status: 500 }
      );
    }

    const gasResponse = await fetch(subject.gas_url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        secret: subject.gas_secret,
        action: 'upload',
        filename: fileName,
        mimeType: fileType,
        dataBase64: fileData,
      }),
    });

    if (!gasResponse.ok) {
      const errorText = await gasResponse.text();
      return NextResponse.json(
        { error: 'Failed to upload to Drive', details: errorText },
        { status: 502 }
      );
    }

    const gasResult = await gasResponse.json();

    if (!gasResult.success) {
      return NextResponse.json(
        { error: gasResult.error || 'Upload failed' },
        { status: 502 }
      );
    }

    const { data: upload, error: insertError } = await supabaseAdmin
      .from('uploads')
      .insert({
        subject_id: subjectId,
        professor_id: professorId || null,
        original_filename: fileName,
        drive_file_id: gasResult.fileId,
        download_url: gasResult.downloadUrl,
        view_url: gasResult.viewUrl,
        mime_type: fileType,
        size_bytes: decodedData.length,
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