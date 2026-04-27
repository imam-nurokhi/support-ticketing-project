import { getCurrentUser } from '@/lib/auth';
import { storeUploadedFile } from '@/lib/upload';

export async function POST(request: Request) {
  const user = await getCurrentUser();

  if (!user) {
    return Response.json({ error: 'Unauthorized.' }, { status: 401 });
  }

  let formData: FormData;
  try {
    formData = await request.formData();
  } catch {
    return Response.json({ error: 'Invalid form data.' }, { status: 400 });
  }

  const files = formData.getAll('files') as File[];

  if (files.length === 0) {
    return Response.json({ error: 'No files provided.' }, { status: 400 });
  }

  if (files.length > 5) {
    return Response.json({ error: 'Maximum 5 files per upload.' }, { status: 400 });
  }

  const results: Array<{ storedName: string; filename: string; mimeType: string; size: number }> = [];

  for (const file of files) {
    const result = await storeUploadedFile(file);
    if ('error' in result) {
      return Response.json({ error: result.error }, { status: 400 });
    }
    results.push(result);
  }

  return Response.json({ files: results }, { status: 201 });
}
