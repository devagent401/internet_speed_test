export interface SpeedTestResult {
  download: number; // Mbps
  upload: number; // Mbps
  ping: number; // ms
  jitter: number; // ms
  timestamp: number;
}

export interface SpeedTestProgress {
  phase: 'idle' | 'ping' | 'download' | 'upload' | 'complete';
  progress: number; // 0-100
  currentSpeed?: number; // Mbps for current phase
  message: string;
}

// Test file sizes in MB
const TEST_FILE_SIZES = [10, 20, 30]; // Use multiple sizes for accuracy
const NUM_RUNS = 3; // Number of runs per test type

/**
 * Measure ping using fetch timing
 */
export async function measurePing(
  url: string = '/api/test-file?size=1',
  numTests: number = 5
): Promise<{ ping: number; jitter: number }> {
  const latencies: number[] = [];

  for (let i = 0; i < numTests; i++) {
    const startTime = performance.now();
    try {
      await fetch(`${url}&nocache=${Date.now()}`, {
        method: 'HEAD',
        cache: 'no-store',
      });
      const endTime = performance.now();
      latencies.push(endTime - startTime);
    } catch (error) {
      console.error('Ping test error:', error);
    }
    // Small delay between tests
    await new Promise((resolve) => setTimeout(resolve, 100));
  }

  if (latencies.length === 0) {
    return { ping: 0, jitter: 0 };
  }

  // Calculate average ping
  const avgPing = latencies.reduce((a, b) => a + b, 0) / latencies.length;

  // Calculate jitter (average deviation from mean)
  const deviations = latencies.map((lat) => Math.abs(lat - avgPing));
  const jitter = deviations.reduce((a, b) => a + b, 0) / deviations.length;

  return {
    ping: Math.round(avgPing * 10) / 100,
    jitter: Math.round(jitter * 10) / 100,
  };
}

/**
 * Measure download speed
 */
export async function measureDownloadSpeed(
  onProgress?: (progress: SpeedTestProgress) => void,
  baseUrl: string = ''
): Promise<number> {
  const speeds: number[] = [];

  for (let run = 0; run < NUM_RUNS; run++) {
    const fileSize = TEST_FILE_SIZES[run % TEST_FILE_SIZES.length];
    const sizeInBytes = fileSize * 1024 * 1024;

    onProgress?.({
      phase: 'download',
      progress: (run / NUM_RUNS) * 100,
      message: `Download test ${run + 1}/${NUM_RUNS} (${fileSize} MB)...`,
    });

    const startTime = performance.now();
    try {
      const response = await fetch(
        `${baseUrl}/api/test-file?size=${fileSize}&nocache=${Date.now()}`,
        {
          cache: 'no-store',
          headers: {
            'Cache-Control': 'no-cache',
          },
        }
      );

      if (!response.ok) {
        throw new Error('Download failed');
      }

      const blob = await response.blob();
      const endTime = performance.now();

      const durationInSeconds = (endTime - startTime) / 1000;
      const sizeInBits = sizeInBytes * 8;
      const speedMbps = sizeInBits / durationInSeconds / 1_000_000;
      speeds.push(speedMbps);

      onProgress?.({
        phase: 'download',
        progress: ((run + 1) / NUM_RUNS) * 100,
        currentSpeed: speedMbps,
        message: `Download: ${speedMbps.toFixed(2)} Mbps`,
      });
    } catch (error) {
      console.error('Download test error:', error);
    }

    // Small delay between runs
    if (run < NUM_RUNS - 1) {
      await new Promise((resolve) => setTimeout(resolve, 500));
    }
  }

  if (speeds.length === 0) {
    return 0;
  }

  // Return average speed
  const avgSpeed = speeds.reduce((a, b) => a + b, 0) / speeds.length;
  return Math.round(avgSpeed * 100) / 100;
}

/**
 * Measure upload speed
 */
