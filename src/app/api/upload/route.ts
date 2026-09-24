import { NextRequest, NextResponse } from 'next/server';
import { getStorageProvider } from '@/lib/storage';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File | null;

    if (!file) {
      return NextResponse.json(
        { error: 'No file provided in form data' },
        { status: 400 }
      );
    }

    // Max 5MB size limit
    const MAX_SIZE = 5 * 1024 * 1024;
    if (file.size > MAX_SIZE) {
      return NextResponse.json(
        { error: 'File size exceeds maximum 5MB limit' },
        { status: 400 }
      );
    }

    // Allowed mime types: images, pdf, plain text, zip, json
    const allowedTypes = [
      'image/png',
      'image/jpeg',
      'image/webp',
      'image/gif',
      'application/pdf',
      'text/plain',
      'application/json',
    ];

    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        {
          error:
            'Unsupported file format. Please upload PNG, JPG, WEBP, PDF, TXT, or JSON files.',
        },
        { status: 400 }
      );
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Delegate to pluggable storage provider (Local Disk or Cloud S3/R2)
    const storage = getStorageProvider();
    const result = await storage.uploadFile({
      name: file.name,
      buffer,
      mimeType: file.type,
      size: file.size,
    });

    return NextResponse.json(
      {
        success: true,
        url: result.url,
        name: result.name,
        size: result.size,
        provider: result.provider,
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error('File upload error:', error);
    return NextResponse.json(
      { error: 'Failed to process file upload', details: error.message },
      { status: 500 }
    );
  }
}
