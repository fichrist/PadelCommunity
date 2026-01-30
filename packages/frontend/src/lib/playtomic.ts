// Function to fetch match details from Playtomic URL
export const fetchPlaytomicMatchDetails = async (url: string) => {
  try {
    const azureFunctionUrl = import.meta.env.VITE_AZURE_FUNCTION_URL || 'http://localhost:7071';
    console.log('Calling Azure Function at:', `${azureFunctionUrl}/api/y`);
    console.log('Scraping URL:', url);

    const response = await fetch(`${azureFunctionUrl}/api/scrapePlaytomic`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ url }),
    });

    console.log('Azure Function response status:', response.status, response.statusText);
    const data = await response.json();
    console.log('Azure Function response data:', data);

    if (!response.ok || !data.success) {
      console.warn('Could not fetch match details from URL:', data.error);
      return null;
    }

    return data;
  } catch (error) {
    console.error('Error fetching match details:', error);
    return null;
  }
};
