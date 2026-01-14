import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { supabase } from './lib/supabase.js';
import { upsertTPMemberDirect, supabaseAdmin } from './lib/postgres.js';
import puppeteer from 'puppeteer';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors({
  origin: true, // Allow all origins
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'ok', message: 'Sacred Paths Backend API is running' });
});

// Database connection test endpoint
app.get('/api/test-db-connection', async (req, res) => {
  try {
    const { pgPool } = await import('./lib/postgres.js');

    if (!pgPool) {
      return res.json({
        success: false,
        error: 'PostgreSQL pool not configured',
        env: {
          hasDatabaseUrl: !!process.env.DATABASE_URL,
          databaseUrlLength: process.env.DATABASE_URL?.length || 0
        }
      });
    }

    // Test the connection
    const result = await pgPool.query('SELECT NOW() as current_time, current_database() as db_name');

    res.json({
      success: true,
      message: 'Database connection successful',
      data: result.rows[0]
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message,
      code: error.code,
      detail: error.detail
    });
  }
});

app.get('/', (req, res) => {
  res.send('API is running!');
});

// Example API endpoint - Get all events
app.get('/api/events', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('events')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;

    res.json({ success: true, data });
  } catch (error) {
    console.error('Error fetching events:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch events' });
  }
});

// Example API endpoint - Get user profile
app.get('/api/users/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw error;

    res.json({ success: true, data });
  } catch (error) {
    console.error('Error fetching user:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch user' });
  }
});

// Example API endpoint - Create a new event
app.post('/api/events', async (req, res) => {
  try {
    const eventData = req.body;
    const { data, error } = await supabase
      .from('events')
      .insert([eventData])
      .select()
      .single();

    if (error) throw error;

    res.status(201).json({ success: true, data });
  } catch (error) {
    console.error('Error creating event:', error);
    res.status(500).json({ success: false, error: 'Failed to create event' });
  }
});

