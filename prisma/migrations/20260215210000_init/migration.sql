CREATE TABLE "Poll" (
  "id" TEXT NOT NULL,
  "question" TEXT NOT NULL,
  "created_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "Poll_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "PollOption" (
  "id" TEXT NOT NULL,
  "poll_id" TEXT NOT NULL,
  "text" TEXT NOT NULL,
  CONSTRAINT "PollOption_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "PollOption_poll_id_fkey" FOREIGN KEY ("poll_id") REFERENCES "Poll" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE TABLE "Vote" (
  "id" TEXT NOT NULL,
  "poll_id" TEXT NOT NULL,
  "option_id" TEXT NOT NULL,
  "client_id" TEXT NOT NULL,
  "ip_hash" TEXT NOT NULL,
  "created_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "Vote_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "Vote_poll_id_fkey" FOREIGN KEY ("poll_id") REFERENCES "Poll" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT "Vote_option_id_fkey" FOREIGN KEY ("option_id") REFERENCES "PollOption" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE UNIQUE INDEX "Vote_poll_id_client_id_key" ON "Vote"("poll_id", "client_id");
CREATE INDEX "Vote_poll_id_idx" ON "Vote"("poll_id");
CREATE INDEX "Vote_option_id_idx" ON "Vote"("option_id");
