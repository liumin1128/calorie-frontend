export interface ScanResult {
  text: string;
  format: string;
}

export interface DebugEntry {
  step: string;
  status: "info" | "success" | "warning" | "error";
  detail: string;
}

export type TraceFn = (entry: DebugEntry) => void;

interface BarcodeDetectorInstance {
  detect: (
    source: ImageBitmap,
  ) => Promise<{ rawValue: string; format: string }[]>;
}

interface BarcodeDetectorConstructor {
  new (options?: { formats?: string[] }): BarcodeDetectorInstance;
}

interface BarcodeFileVariant {
  label: string;
  file: File;
}

interface QuaggaDecodeResult {
  codeResult?: {
    code?: string | null;
    format?: string | null;
  };
}

const MAX_DIM = 1920;
const noopTrace: TraceFn = () => undefined;

function checkNativeDetector(): boolean {
  return typeof globalThis !== "undefined" && "BarcodeDetector" in globalThis;
}

export async function detectBarcodeFromFile(
  file: File,
  trace: TraceFn = noopTrace,
): Promise<ScanResult | null> {
  trace({
    step: "文件检查",
    status: "info",
    detail: `${file.name} | ${file.type || "unknown"} | ${Math.round(file.size / 1024)}KB`,
  });

  if (checkNativeDetector()) {
    trace({
      step: "引擎选择",
      status: "info",
      detail: "检测到 BarcodeDetector，先尝试原生引擎",
    });
    const result = await detectWithNative(file, trace);
    if (result) return result;
    trace({
      step: "引擎切换",
      status: "warning",
      detail: "原生引擎未识别到结果，继续尝试 Quagga2",
    });
  } else {
    trace({
      step: "引擎选择",
      status: "warning",
      detail: "当前浏览器不支持 BarcodeDetector，直接使用 Quagga2",
    });
  }

  return detectWithQuagga(file, trace);
}

async function detectWithNative(
  file: File,
  trace: TraceFn,
): Promise<ScanResult | null> {
  try {
    const detector = new (
      globalThis as unknown as { BarcodeDetector: BarcodeDetectorConstructor }
    ).BarcodeDetector();

    trace({
      step: "原生引擎",
      status: "info",
      detail: "BarcodeDetector 实例创建成功",
    });

    const bitmap = await createImageBitmap(file);
    trace({
      step: "原生引擎",
      status: "info",
      detail: `createImageBitmap 成功: ${bitmap.width}x${bitmap.height}`,
    });

    const barcodes = await detector.detect(bitmap);
    bitmap.close();

    trace({
      step: "原生引擎",
      status: barcodes.length > 0 ? "success" : "warning",
      detail: `检测完成，结果数量: ${barcodes.length}`,
    });

    if (barcodes.length > 0) {
      return { text: barcodes[0].rawValue, format: barcodes[0].format };
    }

    return null;
  } catch (error) {
    trace({
      step: "原生引擎",
      status: "error",
      detail: error instanceof Error ? error.message : "未知原生识别错误",
    });
    return null;
  }
}

async function loadImage(file: File): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const image = new Image();

    image.onload = () => {
      URL.revokeObjectURL(url);
      resolve(image);
    };

    image.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("图片加载失败"));
    };

    image.src = url;
  });
}

function canvasToFile(
  canvas: HTMLCanvasElement,
  fileName: string,
): Promise<File> {
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (!blob) {
          reject(new Error("Canvas 导出失败"));
          return;
        }

        resolve(new File([blob], fileName, { type: "image/jpeg" }));
      },
      "image/jpeg",
      0.92,
    );
  });
}

async function normalizeOrientation(file: File, trace: TraceFn): Promise<File> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const image = new Image();

    image.onload = () => {
      URL.revokeObjectURL(url);

      trace({
        step: "图片加载",
        status: "info",
        detail: `原图尺寸: ${image.naturalWidth}x${image.naturalHeight}`,
      });

      let { naturalWidth: width, naturalHeight: height } = image;
      if (width > MAX_DIM || height > MAX_DIM) {
        const scale = MAX_DIM / Math.max(width, height);
        width = Math.round(width * scale);
        height = Math.round(height * scale);
        trace({
          step: "图片缩放",
          status: "info",
          detail: `缩放后尺寸: ${width}x${height}`,
        });
      } else {
        trace({
          step: "图片缩放",
          status: "info",
          detail: "尺寸无需缩放",
        });
      }

      const canvas = document.createElement("canvas");
      canvas.width = width;
      canvas.height = height;
      const context = canvas.getContext("2d");

      if (!context) {
        trace({
          step: "Canvas",
          status: "error",
          detail: "无法获取 2D context，回退使用原始文件",
        });
        resolve(file);
        return;
      }

      context.drawImage(image, 0, 0, width, height);
      canvas.toBlob(
        (blob) => {
          if (!blob) {
            trace({
              step: "Canvas",
              status: "error",
              detail: "toBlob 返回空值，回退使用原始文件",
            });
            resolve(file);
            return;
          }

          trace({
            step: "Canvas",
            status: "success",
            detail: `重绘成功，输出 ${(blob.size / 1024).toFixed(0)}KB JPEG`,
          });
          resolve(new File([blob], file.name, { type: "image/jpeg" }));
        },
        "image/jpeg",
        0.92,
      );
    };

    image.onerror = () => {
      URL.revokeObjectURL(url);
      trace({
        step: "图片加载",
        status: "error",
        detail: "浏览器无法加载该图片文件，可能是 HEIC/HEIF 或文件损坏",
      });
      reject(new Error("图片加载失败"));
    };

    image.src = url;
  });
}

