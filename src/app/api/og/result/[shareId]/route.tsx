import { ImageResponse } from "next/og";
import { getActiveShareByShareId } from "@/lib/share/result-share";
import { MODE_CONFIG } from "@/lib/tryout/config";

export const runtime = "nodejs";
export const contentType = "image/png";
export const size = { width: 1200, height: 630 };

interface RouteContext {
  params: Promise<{ shareId: string }>;
}

/**
 * Dynamic OG card for /r/[shareId].
 *
 * Uses Next.js `next/og` (Satori under the hood). Pure system fonts are
 * rendered with the runtime's default sans, which keeps cold-start fast
 * and avoids font-fetch egress; we lean on weight + size + spacing for
 * the editorial look instead of pulling Cita's serif at runtime.
 *
 * Returns a 1200x630 image. 5-min CDN cache so re-shares to slow chats
 * (WhatsApp, etc) don't repeatedly hit the DB.
 */
export async function GET(_req: Request, context: RouteContext) {
  const { shareId } = await context.params;
  const share = await getActiveShareByShareId(shareId);

  if (!share) {
    return new ImageResponse(
      (
        <div
          style={{
            display: "flex",
            width: "100%",
            height: "100%",
            background: "#0e1217",
            color: "#f4f1ec",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 48,
            letterSpacing: -0.5,
          }}
        >
          Cita
        </div>
      ),
      { ...size },
    );
  }

  const a = share.attempt;
  const cfg = MODE_CONFIG[a.mode];
  const totalQ = cfg.totalSoal;
  const totalScore = a.totalScore ?? 0;
  const scorePct = totalQ > 0 ? Math.round((totalScore / totalQ) * 100) : 0;
  const modeLabel = a.mode === "MINI" ? "Tryout Mini" : "Tryout Lengkap";

  const subtests: Array<{ code: "TWK" | "TIU" | "TKP"; score: number }> = [
    { code: "TWK", score: a.scoreTWK ?? 0 },
    { code: "TIU", score: a.scoreTIU ?? 0 },
    { code: "TKP", score: a.scoreTKP ?? 0 },
  ];

  const displayName =
    share.showName && a.user.displayName ? a.user.displayName : null;

  const passed = a.passingStatus === "LULUS";

  const dateStr = a.startedAt.toLocaleDateString("id-ID", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          background:
            "linear-gradient(180deg, #fefcf7 0%, #f5f1e6 100%)",
          color: "#1f1c17",
          padding: "60px 72px",
          fontFamily: "system-ui, -apple-system, sans-serif",
        }}
      >
        {/* Header */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            marginBottom: 40,
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 14,
            }}
          >
            <div
              style={{
                width: 44,
                height: 44,
                borderRadius: 22,
                background: "#1f1c17",
                color: "#fefcf7",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 24,
                fontWeight: 700,
                letterSpacing: -1,
              }}
            >
              C
            </div>
            <span
              style={{
                fontSize: 28,
                fontWeight: 600,
                letterSpacing: -0.6,
              }}
            >
              Cita
            </span>
          </div>
          <span
            style={{
              fontSize: 16,
              color: "#6f675b",
              textTransform: "uppercase",
              letterSpacing: 2,
            }}
          >
            {modeLabel}  ·  SKD CPNS
          </span>
        </div>

        {/* Body — score */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            flex: 1,
            justifyContent: "center",
          }}
        >
          {displayName && (
            <span
              style={{
                fontSize: 22,
                color: "#6f675b",
                marginBottom: 6,
                letterSpacing: -0.2,
              }}
            >
              Hasil dari {displayName}
            </span>
          )}
          <div
            style={{
              display: "flex",
              alignItems: "flex-end",
              gap: 24,
              marginBottom: 12,
            }}
          >
            <span
              style={{
                fontSize: 220,
                fontWeight: 500,
                lineHeight: 1,
                letterSpacing: -8,
                color: "#1f1c17",
                fontVariantNumeric: "tabular-nums",
              }}
            >
              {scorePct}
            </span>
            <span
              style={{
                fontSize: 80,
                color: "#6f675b",
                paddingBottom: 28,
                fontWeight: 400,
              }}
            >
              %
            </span>
            <span
              style={{
                fontSize: 28,
                color: a.passingStatus
                  ? passed
                    ? "#3d6c3d"
                    : "#8a4d2d"
                  : "#6f675b",
                paddingBottom: 56,
                marginLeft: 12,
                background: a.passingStatus
                  ? passed
                    ? "#e8f0e3"
                    : "#f5e6d8"
                  : "transparent",
                padding: a.passingStatus ? "8px 18px" : 0,
                borderRadius: 999,
                fontWeight: 600,
                letterSpacing: 0.2,
              }}
            >
              {a.passingStatus
                ? passed
                  ? "LULUS AMBANG"
                  : "BELUM LULUS"
                : ""}
            </span>
          </div>
          <span
            style={{
              fontSize: 22,
              color: "#6f675b",
              fontVariantNumeric: "tabular-nums",
            }}
          >
            Skor mentah {totalScore} dari {totalQ * 5}  ·  {dateStr}
          </span>
        </div>

        {/* Subtests */}
        <div
          style={{
            display: "flex",
            gap: 20,
            marginTop: 32,
          }}
        >
          {subtests.map((s) => (
            <div
              key={s.code}
              style={{
                display: "flex",
                flexDirection: "column",
                flex: 1,
                background: "#fefcf7",
                border: "1px solid #e0d8c8",
                padding: "20px 26px",
                borderRadius: 14,
              }}
            >
              <span
                style={{
                  fontSize: 14,
                  color: "#6f675b",
                  textTransform: "uppercase",
                  letterSpacing: 2,
                  marginBottom: 10,
                  fontWeight: 600,
                }}
              >
                {s.code}
              </span>
              <span
                style={{
                  fontSize: 56,
                  color: "#1f1c17",
                  fontWeight: 500,
                  letterSpacing: -1.5,
                  fontVariantNumeric: "tabular-nums",
                }}
              >
                {s.score}
              </span>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginTop: 28,
          }}
        >
          <span style={{ fontSize: 18, color: "#6f675b", letterSpacing: 0.2 }}>
            cita.id/r/{shareId}
          </span>
          <span
            style={{
              fontSize: 16,
              color: "#6f675b",
              textTransform: "uppercase",
              letterSpacing: 2,
            }}
          >
            Persiapan SKD CPNS
          </span>
        </div>
      </div>
    ),
    {
      ...size,
      headers: {
        "Cache-Control": "public, max-age=300, s-maxage=300",
      },
    },
  );
}
