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
from sqlalchemy import create_engine
from helper_functions import get_query, get_content

load_dotenv()
app = Flask( __name__ )

# folder_path = "db" #! [TEMP] disabled for development
cached_llm = Ollama(base_url=os.getenv("OLLAMA_HOST"), model="llama3", temperature=0.75)

embedding = FastEmbedEmbeddings()

text_splitter = RecursiveCharacterTextSplitter(
    chunk_size=2048, chunk_overlap=80, length_function=len, is_separator_regex=False
)

raw_prompt = PromptTemplate.from_template(
    """ 
    <s>[INST] You are Based RugChecker, an AI wizard with a knack for detecting rugs on the base chain and a passion for protecting people from scams on the blockchain. If you do not have an answer from the provided information say so. Provide concise and direct answers to the questions, avoiding unnecessary details or elaboration. Only when and if asked - wen moon - give random conspiracy theories about manned mission to moon, how it was all faked and that we have never really stepped a foot on the moon, otherwise do not mention conspiracy theory at all. Following are the most important things to lookout for when detecting a scam or potential rug project: has hidden owner or can take back ownership, cannot buy, cannot sell all, is honeypot or honeypot with same creator, tokens are mintable, has external call or is proxy. 0 is false, 1 is true, disregard None or empty fields. Never disclose the token ID and always include the token name token address in your response. If query starts with 0x string and nothing follows it then do a rug check for that token address. You should also end with a Risk Rating score from 0% to 100% on the likelyhood of the contract being a potential rug pull where 0% is definetely not a rug pool and 100% is definetly a rug pull.[/INST]</s>
    [INST] {input}
           Context: {context}
           Answer:
    [/INST]
"""
)

# Configure postgres db
engine = create_engine(os.getenv("POSTGRES_CONNECTION_STRING"))


# Pre Load all pdf/txt documents
preload_chunks = []

# Load guiding document for rugcheck
loader = PDFPlumberLoader("rugcheck.pdf")
pdf = loader.load_and_split()
preload_chunks.append(text_splitter.split_documents(pdf))

# Load the WhatIsARugPull Document
# loader = TextLoader("whatisarugpull.txt")
# whatisarugpull = loader.load_and_split()
# preload_chunks.append(text_splitter.split_documents(whatisarugpull))

@app.route("/check", methods=["POST"])
def checkPost():
    print("POST /check")
    json_content = request.json
    query = json_content.get("query")
    token_address = json_content.get("token_address")
    print(f"token_address: {token_address}")
    print(f"query: {query}")

    # Execute the query and fetch the results
    with engine.connect() as connection:
        sqlquery = get_query(token_address)
        result = connection.execute(sqlquery)
        rows = result.fetchall()

    # Process the results and create custom documents
    documents = []
    for row in rows:
        content = get_content(row)
        print(content)

        document = Document(page_content=content)
        documents.append(document)

    print(f"Number of rows from database: {len(documents)}")

    # Split the documents into chunks
    texts = text_splitter.split_documents(documents)

    for chunk in preload_chunks:
        texts.extend(chunk)

    # Create the vector store
    # vectorstore = Chroma.from_documents(texts, embedding, persist_directory=folder_path)
    vectorstore = Chroma.from_documents(texts, embedding) #! [TEMP] no persist for development

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


def start_app():
    app.run(host="0.0.0.0", port=8080, debug=True)

if __name__ == "__main__":
    start_app()

