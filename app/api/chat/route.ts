import OpenAI from 'openai';
import { OpenAIStream, StreamingTextResponse } from 'ai';
import { gql, request } from 'graphql-request';
import postgres from "postgres";

const { PGHOST, PGDATABASE, PGUSER, PGPASSWORD } = process.env;

const db = postgres({
  host: PGHOST,
  database: PGDATABASE,
  username: PGUSER,
  password: PGPASSWORD,
  port: 5432,
  ssl: "require",
});

interface Pool {
  pool: string;
  token0: string;
  token1: string;
}

const GRAPHQL_API = 'https://indexer.bigdevenergy.link/e15091e/v1/graphql';

const GET_POOLS_QUERY = gql`
  query GetPools($limit: Int!, $offset: Int!) {
    UniswapV3Factory_PoolCreated(limit: $limit, offset: $offset) {
      pool
      token0
      token1
    }
  }
`;

async function fetchAndInsertPools(limit: number, offset: number): Promise<void> {
  try {
    const variables = { limit, offset };
    const response = await request<{ UniswapV3Factory_PoolCreated: Pool[] }>(
      GRAPHQL_API,
      GET_POOLS_QUERY,
      variables
    );

    const pools = response.UniswapV3Factory_PoolCreated;
    if (pools.length > 0) {
      await insertPools(pools);
    }

    // check for more pools to fetch
    if (pools.length === limit) {
      await fetchAndInsertPools(limit, offset + limit);
    }
  } catch (error) {
    console.error('Error fetching or inserting pools:', error);
    throw error;
  }
}

const quoteTokens = [
  '0x4200000000000000000000000000000000000006', // WETH
  '0xd9aaec86b65d86f6a7b5b1b0c42ffa531710b6ca' // USDbc
]

async function insertPools(pools: Pool[]) {
  const insertQuery = `
    INSERT INTO pools (pool, token0, token1)
    SELECT x.pool, x.token0, x.token1 FROM unnest($1::text[], $2::text[], $3::text[]) as x(pool, token0, token1)
    ON CONFLICT (pool) DO NOTHING;
  `;
  const poolsData = pools.reduce((acc: { pool: string[], token0: string[], token1: string[] }, p) => {
    acc.pool.push(p.pool);
    acc.token0.push(p.token0);
    acc.token1.push(p.token1);
    return acc;
  }, { pool: [], token0: [], token1: [] });
  await db.unsafe(insertQuery, [poolsData.pool, poolsData.token0, poolsData.token1]);
  for (const pool of pools) {
    let token = '';
    if (!quoteTokens.includes(pool.token0)) {
      token = pool.token0;
    } else if (!quoteTokens.includes(pool.token1)) {
      token = pool.token1;
    }
    
    if (token !== '') {
      const tokenExistsQuery = 'SELECT EXISTS (SELECT 1 FROM tokens WHERE token_address = $1)';
      const tokenExists = await db.unsafe(tokenExistsQuery, [token]);
      
      if (!tokenExists[0].exists) {
        // doesn't exist, fetch and add to db
        await getAndInsertTokenInfo(token);
      }
    }
  }
}

