import fetch from 'node-fetch';

export const runtime = "edge"; // Specific to Vercel Functions

export async function GET(req: Request) {
    // Extracting URL and parsing query parameters
    const url = new URL(req.url);

    // Getting query parameters directly from the URL search params
    const token_address = url.searchParams.get('token_address');
    const query = url.searchParams.get('query');

    // Ensure required parameters are provided
    if (!token_address || !query) {
        return new Response(JSON.stringify({ error: 'Missing required query parameters' }), {
            status: 400,
            headers: { 'Content-Type': 'application/json' }
        });
    }

    // POST http://localhost:8080/check HTTP/1.1
    // Content-Type: application/json
    // {
    //     "query": "What is the likelyhood of 0xb5C65358ba679622B174b7b2d1e5FB18199aDb00 being a rug pull?",
    //     "token_address": "0xb5C65358ba679622B174b7b2d1e5FB18199aDb00"
    // }
    const api_url = `http://localhost:8080/check`;
    const headers = {
        accept: '*/*',
        'Content-Type': 'application/json'
    };
    try {
        const response = await fetch(api_url, {
            method: 'POST',
            headers: headers,
            body: JSON.stringify({
                token_address: token_address,
                query: query
            }),
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