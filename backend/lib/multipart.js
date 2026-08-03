const Busboy = require("busboy");

const MAX_FILE_BYTES = 5 * 1024 * 1024; // 5MB, comfortably inside Netlify's 6MB request limit

// Parses a multipart/form-data Netlify Function event into { fields, file }.
// file is { buffer, filename, mimeType } or null if none was sent / it was too large.
function parseMultipart(event) {
  return new Promise((resolve, reject) => {
    const busboy = Busboy({
      headers: { "content-type": event.headers["content-type"] || event.headers["Content-Type"] },
      limits: { fileSize: MAX_FILE_BYTES },
    });

    const fields = {};
    let file = null;
    let fileTooLarge = false;

    busboy.on("field", (name, value) => {
      fields[name] = value;
    });

    busboy.on("file", (name, stream, info) => {
      const chunks = [];
      stream.on("data", (chunk) => chunks.push(chunk));
      stream.on("limit", () => {
        fileTooLarge = true;
      });
      stream.on("end", () => {
        if (!fileTooLarge) {
          file = {
            buffer: Buffer.concat(chunks),
            filename: info.filename,
            mimeType: info.mimeType,
          };
        }
      });
    });

    busboy.on("error", reject);
    busboy.on("finish", () => resolve({ fields, file, fileTooLarge }));

    const bodyBuffer = Buffer.from(event.body, event.isBase64Encoded ? "base64" : "utf8");
    busboy.end(bodyBuffer);
  });
}

module.exports = { parseMultipart, MAX_FILE_BYTES };
