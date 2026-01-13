-- CreateTable
CREATE TABLE "DiscordOauthState" (
    "id" TEXT NOT NULL,
    "state" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "DiscordOauthState_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "DiscordOauthState_state_key" ON "DiscordOauthState"("state");

-- CreateIndex
CREATE INDEX "DiscordOauthState_userId_idx" ON "DiscordOauthState"("userId");

-- AddForeignKey
ALTER TABLE "DiscordOauthState" ADD CONSTRAINT "DiscordOauthState_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
