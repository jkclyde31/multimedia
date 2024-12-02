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

      // Log the retrieved data
      console.log('Fetched recordings data:', data);



  return data?.map(item => item.filename) || [];
}
