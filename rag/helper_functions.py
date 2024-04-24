from sqlalchemy import text


def get_content(row):
    return f"""
        Token:
        - token_address: {row.token_address}
        - token_name: {row.token_name}
        - token_symbol: {row.token_symbol}
        - total_supply: {row.total_supply}
        - anti_whale_modifiable: {row.anti_whale_modifiable}
        - buy_tax: {row.buy_tax}
        - can_take_back_ownership: {row.can_take_back_ownership}
        - cannot_buy: {row.cannot_buy}
        - cannot_sell_all: {row.cannot_sell_all}
        - creator_address: {row.creator_address}
        - creator_balance: {row.creator_balance}
        - creator_percent: {row.creator_percent}
        - external_call: {row.external_call}
        - hidden_owner: {row.hidden_owner}
        - holder_count: {row.holder_count}
        - honeypot_with_same_creator: {row.honeypot_with_same_creator}
        - is_anti_whale: {row.is_anti_whale}
        - is_blacklisted: {row.is_blacklisted}
        - is_honeypot: {row.is_honeypot}
        - is_in_dex: {row.is_in_dex}
        - is_mintable: {row.is_mintable}
        - is_open_source: {row.is_open_source}
        - is_proxy: {row.is_proxy}
        - is_whitelisted: {row.is_whitelisted}
        - lp_holder_count: {row.lp_holder_count}
        - lp_total_supply: {row.lp_total_supply}
        - owner_address: {row.owner_address}
        - owner_balance: {row.owner_balance}
        - owner_change_balance: {row.owner_change_balance}
        - owner_percent: {row.owner_percent}
        - personal_slippage_modifiable: {row.personal_slippage_modifiable}
        - selfdestruct: {row.selfdestruct}
        - sell_tax: {row.sell_tax}
        - slippage_modifiable: {row.slippage_modifiable}
        - trading_cooldown: {row.trading_cooldown}
        - transfer_pausable: {row.transfer_pausable}

        DEX:
        - liquidity_type: {row.liquidity_type_list}
        - name: {row.name_list}
        - liquidity: {row.liquidity_sum}
        - pair: {row.pair_list}

        Holders:
        - holder_address: {row.holder_address_list}
        - tag: {row.holder_tag_list}
        - is_contract: {row.sum_holder_is_contract}
        - balance: {row.holder_balance_sum}
        - percent: {row.holder_percent_sum}
        - is_locked: {row.sum_holder_is_locked}

        LP Holders:
        - lp_address: {row.lp_holder_address_list}
        - tag: {row.lp_holder_tag_list}
        - value: {row.sum_lp_value}
        - is_contract: {row.sum_lp_holder_is_contract}
        - balance: {row.lp_holder_balance_sum}
        - percent: {row.lp_holder_percent_sum}
        - nft_list: {row.lp_nft_list}
        - is_locked: {row.sum_lp_holder_is_locked}
    """


def get_query(id=None):
    idquery = f"AND t.token_address = '{id}'" if id else ""
    return text(f"""
            WITH dexs_group AS (
                select d.token_id,count(1) as num_dexs,
                        string_agg(distinct d.liquidity_type, ', ') AS liquidity_type_list,
                        string_agg(distinct d.name, ', ') AS name_list,
                        string_agg(distinct d.pair, ', ') AS pair_list,
                        sum(liquidity) AS liquidity_sum
                from dexs d
                group by d.token_id 
            ), holders_group AS (
                select h.token_id,count(1) as num_holders,
                        string_agg(distinct h.holder_address, ', ') AS holder_address_list,
                        string_agg(distinct h.tag, ', ') AS holder_tag_list,
                        sum(h.balance) as holder_balance_sum,
                        sum(h.percent) as holder_percent_sum,
                        sum(h.is_contract) as sum_holder_is_contract,
                        sum(h.is_locked) as sum_holder_is_locked
                from holders h
                group by h.token_id 
                having count(*)>1
            ), lp_holders_group AS (
                select l.token_id,count(1) as num_lp_holders,
                        string_agg(distinct l.lp_address, ', ') AS lp_holder_address_list,
                        string_agg(distinct l.tag, ', ') AS lp_holder_tag_list,
                        sum(l.balance) as lp_holder_balance_sum,
                        sum(l.percent) as lp_holder_percent_sum,
                        sum(l.is_contract) as sum_lp_holder_is_contract,
                        sum(l.is_locked) as sum_lp_holder_is_locked,
                        sum(l.value) as sum_lp_value,
                        string_agg(distinct l.nft_list, ', ') AS lp_nft_list
                from lp_holders l
                group by l.token_id 
                having count(*)>1
            )
            SELECT t.id, t.token_address, t.anti_whale_modifiable, t.buy_tax, t.can_take_back_ownership, t.cannot_buy, 
                    t.cannot_sell_all, t.creator_address, t.creator_balance, t.creator_percent, t.external_call, t.hidden_owner, 
                    t.holder_count, t.honeypot_with_same_creator, t.is_anti_whale, t.is_blacklisted, t.is_honeypot, t.is_in_dex, 
                    t.is_mintable, t.is_open_source, t.is_proxy, t.is_whitelisted, t.lp_holder_count, t.lp_total_supply, 
                    t.owner_address, t.owner_balance, t.owner_change_balance, t.owner_percent, t.personal_slippage_modifiable, 
                    t.selfdestruct, t.sell_tax, t.slippage_modifiable, t.token_name, t.token_symbol, t.total_supply, 
                    t.trading_cooldown, t.transfer_pausable,
                    d.num_dexs, d.liquidity_type_list, d.name_list, d.pair_list, d.liquidity_sum,
                    h.num_holders, h.holder_address_list, h.holder_tag_list, h.holder_balance_sum, 
                    h.holder_percent_sum, h.sum_holder_is_contract, h.sum_holder_is_locked,
                    l.num_lp_holders, l.lp_holder_address_list, l.lp_holder_tag_list, 
                    l.lp_holder_balance_sum, l.lp_holder_percent_sum, l.sum_lp_holder_is_contract, l.sum_lp_holder_is_locked,
                    l.sum_lp_value, l.lp_nft_list
            FROM public.tokens t, dexs_group d, holders_group h, lp_holders_group l
            WHERE d.token_id = t.id
            AND   h.token_id = t.id
            AND   l.token_id = t.id
            AND   d.token_id = h.token_id
            AND   d.token_id = l.token_id
            AND   h.token_id = l.token_id
            {idquery}
            ORDER BY t.id DESC
""")

