declare module 'gifshot' {
  export interface GIFOptions {
    images: string[];
    gifWidth?: number;
    gifHeight?: number;
    interval?: number;
    numWorkers?: number;
  }

  export interface GIFResult {
    error: boolean;
    errorMsg?: string;
    image: string;
  }

  export function createGIF(
    options: GIFOptions,
    callback: (obj: GIFResult) => void
  ): void;
}
