import { PrismaClient, ProductType } from "@prisma/client";
const prisma=new PrismaClient();
async function main(){
 const ranks=await prisma.productCategory.upsert({where:{slug:"ranks"},create:{name:"Ranks",slug:"ranks"},update:{name:"Ranks"}});
 const points=await prisma.productCategory.upsert({where:{slug:"points"},create:{name:"Points",slug:"points"},update:{name:"Points"}});
 const products=[
  {name:"VIP",slug:"vip",description:"VIP rank for your CubeSMP adventure.",type:ProductType.RANK,rankKey:"vip",priceMinor:14900,pointsAmount:null,categoryId:ranks.id,deliveryCommands:["lp user {player} parent set vip"]},
  {name:"MVP",slug:"mvp",description:"MVP rank for your CubeSMP adventure.",type:ProductType.RANK,rankKey:"mvp",priceMinor:29900,pointsAmount:null,categoryId:ranks.id,deliveryCommands:["lp user {player} parent set mvp"]},
  {name:"ELITE",slug:"elite",description:"ELITE rank for your CubeSMP adventure.",type:ProductType.RANK,rankKey:"elite",priceMinor:49900,pointsAmount:null,categoryId:ranks.id,deliveryCommands:["lp user {player} parent set elite"]},
  {name:"Starter",slug:"points-starter",description:"1,000 in-game points.",type:ProductType.POINTS,rankKey:null,priceMinor:4900,pointsAmount:1000,categoryId:points.id,deliveryCommands:["points give {player} {amount}"]},
  {name:"Standard",slug:"points-standard",description:"3,000 in-game points.",type:ProductType.POINTS,rankKey:null,priceMinor:12900,pointsAmount:3000,categoryId:points.id,deliveryCommands:["points give {player} {amount}"]},
  {name:"Advanced",slug:"points-advanced",description:"5,000 in-game points.",type:ProductType.POINTS,rankKey:null,priceMinor:19900,pointsAmount:5000,categoryId:points.id,deliveryCommands:["points give {player} {amount}"]},
  {name:"Premium",slug:"points-premium",description:"10,000 in-game points.",type:ProductType.POINTS,rankKey:null,priceMinor:34900,pointsAmount:10000,categoryId:points.id,deliveryCommands:["points give {player} {amount}"]}
 ];
 for(const product of products){
  await prisma.product.upsert({where:{slug:product.slug},create:{...product,enabled:true,featured:product.type===ProductType.RANK||product.slug==="points-premium"},update:{name:product.name,description:product.description,type:product.type,priceMinor:product.priceMinor,pointsAmount:product.pointsAmount,rankKey:product.rankKey,categoryId:product.categoryId,deliveryCommands:product.deliveryCommands,enabled:true,featured:product.type===ProductType.RANK||product.slug==="points-premium"}});
 }
 console.log("Seeded CubeSMP categories and 7 editable products with starter PHP prices.");
}
main().catch(e=>{console.error(e);process.exitCode=1;}).finally(()=>prisma.$disconnect());