async function getAndInsertTokenInfo(tokenAddress: string) {
  console.info(`Fetching token data for address: ${tokenAddress}`)
  const apiUrl = `https://api.gopluslabs.io/api/v1/token_security/8453?contract_addresses=${tokenAddress}`;
  const maxRetries = 3;
  const retryDelay = 3000; // in milliseconds

  let retries = 0;
  while (retries < maxRetries) {
    try {
      const response = await fetch(apiUrl, {
        method: 'GET',
        headers: {
          'accept': '*/*',
        },
      });

      if (response.ok) {
        const data = await response.json();
        if (data.result) {
          const tokenDataEntries = Object.entries(data.result);
          if (tokenDataEntries.length > 0) {
            const [_, tokenData] = tokenDataEntries[0];
            await insertTokenData(tokenAddress, tokenData);
          } else {
            console.warn('No token data found in the response');
          }
        } else {
          console.warn(`No token data found for address: ${tokenAddress}`);
          await new Promise(resolve => setTimeout(resolve, retryDelay));
          continue;
        }
        break; // exit loop on successful request
      } else if (response.status === 4029) {
        // rate limit exceeded
        console.warn(`Rate limit exceeded. Retrying in ${retryDelay}ms...`);
        await new Promise(resolve => setTimeout(resolve, retryDelay));
        continue;
      } else {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
    } catch (error) {
      console.error('Error fetching token info:', error);
    }

    retries++;
    await new Promise(resolve => setTimeout(resolve, retryDelay)); // next retry with delay
  }

  if (retries === maxRetries) {
    console.error(`Failed to fetch token info after ${maxRetries} retries.`);
  }
}

async function insertTokenData(tokenAddress: string, tokenData: any) {
  if (!tokenData) {
    console.warn(`No token data found for address: ${tokenAddress}`);
    return;
  }

  const insertTokenQuery = `
    INSERT INTO tokens (
      token_address,
      anti_whale_modifiable,
      buy_tax,
      can_take_back_ownership,
      cannot_buy,
      cannot_sell_all,
      creator_address,
      creator_balance,
      creator_percent,
      external_call,
      hidden_owner,
      holder_count,
      honeypot_with_same_creator,
      is_anti_whale,
      is_blacklisted,
      is_honeypot,
      is_in_dex,
      is_mintable,
      is_open_source,
      is_proxy,
      is_whitelisted,
      lp_holder_count,
      lp_total_supply,
      owner_address,
      owner_balance,
      owner_change_balance,
      owner_percent,
      personal_slippage_modifiable,
      selfdestruct,
      sell_tax,
      slippage_modifiable,
      token_name,
      token_symbol,
      total_supply,
      trading_cooldown,
      transfer_pausable
    )
    VALUES (
      $1, $2, $3, $4, $5, $6, $7, $8, $9, $10,
      $11, $12, $13, $14, $15, $16, $17, $18, $19, $20,
      $21, $22, $23, $24, $25, $26, $27, $28, $29, $30,
      $31, $32, $33, $34, $35, $36
    )
    ON CONFLICT (token_address) DO NOTHING
    RETURNING id;
  `;

  const result = await db.unsafe(insertTokenQuery, [
    tokenAddress,
    tokenData['anti_whale_modifiable'] || 0,
    tokenData['buy_tax'] || 0,
    tokenData['can_take_back_ownership'] || 0,
    tokenData['cannot_buy'] || 0,
    tokenData['cannot_sell_all'] || 0,
    tokenData['creator_address'] || '',
    tokenData['creator_balance'] || 0,
    tokenData['creator_percent'] || 0,
    tokenData['external_call'] || 0,
    tokenData['hidden_owner'] || 0,
    tokenData['holder_count'] || 0,
    tokenData['honeypot_with_same_creator'] || 0,
    tokenData['is_anti_whale'] || 0,
    tokenData['is_blacklisted'] || 0,
    tokenData['is_honeypot'] || 0,
    tokenData['is_in_dex'] || 0,
    tokenData['is_mintable'] || 0,
    tokenData['is_open_source'] || 0,
    tokenData['is_proxy'] || 0,
    tokenData['is_whitelisted'] || 0,
    tokenData['lp_holder_count'] || 0,
    tokenData['lp_total_supply'] || 0,
    tokenData['owner_address'] || '',
    tokenData['owner_balance'] || 0,
    tokenData['owner_change_balance'] || 0,
    tokenData['owner_percent'] || 0,
    tokenData['personal_slippage_modifiable'] || 0,
    tokenData['selfdestruct'] || 0,
    tokenData['sell_tax'] || 0,
    tokenData['slippage_modifiable'] || 0,
    tokenData['token_name'] || '',
    tokenData['token_symbol'] || '',
    tokenData['total_supply'] || 0,
    tokenData['trading_cooldown'] || 0,
    tokenData['transfer_pausable'] || 0,
  ]);

  const tokenId = result[0]?.id;

  if (tokenId) {
    await insertDexData(tokenId, tokenData['dex'] || []);
    await insertHolderData(tokenId, tokenData['holders'] || []);
    await insertLpHolderData(tokenId, tokenData['lp_holders'] || []);
  }
  console.info(`Added token address: ${tokenAddress}`)
}

async function insertDexData(tokenId: number, dexData: any[]) {
  const insertDexQuery = `
    INSERT INTO dexs (token_id, liquidity_type, name, liquidity, pair)
    VALUES ($1, $2, $3, $4, $5);
  `;

  for (const dex of dexData) {
    await db.unsafe(insertDexQuery, [
      tokenId,
      dex.liquidity_type,
      dex.name,
      dex.liquidity,
      dex.pair,
    ]);
  }
}

async function insertHolderData(tokenId: number, holderData: any[]) {
  const insertHolderQuery = `
    INSERT INTO holders (token_id, holder_address, tag, is_contract, balance, percent, is_locked)
    VALUES ($1, $2, $3, $4, $5, $6, $7);
  `;

  for (const holder of holderData) {
    await db.unsafe(insertHolderQuery, [
      tokenId,
      holder.address,
      holder.tag,
      holder.is_contract,
      holder.balance,
      holder.percent,
      holder.is_locked,
    ]);
  }
}

async function insertLpHolderData(tokenId: number, lpHolderData: any[]) {
  const insertLpHolderQuery = `
    INSERT INTO lp_holders (token_id, lp_address, tag, value, is_contract, balance, percent, nft_list, is_locked)
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9);
  `;

  for (const lpHolder of lpHolderData) {
    await db.unsafe(insertLpHolderQuery, [
      tokenId,
      lpHolder.address,
      lpHolder.tag,
      lpHolder.value,
      lpHolder.is_contract,
      lpHolder.balance,
      lpHolder.percent,
      lpHolder.NFT_list ? JSON.stringify(lpHolder.NFT_list) : null,
      lpHolder.is_locked,
    ]);
  }
}

// fetch new pools from envio indexer and token security data from goplus api
// upload to postgres db for model training
export async function GET() {
  try {
    await fetchAndInsertPools(100, 0);  // Fetch 100 records at a time, starting from offset 0
    return new Response('Data fetched and inserted successfully.', { status: 200 });
  } catch (error) {
    console.error('Error fetching or inserting pools:', error);
    return new Response('Internal Server Error', { status: 500 });
  }
}

// use local model
const openai = new OpenAI({
  baseURL: "https://4407-173-63-55-221.ngrok-free.app/v1"
});
 
// IMPORTANT! Set the runtime to nodejs
export const runtime = 'nodejs';
 
export async function POST(req: Request) {
  const { messages } = await req.json();
 
  const response = await openai.chat.completions.create({
    model: 'gpt-3.5-turbo',
    stream: true,
    messages,
  });
 
  // Convert the response into a friendly text-stream
  const stream = OpenAIStream(response);
  // Respond with the stream
  return new StreamingTextResponse(stream);
}
