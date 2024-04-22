import fetch from 'node-fetch';
import { writeFile } from 'fs/promises';

export const runtime = "edge"; // Specific to Vercel Functions

export async function GET(req: Request) {
    // Extracting URL and parsing query parameters
    const url = new URL(req.url);

    // Getting query parameters directly from the URL search params
    const contractAddress = url.searchParams.get('contractAddress');
    const networkEndpointNumber = url.searchParams.get('networkEndpointNumber');

    // Ensure required parameters are provided
    if (!contractAddress || !networkEndpointNumber) {
        return new Response(JSON.stringify({ error: 'Missing required query parameters' }), {
            status: 400,
            headers: { 'Content-Type': 'application/json' }
        });
    }

    // Constructing the request URL with the contract address
    // const apiUrl = `https://public-api.birdeye.so/defi/token_security?address=${contractAddress}`;
    const apiUrl = `https://api.gopluslabs.io/api/v1/token_security/${networkEndpointNumber}?contract_addresses=${contractAddress}`;

    // const headers = {
    //     'x-chain': networkEndpoint,
    //     'X-API-KEY': process.env.BIRDEYE_API_KEY // Using an environment variable for the API key
    // };
    const headers = {
        accept: '*/*'
    };

    try {
        const response = await fetch(apiUrl, {
            method: 'GET',
            headers: headers
        });
        const data = await response.json();
        // await writeFile('data.json', JSON.stringify(data, null, 2));
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
