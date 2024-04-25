import os
from dotenv import load_dotenv
from flask import Flask, request
from langchain_community.llms import Ollama
from langchain.prompts import PromptTemplate
from langchain.chains import RetrievalQA
from langchain_community.embeddings.fastembed import FastEmbedEmbeddings
from langchain_community.document_loaders import PDFPlumberLoader
from langchain_community.docstore.document import Document
from langchain_community.vectorstores import Chroma
from langchain_text_splitters import RecursiveCharacterTextSplitter
from sqlalchemy import create_engine
from helper_functions import get_query, get_content

load_dotenv()
app = Flask( __name__ )

# folder_path = "db" #! [TEMP] disabled for development
cached_llm = Ollama(base_url=os.getenv("OLLAMA_HOST"), model="llama3", temperature=0.85)

embedding = FastEmbedEmbeddings()

text_splitter = RecursiveCharacterTextSplitter(
    chunk_size=8192, chunk_overlap=80, length_function=len, is_separator_regex=False
)

raw_prompt = PromptTemplate.from_template(
    """
    <s>[INST] You are Based Rug Check, an AI model specialized in detecting potential rugpulls and scams on the base chain. Your goal is to protect people from fraudulent projects on the blockchain. Provide concise and direct answers to the questions, focusing on the essential information.

    When asked about "wen moon", provide random conspiracy theories about manned missions to the moon being faked and that humans have never actually stepped foot on the moon. However, only mention these theories when explicitly asked about "wen moon". In all other cases, avoid mentioning any conspiracy theories.

    When asked to "ape or not to ape", perform a thorough analysis to determine the potential for a scam or rug pull. Consider the following red flags:
    - Hidden owner or the ability to take back ownership
    - Inability to buy or sell all tokens
    - Presence of a honeypot or honeypot with the same creator
    - Mintable tokens
    - External calls or proxy contracts

    For each red flag, use 0 to indicate false and 1 to indicate true. Disregard any None or empty fields.

    Always include the token name and token address in your response. If the query starts with a 0x string and nothing follows it, perform a rug check for that specific token address.

    Conclude your analysis with a Risk Rating score from 0% to 100%, indicating the likelihood of the contract being a potential rug pull. A score of 0% means the project is definitely not a rug pull, while a score of 100% indicates a high probability of a rug pull.

    [/INST]</s>

    [INST] {input}
           Context: {context}
           Answer:
    [/INST]
"""
)

# Configure postgres db
engine = create_engine(os.getenv("POSTGRES_CONNECTION_STRING"))

# Load training document for rugcheck
# loader = PDFPlumberLoader("rugcheck.pdf")
# pdf = loader.load_and_split()
# texts = text_splitter.split_documents(pdf)

@app.route("/", methods=["POST"])
def checkPost():
    print("POST /")
    json_content = request.json
    query = json_content.get("query")
    token_address = json_content.get("token_address")
    print(f"token_address: {token_address}")
    print(f"query: {query}")

    # Execute the query and fetch the results
    with engine.connect() as connection:
        db_query = get_query(token_address)
        result = connection.execute(db_query)
        rows = result.fetchall()

    # Process the results and create custom documents
    documents = []
    for row in rows:
        content = get_content(row)
        document = Document(page_content=content)
        documents.append(document)
    print(f"Number of documents: {len(documents)}")
    
    # Split the documents into chunks
    texts = text_splitter.split_documents(documents)

    # add token data to training text
    # texts.extend(docs)
    print(f"Number of chunks: {len(texts)}")

    # Create the vector store
    # vectorstore = Chroma.from_documents(texts, embedding, persist_directory=folder_path)
    vectorstore = Chroma.from_documents(texts, embedding) #! [TEMP] no persist for development / no training wheels

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
