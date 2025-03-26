import { S3 } from "@repo/server/s3";

const s3 = new S3({
    endpoint: process.env.S3_ENDPOINT,
    accessKeyId: process.env.S3_AK,
    secretAccessKey: process.env.S3_SK,
    region: process.env.S3_REGION,
    bucket: process.env.S3_BUCKET
});
export default s3;