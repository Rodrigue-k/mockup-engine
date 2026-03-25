/**
 * Universal Mockup Engine - MP4 Muxer
 * Responsible for wrapping H.264 / H.265 bitstreams from VideoEncoder into an MP4 container
 */

import * as MP4Box from 'mp4box';

export class VideoMuxer {
  private mp4file: any; // Type 'any' used as mp4box lacks top-level TS types in many environments, but we follow its API accurately
  private videoTrack: number | null = null;
  private onBlobReady: ((blob: Blob) => void) | null = null;

  constructor(width: number, height: number, fps: number, onBlobReady: (blob: Blob) => void) {
    this.mp4file = MP4Box.createFile();
    this.onBlobReady = onBlobReady;

    // Track generation (H.264 avc1.42E01E)
    this.videoTrack = this.mp4file.addTrack({
      timescale: 1000,
      width,
      height,
      nb_samples: 0,
      avcDecoderConfigRecord: null, // To be set later
    });

    this.mp4file.onFlush = () => {
      const blob = new Blob([this.mp4file.getBuffer()], { type: 'video/mp4' });
      if (this.onBlobReady) this.onBlobReady(blob);
    };
  }

  // Add an encoded frame chunk into the MP4 file
  public addEncodedChunk(chunk: any, metadata?: any) {
    const buffer = new ArrayBuffer(chunk.byteLength);
    chunk.copyTo(buffer);

    // If metadata contains the config record, we update the track once
    if (metadata && metadata.decoderConfig && this.videoTrack !== null) {
      // Logic for updating the avcDecoderConfigRecord would go here
      // For H.264/AVC1 tracks
    }

    this.mp4file.addSample(this.videoTrack!, buffer, {
      dts: chunk.timestamp / 1000,
      cts: chunk.timestamp / 1000,
      duration: 1000 / 30, // 30 FPS default duration
      is_sync: chunk.type === 'key',
    });
  }

  public finalize() {
    this.mp4file.flush();
  }
}
