-- CreateEnum
CREATE TYPE "Role" AS ENUM ('user', 'admin');

-- CreateTable
CREATE TABLE "User" (
    "id" SERIAL NOT NULL,
    "username" TEXT NOT NULL,
    "fullName" TEXT,
    "passwordHash" TEXT NOT NULL,
    "role" "Role" NOT NULL DEFAULT 'user',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Prediction" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "name" TEXT NOT NULL,
    "modelUsed" TEXT NOT NULL,
    "result" TEXT NOT NULL,
    "confidence" DOUBLE PRECISION,
    "userId" INTEGER,
    "physicalactivities" TEXT,
    "hadasthma" TEXT,
    "removedteeth" TEXT,
    "alcoholdrinkers" TEXT,
    "fluvaxlast12" TEXT,
    "chestscan" TEXT,
    "sex" TEXT,
    "generalhealth" TEXT,
    "raceethnicitycategory" TEXT,
    "lastcheckuptime" TEXT,
    "physicalhealthdays" TEXT,
    "mentalhealthdays" TEXT,
    "sleephours" TEXT,
    "haddiabetes" TEXT,
    "agecategory" TEXT,
    "bmi" TEXT,
    "heightinmeters" TEXT,
    "hadstroke" TEXT,
    "hadcopd" TEXT,
    "hadarthritis" TEXT,
    "hadkidneydisease" TEXT,
    "hadskincancer" TEXT,
    "haddepressivedisorder" TEXT,
    "deaforhardofhearing" TEXT,
    "blindorvisiondifficulty" TEXT,
    "difficultyconcentrating" TEXT,
    "difficultywalking" TEXT,
    "difficultydressingbathing" TEXT,
    "difficultyerrands" TEXT,
    "smokerstatus" TEXT,
    "ecigaretteusage" TEXT,
    "hivtesting" TEXT,
    "pneumovaxever" TEXT,
    "tetanuslast10tdap" TEXT,
    "highrisklastyear" TEXT,
    "covidpos" TEXT,

    CONSTRAINT "Prediction_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_username_key" ON "User"("username");

-- AddForeignKey
ALTER TABLE "Prediction" ADD CONSTRAINT "Prediction_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
