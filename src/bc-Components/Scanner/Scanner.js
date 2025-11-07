// Scanner.jsx (updated - safe handling for reader.reset absence)
import React, { useEffect, useRef, useState } from 'react';
import './Scanner.css';

export default function Scanner({ onDetected = (txt) => console.log('scanned:', txt) }) {
  const videoRef = useRef(null);
  const [reader, setReader] = useState(null);
  const [scanning, setScanning] = useState(false);
  const [cameras, setCameras] = useState([]);
  const [selectedDeviceId, setSelectedDeviceId] = useState('');
  const [lastResult, setLastResult] = useState('');
  const [error, setError] = useState('');

  // helper: safely reset/stop a reader if available
  function safeResetReader(r) {
    try {
      if (!r) return;
      if (typeof r.reset === 'function') {
        r.reset();
        return;
      }
      // some versions use stopContinuousDecode / stop
      if (typeof r.stopContinuousDecode === 'function') {
        r.stopContinuousDecode();
        return;
      }
      if (typeof r.stop === 'function') {
        r.stop();
        return;
      }
      // else: nothing to call on the reader object — fallback to stopping camera below
    } catch (err) {
      console.warn('safeResetReader error', err);
    }
  }

  // helper: stop camera tracks in video element (always works)
  function stopCameraStream() {
    try {
      const v = videoRef.current;
      if (!v) return;
      const stream = v.srcObject;
      if (stream && stream.getTracks) {
        stream.getTracks().forEach((t) => {
          try { t.stop(); } catch (e) {}
        });
      }
      // clear srcObject so the video element stops
      if (v.srcObject) v.srcObject = null;
    } catch (err) {
      console.warn('stopCameraStream error', err);
    }
  }

  useEffect(() => {
    let mounted = true;
    let inst = null;

    import('@zxing/browser')
      .then((ZX) => {
        if (!mounted) return;
        inst = new ZX.BrowserMultiFormatReader();
        setReader(inst);

        inst
          .listVideoInputDevices()
          .then((devices) => {
            if (!mounted) return;
            setCameras(devices || []);
            if (devices && devices.length) {
              const back = devices.find((d) => /back|rear|environment/i.test(d.label));
              setSelectedDeviceId((prev) => prev || (back ? back.deviceId : devices[0].deviceId));
            }
          })
          .catch((e) => {
            console.warn('camera list error', e);
          });
      })
      .catch((e) => setError(String(e)));

    return () => {
      mounted = false;
      // try to clean up reader safely
      safeResetReader(inst);
      stopCameraStream();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // start/stop scanning when reader or selected device changes
  useEffect(() => {
    if (!reader) return;
    let active = true;

    async function start() {
      try {
        setError('');
        setLastResult('');

        // ensure any previous reader behavior stopped safely
        safeResetReader(reader);
        stopCameraStream();

        // decodeFromVideoDevice will set up the camera into the video element
        // Some versions return a Promise and manage their own workers; others don't.
        // We rely on the callback form:
        await reader.decodeFromVideoDevice(selectedDeviceId || null, videoRef.current, (result, err) => {
          if (!active) return;
          if (result) {
            const text = result.getText ? result.getText() : String(result);
            setLastResult(text);
            onDetected(text);
          }
          if (err && err.name !== 'NotFoundException') {
            // NotFoundException while scanning frames is expected; other errors we log
            console.warn('scanner frame error', err);
          }
        });

        setScanning(true);
      } catch (e) {
        console.error('start scanning error', e);
        setError(String(e));
        setScanning(false);
      }
    }

    start();

    return () => {
      active = false;
      // defensive shutdown
      try {
        safeResetReader(reader);
      } catch (e) {}
      stopCameraStream();
    };
  }, [reader, selectedDeviceId, onDetected]);

  function stopScanning() {
    try {
      safeResetReader(reader);
    } catch (e) {}
    stopCameraStream();
    setScanning(false);
  }

  // Use a temporary reader for image uploads (safer and avoids interfering with video reader)
  async function onFileChange(e) {
    const file = e.target.files && e.target.files[0];
    if (!file) return;
    let tmpReader;
    let imgUrl;
    try {
      const ZX = await import('@zxing/browser');
      tmpReader = new ZX.BrowserMultiFormatReader();

      const img = document.createElement('img');
      imgUrl = URL.createObjectURL(file);
      img.src = imgUrl;
      await img.decode();

      // many versions expose decodeFromImageElement
      let result;
      if (typeof tmpReader.decodeFromImageElement === 'function') {
        result = await tmpReader.decodeFromImageElement(img);
      } else if (typeof tmpReader.decodeFromImage === 'function') {
        // fallback if method has a different name
        result = await tmpReader.decodeFromImage(img);
      } else {
        // final fallback: draw to canvas and decode using a new image element from dataURL
        const canvas = document.createElement('canvas');
        canvas.width = img.naturalWidth || img.width;
        canvas.height = img.naturalHeight || img.height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0);
        const dataUrl = canvas.toDataURL('image/png');

        const imageElement = document.createElement('img');
        imageElement.src = dataUrl;
        await imageElement.decode();

        if (typeof tmpReader.decodeFromImageElement === 'function') {
          result = await tmpReader.decodeFromImageElement(imageElement);
        } else {
          throw new Error('No suitable image decode method on ZXing reader');
        }
      }

      const text = result && (typeof result.getText === 'function' ? result.getText() : String(result));
      setLastResult(text);
      onDetected(text);
    } catch (err) {
      console.error('Image decode error', err);
      setError(err?.message || String(err));
    } finally {
      // cleanup
      try {
        if (tmpReader) safeResetReader(tmpReader);
      } catch (e) {}
      if (imgUrl) {
        try { URL.revokeObjectURL(imgUrl); } catch (e) {}
      }
    }
  }

  return (
    <div className="Scanner">
      <div className="Scanner-card">
        <div className="Scanner-header">
          <div className="Scanner-title">Scanner</div>
          <div className="Scanner-sub">Reads 1D (linear) & 2D (QR) codes</div>
        </div>

        <div className="Scanner-view">
          <video ref={videoRef} className="Scanner-video" muted playsInline autoPlay />
          <div className="Scanner-overlay">
            <div className="Scanner-overlay-box" />
          </div>
        </div>

        <div className="Scanner-controls">
          <div className="Scanner-row">
            <label className="Scanner-label">Camera</label>
            <select
              className="Scanner-select"
              value={selectedDeviceId}
              onChange={(e) => setSelectedDeviceId(e.target.value)}
            >
              {cameras.length === 0 && <option>Detecting cameras…</option>}
              {cameras.map((c) => (
                <option key={c.deviceId} value={c.deviceId}>
                  {c.label || c.deviceId}
                </option>
              ))}
            </select>

            <button
              className="Scanner-button"
              onClick={() => {
                if (scanning) stopScanning();
                else if (reader) setSelectedDeviceId((id) => id || '');
              }}
            >
              {scanning ? 'Stop' : 'Start'}
            </button>
          </div>

          <div className="Scanner-row">
            <label className="Scanner-label">Upload image</label>
            <input type="file" accept="image/*" onChange={onFileChange} className="Scanner-file" />
          </div>

          <div className="Scanner-row result-row">
            <div className="Scanner-result-label">Last result</div>
            <div className="Scanner-result">{lastResult || <span className="muted">None yet</span>}</div>
          </div>

          {error && <div className="Scanner-error">Error: {error}</div>}

          <div className="Scanner-hint">Tip: Use steady hands and good lighting. On some laptops the built-in camera may not focus on small printed barcodes — use image upload in that case.</div>
        </div>
      </div>
    </div>
  );
}
