import type { Express, Request, Response } from "express";
import type { Server as HttpServer } from "http";
import rateLimit, { ipKeyGenerator } from "express-rate-limit";
import { customAlphabet, nanoid } from "nanoid";
import { createHash } from "node:crypto";
import { Server as SocketIOServer } from "socket.io";
import { z } from "zod";
import { PrismaClientKnownRequestError } from "@prisma/client/runtime/library";
import { prisma } from "./db";

const createPollId = customAlphabet("0123456789abcdefghijklmnopqrstuvwxyz", 10);
const createOptionId = customAlphabet(
  "0123456789abcdefghijklmnopqrstuvwxyz",
  8,
);

const pollIdSchema = z.string().trim().regex(/^[a-z0-9_-]{4,32}$/i, {
  message: "Invalid pollId format.",
});

const createPollSchema = z.object({
  question: z.string().trim().min(10).max(140),
  options: z
    .array(z.string().trim().min(1).max(60))
    .min(2)
    .max(6)
    .refine((values) => {
      const normalized = values.map((value) => value.toLowerCase());
      return new Set(normalized).size === normalized.length;
    }, "Options must be unique (case-insensitive)."),
});

const voteSchema = z.object({
  optionId: z.string().trim().min(1),
});

const pollJoinSchema = z.object({
  pollId: pollIdSchema,
});

const clientIdSchema = z.string().trim().min(1).max(200);

const voteLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req: Request) =>
    `${ipKeyGenerator(req)}:${req.params.pollId}`,
  handler: (req, res) => {
    const resetTime =
      req.rateLimit?.resetTime instanceof Date ? req.rateLimit.resetTime : null;
    const retryAfterSeconds = resetTime
      ? Math.max(1, Math.ceil((resetTime.getTime() - Date.now()) / 1000))
      : undefined;
    return res.status(429).json({
      message: "Too many requests",
      ...(retryAfterSeconds ? { retryAfterSeconds } : {}),
    });
  },
});

function jsonError(
  res: Response,
  status: number,
  message: string,
  details?: unknown,
) {
  return res.status(status).json(
    details === undefined
      ? { message }
      : {
          message,
          details,
        },
  );
}

function getPublicBaseUrl(req: Request): string {
  const isDev = process.env.NODE_ENV !== "production";
  if (isDev) {
    const origin = req.get("origin");
    if (origin) {
      return origin.replace(/\/$/, "");
    }

    const forwardedProto = req.get("x-forwarded-proto");
    const forwardedHost = req.get("x-forwarded-host");
    const proto = forwardedProto?.split(",")[0]?.trim() || req.protocol;
    const host = forwardedHost?.split(",")[0]?.trim() || req.get("host");
    if (host) {
      return `${proto}://${host}`;
    }
  }

  const configured = process.env.PUBLIC_BASE_URL?.trim();
  if (configured) {
    return configured.replace(/\/$/, "");
  }

  const origin = req.get("origin");
  if (origin) {
    return origin.replace(/\/$/, "");
  }

  const forwardedProto = req.get("x-forwarded-proto");
  const forwardedHost = req.get("x-forwarded-host");
  const proto = forwardedProto?.split(",")[0]?.trim() || req.protocol;
  const host = forwardedHost?.split(",")[0]?.trim() || req.get("host");
  if (host) {
    return `${proto}://${host}`;
  }

  return "";
}

function hashIp(ipAddress: string): string {
  const salt = process.env.IP_HASH_SALT?.trim() || "dev-only-salt";
  return createHash("sha256").update(`${ipAddress}:${salt}`).digest("hex");
}

async function getPollSnapshot(pollId: string) {
  const poll = await prisma.poll.findUnique({
    where: { id: pollId },
    include: {
      options: true,
    },
  });
  if (!poll) {
    return null;
  }

  const grouped = await prisma.vote.groupBy({
    by: ["optionId"],
    where: { pollId },
    _count: {
      _all: true,
    },
  });

  const votesByOption = new Map<string, number>();
  for (const row of grouped) {
    votesByOption.set(row.optionId, row._count._all);
  }

  const results = poll.options.map((option) => ({
    optionId: option.id,
    votes: votesByOption.get(option.id) ?? 0,
  }));
  const totalVotes = results.reduce((sum, row) => sum + row.votes, 0);

  return {
    pollId: poll.id,
    question: poll.question,
    options: poll.options.map((option) => ({
      id: option.id,
      text: option.text,
    })),
    results,
    totalVotes,
    createdAt: poll.createdAt.getTime(),
  };
}

async function emitPollState(io: SocketIOServer, pollId: string) {
  const snapshot = await getPollSnapshot(pollId);
  if (!snapshot) {
    return;
  }

  io.to(pollId).emit("poll:state", {
    pollId: snapshot.pollId,
    results: snapshot.results,
    totalVotes: snapshot.totalVotes,
  });
}

