import { app, HttpRequest, HttpResponseInit, InvocationContext } from "@azure/functions";

interface PlayerResult {
  name: string;
  ranking: string | null;
  club: string | null;
  userId: string;
}

interface LookForTpRankingRequest {
  firstName: string;
  lastName: string;
}

async function searchPlayers(firstName: string, lastName: string): Promise<PlayerResult[]> {
  const searchUrl = `https://www.tennisenpadelvlaanderen.be/zoek-een-speler?sportId=2&playerName=${encodeURIComponent(
    lastName
  )}&playerFirstName=${encodeURIComponent(firstName)}&pyramidId=6`;

  const response = await fetch(searchUrl, {
    headers: {
      "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
      "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8",
      "Accept-Language": "nl-BE,nl;q=0.9,en;q=0.8",
    },
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch search results: ${response.status}`);
  }

  const html = await response.text();
  const players: PlayerResult[] = [];

  // Find all player cards by looking for userId links and extracting surrounding content
  const userIdMatches = [...html.matchAll(/href="\/dashboard\?userId=(\d+)"/g)];
  const seenUserIds = new Set<string>();

  for (const userIdMatch of userIdMatches) {
    const userId = userIdMatch[1];
    if (seenUserIds.has(userId)) continue;
    seenUserIds.add(userId);

    // Find the result-card container that contains this userId
    // Look backwards from the userId match to find the card start
    const matchIndex = userIdMatch.index!;
    const searchStart = Math.max(0, matchIndex - 2000);
    const cardContext = html.substring(searchStart, matchIndex + 200);

    // Extract player name from h5 tag in speler-info
    const nameMatch = cardContext.match(/<h5>([^<]+)<\/h5>/);
    const name = nameMatch ? nameMatch[1].trim() : `${firstName} ${lastName}`;

    // Extract club name from the first span after the icon (tevl-icon-padel or tevl-icon-tennis)
    // Format: <span>Meadow Club Kontich | </span>
    const clubMatch = cardContext.match(/<i class="tevl-icon-(?:padel|tennis)"><\/i>\s*<span>([^|<]+)/);
    const club = clubMatch ? clubMatch[1].trim() : null;

    // Extract P ranking (e.g., P100, P200, P500) - look for it in a <b> tag
    const rankingMatch = cardContext.match(/<b>(P\d+)<\/b>/);
    const ranking = rankingMatch ? rankingMatch[1] : null;

    players.push({
      name,
      ranking,
      club,
      userId,
    });
  }

  return players;
}

export async function lookForTpRanking(
  request: HttpRequest,
  context: InvocationContext
): Promise<HttpResponseInit> {
  context.log("Received look-for-tp-ranking request");

  try {
    // Parse request body
    const body = (await request.json()) as LookForTpRankingRequest;
    context.log("Request body:", body);

    const { firstName, lastName } = body;

    if (!firstName || !lastName) {
      context.log("Missing firstName or lastName");
      return {
        status: 400,
        jsonBody: {
          success: false,
          error: "firstName and lastName are required",
        },
      };
    }

    context.log(`Looking for TP ranking for ${firstName} ${lastName}...`);

    const players = await searchPlayers(firstName, lastName);

    context.log(`Found ${players.length} players`);

    return {
      status: 200,
      jsonBody: {
        success: true,
        data: {
          players,
          firstName,
          lastName,
        },
      },
    };
  } catch (error: any) {
    context.error("Error looking for TP ranking:", error);
    return {
      status: 500,
      jsonBody: {
        success: false,
        error: error.message || "Failed to look for TP ranking",
      },
    };
  }
}

app.http("lookForTpRanking", {
  methods: ["POST"],
  authLevel: "anonymous",
  handler: lookForTpRanking,
});
