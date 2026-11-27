-- Initial CubeSMP relational schema. Prisma client generates cuid IDs in application code.
CREATE TYPE "UserRole" AS ENUM ('OWNER','ADMIN','MODERATOR','PLAYER');
CREATE TYPE "PaymentMethod" AS ENUM ('GCASH','MAYA');
CREATE TYPE "TransactionStatus" AS ENUM ('PENDING','APPROVED','REJECTED','DELIVERED');
CREATE TYPE "DeliveryStatus" AS ENUM ('QUEUED','CLAIMED','SUCCEEDED','FAILED');
CREATE TYPE "ProductType" AS ENUM ('RANK','POINTS','ITEM');

CREATE TABLE "User" (
 "id" TEXT NOT NULL, "email" TEXT NOT NULL, "minecraftName" TEXT NOT NULL, "passwordHash" TEXT NOT NULL,
 "role" "UserRole" NOT NULL DEFAULT 'PLAYER', "suspended" BOOLEAN NOT NULL DEFAULT false,
 "pointsBalance" INTEGER NOT NULL DEFAULT 0, "currentRank" TEXT,
 "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP, "updatedAt" TIMESTAMP(3) NOT NULL,
 CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);
CREATE TABLE "Session" (
 "id" TEXT NOT NULL, "userId" TEXT NOT NULL, "expiresAt" TIMESTAMP(3) NOT NULL,
 "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP, CONSTRAINT "Session_pkey" PRIMARY KEY ("id")
);
CREATE TABLE "ProductCategory" (
 "id" TEXT NOT NULL, "name" TEXT NOT NULL, "slug" TEXT NOT NULL,
 "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP, CONSTRAINT "ProductCategory_pkey" PRIMARY KEY ("id")
);
CREATE TABLE "Product" (
 "id" TEXT NOT NULL, "name" TEXT NOT NULL, "slug" TEXT NOT NULL, "description" TEXT NOT NULL DEFAULT '',
 "imageUrl" TEXT, "priceMinor" INTEGER NOT NULL, "currency" TEXT NOT NULL DEFAULT 'PHP',
 "type" "ProductType" NOT NULL DEFAULT 'ITEM', "enabled" BOOLEAN NOT NULL DEFAULT true, "featured" BOOLEAN NOT NULL DEFAULT false,
 "pointsAmount" INTEGER, "rankKey" TEXT, "benefits" JSONB, "deliveryCommands" JSONB,
 "categoryId" TEXT, "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP, "updatedAt" TIMESTAMP(3) NOT NULL,
 CONSTRAINT "Product_pkey" PRIMARY KEY ("id")
);
CREATE TABLE "Order" (
 "id" TEXT NOT NULL, "userId" TEXT NOT NULL, "status" "TransactionStatus" NOT NULL DEFAULT 'PENDING',
 "totalMinor" INTEGER NOT NULL, "currency" TEXT NOT NULL DEFAULT 'PHP',
 "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP, "updatedAt" TIMESTAMP(3) NOT NULL,
 CONSTRAINT "Order_pkey" PRIMARY KEY ("id")
);
CREATE TABLE "OrderItem" (
 "id" TEXT NOT NULL, "orderId" TEXT NOT NULL, "productId" TEXT NOT NULL, "quantity" INTEGER NOT NULL DEFAULT 1,
 "unitPriceMinor" INTEGER NOT NULL, "productName" TEXT NOT NULL, CONSTRAINT "OrderItem_pkey" PRIMARY KEY ("id")
);
CREATE TABLE "PaymentTransaction" (
 "id" TEXT NOT NULL, "orderId" TEXT NOT NULL, "method" "PaymentMethod" NOT NULL, "referenceNumber" TEXT NOT NULL,
 "amountMinor" INTEGER NOT NULL, "proofObjectKey" TEXT NOT NULL, "status" "TransactionStatus" NOT NULL DEFAULT 'PENDING',
 "rejectionReason" TEXT, "reviewedById" TEXT, "reviewedAt" TIMESTAMP(3),
 "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP, CONSTRAINT "PaymentTransaction_pkey" PRIMARY KEY ("id")
);
CREATE TABLE "PointLedger" (
 "id" TEXT NOT NULL, "userId" TEXT NOT NULL, "delta" INTEGER NOT NULL, "reason" TEXT NOT NULL,
 "referenceId" TEXT, "actorId" TEXT, "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
 CONSTRAINT "PointLedger_pkey" PRIMARY KEY ("id")
);
CREATE TABLE "DeliveryJob" (
 "id" TEXT NOT NULL, "orderId" TEXT NOT NULL, "status" "DeliveryStatus" NOT NULL DEFAULT 'QUEUED',
 "attempts" INTEGER NOT NULL DEFAULT 0, "claimedAt" TIMESTAMP(3), "claimedBy" TEXT, "lastError" TEXT,
 "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP, "updatedAt" TIMESTAMP(3) NOT NULL,
 CONSTRAINT "DeliveryJob_pkey" PRIMARY KEY ("id")
);
CREATE TABLE "DeliveryLog" (
 "id" TEXT NOT NULL, "jobId" TEXT NOT NULL, "event" TEXT NOT NULL, "detail" TEXT,
 "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP, CONSTRAINT "DeliveryLog_pkey" PRIMARY KEY ("id")
);
CREATE TABLE "WebsiteSetting" (
 "key" TEXT NOT NULL, "value" JSONB NOT NULL, "updatedAt" TIMESTAMP(3) NOT NULL,
 CONSTRAINT "WebsiteSetting_pkey" PRIMARY KEY ("key")
);
CREATE TABLE "Announcement" (
 "id" TEXT NOT NULL, "title" TEXT NOT NULL, "body" TEXT NOT NULL, "published" BOOLEAN NOT NULL DEFAULT false,
 "publishedAt" TIMESTAMP(3), "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
 CONSTRAINT "Announcement_pkey" PRIMARY KEY ("id")
);
CREATE TABLE "PaymentMethodSetting" (
 "method" "PaymentMethod" NOT NULL, "accountName" TEXT NOT NULL, "accountNumber" TEXT NOT NULL,
 "qrObjectKey" TEXT, "instructions" TEXT NOT NULL, "enabled" BOOLEAN NOT NULL DEFAULT false,
 "updatedAt" TIMESTAMP(3) NOT NULL, CONSTRAINT "PaymentMethodSetting_pkey" PRIMARY KEY ("method")
);
CREATE TABLE "AuditLog" (
 "id" TEXT NOT NULL, "actorId" TEXT, "action" TEXT NOT NULL, "entityType" TEXT NOT NULL,
 "entityId" TEXT, "metadata" JSONB, "ipAddress" TEXT, "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
 CONSTRAINT "AuditLog_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "User_email_key" ON "User"("email");
CREATE UNIQUE INDEX "User_minecraftName_key" ON "User"("minecraftName");
CREATE INDEX "Session_userId_idx" ON "Session"("userId");
CREATE INDEX "Session_expiresAt_idx" ON "Session"("expiresAt");
CREATE UNIQUE INDEX "ProductCategory_name_key" ON "ProductCategory"("name");
CREATE UNIQUE INDEX "ProductCategory_slug_key" ON "ProductCategory"("slug");
CREATE UNIQUE INDEX "Product_slug_key" ON "Product"("slug");
CREATE INDEX "Product_enabled_type_idx" ON "Product"("enabled","type");
CREATE INDEX "Order_userId_createdAt_idx" ON "Order"("userId","createdAt");
CREATE INDEX "Order_status_createdAt_idx" ON "Order"("status","createdAt");
CREATE INDEX "OrderItem_orderId_idx" ON "OrderItem"("orderId");
CREATE UNIQUE INDEX "PaymentTransaction_orderId_key" ON "PaymentTransaction"("orderId");
CREATE UNIQUE INDEX "PaymentTransaction_method_referenceNumber_key" ON "PaymentTransaction"("method","referenceNumber");
CREATE INDEX "PaymentTransaction_status_createdAt_idx" ON "PaymentTransaction"("status","createdAt");
CREATE INDEX "PointLedger_userId_createdAt_idx" ON "PointLedger"("userId","createdAt");
CREATE UNIQUE INDEX "PointLedger_referenceId_key" ON "PointLedger"("referenceId");
CREATE UNIQUE INDEX "DeliveryJob_orderId_key" ON "DeliveryJob"("orderId");
CREATE INDEX "DeliveryJob_status_createdAt_idx" ON "DeliveryJob"("status","createdAt");
CREATE INDEX "DeliveryLog_jobId_createdAt_idx" ON "DeliveryLog"("jobId","createdAt");
CREATE INDEX "AuditLog_actorId_createdAt_idx" ON "AuditLog"("actorId","createdAt");
CREATE INDEX "AuditLog_entityType_entityId_idx" ON "AuditLog"("entityType","entityId");

ALTER TABLE "Session" ADD CONSTRAINT "Session_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Product" ADD CONSTRAINT "Product_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "ProductCategory"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "Order" ADD CONSTRAINT "Order_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "OrderItem" ADD CONSTRAINT "OrderItem_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "Order"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "OrderItem" ADD CONSTRAINT "OrderItem_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "PaymentTransaction" ADD CONSTRAINT "PaymentTransaction_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "Order"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "PaymentTransaction" ADD CONSTRAINT "PaymentTransaction_reviewedById_fkey" FOREIGN KEY ("reviewedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "PointLedger" ADD CONSTRAINT "PointLedger_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "DeliveryJob" ADD CONSTRAINT "DeliveryJob_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "Order"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "DeliveryLog" ADD CONSTRAINT "DeliveryLog_jobId_fkey" FOREIGN KEY ("jobId") REFERENCES "DeliveryJob"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "AuditLog" ADD CONSTRAINT "AuditLog_actorId_fkey" FOREIGN KEY ("actorId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
