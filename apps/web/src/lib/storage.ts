import { S3Client } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { GetObjectCommand, PutObjectCommand } from "@aws-sdk/client-s3";

function client() {
  const endpoint=process.env.S3_ENDPOINT;
  const bucket=process.env.S3_BUCKET;
  const accessKeyId=process.env.S3_ACCESS_KEY_ID;
  const secretAccessKey=process.env.S3_SECRET_ACCESS_KEY;
  if(!endpoint||!bucket||!accessKeyId||!secretAccessKey) throw new Error("Private S3 storage is not configured");
  return { bucket, s3:new S3Client({region:process.env.S3_REGION??"auto",endpoint,forcePathStyle:true,credentials:{accessKeyId,secretAccessKey}}) };
}
export async function createUploadUrl(key:string,contentType:string) {
  const {bucket,s3}=client();
  return getSignedUrl(s3,new PutObjectCommand({Bucket:bucket,Key:key,ContentType:contentType}),{expiresIn:300});
}
export async function createDownloadUrl(key:string) {
  const {bucket,s3}=client();
  return getSignedUrl(s3,new GetObjectCommand({Bucket:bucket,Key:key}),{expiresIn:180});
}
