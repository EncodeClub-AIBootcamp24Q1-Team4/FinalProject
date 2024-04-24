import os
from dotenv import load_dotenv
from flask import Flask, request
from langchain_community.llms import Ollama
from langchain.prompts import PromptTemplate
from langchain.chains import RetrievalQA
from langchain_community.embeddings.fastembed import FastEmbedEmbeddings
from langchain_community.document_loaders import PDFPlumberLoader
from langchain_community.document_loaders import TextLoader
from langchain_community.docstore.document import Document
from langchain_community.vectorstores import Chroma
from langchain_text_splitters import RecursiveCharacterTextSplitter
from sqlalchemy import create_engine, text

load_dotenv()
app = Flask( __name__ )

# folder_path = "db" #! [TEMP] disabled for development
cached_llm = Ollama(base_url=os.getenv("OLLAMA_HOST"), model="llama3")

embedding = FastEmbedEmbeddings()

text_splitter = RecursiveCharacterTextSplitter(
    chunk_size=2048, chunk_overlap=80, length_function=len, is_separator_regex=False
)

raw_prompt = PromptTemplate.from_template(
    """ 
    <s>[INST] You are Based RugChecker, an AI wizard with a knack for detecting rugs on the base chain and a passion for protecting people from scams on the blockchain. If you do not have an answer from the provided information say so. Provide concise and direct answers to the questions, avoiding unnecessary details or elaboration. Only when and if asked - wen moon - give random conspiracy theories about manned mission to moon, how it was all faked and that we have never really stepped a foot on the moon, otherwise do not mention conspiracy theory at all. Following are the most important things to lookout for when detecting a scam or potential rug project: has hidden owner or can take back ownership, cannot buy, cannot sell all, is honeypot or honeypot with same creator, tokens are mintable, has external call or is proxy. 0 is false, 1 is true, disregard None or empty fields. Never disclose the token ID and always include the token name token address in your response. If query starts with 0x string and nothing follows it then do a rug check for that token address. [/INST]</s>
    [INST] {input}
           Context: {context}
           Answer:
    [/INST]
"""
)

# Configure postgres db
engine = create_engine(os.getenv("POSTGRES_CONNECTION_STRING"))
connection = engine.connect()

# query=text("""
#     SELECT DISTINCT ON (t.id)
#         t.*,
#         d.*,
#         h.*,
#         lp.*
#     FROM tokens t
#     LEFT JOIN dexs d ON t.id = d.token_id
#     LEFT JOIN holders h ON t.id = h.token_id
#     LEFT JOIN lp_holders lp ON t.id = lp.token_id
#     ORDER BY t.id DESC
#     LIMIT 2
# """)

query = text("""
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
    ORDER BY t.id DESC
    LIMIT 2
""")

# Execute the query and fetch the results
with engine.connect() as connection:
    result = connection.execute(query)
    rows = result.fetchall()

# Process the results and create custom documents
documents = []
for row in rows:
    content = f"""
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

    document = Document(page_content=content)
    documents.append(document)

# Split the documents into chunks
texts = text_splitter.split_documents(documents)

# Load guiding document for rugcheck
loader = PDFPlumberLoader("rugcheck.pdf")
pdf = loader.load_and_split()
chunks = text_splitter.split_documents(pdf)
texts.extend(chunks)

# Load the WhatIsARugPull Document
loader = TextLoader("whatisarugpull.txt")
whatisarugpull = loader.load_and_split()
chunks = text_splitter.split_documents(whatisarugpull)
texts.extend(chunks)

# Create the vector store
# vectorstore = Chroma.from_documents(texts, embedding, persist_directory=folder_path)
vectorstore = Chroma.from_documents(texts, embedding) #! [TEMP] no persist for development
        
@app.route("/check", methods=["POST"])
def checkPost():
    print("POST /check")
    json_content = request.json
    query = json_content.get("query")
    print(f"query: {query}")

    # Create a RetrievalQA instance
    qa = RetrievalQA.from_chain_type(
        llm=cached_llm,
        chain_type="stuff",
        retriever=vectorstore.as_retriever(),
        return_source_documents=True,
    )

    result = qa({"query": query})
    response = result["result"]
    print(response)
    response_answer = {"answer": response}

    # Fact check
    source_documents = result["source_documents"]
    sources = [
        {
            "page_content": doc.page_content,
            "metadata": doc.metadata,
        }
        for doc in source_documents
    ]
    for source in sources:
        print(source["page_content"].strip())
        print("---")

    return response_answer


@app.route("/ai", methods=["POST"])
def aiPost():
    print("POST /ai")
    json_content = request.json
    query = json_content.get("query")
    print(f"query: {query}")

    # Use the vector store to retrieve relevant documents
    docs = vectorstore.similarity_search(query)
    
    # Format the retrieved documents as context
    context = "\n".join([doc.page_content for doc in docs])

    prompt = raw_prompt.format(input=query, context=context)

    response = cached_llm.invoke(prompt)
    print(response)
    response_answer = {"answer": response}
    
    return response_answer


def start_app():
    app.run(host="0.0.0.0", port=8080, debug=True)

if __name__ == "__main__":
    start_app()