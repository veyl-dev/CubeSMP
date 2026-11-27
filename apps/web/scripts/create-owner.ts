import "dotenv/config";
import bcrypt from "bcryptjs";
import { PrismaClient } from "@prisma/client";

const prisma=new PrismaClient();
async function main(){
 const email=process.env.OWNER_BOOTSTRAP_EMAIL?.toLowerCase();
 const password=process.env.OWNER_BOOTSTRAP_PASSWORD;
 if(!email||!password||password.length<16) throw new Error("Set OWNER_BOOTSTRAP_EMAIL and OWNER_BOOTSTRAP_PASSWORD (minimum 16 characters).");
 const existing=await prisma.user.findUnique({where:{email}});
 if(existing){
  await prisma.user.update({where:{id:existing.id},data:{role:"OWNER",suspended:false,passwordHash:await bcrypt.hash(password,12)}});
  console.log("Existing account promoted to OWNER and password rotated.");
 }else{
  const minecraftName=process.env.OWNER_BOOTSTRAP_MINECRAFT_NAME??"CubeSMPOwner";
  await prisma.user.create({data:{email,minecraftName,passwordHash:await bcrypt.hash(password,12),role:"OWNER"}});
  console.log("Owner account created.");
 }
}
main().catch(error=>{console.error(error);process.exitCode=1;}).finally(()=>prisma.$disconnect());
