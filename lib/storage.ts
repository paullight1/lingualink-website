import { supabase, getSupabaseToken } from "@/lib/supabase/client";
import { SUPABASE_URL, BUCKETS } from "@/lib/config";
import { extensionForMime } from "@/lib/media";

/**
 * Browser uploads to Supabase Storage. Ports the mobile app's
 * src/utils/storage.ts pattern (direct REST) using the Clerk bearer token,
 * with a supabase-js fallback. Files are stored under `{bucket}/{userId}/{name}`.
 */

export interface UploadResult {
  path: string;
  publicUrl: string;
}

async function uploadToBucket(
  bucket: string,
  userId: string,
  file: Blob,
  filename: string,
  contentType: string
): Promise<UploadResult> {
  const path = `${userId}/${filename}`;
  const token = getSupabaseToken();

  // Preferred: direct REST with the Clerk JWT (matches mobile).
  if (token) {
    const res = await fetch(
      `${SUPABASE_URL}/storage/v1/object/${bucket}/${encodeURIComponent(userId)}/${encodeURIComponent(filename)}`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": contentType,
          "x-upsert": "true",
        },
        body: file,
      }
    );
    if (!res.ok) {
      const text = await res.text().catch(() => "");
      throw new Error(`Upload failed (${res.status}): ${text}`);
    }
  } else {
    const { error } = await supabase.storage
      .from(bucket)
      .upload(path, file, { contentType, upsert: true });
    if (error) throw error;
  }

  const { data } = supabase.storage.from(bucket).getPublicUrl(path);
  return { path, publicUrl: data.publicUrl };
}

const stamp = (ext: string) =>
  `${Math.floor(performance.now())}-${Math.round(performance.timeOrigin)}.${ext}`;

/**
 * The extension must match the blob's real container — mobile players sniff the
 * URL extension, so naming an MP4 ".webm" (or vice versa) breaks playback there.
 */
export function uploadAudio(userId: string, blob: Blob, ext?: string) {
  const contentType = blob.type || "audio/mp4";
  return uploadToBucket(
    BUCKETS.voiceClips,
    userId,
    blob,
    stamp(ext ?? extensionForMime(contentType)),
    contentType
  );
}

export function uploadVideo(userId: string, blob: Blob, ext?: string) {
  const contentType = blob.type || "video/mp4";
  return uploadToBucket(
    BUCKETS.videos,
    userId,
    blob,
    stamp(ext ?? extensionForMime(contentType)),
    contentType
  );
}

export function uploadAvatar(userId: string, file: File) {
  const ext = file.name.split(".").pop() || "jpg";
  return uploadToBucket(
    BUCKETS.avatars,
    userId,
    file,
    stamp(ext),
    file.type || "image/jpeg"
  );
}

export function publicUrl(bucket: string, path: string): string {
  return supabase.storage.from(bucket).getPublicUrl(path).data.publicUrl;
}

/**
 * Recover the in-bucket object path from a stored public URL.
 * Clips persist the full public URL in `audio_url` / `video_url`, but
 * `storage.remove()` wants the path relative to the bucket, so deleting a row
 * without this leaves the media orphaned in storage.
 * Returns null when the URL doesn't belong to the given bucket.
 */
export function storagePathFromUrl(
  bucket: string,
  url: string | null | undefined
): string | null {
  if (!url) return null;
  // Already a bare path.
  if (!/^https?:\/\//i.test(url)) return url;

  const marker = `/storage/v1/object/public/${bucket}/`;
  const index = url.indexOf(marker);
  if (index === -1) return null;

  const path = url.slice(index + marker.length).split("?")[0];
  return path ? decodeURIComponent(path) : null;
}
