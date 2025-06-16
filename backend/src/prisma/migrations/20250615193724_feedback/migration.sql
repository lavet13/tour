-- CreateTable
CREATE TABLE "feedback" (
    "id" TEXT NOT NULL,
    "reason" TEXT NOT NULL,
    "replyTo" TEXT NOT NULL,
    "message" TEXT NOT NULL,

    CONSTRAINT "feedback_pkey" PRIMARY KEY ("id")
);
