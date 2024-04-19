/*
 *Please refer to https://docs.envio.dev for a thorough guide on all Envio indexer features*
 */
import {
  UniswapV3FactoryContract,
  UniswapV3PoolContract,
} from '../generated/src/Handlers.gen';

import type {
  UniswapV3Factory_PoolCreatedEntity,
  UniswapV3Pool_BurnEntity,
  UniswapV3Pool_MintEntity,
  UniswapV3Pool_SetFeeProtocolEntity,
  UniswapV3Pool_SwapEntity,
  EventsSummaryEntity,
} from '../generated/src/Types.gen';

export const GLOBAL_EVENTS_SUMMARY_KEY = 'GlobalEventsSummary';

const INITIAL_EVENTS_SUMMARY: EventsSummaryEntity = {
  id: GLOBAL_EVENTS_SUMMARY_KEY,
  uniswapV3Factory_PoolCreatedCount: BigInt(0),
  uniswapV3Pool_BurnCount: BigInt(0),
  uniswapV3Pool_MintCount: BigInt(0),
  uniswapV3Pool_SetFeeProtocolCount: BigInt(0),
  uniswapV3Pool_SwapCount: BigInt(0),
};

UniswapV3FactoryContract.PoolCreated.loader(({ event, context }) => {
  context.EventsSummary.load(GLOBAL_EVENTS_SUMMARY_KEY);
  context.contractRegistration.addUniswapV3Pool(event.params.pool);
});

UniswapV3FactoryContract.PoolCreated.handler(({ event, context }) => {
  const summary = context.EventsSummary.get(GLOBAL_EVENTS_SUMMARY_KEY);

  const currentSummaryEntity: EventsSummaryEntity =
    summary ?? INITIAL_EVENTS_SUMMARY;

  const nextSummaryEntity = {
    ...currentSummaryEntity,
    uniswapV3Factory_PoolCreatedCount:
      currentSummaryEntity.uniswapV3Factory_PoolCreatedCount + BigInt(1),
  };

  const uniswapV3Factory_PoolCreatedEntity: UniswapV3Factory_PoolCreatedEntity =
    {
      id: event.transactionHash + event.logIndex.toString(),
      token0: event.params.token0,
      token1: event.params.token1,
      fee: event.params.fee,
      tickSpacing: event.params.tickSpacing,
      pool: event.params.pool,
      eventsSummary: GLOBAL_EVENTS_SUMMARY_KEY,
    };

  context.EventsSummary.set(nextSummaryEntity);
  context.UniswapV3Factory_PoolCreated.set(uniswapV3Factory_PoolCreatedEntity);
});
UniswapV3PoolContract.Burn.loader(({ event, context }) => {
  context.EventsSummary.load(GLOBAL_EVENTS_SUMMARY_KEY);
});

UniswapV3PoolContract.Burn.handler(({ event, context }) => {
  const summary = context.EventsSummary.get(GLOBAL_EVENTS_SUMMARY_KEY);

  const currentSummaryEntity: EventsSummaryEntity =
    summary ?? INITIAL_EVENTS_SUMMARY;

  const nextSummaryEntity = {
    ...currentSummaryEntity,
    uniswapV3Pool_BurnCount:
      currentSummaryEntity.uniswapV3Pool_BurnCount + BigInt(1),
  };

  const uniswapV3Pool_BurnEntity: UniswapV3Pool_BurnEntity = {
    id: event.transactionHash + event.logIndex.toString(),
    owner: event.params.owner,
    tickLower: event.params.tickLower,
    tickUpper: event.params.tickUpper,
    amount: event.params.amount,
    amount0: event.params.amount0,
    amount1: event.params.amount1,
    eventsSummary: GLOBAL_EVENTS_SUMMARY_KEY,
  };

  context.EventsSummary.set(nextSummaryEntity);
  context.UniswapV3Pool_Burn.set(uniswapV3Pool_BurnEntity);
});
UniswapV3PoolContract.Mint.loader(({ event, context }) => {
  context.EventsSummary.load(GLOBAL_EVENTS_SUMMARY_KEY);
});