export async function measureUploadSpeed(
  onProgress?: (progress: SpeedTestProgress) => void,
  baseUrl: string = ''
): Promise<number> {
  const speeds: number[] = [];

  for (let run = 0; run < NUM_RUNS; run++) {
    const fileSize = TEST_FILE_SIZES[run % TEST_FILE_SIZES.length];
    const sizeInBytes = fileSize * 1024 * 1024;

    onProgress?.({
      phase: 'upload',
      progress: (run / NUM_RUNS) * 100,
      message: `Upload test ${run + 1}/${NUM_RUNS} (${fileSize} MB)...`,
    });

    // Generate test data
    const testData = new Uint8Array(sizeInBytes);
    for (let i = 0; i < sizeInBytes; i++) {
      testData[i] = Math.floor(Math.random() * 256);
    }

    try {
      // Use XMLHttpRequest for accurate upload timing
      const speedMbps = await new Promise<number>((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        let uploadStartTime: number | null = null;
        let uploadEndTime: number | null = null;
        let hasResolved = false;

        // Track when upload actually starts (data begins sending to network)
        xhr.upload.addEventListener('loadstart', () => {
          uploadStartTime = performance.now();
        });

        // Track when upload completes (all data sent to server)
        xhr.upload.addEventListener('loadend', () => {
          uploadEndTime = performance.now();

          // Calculate speed when upload completes
          if (uploadStartTime && uploadEndTime && !hasResolved) {
            const durationInSeconds = (uploadEndTime - uploadStartTime) / 1000;

            // Only calculate if we have a valid duration
            if (durationInSeconds > 0.01) {
              const sizeInBits = sizeInBytes * 8;
              // Convert bits per second to Megabits per second (1 Mbps = 1,000,000 bits/s)
              const speedMbps = sizeInBits / durationInSeconds / 1_000_000;
              hasResolved = true;
              resolve(speedMbps);
            }
          }
        });

        // Handle response received
        xhr.addEventListener('load', () => {
          if (xhr.status >= 200 && xhr.status < 300) {
            // If upload timing didn't resolve yet, use response time as fallback
            if (!hasResolved && uploadStartTime) {
              const responseTime = performance.now();
              const durationInSeconds = (responseTime - uploadStartTime) / 1000;
              if (durationInSeconds > 0.01) {
                const sizeInBits = sizeInBytes * 8;
                const speedMbps = sizeInBits / durationInSeconds / 1_000_000;
                hasResolved = true;
                resolve(speedMbps);
              }
            }
          } else {
            if (!hasResolved) {
              hasResolved = true;
              reject(new Error(`Upload failed with status ${xhr.status}`));
            }
          }
        });

        xhr.addEventListener('error', () => {
          if (!hasResolved) {
            hasResolved = true;
            reject(new Error('Upload failed'));
          }
        });

        xhr.addEventListener('abort', () => {
          if (!hasResolved) {
            hasResolved = true;
            reject(new Error('Upload aborted'));
          }
        });

        xhr.addEventListener('timeout', () => {
          if (!hasResolved) {
            hasResolved = true;
            reject(new Error('Upload timeout'));
          }
        });

        xhr.open('POST', `${baseUrl}/api/upload?nocache=${Date.now()}`);
        xhr.setRequestHeader('Content-Type', 'application/octet-stream');
        xhr.setRequestHeader('Cache-Control', 'no-cache');
        xhr.timeout = 60000; // 60 second timeout

        // Send the data
        xhr.send(testData);
      });

      speeds.push(speedMbps);

      onProgress?.({
        phase: 'upload',
        progress: ((run + 1) / NUM_RUNS) * 100,
        currentSpeed: speedMbps,
        message: `Upload: ${speedMbps.toFixed(2)} Mbps`,
      });
    } catch (error) {
      console.error('Upload test error:', error);
      // Continue with other runs even if one fails
    }

    // Small delay between runs
    if (run < NUM_RUNS - 1) {
      await new Promise((resolve) => setTimeout(resolve, 500));
    }
  }

  if (speeds.length === 0) {
    return 0;
  }
  // Return average speed
  const avgSpeed = speeds.reduce((a, b) => a + b, 0) / speeds.length;
  return Math.round(avgSpeed * 10) / 1024;
}

/**
 * Run complete speed test
 */
export async function runSpeedTest(
  onProgress?: (progress: SpeedTestProgress) => void
): Promise<SpeedTestResult> {
  const baseUrl = typeof window !== 'undefined' ? window.location.origin : '';

  // Ping test
  onProgress?.({
    phase: 'ping',
    progress: 0,
    message: 'Measuring ping...',
  });

  const { ping, jitter } = await measurePing(`${baseUrl}/api/test-file?size=1`);
  onProgress?.({
    phase: 'ping',
    progress: 100,
    message: `Ping: ${ping}ms, Jitter: ${jitter}ms`,
  });

  // Download test
  const downloadSpeed = await measureDownloadSpeed(onProgress, baseUrl);

  // Upload test
  const uploadSpeed = await measureUploadSpeed(onProgress, baseUrl);

  onProgress?.({
    phase: 'complete',
    progress: 100,
    message: 'Test complete!',
  });

  return {
    download: downloadSpeed,
    upload: uploadSpeed,
    ping,
    jitter,
    timestamp: Date.now(),
  };
}

