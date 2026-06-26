import html2canvas from 'html2canvas';
import gifshot from 'gifshot';

export const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export interface ExportProgress {
  percent: number;
  message: string;
}

export async function captureElementFrame(element: HTMLElement): Promise<string> {
  // Capture the visualizer element using html2canvas
  const canvas = await html2canvas(element, {
    backgroundColor: null, // Keep the background CSS colors
    scale: 1.2, // Balance quality and file size
    logging: false,
    useCORS: true,
    allowTaint: true,
  });
  return canvas.toDataURL('image/png');
}

export function generateGifFromFrames(
  frames: string[],
  width: number,
  height: number,
  intervalSec: number = 0.5
): Promise<Blob> {
  return new Promise((resolve, reject) => {
    try {
      gifshot.createGIF(
        {
          images: frames,
          gifWidth: width,
          gifHeight: height,
          interval: intervalSec,
          numWorkers: 2,
        },
        (obj) => {
          if (obj.error) {
            reject(new Error(obj.errorMsg || 'Failed to encode GIF'));
          } else {
            // Convert data URI to Blob
            const dataUri = obj.image;
            const byteString = atob(dataUri.split(',')[1]);
            const mimeString = dataUri.split(',')[0].split(':')[1].split(';')[0];
            const ab = new ArrayBuffer(byteString.length);
            const ia = new Uint8Array(ab);
            for (let i = 0; i < byteString.length; i++) {
              ia[i] = byteString.charCodeAt(i);
            }
            const blob = new Blob([ab], { type: mimeString });
            resolve(blob);
          }
        }
      );
    } catch (err) {
      reject(err);
    }
  });
}

/**
 * Runs a capture flow by stepping through the animation step-by-step
 */
export async function exportVisualizerToGif(
  elementId: string,
  totalSteps: number,
  setStep: (step: number) => void,
  onProgress: (progress: ExportProgress) => void,
  intervalSec: number = 0.5
): Promise<Blob | null> {
  const element = document.getElementById(elementId);
  if (!element) {
    throw new Error(`Element with id "${elementId}" not found`);
  }

  // Backup current scroll position and style
  const originalWidth = element.getBoundingClientRect().width;
  const originalHeight = element.getBoundingClientRect().height;

  const frames: string[] = [];

  try {
    // Step through each frame and capture
    for (let i = 0; i < totalSteps; i++) {
      onProgress({
        percent: Math.round((i / totalSteps) * 50),
        message: `Capturing frame ${i + 1} of ${totalSteps}...`,
      });
      
      setStep(i);
      
      // Wait for rendering and transition animation (350ms)
      await sleep(350);

      const dataUrl = await captureElementFrame(element);
      frames.push(dataUrl);
    }

    onProgress({
      percent: 50,
      message: 'Compiling frames into GIF (this might take a few seconds)...',
    });

    // Compile into GIF
    const gifBlob = await generateGifFromFrames(
      frames,
      originalWidth || 600,
      originalHeight || 400,
      intervalSec
    );

    onProgress({
      percent: 100,
      message: 'GIF generation complete! Starting download...',
    });

    return gifBlob;
  } catch (err) {
    console.error('Error during GIF export:', err);
    throw err;
  }
}
