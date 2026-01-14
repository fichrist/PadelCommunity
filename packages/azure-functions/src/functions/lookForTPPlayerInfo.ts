import { app, HttpRequest, HttpResponseInit, InvocationContext } from "@azure/functions";

interface PlayerInfo {
  name: string | null;
  ranking: string | null;
  club: string | null;
  userId: string;
}

interface LookForTPPlayerInfoRequest {
  userId: string;
}

async function fetchPlayerInfoByUserId(userId: string): Promise<PlayerInfo | null> {
  // The dashboard page uses dynamic JavaScript rendering, so we cannot scrape it directly.
  // Instead, we'll try to fetch the public profile page which may have static content.
  const profileUrl = `https://www.tennisenpadelvlaanderen.be/nl/dashboard/resultaten?userId=${userId}`;

  try {
    const response = await fetch(profileUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
        'Accept-Language': 'nl-BE,nl;q=0.9,en;q=0.8',
      },
    });

    if (!response.ok) {
      console.log(`Failed to fetch profile page: ${response.status}`);
      return null;
    }

    const html = await response.text();

    // Extract ranking - look for klassement__score with Padel sport
    let ranking: string | null = null;

    // First try: Find klassement__item containing Padel and extract the score
    // Pattern: <div class="klassement__item">...<span class="klassement__sport">Padel</span>...<span class="klassement__score">P400</span>...</div>
    const klassementItemRegex = /<div[^>]*class="[^"]*klassement__item[^"]*"[^>]*>[\s\S]*?<span[^>]*class="[^"]*klassement__sport[^"]*"[^>]*>\s*Padel\s*<\/span>[\s\S]*?<span[^>]*class="[^"]*klassement__score[^"]*"[^>]*>([^<]+)<\/span>/gi;
    const padelMatch = klassementItemRegex.exec(html);
    if (padelMatch) {
      ranking = padelMatch[1].trim();
    }

    // Alternative: Try simpler pattern if the above doesn't work
    if (!ranking) {
      // Look for any P followed by digits pattern near "Padel"
      const simpleMatch = html.match(/Padel[\s\S]{0,200}?klassement__score[^>]*>([P][0-9]+(?:\.[0-9]+)?)</i);
      if (simpleMatch) {
        ranking = simpleMatch[1].trim();
      }
    }

    // Final fallback: Just look for any klassement__score with P-ranking format
    if (!ranking) {
      const scoreMatch = html.match(/klassement__score[^>]*>([P][0-9]+(?:\.[0-9]+)?)<\/span>/i);
      if (scoreMatch) {
        ranking = scoreMatch[1].trim();
      }
    }

    // Extract club - look for club name in the HTML
    let club: string | null = null;

    // Try to find club in profiel__club or similar
    const clubPatterns = [
      /profiel__club[^>]*>([^<]+)</i,
      /class="[^"]*club[^"]*"[^>]*>([^<]+)</i,
      /data-club="([^"]+)"/i,
      /<span[^>]*class="[^"]*club-name[^"]*"[^>]*>([^<]+)<\/span>/i,
    ];

    for (const pattern of clubPatterns) {
      const match = html.match(pattern);
      if (match && match[1]) {
        const potentialClub = match[1].trim();
        // Filter out generic page elements
        if (potentialClub && !potentialClub.toLowerCase().includes('lid worden') && potentialClub.length > 2) {
          club = potentialClub;
          break;
        }
      }
    }

    return {
      name: null, // Name not needed
      ranking,
      club,
      userId,
    };
  } catch (error) {
    console.error('Error fetching player info:', error);
    return null;
  }
}

export async function lookForTPPlayerInfo(
  request: HttpRequest,
  context: InvocationContext
): Promise<HttpResponseInit> {
  context.log("Received look-for-tp-player-info request");

  try {
    const body = (await request.json()) as LookForTPPlayerInfoRequest;
    context.log("Request body:", body);

    const { userId } = body;

    if (!userId) {
      context.log("Missing userId");
      return {
        status: 400,
        jsonBody: {
          success: false,
          error: "userId is required",
        },
      };
    }

    context.log(`Looking for TP player info for userId: ${userId}`);

    const playerInfo = await fetchPlayerInfoByUserId(userId);

    context.log("Player info result:", playerInfo);

    return {
      status: 200,
      jsonBody: {
        success: true,
        data: {
          playerInfo,
          note: "The TP Vlaanderen dashboard uses dynamic JavaScript rendering. Ranking data may not be available without browser automation. Consider using lookForTpPlayers to search by name instead, which returns ranking data directly from search results."
        },
      },
    };
  } catch (error: any) {
    context.error("Error in lookForTPPlayerInfo:", error);
    return {
      status: 500,
      jsonBody: {
        success: false,
        error: error.message || "Failed to look for TP player info",
      },
    };
  }
}

app.http("lookForTPPlayerInfo", {
  methods: ["POST"],
  authLevel: "anonymous",
  handler: lookForTPPlayerInfo,
});