UniswapV3PoolContract.Mint.handler(({ event, context }) => {
  const summary = context.EventsSummary.get(GLOBAL_EVENTS_SUMMARY_KEY);

  const currentSummaryEntity: EventsSummaryEntity =
    summary ?? INITIAL_EVENTS_SUMMARY;

  const nextSummaryEntity = {
    ...currentSummaryEntity,
    uniswapV3Pool_MintCount:
      currentSummaryEntity.uniswapV3Pool_MintCount + BigInt(1),
  };

  const uniswapV3Pool_MintEntity: UniswapV3Pool_MintEntity = {
    id: event.transactionHash + event.logIndex.toString(),
    sender: event.params.sender,
    owner: event.params.owner,
    tickLower: event.params.tickLower,
    tickUpper: event.params.tickUpper,
    amount: event.params.amount,
    amount0: event.params.amount0,
    amount1: event.params.amount1,
    eventsSummary: GLOBAL_EVENTS_SUMMARY_KEY,
  };

  context.EventsSummary.set(nextSummaryEntity);
  context.UniswapV3Pool_Mint.set(uniswapV3Pool_MintEntity);
});
UniswapV3PoolContract.SetFeeProtocol.loader(({ event, context }) => {
  context.EventsSummary.load(GLOBAL_EVENTS_SUMMARY_KEY);
});

UniswapV3PoolContract.SetFeeProtocol.handler(({ event, context }) => {
  const summary = context.EventsSummary.get(GLOBAL_EVENTS_SUMMARY_KEY);

  const currentSummaryEntity: EventsSummaryEntity =
    summary ?? INITIAL_EVENTS_SUMMARY;

  const nextSummaryEntity = {
    ...currentSummaryEntity,
    uniswapV3Pool_SetFeeProtocolCount:
      currentSummaryEntity.uniswapV3Pool_SetFeeProtocolCount + BigInt(1),
  };

  const uniswapV3Pool_SetFeeProtocolEntity: UniswapV3Pool_SetFeeProtocolEntity =
    {
      id: event.transactionHash + event.logIndex.toString(),
      feeProtocol0Old: event.params.feeProtocol0Old,
      feeProtocol1Old: event.params.feeProtocol1Old,
      feeProtocol0New: event.params.feeProtocol0New,
      feeProtocol1New: event.params.feeProtocol1New,
      eventsSummary: GLOBAL_EVENTS_SUMMARY_KEY,
    };

  context.EventsSummary.set(nextSummaryEntity);
  context.UniswapV3Pool_SetFeeProtocol.set(uniswapV3Pool_SetFeeProtocolEntity);
});
UniswapV3PoolContract.Swap.loader(({ event, context }) => {
  context.EventsSummary.load(GLOBAL_EVENTS_SUMMARY_KEY);
});

UniswapV3PoolContract.Swap.handler(({ event, context }) => {
  const summary = context.EventsSummary.get(GLOBAL_EVENTS_SUMMARY_KEY);

  const currentSummaryEntity: EventsSummaryEntity =
    summary ?? INITIAL_EVENTS_SUMMARY;

  const nextSummaryEntity = {
    ...currentSummaryEntity,
    uniswapV3Pool_SwapCount:
      currentSummaryEntity.uniswapV3Pool_SwapCount + BigInt(1),
  };

  const uniswapV3Pool_SwapEntity: UniswapV3Pool_SwapEntity = {
    id: event.transactionHash + event.logIndex.toString(),
    sender: event.params.sender,
    recipient: event.params.recipient,
    amount0: event.params.amount0,
    amount1: event.params.amount1,
    sqrtPriceX96: event.params.sqrtPriceX96,
    liquidity: event.params.liquidity,
    tick: event.params.tick,
    eventsSummary: GLOBAL_EVENTS_SUMMARY_KEY,
  };

  context.EventsSummary.set(nextSummaryEntity);
  context.UniswapV3Pool_Swap.set(uniswapV3Pool_SwapEntity);
});
