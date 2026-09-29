-- CreateTable
CREATE TABLE "InnovationLabProject" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "InnovationLabProject_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "InnovationLabProjectUpdate" (
    "id" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdBy" TEXT NOT NULL,

    CONSTRAINT "InnovationLabProjectUpdate_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "InnovationLabProjectUpdate" ADD CONSTRAINT "InnovationLabProjectUpdate_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "InnovationLabProject"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InnovationLabProjectUpdate" ADD CONSTRAINT "InnovationLabProjectUpdate_createdBy_fkey" FOREIGN KEY ("createdBy") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
