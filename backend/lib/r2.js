const { S3Client, PutObjectCommand, GetObjectCommand } = require("@aws-sdk/client-s3");
const { getSignedUrl } = require("@aws-sdk/s3-request-presigner");

const r2 = new S3Client({
  region: "auto",
  endpoint: `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY_ID,
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY,
  },
});

async function uploadResume(key, buffer, contentType) {
  await r2.send(
    new PutObjectCommand({
      Bucket: process.env.R2_BUCKET,
      Key: key,
      Body: buffer,
      ContentType: contentType,
    })
  );
}

function getResumeDownloadUrl(key) {
  return getSignedUrl(
    r2,
    new GetObjectCommand({ Bucket: process.env.R2_BUCKET, Key: key }),
    { expiresIn: 60 * 10 }
  );
}

module.exports = { uploadResume, getResumeDownloadUrl };
