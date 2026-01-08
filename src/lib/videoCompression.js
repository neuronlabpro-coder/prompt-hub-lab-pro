import ffmpeg from 'fluent-ffmpeg';

const DEFAULT_CONFIG = {
  codec: 'libvpx-vp9',
  bitrate: '1000k',
  crf: 30,
  audioCodec: 'libopus',
  maxDuration: 8,
};

export async function compressVideo(inputPath, outputPath, config = {}) {
  const options = { ...DEFAULT_CONFIG, ...config };

  return new Promise((resolve, reject) => {
    let command = ffmpeg(inputPath)
      .output(outputPath)
      .videoCodec(options.codec)
      .audioCodec(options.audioCodec)
      .videoBitrate(options.bitrate)
      .outputOptions([`-crf ${options.crf}`, '-b:v 0']);

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

export async function createPreviewVideo(inputPath, outputPath, config) {
  return compressVideo(inputPath, outputPath, {
    codec: config.codec,
    bitrate: config.bitrate,
    crf: config.crf,
    audioCodec: config.audio_codec,
    maxDuration: config.max_preview_duration,
  });
}

export async function getVideoMetadata(filePath) {
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