// Scrape Playtomic match details 
app.post('/api/scrape-playtomic', async (req, res) => {
  let browser;
  try {
    const { url } = req.body;

    if (!url) {
      return res.status(400).json({ success: false, error: 'URL is required' });
    }

    // Validate Playtomic URL
    if (!url.includes('playtomic.io')) {
      return res.status(400).json({ success: false, error: 'Only Playtomic URLs are supported' });
    }

    console.log('Fetching Playtomic match details from:', url);

    // Extract shortened code from URL (e.g., "1Axkqx4B" from "https://app.playtomic.io/t/1Axkqx4B")
    const shortCodeMatch = url.match(/\/t\/([A-Za-z0-9]+)/);

    if (!shortCodeMatch) {
      return res.status(400).json({ success: false, error: 'Invalid Playtomic URL format' });
    }

    const shortCode = shortCodeMatch[1];
    console.log('Short code:', shortCode);

    // Launch headless browser
    browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });

    const page = await browser.newPage();

    // Intercept network requests to capture API calls
    const apiResponses: any[] = [];

    await page.setRequestInterception(true);
    page.on('request', (request) => {
      request.continue();
    });

    page.on('response', async (response) => {
      const url = response.url();
      // Capture API responses that might contain match data
      if (url.includes('api.playtomic.io') || url.includes('/matches/') || url.includes(shortCode)) {
        try {
          const contentType = response.headers()['content-type'];
          if (contentType && contentType.includes('application/json')) {
            const responseData = await response.json();
            console.log('Captured API response from:', url);
            console.log('Response data:', JSON.stringify(responseData).substring(0, 500));
            apiResponses.push({ url, data: responseData });
          }
        } catch (e) {
          // Ignore errors parsing response
        }
      }
    });

    // Set user agent to mimic mobile app
    await page.setUserAgent('Mozilla/5.0 (iPhone; CPU iPhone OS 14_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148');

    // Navigate to the page
    await page.goto(url, { waitUntil: 'networkidle2', timeout: 30000 });

    // Wait a bit for JavaScript and API calls to complete
    await new Promise(resolve => setTimeout(resolve, 3000));

    // Get the final URL after any redirects
    const finalUrl = page.url();
    console.log('Final URL:', finalUrl);

    // Extract match ID from URL if redirected to a match page
    const matchIdMatch = finalUrl.match(/matches\/([a-f0-9-]+)/);
    const matchId = matchIdMatch ? matchIdMatch[1] : null;
    console.log('Match ID:', matchId);

    let matchDetails: any = {
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
      organizer_name: null
    };

    // If we have a match ID, try to fetch data from Playtomic API
    if (matchId) {
      console.log('Attempting to fetch match data from API...');
      try {
        // Try to fetch from their API endpoint
        const apiUrl = `https://api.playtomic.io/v1/matches/${matchId}`;
        const apiResponse = await fetch(apiUrl, {
          headers: {
            'User-Agent': 'Mozilla/5.0 (iPhone; CPU iPhone OS 14_0 like Mac OS X) AppleWebKit/605.1.15',
            'Accept': 'application/json'
          }
        });

        if (apiResponse.ok) {
          const apiData = await apiResponse.json();
          console.log('Successfully fetched match data from API');

          // Extract data from Playtomic API response structure
          if (apiData.location) matchDetails.venue_name = apiData.location;
          if (apiData.tenant?.tenant_name) matchDetails.venue_name = apiData.tenant.tenant_name;
          if (apiData.tenant?.name) matchDetails.venue_name = apiData.tenant.name;

          // Extract date and calculate duration
          if (apiData.start_date) {
            matchDetails.match_date = apiData.start_date;
            // Calculate duration if we have both start and end
            if (apiData.end_date) {
              const start = new Date(apiData.start_date);
              const end = new Date(apiData.end_date);
              matchDetails.duration = Math.round((end.getTime() - start.getTime()) / (1000 * 60)); // in minutes
            }
          }

          // Extract location details from tenant address
          if (apiData.tenant?.address) {
            const addr = apiData.tenant.address;
            matchDetails.location = `${addr.street || ''}, ${addr.postal_code || ''} ${addr.city || ''}`.trim().replace(/, ,/g, ',');
            if (addr.city) matchDetails.city = addr.city;
            if (addr.coordinate) {
              matchDetails.latitude = addr.coordinate.lat;
              matchDetails.longitude = addr.coordinate.lon;
            }
          }

          // Extract resource/court info
          if (apiData.resource_name) matchDetails.court_number = apiData.resource_name;
          if (apiData.resource?.name) matchDetails.court_number = apiData.resource.name;

          // Extract price from registration info
          // Check multiple possible price locations
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

          // Extract surface type from resource properties
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
          if (apiData.teams && apiData.teams[0]?.players && apiData.teams[0].players[0]?.name) {
            matchDetails.organizer_name = apiData.teams[0].players[0].name;
          }

          // Extract participants from all teams
          const participants: any[] = [];
          if (apiData.teams && Array.isArray(apiData.teams)) {
            apiData.teams.forEach((team: any) => {
              if (team.players && Array.isArray(team.players)) {
                team.players.forEach((player: any) => {
                  // Find registration info for this player
                  let registrationInfo = null;
                  if (apiData.registration_info?.registrations) {
                    registrationInfo = apiData.registration_info.registrations.find(
                      (reg: any) => reg.user_id === player.user_id
                    );
                  }

                  participants.push({
                    playtomic_user_id: player.user_id,
                    name: player.name,
                    team_id: team.team_id,
                    gender: player.gender,
                    level_value: player.level_value,
                    level_confidence: player.level_confidence,
                    price: registrationInfo?.price || null,
                    payment_status: registrationInfo?.payment_date ? 'paid' : 'pending',
                    registration_date: registrationInfo?.registration_date || null
                  });
                });
              }
            });
          }
          matchDetails.participants = participants;
        } else {
          console.log('API request failed:', apiResponse.status, apiResponse.statusText);
        }
      } catch (apiError) {
        console.log('API fetch error:', apiError);
      }
    }

    // Try to extract data from captured API responses
    if (apiResponses.length > 0) {
      console.log(`Found ${apiResponses.length} API responses`);

      for (const apiResponse of apiResponses) {
        const data = apiResponse.data;

        // Try to extract fields from API response
        if (data.club_name) matchDetails.venue_name = data.club_name;
        if (data.venue_name) matchDetails.venue_name = data.venue_name;
        if (data.tenant_name) matchDetails.venue_name = data.tenant_name;
        if (data.address) matchDetails.location = data.address;
        if (data.city) matchDetails.city = data.city;
        if (data.latitude) matchDetails.latitude = data.latitude;
        if (data.longitude) matchDetails.longitude = data.longitude;
        if (data.start_date || data.date) matchDetails.match_date = data.start_date || data.date;
        if (data.start_time || data.time) matchDetails.match_time = data.start_time || data.time;
        if (data.duration) matchDetails.duration = data.duration;
        if (data.court) matchDetails.court_number = data.court;
        if (data.court_number) matchDetails.court_number = data.court_number;
        if (data.price) matchDetails.price_per_person = data.price;
        if (data.price_per_person) matchDetails.price_per_person = data.price_per_person;
        if (data.total_price) matchDetails.total_price = data.total_price;
        if (data.surface) matchDetails.surface_type = data.surface;
        if (data.surface_type) matchDetails.surface_type = data.surface_type;
        if (data.players || data.players_registered !== undefined) {
          matchDetails.players_registered = data.players || data.players_registered;
        }
        if (data.max_players || data.total_spots) {
          matchDetails.total_spots = data.max_players || data.total_spots;
        }
        if (data.organizer) matchDetails.organizer_name = data.organizer;
        if (data.organizer_name) matchDetails.organizer_name = data.organizer_name;
      }
    }

    // If no API data found, try to scrape from page content
    if (!matchDetails.venue_name && !matchDetails.match_date) {
      const scrapedData = await page.evaluate(() => {
        const result: any = {};
        const bodyText = document.body.innerText;

        // Try to find venue name from h1 or h2
        const h1 = document.querySelector('h1');
        const h2 = document.querySelector('h2');
        if (h1 && h1.textContent) result.venue_name = h1.textContent.trim();
        else if (h2 && h2.textContent) result.venue_name = h2.textContent.trim();

        // Look for price patterns
        const priceMatch = bodyText.match(/(\d+[.,]\d{2})\s*€/);
        if (priceMatch) result.price_per_person = parseFloat(priceMatch[1].replace(',', '.'));

        // Look for date patterns
        const dateMatch = bodyText.match(/(\d{1,2}[\/\-]\d{1,2}[\/\-]\d{4})|(\d{4}[\/\-]\d{1,2}[\/\-]\d{1,2})/);
        if (dateMatch) result.match_date = dateMatch[0];

        // Look for time patterns
        const timeMatch = bodyText.match(/(\d{1,2}:\d{2})/);
        if (timeMatch) result.match_time = timeMatch[0];

        // Look for player count
        const playerMatch = bodyText.match(/(\d+)\s*[\/de]+\s*(\d+)/i);
        if (playerMatch) {
          result.players_registered = parseInt(playerMatch[1]);
          result.total_spots = parseInt(playerMatch[2]);
        }

        // Look for duration
        const durationMatch = bodyText.match(/(\d+)\s*(min|minutes|minutos)/i);
        if (durationMatch) result.duration = parseInt(durationMatch[1]);

        return result;
      });

      // Merge scraped data with match details
      matchDetails = { ...matchDetails, ...scrapedData };
    }

    await browser.close();

    console.log('Extracted match details:', matchDetails);

    // Note: Match card will refresh automatically via database trigger
    // when participants are inserted - see migration 20260112222622

    res.json({ success: true, data: matchDetails });
  } catch (error: any) {
    console.error('Error scraping Playtomic:', error);
    if (browser) {
      await browser.close();
    }
    res.status(500).json({
      success: false,
      error: 'Failed to scrape match details',
      message: error.message
    });
  }
});

