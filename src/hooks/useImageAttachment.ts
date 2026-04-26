"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  prepareImageForAiUpload,
  type PreparedImageAsset,
} from "@/services/imagePreprocessService";
import { uploadCalorieImage } from "@/services/storageService";

export interface ImageAttachmentValue {
  file: File | null;
  previewUrl: string | null;
  remoteUrl: string | null;
  preparing: boolean;
  uploading: boolean;
  error: string | null;
  hasImage: boolean;
}

interface UseImageAttachmentOptions {
  initialRemoteUrl?: string | null;
}

export function useImageAttachment(options?: UseImageAttachmentOptions) {
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [remoteUrl, setRemoteUrl] = useState<string | null>(
    options?.initialRemoteUrl ?? null,
  );
  const [preparing, setPreparing] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setRemoteUrl(options?.initialRemoteUrl ?? null);
  }, [options?.initialRemoteUrl]);

  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    };
  }, [previewUrl]);

  const resetPreviewUrl = useCallback((nextUrl: string | null) => {
    setPreviewUrl((current) => {
      if (current && current !== nextUrl) {
        URL.revokeObjectURL(current);
      }
      return nextUrl;
    });
  }, []);

  const setPreparedAsset = useCallback(
    (asset: PreparedImageAsset) => {
      setFile(asset.file);
      resetPreviewUrl(asset.previewUrl);
      setError(null);
    },
    [resetPreviewUrl],
  );

  const selectFile = useCallback(
    async (selected: File) => {
      setPreparing(true);
      setError(null);
      try {
        const prepared = await prepareImageForAiUpload(selected);
        setPreparedAsset(prepared);
        return prepared;
      } catch (err) {
        setFile(null);
        resetPreviewUrl(null);
        setError(err instanceof Error ? err.message : "图片处理失败，请重试");
        throw err;
      } finally {
        setPreparing(false);
      }
    },
    [resetPreviewUrl, setPreparedAsset],
  );

  const clear = useCallback(() => {
    setFile(null);
    resetPreviewUrl(null);
    setRemoteUrl(null);
    setError(null);
  }, [resetPreviewUrl]);

  const setRemoteImage = useCallback((url: string | null) => {
    setRemoteUrl(url);
  }, []);

  const uploadIfNeeded = useCallback(
    async (token: string) => {
      if (file) {
        setUploading(true);
        setError(null);
        try {
          const url = await uploadCalorieImage(token, file);
          setRemoteUrl(url);
          return url;
        } catch (err) {
          const message = err instanceof Error ? err.message : "图片上传失败";
          setError(message);
          throw err;
        } finally {
          setUploading(false);
        }
      }

      return remoteUrl;
    },
    [file, remoteUrl],
  );

  const state: ImageAttachmentValue = useMemo(
    () => ({
      file,
      previewUrl,
      remoteUrl,
      preparing,
      uploading,
      error,
      hasImage: Boolean(file || previewUrl || remoteUrl),
    }),
    [error, file, preparing, previewUrl, remoteUrl, uploading],
  );

  return {
    ...state,
    selectFile,
    clear,
    uploadIfNeeded,
    setError,
    setRemoteImage,
    setPreparedAsset,
    displayUrl: previewUrl ?? remoteUrl,
  };
}
