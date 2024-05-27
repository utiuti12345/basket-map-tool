import supabase from '../supabase/supabase';

const BUCKET = process.env.SUPABASE_STORAGE_BUCKET!;

export async function upload(file: any, fileName: string) {
  const { data, error } = await supabase.storage.from(BUCKET).upload(fileName, file);

  if (error) {
    console.log(error);
    throw error;
  }
}

export async function uploadByte(
    file: Uint8Array,
    fileName: string
) {
  const { data, error } = await supabase.storage.from(BUCKET).upload(fileName, file,{
    contentType: 'image/png'
  });

  if (error) {
    console.log(error);
    throw error;
  }
}

export async function getUrl(imageUrl: string) {
  const { data } = supabase.storage.from(BUCKET).getPublicUrl(imageUrl!);

  if (!data) {
    return '';
  }

  return data.publicUrl;
}