// Scrape Tennis & Padel Vlaanderen ranking
app.post('/api/scrape-tennis-padel-ranking', async (req, res) => {
  let browser;
  try {
    const { userId } = req.body;

    if (!userId) {
      return res.status(400).json({ success: false, error: 'User ID is required' });
    }

    console.log('Fetching Tennis & Padel Vlaanderen ranking for user:', userId);

    const url = `https://www.tennisenpadelvlaanderen.be/nl/dashboard/resultaten?userId=${userId}`;

    // Launch headless browser
    browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });

    const page = await browser.newPage();
    await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');

    // Navigate to the page
    await page.goto(url, { waitUntil: 'networkidle2', timeout: 30000 });

    // Wait for dynamic content to load
    await new Promise(resolve => setTimeout(resolve, 5000));

    // Debug: Check what klassement sections exist
    const debugInfo = await page.evaluate(() => {
      const sportElements = document.querySelectorAll('.klassement__sport');
      const items = document.querySelectorAll('.klassement__item');

      return {
        sportElementsCount: sportElements.length,
        sportTexts: Array.from(sportElements).map(el => el.textContent?.trim()),
        itemsCount: items.length,
        itemsInfo: Array.from(items).map((item, i) => {
          const sport = item.querySelector('.klassement__sport')?.textContent?.trim();
          const score = item.querySelector('.klassement__score')?.textContent?.trim();
          return { index: i, sport, score };
        })
      };
    });

    console.log('Debug klassement info:', JSON.stringify(debugInfo, null, 2));

    // Extract Padel ranking from the page
    const ranking = await page.evaluate(() => {
      // Find all klassement items
      const items = document.querySelectorAll('.klassement__item');

      // Loop through each item to find the one with Padel sport
      for (const item of items) {
        const sportElement = item.querySelector('.klassement__sport');
        const sportText = sportElement?.textContent?.trim();

        if (sportText && sportText.toLowerCase().includes('padel')) {
          // Found Padel item, now get the score
          const scoreElement = item.querySelector('.klassement__score');
          if (scoreElement && scoreElement.textContent) {
            return scoreElement.textContent.trim();
          }
        }
      }

      return null;
    });

    await browser.close();

    if (!ranking) {
      return res.status(404).json({
        success: false,
        error: 'Ranking not found'
      });
    }

    console.log('Extracted ranking:', ranking);

    res.json({ success: true, ranking });
  } catch (error: any) {
    console.error('Error scraping Tennis & Padel Vlaanderen:', error);
    if (browser) {
      await browser.close();
    }
    res.status(500).json({
      success: false,
      error: 'Failed to scrape ranking',
      message: error.message
    });
  }
});


