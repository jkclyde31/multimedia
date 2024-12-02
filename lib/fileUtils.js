'use server';

import { supabase } from '../lib/supabase';

export async function saveRecording(formData) {
  const blob = formData.get('blob');
  const fileName = formData.get('fileName');

  if (!blob || !fileName) {
    throw new Error('Missing blob or filename');
  }

  const buffer = Buffer.from(await blob.arrayBuffer());

  // Upload to Supabase storage
  const { data, error } = await supabase.storage
    .from('recordings')
    .upload(fileName, buffer, {
      cacheControl: '3600',
      upsert: false
    });

  if (error) throw error;

  // Save metadata in database
  const { data: insertData, error: metadataError } = await supabase
    .from('recordings')
    .insert({ 
      filename: fileName, 
      path: data.path,
      created_at: new Date().toISOString() 
    })
    .select();

  if (metadataError) throw metadataError;

  return { success: true };
}

export async function listRecordings() {
  const { data, error } = await supabase
    .from('recordings')
    .select('filename')
    .order('created_at', { ascending: false });

  if (error) throw error;

  return data?.map(item => item.filename) || [];
}
// 'use server';

// import fs from 'fs/promises';
// import path from 'path';

// const RECORDINGS_DIR = path.join(process.cwd(), 'public', 'recordings');
// const RECORDINGS_LIST = path.join(process.cwd(), 'public', 'recordings.txt');

// export async function saveRecording(formData) {
//   'use server';
  
//   const blob = formData.get('blob');
//   const fileName = formData.get('fileName');

//   if (!blob || !fileName) {
//     throw new Error('Missing blob or filename');
//   }

//   // Ensure recordings directory exists
//   await fs.mkdir(RECORDINGS_DIR, { recursive: true });

//   // Save blob to file
//   const filePath = path.join(RECORDINGS_DIR, fileName);
//   const buffer = Buffer.from(await blob.arrayBuffer());
//   await fs.writeFile(filePath, buffer);

//   // Append to recordings list
//   await fs.appendFile(RECORDINGS_LIST, `${fileName}\n`);

//   return { success: true };
// }



// export async function listRecordings() {
//   'use server';
  
//   try {
//     const recordingsContent = await fs.readFile(RECORDINGS_LIST, 'utf-8');
//     const recordings = recordingsContent.trim().split('\n');
//     return recordings.filter(recording => recording.trim() !== '');
//   } catch (error) {
//     // If file doesn't exist, return empty array
//     return [];
//   }
// }