import { PrismaClient } from "@prisma/client";
const prisma=new PrismaClient();
async function main(){
 const products=[
  {name:"VIP",slug:"vip",description:"VIP rank for your CubeSMP adventure.",type:"RANK" as const,rankKey:"vip",priceMinor:0,enabled:false,deliveryCommands:["lp user {player} parent set vip"]},
  {name:"MVP",slug:"mvp",description:"MVP rank for your CubeSMP adventure.",type:"RANK" as const,rankKey:"mvp",priceMinor:0,enabled:false,deliveryCommands:["lp user {player} parent set mvp"]},
  {name:"ELITE",slug:"elite",description:"ELITE rank for your CubeSMP adventure.",type:"RANK" as const,rankKey:"elite",priceMinor:0,enabled:false,deliveryCommands:["lp user {player} parent set elite"]},
  {name:"Starter",slug:"points-starter",description:"1,000 in-game points.",type:"POINTS" as const,pointsAmount:1000,priceMinor:0,enabled:false,deliveryCommands:["points give {player} {amount}"]},
  {name:"Standard",slug:"points-standard",description:"3,000 in-game points.",type:"POINTS" as const,pointsAmount:3000,priceMinor:0,enabled:false,deliveryCommands:["points give {player} {amount}"]},
  {name:"Advanced",slug:"points-advanced",description:"5,000 in-game points.",type:"POINTS" as const,pointsAmount:5000,priceMinor:0,enabled:false,deliveryCommands:["points give {player} {amount}"]},
  {name:"Premium",slug:"points-premium",description:"10,000 in-game points.",type:"POINTS" as const,pointsAmount:10000,priceMinor:0,enabled:false,deliveryCommands:["points give {player} {amount}"]}
 ];
 for(const product of products){
  await prisma.product.upsert({where:{slug:product.slug},create:product,update:{name:product.name,description:product.description,type:product.type,pointsAmount:"pointsAmount" in product?product.pointsAmount:null,rankKey:"rankKey" in product?product.rankKey:null}});
 }
 console.log("Seeded 3 ranks and 4 points packages. Products are disabled until prices and delivery commands are configured.");
}
main().catch(e=>{console.error(e);process.exitCode=1;}).finally(()=>prisma.$disconnect());
