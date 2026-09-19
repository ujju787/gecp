import { execFile } from 'child_process';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Find Python executable in server/.venv or fallback to python
const venvPythonWin = path.join(__dirname, '..', '.venv', 'Scripts', 'python.exe');
const venvPythonUnix = path.join(__dirname, '..', '.venv', 'bin', 'python');
let pythonPath = 'python';

if (fs.existsSync(venvPythonWin)) {
  pythonPath = venvPythonWin;
} else if (fs.existsSync(venvPythonUnix)) {
  pythonPath = venvPythonUnix;
}

const scriptPath = path.join(__dirname, '..', 'scripts', 'qr_generator.py');

/**
 * Controller to generate Python-powered QR Code
 * Accepts: { data, boxSize, border, fillColor, backColor, errorLevel }
 */
export const generatePythonQR = (req, res) => {
  try {
    const { 
      data, 
      boxSize = 10, 
      border = 2, 
      fillColor = '#0c4a6e', 
      backColor = '#ffffff', 
      errorLevel = 'H' 
    } = req.body;

    if (!data) {
      return res.status(400).json({ error: 'Payload data is required for QR code generation.' });
    }

    const payloadString = typeof data === 'object' ? JSON.stringify(data) : String(data);

    const args = [
      scriptPath,
      '--data', payloadString,
      '--box-size', String(boxSize),
      '--border', String(border),
      '--fill-color', String(fillColor),
      '--back-color', String(backColor),
      '--error-level', String(errorLevel)
    ];

    execFile(pythonPath, args, { maxBuffer: 10 * 1024 * 1024 }, async (error, stdout, stderr) => {
      if (error) {
        try {
          const QRCode = (await import('qrcode')).default;
          const dataUrl = await QRCode.toDataURL(payloadString, {
            margin: Number(border) || 2,
            color: {
              dark: fillColor || '#0c4a6e',
              light: backColor || '#ffffff'
            },
            errorCorrectionLevel: errorLevel === 'H' ? 'high' : 'medium'
          });
          const base64Data = dataUrl.replace(/^data:image\/png;base64,/, '');
          return res.json({
            success: true,
            engine: 'Node.js QR Engine (Cloud Fallback)',
            qrBase64: base64Data,
            width: 300,
            height: 300,
            payload: data
          });
        } catch (nodeErr) {
          console.error('Python QR Generator Error:', stderr || error);
          return res.status(500).json({ 
            error: 'QR generation process failed', 
            details: stderr || error.message 
          });
        }
      }

      try {
        const parsed = JSON.parse(stdout.trim());
        return res.json({
          success: true,
          engine: 'Python 3.14 + qrcode + PIL (Pillow)',
          qrBase64: parsed.qrBase64,
          width: parsed.width,
          height: parsed.height,
          payload: parsed.payload
        });
      } catch (parseErr) {
        return res.status(500).json({ 
          error: 'Failed to parse QR generator output', 
          raw: stdout 
        });
      }
    });
  } catch (err) {
    console.error('QR Controller Exception:', err);
    return res.status(500).json({ error: 'Internal server error during QR code generation.' });
  }
};