// ============ CHAT API ENDPOINTS ============

// Get all conversations for a user
app.get('/api/conversations/:userId', async (req, res) => {
  try {
    const { userId } = req.params;

    // Get conversations where user is a participant
    const { data: participantData, error: participantError } = await supabase
      .from('conversation_participants')
      .select('conversation_id, last_read_at')
      .eq('user_id', userId);

    if (participantError) throw participantError;

    const conversationIds = participantData.map(p => p.conversation_id);

    if (conversationIds.length === 0) {
      return res.json({ success: true, data: [] });
    }

    // Get conversation details
    const { data: conversations, error: conversationsError } = await supabase
      .from('conversations')
      .select('*')
      .in('id', conversationIds)
      .order('updated_at', { ascending: false });

    if (conversationsError) throw conversationsError;

    // For each conversation, get participants and last message
    const conversationsWithDetails = await Promise.all(
      conversations.map(async (conv) => {
        // Get all participants
        const { data: participants } = await supabase
          .from('conversation_participants')
          .select('user_id, profiles(id, display_name, avatar_url)')
          .eq('conversation_id', conv.id);

        // Get last message
        const { data: lastMessage } = await supabase
          .from('messages')
          .select('content, created_at, sender_id, profiles(display_name)')
          .eq('conversation_id', conv.id)
          .order('created_at', { ascending: false })
          .limit(1)
          .single();

        // Get unread count
        const userParticipant = participantData.find(p => p.conversation_id === conv.id);
        const { count: unreadCount } = await supabase
          .from('messages')
          .select('*', { count: 'exact', head: true })
          .eq('conversation_id', conv.id)
          .gt('created_at', userParticipant?.last_read_at || new Date(0).toISOString());

        return {
          ...conv,
          participants,
          lastMessage,
          unreadCount: unreadCount || 0
        };
      })
    );

    res.json({ success: true, data: conversationsWithDetails });
  } catch (error) {
    console.error('Error fetching conversations:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch conversations' });
  }
});

