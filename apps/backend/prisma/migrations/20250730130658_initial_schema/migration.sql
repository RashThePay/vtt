-- CreateEnum
CREATE TYPE "GameStatus" AS ENUM ('SETUP', 'ACTIVE', 'PAUSED', 'COMPLETED');

-- CreateEnum
CREATE TYPE "GamePhase" AS ENUM ('WIND', 'PLANNING', 'MOVEMENT', 'ACTION', 'MAINTENANCE');

-- CreateEnum
CREATE TYPE "MissionStatus" AS ENUM ('AVAILABLE', 'ASSIGNED', 'IN_PROGRESS', 'COMPLETED', 'FAILED');

-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "username" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "games" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "gm_id" TEXT NOT NULL,
    "status" "GameStatus" NOT NULL DEFAULT 'SETUP',
    "current_round" INTEGER NOT NULL DEFAULT 1,
    "current_phase" "GamePhase" NOT NULL DEFAULT 'WIND',
    "settings" JSONB,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "games_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "players" (
    "id" TEXT NOT NULL,
    "game_id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "captain_name" TEXT NOT NULL,
    "captain_stats" JSONB NOT NULL,
    "reputation" JSONB NOT NULL,
    "gold" INTEGER NOT NULL DEFAULT 150,
    "position" JSONB NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "players_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ships" (
    "id" TEXT NOT NULL,
    "player_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "stats" JSONB NOT NULL,
    "cargo" JSONB NOT NULL,
    "crew" JSONB NOT NULL,
    "condition" JSONB NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ships_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "game_log" (
    "id" TEXT NOT NULL,
    "game_id" TEXT NOT NULL,
    "player_id" TEXT,
    "action_type" TEXT NOT NULL,
    "details" JSONB NOT NULL,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "game_log_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "markets" (
    "id" TEXT NOT NULL,
    "game_id" TEXT NOT NULL,
    "location_id" TEXT NOT NULL,
    "goods_prices" JSONB NOT NULL,
    "supply_levels" JSONB NOT NULL,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "markets_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "missions" (
    "id" TEXT NOT NULL,
    "game_id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "requirements" JSONB NOT NULL,
    "rewards" JSONB NOT NULL,
    "status" "MissionStatus" NOT NULL DEFAULT 'AVAILABLE',
    "assigned_to_id" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "missions_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_username_key" ON "users"("username");

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "players_game_id_user_id_key" ON "players"("game_id", "user_id");

-- CreateIndex
CREATE UNIQUE INDEX "ships_player_id_key" ON "ships"("player_id");

-- CreateIndex
CREATE UNIQUE INDEX "markets_game_id_location_id_key" ON "markets"("game_id", "location_id");

-- AddForeignKey
ALTER TABLE "players" ADD CONSTRAINT "players_game_id_fkey" FOREIGN KEY ("game_id") REFERENCES "games"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "players" ADD CONSTRAINT "players_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ships" ADD CONSTRAINT "ships_player_id_fkey" FOREIGN KEY ("player_id") REFERENCES "players"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "game_log" ADD CONSTRAINT "game_log_game_id_fkey" FOREIGN KEY ("game_id") REFERENCES "games"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "game_log" ADD CONSTRAINT "game_log_player_id_fkey" FOREIGN KEY ("player_id") REFERENCES "players"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "markets" ADD CONSTRAINT "markets_game_id_fkey" FOREIGN KEY ("game_id") REFERENCES "games"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "missions" ADD CONSTRAINT "missions_game_id_fkey" FOREIGN KEY ("game_id") REFERENCES "games"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "missions" ADD CONSTRAINT "missions_assigned_to_id_fkey" FOREIGN KEY ("assigned_to_id") REFERENCES "players"("id") ON DELETE SET NULL ON UPDATE CASCADE;
