import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import {
    S3Client,
    PutObjectCommand,
    GetObjectCommand,
    CopyObjectCommand,
  } from "@aws-sdk/client-s3";
export interface IS3Config {
    endpoint: string;
    accessKeyId: string;
    secretAccessKey: string;
    region: string;
    bucket: string;
}
export class S3 {
    private s3: S3Client
    private bucket: string;
    constructor(config: IS3Config) {
        this.s3 = new S3Client({
            region: config.region,
            endpoint: config.endpoint,
            credentials: {
                accessKeyId: config.accessKeyId,
                secretAccessKey: config.secretAccessKey,
            },
        })
        this.bucket = config.bucket;
    }

    getBucket(): string {
        return this.bucket;
    }

    async readPreSign(key: string): Promise<string> {
        const command = new GetObjectCommand({
            Bucket: this.bucket,
            Key: key,
        })
        return await getSignedUrl(this.s3,command,{
            expiresIn: 3600,
        });
    }

    async uploadPreSign(key: string): Promise<string> {
        const command = new PutObjectCommand({
            Bucket: this.bucket,
            Key: key,
        })
        return await getSignedUrl(this.s3,command,{
            expiresIn: 3600,
        });
    }
    async copyFileToOtherDir(sourceKey: string, destinationKey: string): Promise<boolean> {
        const command = new CopyObjectCommand({
            Bucket: this.getBucket(),
            CopySource: `${this.getBucket()}/${sourceKey}`,
            Key: destinationKey,
        })
        const result = await this.s3.send(command);
        if (result.CopyObjectResult) {
            return true;
        } else {
            throw new Error('Copy operation failed');
        }
    }

}