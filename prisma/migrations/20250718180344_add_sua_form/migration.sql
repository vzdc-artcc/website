-- CreateTable
CREATE TABLE "SuaBlock"
(
    "id"         TEXT         NOT NULL,
    "userId"     TEXT         NOT NULL,
    "start"      TIMESTAMP(3) NOT NULL,
    "end"        TIMESTAMP(3) NOT NULL,
    "afiliation" TEXT         NOT NULL,
    "details"    TEXT         NOT NULL,

    CONSTRAINT "SuaBlock_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SuaBlockAirspace"
(
    "id"             TEXT    NOT NULL,
    "suaBlockId"     TEXT    NOT NULL,
    "identifier"     TEXT    NOT NULL,
    "bottomAltitude" INTEGER NOT NULL,
    "topAltitude"    INTEGER NOT NULL,

    CONSTRAINT "SuaBlockAirspace_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "SuaBlock"
    ADD CONSTRAINT "SuaBlock_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SuaBlockAirspace"
    ADD CONSTRAINT "SuaBlockAirspace_suaBlockId_fkey" FOREIGN KEY ("suaBlockId") REFERENCES "SuaBlock" ("id") ON DELETE CASCADE ON UPDATE CASCADE;