// Get messages for a conversation
app.get('/api/conversations/:conversationId/messages', async (req, res) => {
  try {
    const { conversationId } = req.params;
    const { limit = 50, offset = 0 } = req.query;

    const { data, error } = await supabase
      .from('messages')
      .select(`
        *,
        sender:profiles(id, display_name, avatar_url)
      `)
      .eq('conversation_id', conversationId)
      .order('created_at', { ascending: true })
      .range(Number(offset), Number(offset) + Number(limit) - 1);

    if (error) throw error;

    res.json({ success: true, data });
  } catch (error) {
    console.error('Error fetching messages:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch messages' });
  }
});

// Send a message
app.post('/api/messages', async (req, res) => {
  try {
    const { conversation_id, sender_id, content } = req.body;

    if (!conversation_id || !sender_id || !content) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields: conversation_id, sender_id, content'
      });
    }

    const { data, error } = await supabase
      .from('messages')
      .insert([{ conversation_id, sender_id, content }])
      .select(`
        *,
        sender:profiles(id, display_name, avatar_url)
      `)
      .single();

    if (error) throw error;

    res.status(201).json({ success: true, data });
  } catch (error) {
    console.error('Error sending message:', error);
    res.status(500).json({ success: false, error: 'Failed to send message' });
  }
});

// Create a new conversation
app.post('/api/conversations', async (req, res) => {
  try {
    const { type, name, participants } = req.body;

    if (!type || !participants || participants.length < 2) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields: type and at least 2 participants'
      });
    }

    // For direct messages, check if conversation already exists
    if (type === 'direct' && participants.length === 2) {
      const { data: existingConversations } = await supabase
        .from('conversation_participants')
        .select('conversation_id, conversations(type)')
        .in('user_id', participants);

      if (existingConversations) {
        const conversationCounts = existingConversations.reduce((acc, item) => {
          if (item.conversations?.type === 'direct') {
            acc[item.conversation_id] = (acc[item.conversation_id] || 0) + 1;
          }
          return acc;
        }, {} as Record<string, number>);

        const existingConvId = Object.entries(conversationCounts)
          .find(([_, count]) => count === 2)?.[0];

        if (existingConvId) {
          const { data: existingConv } = await supabase
            .from('conversations')
            .select('*')
            .eq('id', existingConvId)
            .single();

          return res.json({ success: true, data: existingConv, existed: true });
        }
      }
    }

    // Create new conversation
    const { data: conversation, error: convError } = await supabase
      .from('conversations')
      .insert([{ type, name }])
      .select()
      .single();

    if (convError) throw convError;

    // Add participants
    const participantInserts = participants.map((userId: string) => ({
      conversation_id: conversation.id,
      user_id: userId
    }));

    const { error: participantError } = await supabase
      .from('conversation_participants')
      .insert(participantInserts);

    if (participantError) throw participantError;

    res.status(201).json({ success: true, data: conversation });
  } catch (error) {
    console.error('Error creating conversation:', error);
    res.status(500).json({ success: false, error: 'Failed to create conversation' });
  }
});