async function createBarcodeCropVariant(
  file: File,
  label: string,
  widthRatio: number,
  heightRatio: number,
  enhance = false,
): Promise<File> {
  const image = await loadImage(file);
  const cropWidth = Math.round(image.naturalWidth * widthRatio);
  const cropHeight = Math.round(image.naturalHeight * heightRatio);
  const sourceX = Math.max(0, Math.round((image.naturalWidth - cropWidth) / 2));
  const sourceY = Math.max(
    0,
    Math.round((image.naturalHeight - cropHeight) / 2),
  );

  const canvas = document.createElement("canvas");
  canvas.width = cropWidth;
  canvas.height = cropHeight;
  const context = canvas.getContext("2d");

  if (!context) {
    throw new Error(`无法创建 ${label}`);
  }

  context.fillStyle = "#ffffff";
  context.fillRect(0, 0, canvas.width, canvas.height);
  if (enhance) {
    context.filter = "grayscale(1) contrast(1.9) brightness(1.08)";
  }
  context.drawImage(
    image,
    sourceX,
    sourceY,
    cropWidth,
    cropHeight,
    0,
    0,
    cropWidth,
    cropHeight,
  );
  context.filter = "none";

  return canvasToFile(canvas, file.name);
}

async function createQuaggaVariants(file: File): Promise<BarcodeFileVariant[]> {
  const variants: BarcodeFileVariant[] = [{ label: "全图", file }];

  variants.push({
    label: "中带裁剪50%高",
    file: await createBarcodeCropVariant(file, "中带裁剪50%高", 1, 0.5),
  });
  variants.push({
    label: "中带裁剪35%高",
    file: await createBarcodeCropVariant(file, "中带裁剪35%高", 1, 0.35),
  });
  variants.push({
    label: "中带高对比50%高",
    file: await createBarcodeCropVariant(file, "中带高对比50%高", 1, 0.5, true),
  });
  variants.push({
    label: "中心裁剪80%x50%",
    file: await createBarcodeCropVariant(file, "中心裁剪80%x50%", 0.8, 0.5),
  });

  return variants;
}

async function detectWithQuagga(
  file: File,
  trace: TraceFn,
): Promise<ScanResult | null> {
  const correctedFile = await normalizeOrientation(file, trace);

  trace({
    step: "Quagga 引擎",
    status: "info",
    detail: "开始动态加载 Quagga2 并尝试条形码专用扫描",
  });

  const quaggaModule = await import("@ericblade/quagga2");
  const Quagga = quaggaModule.default;

  trace({
    step: "Quagga 引擎",
    status: "success",
    detail: "Quagga2 动态加载成功",
  });

  try {
    const quaggaVariants = await createQuaggaVariants(correctedFile);
    for (const variant of quaggaVariants) {
      trace({
        step: "Quagga 尝试",
        status: "info",
        detail: `${variant.label} | ${variant.file.type || "unknown"} | ${Math.round(variant.file.size / 1024)}KB`,
      });

      const src = URL.createObjectURL(variant.file);
      try {
        const result = await new Promise<QuaggaDecodeResult | null>(
          (resolve) => {
            Quagga.decodeSingle(
              {
                src,
                numOfWorkers: 0,
                locate: true,
                inputStream: {
                  size: 0,
                  singleChannel: false,
                },
                locator: {
                  halfSample: false,
                  patchSize: "small",
                },
                decoder: {
                  readers: [
                    "ean_reader",
                    "ean_8_reader",
                    "upc_reader",
                    "upc_e_reader",
                    "code_128_reader",
                    "code_39_reader",
                    "codabar_reader",
                  ],
                },
              },
              (data: QuaggaDecodeResult | null) => resolve(data),
            );
          },
        );

        const codeResult = result?.codeResult;
        if (codeResult?.code) {
          trace({
            step: "Quagga 尝试",
            status: "success",
            detail: `${variant.label} 识别成功: ${codeResult.format || "unknown"}`,
          });

          return {
            text: codeResult.code,
            format: codeResult.format || "barcode",
          };
        }

        trace({
          step: "Quagga 尝试",
          status: "warning",
          detail: `${variant.label} 未识别到条形码`,
        });
      } catch (error) {
        trace({
          step: "Quagga 尝试",
          status: "warning",
          detail: `${variant.label} 失败: ${error instanceof Error ? error.message : String(error)}`,
        });
      } finally {
        URL.revokeObjectURL(src);
      }
    }

    trace({
      step: "Quagga 引擎",
      status: "error",
      detail: "Quagga2 的条形码专用扫描也全部失败",
    });
    return null;
  } catch (error) {
    trace({
      step: "Quagga 引擎",
      status: "error",
      detail: error instanceof Error ? error.message : String(error),
    });
    return null;
  }
}
