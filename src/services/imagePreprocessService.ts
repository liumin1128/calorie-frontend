const MAX_SOURCE_SIZE = 15 * 1024 * 1024;
const TARGET_MAX_SIZE_MB = 0.8;
const TARGET_MAX_WIDTH_OR_HEIGHT = 1600;
const TARGET_IMAGE_TYPE = "image/jpeg";
const TARGET_IMAGE_EXTENSION = "jpg";
const INITIAL_QUALITY = 0.82;

const ALLOWED_MIME_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
  "image/heic",
  "image/heif",
]);

const ALLOWED_EXTENSIONS = new Set([
  "jpg",
  "jpeg",
  "png",
  "webp",
  "gif",
  "heic",
  "heif",
]);

const HEIC_EXTENSIONS = new Set(["heic", "heif"]);

export const AI_IMAGE_ACCEPT = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
  "image/heic",
  "image/heif",
  ".heic",
  ".heif",
].join(",");

export interface PreparedImageAsset {
  file: File;
  previewUrl: string;
}

export const RECORD_IMAGE_ACCEPT = AI_IMAGE_ACCEPT;

export const RECORD_IMAGE_VALIDATION_MESSAGES = {
  unsupportedFormat: "仅支持 JPEG、PNG、WebP、GIF、HEIC、HEIF 格式",
  oversize: "图片大小不能超过 15MB",
  convertFailed: "HEIC/HEIF 图片转换失败，请改用 JPEG 后重试",
} as const;

function getFileExtension(fileName: string): string {
  const segments = fileName.split(".");
  return segments.length > 1 ? (segments.at(-1)?.toLowerCase() ?? "") : "";
}

function replaceFileExtension(fileName: string, extension: string): string {
  const baseName = fileName.replace(/\.[^.]+$/, "") || "image";
  return `${baseName}.${extension}`;
}

function isAllowedImageFile(file: File): boolean {
  return (
    ALLOWED_MIME_TYPES.has(file.type) ||
    ALLOWED_EXTENSIONS.has(getFileExtension(file.name))
  );
}

function isHeicOrHeifFile(file: File): boolean {
  return (
    file.type === "image/heic" ||
    file.type === "image/heif" ||
    HEIC_EXTENSIONS.has(getFileExtension(file.name))
  );
}

function shouldSkipCompression(file: File): boolean {
  return file.type === "image/gif" || getFileExtension(file.name) === "gif";
}

async function loadImageCompression() {
  const loadedModule = await import("browser-image-compression");
  return loadedModule.default;
}

async function loadHeicConverter() {
  const loadedModule = await import("heic2any");
  return loadedModule.default;
}

function createFileFromBlob(blob: Blob, fileName: string, type: string): File {
  return new File([blob], fileName, {
    type,
    lastModified: Date.now(),
  });
}

async function convertHeicToJpeg(file: File): Promise<File> {
  const heic2any = await loadHeicConverter();
  const result = await heic2any({
    blob: file,
    toType: TARGET_IMAGE_TYPE,
    quality: INITIAL_QUALITY,
  });

  const blob = Array.isArray(result) ? result[0] : result;
  if (!(blob instanceof Blob)) {
    throw new Error("HEIC 图片转换失败");
  }

  return createFileFromBlob(
    blob,
    replaceFileExtension(file.name, TARGET_IMAGE_EXTENSION),
    TARGET_IMAGE_TYPE,
  );
}

async function compressImage(file: File): Promise<File> {
  if (shouldSkipCompression(file)) {
    return file;
  }

  const imageCompression = await loadImageCompression();
  return imageCompression(file, {
    maxSizeMB: TARGET_MAX_SIZE_MB,
    maxWidthOrHeight: TARGET_MAX_WIDTH_OR_HEIGHT,
    useWebWorker: true,
    fileType: TARGET_IMAGE_TYPE,
    initialQuality: INITIAL_QUALITY,
    maxIteration: 10,
    preserveExif: false,
  });
}

export function validateImageFile(file: File): string | null {
  if (!isAllowedImageFile(file)) {
    return RECORD_IMAGE_VALIDATION_MESSAGES.unsupportedFormat;
  }

  if (file.size > MAX_SOURCE_SIZE) {
    return RECORD_IMAGE_VALIDATION_MESSAGES.oversize;
  }

  return null;
}

export async function prepareImageForAiUpload(
  file: File,
): Promise<PreparedImageAsset> {
  const validationError = validateImageFile(file);
  if (validationError) {
    throw new Error(validationError);
  }

  let normalizedFile = file;
  if (isHeicOrHeifFile(file)) {
    try {
      normalizedFile = await convertHeicToJpeg(file);
    } catch {
      throw new Error(RECORD_IMAGE_VALIDATION_MESSAGES.convertFailed);
    }
  }

  let processedFile = normalizedFile;
  try {
    processedFile = await compressImage(normalizedFile);
  } catch {
    processedFile = normalizedFile;
  }

  return {
    file: processedFile,
    previewUrl: URL.createObjectURL(processedFile),
  };
}
