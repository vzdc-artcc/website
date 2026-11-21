-- CreateTable
CREATE TABLE "Onboarding"
(
    "id"     TEXT    NOT NULL,
    "userId" TEXT    NOT NULL,
    "step"   INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "Onboarding_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Onboarding_userId_key" ON "Onboarding" ("userId");

-- AddForeignKey
ALTER TABLE "Onboarding"
    ADD CONSTRAINT "Onboarding_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE;
