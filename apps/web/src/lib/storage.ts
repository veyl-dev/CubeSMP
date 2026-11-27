import { createClient } from "@supabase/supabase-js";

function storageClient(){
 const url=process.env.SUPABASE_URL;
 const secret=process.env.SUPABASE_SECRET_KEY;
 if(!url||!secret)throw new Error("Supabase server storage is not configured");
 return createClient(url,secret,{auth:{persistSession:false,autoRefreshToken:false,detectSessionInUrl:false}});
}
export async function uploadPrivateObject(key:string,body:Buffer,contentType:string){
 const client=storageClient();
 const bucket=key.startsWith("site-assets/")?"site-assets":key.startsWith("product-images/")?"product-images":"payment-proofs";
 const path=key.replace(/^(site-assets|product-images|payment-proofs)\//,"");
 const {error}=await client.storage.from(bucket).upload(path,body,{contentType,upsert:false,cacheControl:bucket==="payment-proofs"?"0":"3600"});
 if(error)throw error;
}
export async function createDownloadUrl(key:string){
 const client=storageClient();
 const bucket=key.startsWith("site-assets/")?"site-assets":key.startsWith("product-images/")?"product-images":"payment-proofs";
 const path=key.replace(/^(site-assets|product-images|payment-proofs)\//,"");
 const {data,error}=await client.storage.from(bucket).createSignedUrl(path,180);
 if(error||!data?.signedUrl)throw error??new Error("Could not create a signed storage URL");
 return data.signedUrl;
}
export function publicObjectUrl(key:string){
 const client=storageClient();
 const bucket=key.startsWith("site-assets/")?"site-assets":"product-images";
 const path=key.replace(/^(site-assets|product-images)\//,"");
 return client.storage.from(bucket).getPublicUrl(path).data.publicUrl;
}