// Update last read timestamp for a conversation
app.put('/api/conversations/:conversationId/read', async (req, res) => {
  try {
    const { conversationId } = req.params;
    const { userId } = req.body;

    if (!userId) {
      return res.status(400).json({ success: false, error: 'Missing userId' });
    }

    const { data, error } = await supabase
      .from('conversation_participants')
      .update({ last_read_at: new Date().toISOString() })
      .eq('conversation_id', conversationId)
      .eq('user_id', userId)
      .select()
      .single();

    if (error) throw error;

    res.json({ success: true, data });
  } catch (error) {
    console.error('Error updating read status:', error);
    res.status(500).json({ success: false, error: 'Failed to update read status' });
  }
});

// Scrape all TP members
app.post('/api/scrape-all-tp-members', async (_req, res) => {
  let browser;
  try {
    console.log('Starting TP members scraping...');

    browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });

    const results = [];
    const errors = [];

    // Loop from 8000 to 8002
    for (let tpUserId = 8000; tpUserId <= 8002; tpUserId++) {
      try {
        console.log(`Scraping TP user ${tpUserId}...`);

        const page = await browser.newPage();
        const url = `https://www.tennisenpadelvlaanderen.be/nl/dashboard/resultaten?userId=${tpUserId}`;

        await page.goto(url, { waitUntil: 'networkidle0', timeout: 30000 });

        // Wait for the content to load
        await page.waitForSelector('.section--speler__name, .section--speler__info', { timeout: 10000 }).catch(() => {
          console.log(`No member data found for user ${tpUserId}`);
        });

        // Extract name
        const name = await page.$eval('.section--speler__name', el => el.textContent?.trim()).catch(() => null);

        // Extract membership number
        const tpMembershipNumber = await page.$eval('.section--speler__info', el => el.textContent?.trim()).catch(() => null);

        await page.close();

        if (name || tpMembershipNumber) {
          console.log(`Found member: ${name} (${tpMembershipNumber})`);

          try {
            // Use direct PostgreSQL connection to bypass PostgREST schema cache
            const data = await upsertTPMemberDirect(tpUserId, name, tpMembershipNumber);
            console.log(`Successfully saved member ${tpUserId} via direct connection`);
            results.push(data);
          } catch (error: any) {
            console.error(`Error saving member ${tpUserId}:`, error);
            errors.push({ tpUserId, error: error.message });
          }
        } else {
          console.log(`No member found for user ${tpUserId}`);
        }

        // Add a small delay to avoid overwhelming the server
        await new Promise(resolve => setTimeout(resolve, 1000));

      } catch (error: any) {
        console.error(`Error scraping user ${tpUserId}:`, error.message);
        errors.push({ tpUserId, error: error.message });
      }
    }

    await browser.close();

    console.log(`Scraping complete. Found ${results.length} members, ${errors.length} errors.`);

    res.json({
      success: true,
      data: {
        membersFound: results.length,
        errorsCount: errors.length,
        results,
        errorsList: errors
      }
    });

  } catch (error: any) {
    console.error('Error scraping TP members:', error);
    if (browser) {
      await browser.close();
    }
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to scrape TP members'
    });
  }
});

