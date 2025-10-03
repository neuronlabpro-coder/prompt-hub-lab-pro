import ffmpeg from 'fluent-ffmpeg';
import { VideoCompressionConfig } from '../types';

export interface CompressionOptions {
  codec?: string;
  bitrate?: string;
  crf?: number;
  audioCodec?: string;
  maxDuration?: number;
}

const DEFAULT_CONFIG: CompressionOptions = {
  codec: 'libvpx-vp9',
  bitrate: '1000k',
  crf: 30,
  audioCodec: 'libopus',
  maxDuration: 8, // 8 segundos máximo para preview
};

export async function compressVideo(
  inputPath: string,
  outputPath: string,
  config: Partial<CompressionOptions> = {}
): Promise<void> {
  const options = { ...DEFAULT_CONFIG, ...config };

  return new Promise((resolve, reject) => {
    let command = ffmpeg(inputPath)
      .output(outputPath)
      .videoCodec(options.codec!)
      .audioCodec(options.audioCodec!)
      .videoBitrate(options.bitrate!)
      .outputOptions([
        `-crf ${options.crf}`,
        '-b:v 0', // Variable bitrate
      ]);

    // Limitar duración si se especifica
    if (options.maxDuration) {
      command = command.duration(options.maxDuration);
    }

    command
      .on('end', () => {
        console.log('Compresión de video completada');
        resolve();
      })
      .on('error', (err) => {
        console.error('Error en la compresión:', err);
        reject(err);
      })
      .on('progress', (progress) => {
        console.log(`Progreso: ${progress.percent}%`);
      })
      .run();
  });
}

export async function createPreviewVideo(
  inputPath: string,
  outputPath: string,
  config: VideoCompressionConfig
): Promise<void> {
  return compressVideo(inputPath, outputPath, {
    codec: config.codec,
    bitrate: config.bitrate,
    crf: config.crf,
    audioCodec: config.audio_codec,
    maxDuration: config.max_preview_duration,
  });
}

export async function getVideoMetadata(filePath: string): Promise<{
  duration: number;
  size: number;
  format: string;
}> {
  return new Promise((resolve, reject) => {
    ffmpeg.ffprobe(filePath, (err, metadata) => {
      if (err) {
        reject(err);
        return;
      }

      resolve({
        duration: metadata.format.duration || 0,
        size: metadata.format.size || 0,
        format: metadata.format.format_name || 'unknown',
      });
    });
  });
}