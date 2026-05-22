import { randomBytes } from "crypto";
import { prisma } from "@/lib/db/prisma";

/**
 * Generates a URL-safe 8-char share id (base32 alphabet, no ambiguous chars).
 * Collision is astronomically unlikely (32^8 = 1T entries) but we still
 * retry up to 5 times if the DB rejects an insert via unique constraint.
 */
const ALPHABET = "abcdefghjkmnpqrstuvwxyz23456789"; // 31 chars, no l/i/o/0/1
const ID_LENGTH = 8;

function newShareId(): string {
  const buf = randomBytes(ID_LENGTH);
  let id = "";
  for (let i = 0; i < ID_LENGTH; i++) {
    id += ALPHABET[buf[i] % ALPHABET.length];
  }
  return id;
}

export interface CreateShareInput {
  attemptId: string;
  showName?: boolean;
}

/**
 * Idempotent: if a share for this attempt already exists, returns it.
 * Otherwise generates a new shareId with collision-retry.
 */
export async function getOrCreateResultShare(input: CreateShareInput) {
  const { attemptId, showName = false } = input;

  // Fast path — existing live share
  const existing = await prisma.resultShare.findUnique({
    where: { attemptId },
  });
  if (existing && !existing.revokedAt) {
    return existing;
  }
  // Re-activate revoked share with fresh id
  if (existing?.revokedAt) {
    return prisma.resultShare.update({
      where: { attemptId },
      data: {
        shareId: newShareId(),
        revokedAt: null,
        showName,
      },
    });
  }

  // New share — retry on collision
  for (let attempt = 0; attempt < 5; attempt++) {
    try {
      return await prisma.resultShare.create({
        data: {
          attemptId,
          shareId: newShareId(),
          showName,
        },
      });
    } catch (err) {
      const code = (err as { code?: string }).code;
      if (code === "P2002" && attempt < 4) {
        continue; // shareId collision — try again
      }
      throw err;
    }
  }
  throw new Error("Failed to allocate unique shareId after 5 attempts");
}

export async function updateResultShareName(
  attemptId: string,
  showName: boolean,
) {
  return prisma.resultShare.update({
    where: { attemptId },
    data: { showName },
  });
}

export async function revokeResultShare(attemptId: string) {
  return prisma.resultShare.update({
    where: { attemptId },
    data: { revokedAt: new Date() },
  });
}

export async function getActiveShareByShareId(shareId: string) {
  const share = await prisma.resultShare.findUnique({
    where: { shareId },
    include: {
      attempt: {
        include: {
          user: {
            select: {
              displayName: true,
            },
          },
        },
      },
    },
  });
  if (!share || share.revokedAt) return null;
  return share;
}
