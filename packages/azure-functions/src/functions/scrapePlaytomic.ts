import { app, HttpRequest, HttpResponseInit, InvocationContext } from "@azure/functions";

interface MatchDetails {
  match_id: string | null;
  match_date: string | null;
  match_time: string | null;
  venue_name: string | null;
  location: string | null;
  city: string | null;
  latitude: number | null;
  longitude: number | null;
  duration: number | null;
  court_number: string | null;
  price_per_person: number | null;
  total_price: number | null;
  match_type: string;
  surface_type: string | null;
  players_registered: number;
  total_spots: number;
  organizer_name: string | null;
  participants: Participant[];
}

interface Participant {
  playtomic_user_id: string;
  name: string;
  team_id: string | null;
  gender: string | null;
  level_value: number | null;
  level_confidence: number | null;
  price: number | null;
  payment_status: string;
  registration_date: string | null;
}

interface ScrapePlaytomicRequest {
  url: string;
}

async function resolveShortUrl(shortCode: string): Promise<string | null> {
  const shortUrl = `https://app.playtomic.io/t/${shortCode}`;

  try {
    // Follow redirects to get the final URL with match ID
    const response = await fetch(shortUrl, {
      method: 'GET',
      redirect: 'follow',
      headers: {
        'User-Agent': 'Mozilla/5.0 (iPhone; CPU iPhone OS 14_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148',
      },
    });

    // The final URL should contain the match ID
    const finalUrl = response.url;
    const matchIdMatch = finalUrl.match(/matches\/([a-f0-9-]+)/);

    if (matchIdMatch) {
      return matchIdMatch[1];
    }

    // If redirect didn't work, try to parse the HTML for a redirect
    const html = await response.text();
    const metaRedirect = html.match(/url=([^"]+matches\/([a-f0-9-]+))/);
    if (metaRedirect) {
      return metaRedirect[2];
    }

    return null;
  } catch (error) {
    console.error('Error resolving short URL:', error);
    return null;
  }
}

async function fetchMatchFromApi(matchId: string): Promise<any> {
  const apiUrl = `https://api.playtomic.io/v1/matches/${matchId}`;

  const response = await fetch(apiUrl, {
    headers: {
      'User-Agent': 'Mozilla/5.0 (iPhone; CPU iPhone OS 14_0 like Mac OS X) AppleWebKit/605.1.15',
      'Accept': 'application/json',
    },
  });

  if (!response.ok) {
    throw new Error(`API request failed: ${response.status} ${response.statusText}`);
  }

  return response.json();
}

function parseMatchData(apiData: any, matchId: string): MatchDetails {
  const matchDetails: MatchDetails = {
    match_id: matchId,
    match_date: null,
    match_time: null,
    venue_name: null,
    location: null,
    city: null,
    latitude: null,
    longitude: null,
    duration: null,
    court_number: null,
    price_per_person: null,
    total_price: null,
    match_type: 'friendly',
    surface_type: null,
    players_registered: 0,
    total_spots: 4,
    organizer_name: null,
    participants: [],
  };

  // Extract venue name
  if (apiData.location) matchDetails.venue_name = apiData.location;
  if (apiData.tenant?.tenant_name) matchDetails.venue_name = apiData.tenant.tenant_name;
  if (apiData.tenant?.name) matchDetails.venue_name = apiData.tenant.name;

  // Extract date and calculate duration
  if (apiData.start_date) {
    matchDetails.match_date = apiData.start_date;
    // Extract time from ISO date
    const startDate = new Date(apiData.start_date);
    matchDetails.match_time = startDate.toTimeString().substring(0, 5);

    // Calculate duration if we have both start and end
    if (apiData.end_date) {
      const endDate = new Date(apiData.end_date);
      matchDetails.duration = Math.round((endDate.getTime() - startDate.getTime()) / (1000 * 60));
    }
  }

  // Extract location details from tenant address
  if (apiData.tenant?.address) {
    const addr = apiData.tenant.address;
    const parts = [addr.street, addr.postal_code, addr.city].filter(Boolean);
    matchDetails.location = parts.join(', ');
    if (addr.city) matchDetails.city = addr.city;
    if (addr.coordinate) {
      matchDetails.latitude = addr.coordinate.lat;
      matchDetails.longitude = addr.coordinate.lon;
    }
  }

  // Extract resource/court info
  if (apiData.resource_name) matchDetails.court_number = apiData.resource_name;
  if (apiData.resource?.name) matchDetails.court_number = apiData.resource.name;

  // Extract price
  if (apiData.price) {
    const priceStr = typeof apiData.price === 'string' ? apiData.price : String(apiData.price);
    const priceMatch = priceStr.match(/(\d+\.?\d*)/);
    if (priceMatch) matchDetails.total_price = parseFloat(priceMatch[1]);
  }
  // Try getting price from first team's first player
  if (!matchDetails.total_price && apiData.teams?.[0]?.players?.[0]?.price) {
    const playerPrice = apiData.teams[0].players[0].price;
    const priceMatch = String(playerPrice).match(/(\d+\.?\d*)/);
    if (priceMatch) matchDetails.total_price = parseFloat(priceMatch[1]);
  }
  // Try from registration info slot list
  if (!matchDetails.total_price && apiData.registration_info?.slot_list?.[0]?.price) {
    const slotPrice = apiData.registration_info.slot_list[0].price;
    const priceMatch = String(slotPrice).match(/(\d+\.?\d*)/);
    if (priceMatch) matchDetails.total_price = parseFloat(priceMatch[1]);
  }

  // Extract surface type
  if (apiData.resource_properties?.surface_type) {
    matchDetails.surface_type = apiData.resource_properties.surface_type;
  }
  if (apiData.surface) matchDetails.surface_type = apiData.surface;

  // Extract player counts from teams
  if (apiData.teams && Array.isArray(apiData.teams)) {
    let totalPlayers = 0;
    apiData.teams.forEach((team: any) => {
      if (team.players && Array.isArray(team.players)) {
        totalPlayers += team.players.length;
      }
    });
    if (totalPlayers > 0) matchDetails.players_registered = totalPlayers;
  }

  // Extract max players/slots
  if (apiData.slots) matchDetails.total_spots = apiData.slots;
  if (apiData.max_players) matchDetails.total_spots = apiData.max_players;

  // Extract organizer from first team's first player
  if (apiData.teams?.[0]?.players?.[0]?.name) {
    matchDetails.organizer_name = apiData.teams[0].players[0].name;
  }

  // Extract participants from all teams
  if (apiData.teams && Array.isArray(apiData.teams)) {
    apiData.teams.forEach((team: any) => {
      if (team.players && Array.isArray(team.players)) {
        team.players.forEach((player: any) => {
          // Find registration info for this player
          let registrationInfo: any = null;
          if (apiData.registration_info?.registrations) {
            registrationInfo = apiData.registration_info.registrations.find(
              (reg: any) => reg.user_id === player.user_id
            );
          }

          matchDetails.participants.push({
            playtomic_user_id: player.user_id,
            name: player.name,
            team_id: team.team_id || null,
            gender: player.gender || null,
            level_value: player.level_value || null,
            level_confidence: player.level_confidence || null,
            price: registrationInfo?.price || null,
            payment_status: registrationInfo?.payment_date ? 'paid' : 'pending',
            registration_date: registrationInfo?.registration_date || null,
          });
        });
      }
    });
  }

  return matchDetails;
}

export async function scrapePlaytomic(
  request: HttpRequest,
  context: InvocationContext
): Promise<HttpResponseInit> {
  context.log("Received scrape-playtomic request");

  try {
    const body = (await request.json()) as ScrapePlaytomicRequest;
    const { url } = body;

    if (!url) {
      return {
        status: 400,
        jsonBody: { success: false, error: 'URL is required' },
      };
    }

    // Validate Playtomic URL
    if (!url.includes('playtomic.io')) {
      return {
        status: 400,
        jsonBody: { success: false, error: 'Only Playtomic URLs are supported' },
      };
    }

    context.log(`Processing Playtomic URL: ${url}`);

    // Extract match ID directly if it's already in the URL
    let matchId: string | null = null;
    const directMatchIdMatch = url.match(/matches\/([a-f0-9-]+)/);

    if (directMatchIdMatch) {
      matchId = directMatchIdMatch[1];
      context.log(`Found match ID directly in URL: ${matchId}`);
    } else {
      // Try to extract short code and resolve it
      const shortCodeMatch = url.match(/\/t\/([A-Za-z0-9]+)/);

      if (shortCodeMatch) {
        const shortCode = shortCodeMatch[1];
        context.log(`Found short code: ${shortCode}, resolving...`);
        matchId = await resolveShortUrl(shortCode);
        context.log(`Resolved to match ID: ${matchId}`);
      }
    }

    if (!matchId) {
      return {
        status: 400,
        jsonBody: { success: false, error: 'Could not extract match ID from URL' },
      };
    }

    // Fetch match data from Playtomic API
    context.log(`Fetching match data for ID: ${matchId}`);
    const apiData = await fetchMatchFromApi(matchId);

    // Parse the API response
    const matchDetails = parseMatchData(apiData, matchId);

    context.log(`Successfully extracted match details: ${matchDetails.venue_name}, ${matchDetails.match_date}`);

    return {
      status: 200,
      jsonBody: {
        success: true,
        data: matchDetails,
      },
    };
  } catch (error: any) {
    context.error("Error scraping Playtomic:", error);
    return {
      status: 500,
      jsonBody: {
        success: false,
        error: error.message || 'Failed to scrape match details',
      },
    };
  }
}

app.http("scrapePlaytomic", {
  methods: ["POST"],
  authLevel: "anonymous",
  handler: scrapePlaytomic,
});
