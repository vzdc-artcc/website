-- CreateTable
CREATE TABLE "DiscordConfig" (
    "id" TEXT NOT NULL,
    "guildId" TEXT NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "DiscordConfig_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DiscordChannel" (
    "id" TEXT NOT NULL,
    "discordConfigId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "channelId" TEXT NOT NULL,

    CONSTRAINT "DiscordChannel_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DiscordRole" (
    "id" TEXT NOT NULL,
    "discordConfigId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "roleId" TEXT NOT NULL,

    CONSTRAINT "DiscordRole_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DiscordCategory" (
    "id" TEXT NOT NULL,
    "discordConfigId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "categoryId" TEXT NOT NULL,

    CONSTRAINT "DiscordCategory_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "DiscordConfig_guildId_key" ON "DiscordConfig"("guildId");

-- CreateIndex
CREATE UNIQUE INDEX "DiscordChannel_channelId_key" ON "DiscordChannel"("channelId");

-- CreateIndex
CREATE INDEX "DiscordChannel_discordConfigId_idx" ON "DiscordChannel"("discordConfigId");

-- CreateIndex
CREATE UNIQUE INDEX "DiscordChannel_discordConfigId_name_key" ON "DiscordChannel"("discordConfigId", "name");

-- CreateIndex
CREATE UNIQUE INDEX "DiscordRole_roleId_key" ON "DiscordRole"("roleId");

-- CreateIndex
CREATE INDEX "DiscordRole_discordConfigId_idx" ON "DiscordRole"("discordConfigId");

-- CreateIndex
CREATE UNIQUE INDEX "DiscordRole_discordConfigId_name_key" ON "DiscordRole"("discordConfigId", "name");

-- CreateIndex
CREATE UNIQUE INDEX "DiscordCategory_categoryId_key" ON "DiscordCategory"("categoryId");

-- CreateIndex
CREATE INDEX "DiscordCategory_discordConfigId_idx" ON "DiscordCategory"("discordConfigId");

-- CreateIndex
CREATE UNIQUE INDEX "DiscordCategory_discordConfigId_name_key" ON "DiscordCategory"("discordConfigId", "name");

-- AddForeignKey
ALTER TABLE "DiscordChannel" ADD CONSTRAINT "DiscordChannel_discordConfigId_fkey" FOREIGN KEY ("discordConfigId") REFERENCES "DiscordConfig"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DiscordRole" ADD CONSTRAINT "DiscordRole_discordConfigId_fkey" FOREIGN KEY ("discordConfigId") REFERENCES "DiscordConfig"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DiscordCategory" ADD CONSTRAINT "DiscordCategory_discordConfigId_fkey" FOREIGN KEY ("discordConfigId") REFERENCES "DiscordConfig"("id") ON DELETE CASCADE ON UPDATE CASCADE;
