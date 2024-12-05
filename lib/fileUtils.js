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

      console.log('Fetched recordings data:', data);



  return data?.map(item => item.filename) || [];
}

// PHOTOS =============================================

export async function savePhoto(formData) {
  try {
    const blob = formData.get('blob');
    const fileName = formData.get('fileName');

    if (!blob || !fileName) {
      throw new Error('Missing blob or filename');
    }

    const buffer = Buffer.from(await blob.arrayBuffer());

    // Upload to Supabase storage
    const { data, error: uploadError } = await supabase.storage
      .from('photos')
      .upload(fileName, buffer, {
        cacheControl: '3600',
        upsert: false,
        contentType: 'image/png'
      });

    if (uploadError) {
      console.error('Supabase storage upload error:', uploadError);
      throw uploadError;
    }

    // Save metadata in database
    const { data: insertData, error: metadataError } = await supabase
      .from('photos')
      .insert({ 
        filename: fileName, 
        path: data.path,
        created_at: new Date().toISOString() 
      })
      .select();

    if (metadataError) {
      console.error('Supabase metadata insert error:', metadataError);
      throw metadataError;
    }

    return { success: true };
  } catch (err) {
    console.error('Complete savePhoto error:', err);
    throw err; // Re-throw to be caught in the UI
  }
}

export async function listPhotos() {
  const { data, error } = await supabase
    .from('photos')
    .select('filename')
    .order('created_at', { ascending: false });

  if (error) throw error;

  console.log('Fetched photos data:', data);

  return data?.map(item => item.filename) || [];
}

// VIDEOS =============================================

export async function saveVideo(formData) {
  const blob = formData.get('blob');
  const fileName = formData.get('fileName');

  if (!blob || !fileName) {
    throw new Error('Missing blob or filename');
  }

  const buffer = Buffer.from(await blob.arrayBuffer());

  // Upload to Supabase storage
  const { data, error } = await supabase.storage
    .from('videos')
    .upload(fileName, buffer, {
      cacheControl: '3600',
      upsert: false,
      contentType: 'video/webm'
    });

  if (error) {
    console.error('Supabase storage upload error:', error);
    throw error;
  }

  // Save metadata in database
  const { data: insertData, error: metadataError } = await supabase
    .from('videos')
    .insert({ 
      filename: fileName, 
      path: data.path,
      created_at: new Date().toISOString() 
    })
    .select();

  if (metadataError) {
    console.error('Supabase metadata insert error:', metadataError);
    throw metadataError;
  }

  return { success: true, path: data.path };
}

export async function listVideos() {
  const { data, error } = await supabase
    .from('videos')
    .select('filename, path')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching videos:', error);
    throw error;
  }

  console.log('Fetched videos data:', data);

  return data || [];
}