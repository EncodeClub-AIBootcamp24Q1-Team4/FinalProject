export const runtime = "edge"; // Specific to Vercel Functions

export async function GET(req: Request) {
    // get params from request
    const url = new URL(req.url);
    const contractAddress = url.searchParams.get('contractAddress');
    const networkId = url.searchParams.get('networkId');

    // Ensure required parameters are provided
    if (!contractAddress || !networkId) {
        return new Response(JSON.stringify({ error: 'Missing required query parameters' }), {
            status: 400,
            headers: { 'Content-Type': 'application/json' }
        });
    }

    const apiUrl = `https://api.gopluslabs.io/api/v1/token_security/${networkId}?contract_addresses=${contractAddress}`;
    const headers = {
        accept: '*/*'
    };

    try {
        const response = await fetch(apiUrl, {
            method: 'GET',
            headers: headers
        });
        const data = await response.json();
        return new Response(JSON.stringify(data), {
            headers: { 'Content-Type': 'application/json' },
        });
    } catch (error) {
        console.error('Error fetching data:', error);
        return new Response(JSON.stringify({ error: 'Failed to fetch data' }), {
            status: 500
        });
    }
}