// Look for TP ranking for a player
app.post('/api/look-for-tp-ranking', async (req, res) => {
  let browser;
  try {
    console.log('Received look-for-tp-ranking request');
    console.log('Request body:', req.body);

    const { firstName, lastName } = req.body;

    if (!firstName || !lastName) {
      console.log('Missing firstName or lastName');
      return res.status(400).json({
        success: false,
        error: 'firstName and lastName are required'
      });
    }

    // Get the authorization token from headers
    const authHeader = req.headers.authorization;
    console.log('Auth header present:', !!authHeader);

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      console.log('Authorization token missing or invalid format');
      return res.status(401).json({
        success: false,
        error: 'Authorization token required'
      });
    }

    const token = authHeader.substring(7); // Remove 'Bearer ' prefix
    console.log('Token length:', token.length);

    // Verify the token and get the user
    console.log('Verifying token with Supabase...');
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);

    if (authError) {
      console.log('Auth error:', authError.message);
      return res.status(401).json({
        success: false,
        error: 'Invalid or expired token: ' + authError.message
      });
    }

    if (!user) {
      console.log('No user returned from token verification');
      return res.status(401).json({
        success: false,
        error: 'Invalid or expired token'
      });
    }

    console.log(`Looking for TP ranking for ${firstName} ${lastName}...`);

    console.log('Launching Puppeteer browser...');
    browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    console.log('Browser launched successfully');

    const page = await browser.newPage();
    console.log('New page created');
    const url = `https://www.tennisenpadelvlaanderen.be/zoek-een-speler?sportId=2&playerName=${encodeURIComponent(lastName)}&playerFirstName=${encodeURIComponent(firstName)}&pyramidId=6#searchResultStart`;

    await page.goto(url, { waitUntil: 'networkidle0', timeout: 30000 });

    // Wait for search results to load
    await page.waitForSelector('.result-card, .no-results', { timeout: 10000 }).catch(() => {
      console.log('No search results found');
    });

    // Get all player results with ranking starting with P
    const players = await page.evaluate(() => {
      const results = [];
      const resultCards = document.querySelectorAll('.result-card.result-card--speler');

      for (const card of resultCards) {
        const playerInfoEl = card.querySelector('.speler-info');
        const rankingContainers = card.querySelectorAll('.d-flex.flex-column.gap-1');

        if (playerInfoEl) {
          // Extract all text content from player info and ranking containers
          const playerInfoText = playerInfoEl.textContent?.trim() || '';

          // Try to extract user ID from the QR button's href
          let userId = null;
          const qrButton = card.querySelector('.qr-button');
          if (qrButton) {
            // Try to get href from the qr-button div itself or from an anchor inside it
            let href = qrButton.getAttribute('href');
            if (!href) {
              const anchor = qrButton.querySelector('a');
              href = anchor?.getAttribute('href') || null;
            }
            // Extract userId from query parameter (e.g., /dashboard?userId=295478)
            const userIdMatch = href?.match(/userId=(\d+)/);
            if (userIdMatch) {
              userId = userIdMatch[1];
            }
          }

          // Look for ranking starting with P in the ranking containers
          let ranking = null;
          let allInfo = playerInfoText;

          for (const container of rankingContainers) {
            const text = container.textContent?.trim();
            if (text) {
              // Add all container text to allInfo if not already included
              if (!allInfo.includes(text)) {
                allInfo += ' | ' + text;
              }

              // Look for P ranking
              const match = text.match(/P\d+(\.\d+)?/);
              if (match) {
                ranking = match[0];
              }
            }
          }

          // Only include players with a user id
          if (userId) {
            results.push({
              info: allInfo,
              ranking,
              userId
            });
          }
        }
      }

      return results;
    });

    await browser.close();

    console.log(`Found ${players.length} players with P ranking`);

    res.json({
      success: true,
      data: {
        players,
        firstName,
        lastName
      }
    });

  } catch (error: any) {
    console.error('Error looking for TP ranking:', error);
    if (browser) {
      await browser.close();
    }
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to look for TP ranking'
    });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Backend server running on http://localhost:${PORT}`);
  console.log(`📊 Health check: http://localhost:${PORT}/health`);
});