export async function registerRoutes(
  httpServer: HttpServer,
  app: Express,
): Promise<HttpServer> {
  const corsOrigins = (process.env.CORS_ORIGIN || "")
    .split(",")
    .map((origin) => origin.trim())
    .filter(Boolean);

  const io = new SocketIOServer(httpServer, {
    path: "/socket.io",
    cors: {
      origin: corsOrigins.length > 0 ? corsOrigins : true,
      credentials: true,
    },
  });

  io.on("connection", (socket) => {
    socket.on("poll:join", async (payload) => {
      const parsed = pollJoinSchema.safeParse(payload);
      if (!parsed.success) {
        socket.emit("poll:error", { message: "Invalid pollId." });
        return;
      }

      try {
        const exists = await prisma.poll.findUnique({
          where: { id: parsed.data.pollId },
          select: { id: true },
        });
        if (!exists) {
          socket.emit("poll:error", { message: "Poll not found." });
          return;
        }

        socket.join(parsed.data.pollId);
        const snapshot = await getPollSnapshot(parsed.data.pollId);
        if (snapshot) {
          socket.emit("poll:state", {
            pollId: snapshot.pollId,
            results: snapshot.results,
            totalVotes: snapshot.totalVotes,
          });
        }
      } catch (_error) {
        socket.emit("poll:error", { message: "Failed to join poll room." });
      }
    });
  });

  app.get("/api/health", (_req, res) => {
    res.json({ ok: true });
  });

  app.post("/api/polls", async (req, res) => {
    const parsed = createPollSchema.safeParse(req.body);
    if (!parsed.success) {
      return jsonError(res, 400, "Validation failed.", parsed.error.flatten());
    }

    const pollId = createPollId();
    const shareUrl = `${getPublicBaseUrl(req)}/p/${pollId}`;
    const optionPayload = parsed.data.options.map((text) => ({
      id: createOptionId(),
      text,
      pollId,
    }));

    await prisma.$transaction([
      prisma.poll.create({
        data: {
          id: pollId,
          question: parsed.data.question,
        },
      }),
      prisma.pollOption.createMany({
        data: optionPayload,
      }),
    ]);

    return res.status(201).json({ pollId, shareUrl });
  });

  app.get("/api/polls/:pollId", async (req, res) => {
    const parsedId = pollIdSchema.safeParse(req.params.pollId);
    if (!parsedId.success) {
      return jsonError(res, 400, "Invalid pollId.");
    }

    const snapshot = await getPollSnapshot(parsedId.data);
    if (!snapshot) {
      return jsonError(res, 404, "Poll not found.");
    }

    const clientIdHeader = req.header("x-client-id");
    let userStatus:
      | {
          hasVoted: boolean;
          votedOptionId?: string;
        }
      | undefined;

    if (clientIdHeader) {
      const parsedClientId = clientIdSchema.safeParse(clientIdHeader);
      if (parsedClientId.success) {
        const vote = await prisma.vote.findUnique({
          where: {
            pollId_clientId: {
              pollId: parsedId.data,
              clientId: parsedClientId.data,
            },
          },
        });
        if (vote) {
          userStatus = { hasVoted: true, votedOptionId: vote.optionId };
        } else {
          userStatus = { hasVoted: false };
        }
      }
    }

    return res.json({
      ...snapshot,
      userStatus,
      shareUrl: `${getPublicBaseUrl(req)}/p/${snapshot.pollId}`,
    });
  });

  app.post("/api/polls/:pollId/vote", voteLimiter, async (req, res) => {
    const parsedId = pollIdSchema.safeParse(req.params.pollId);
    if (!parsedId.success) {
      return jsonError(res, 400, "Invalid pollId.");
    }

    const parsedBody = voteSchema.safeParse(req.body);
    if (!parsedBody.success) {
      return jsonError(
        res,
        400,
        "Validation failed.",
        parsedBody.error.flatten(),
      );
    }

    const clientIdHeader = req.header("x-client-id");
    if (!clientIdHeader) {
      return jsonError(
        res,
        400,
        "Missing X-Client-Id header. Voting requires a client identifier.",
      );
    }

    const parsedClientId = clientIdSchema.safeParse(clientIdHeader);
    if (!parsedClientId.success) {
      return jsonError(res, 400, "Invalid X-Client-Id header.");
    }

    const poll = await prisma.poll.findUnique({
      where: { id: parsedId.data },
      include: { options: true },
    });
    if (!poll) {
      return jsonError(res, 404, "Poll not found.");
    }

    const optionBelongsToPoll = poll.options.some(
      (option) => option.id === parsedBody.data.optionId,
    );
    if (!optionBelongsToPoll) {
      return jsonError(res, 400, "Invalid optionId for this poll.");
    }

    try {
      await prisma.vote.create({
        data: {
          id: nanoid(),
          pollId: parsedId.data,
          optionId: parsedBody.data.optionId,
          clientId: parsedClientId.data,
          ipHash: hashIp(req.ip || "unknown"),
        },
      });
    } catch (error) {
      if (
        error instanceof PrismaClientKnownRequestError &&
        error.code === "P2002"
      ) {
        return jsonError(res, 403, "Already voted");
      }
      throw error;
    }

    const snapshot = await getPollSnapshot(parsedId.data);
    if (!snapshot) {
      return jsonError(res, 404, "Poll not found.");
    }

    await emitPollState(io, parsedId.data);

    return res.status(201).json({
      ...snapshot,
      userStatus: {
        hasVoted: true,
        votedOptionId: parsedBody.data.optionId,
      },
      shareUrl: `${getPublicBaseUrl(req)}/p/${snapshot.pollId}`,
    });
  });

  return httpServer;
}
