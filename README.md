# Based Rug Chat - Encode AI Bootcamp Final Project 
## AI Rug Check on the Base Network
## By Brian Blank LMaGmf, Guy Cioffi 4KTBAl, Prasanna Malla nmv94F, Loren Adam n0e2ha

Visit Us on the Web at  https://basedrugchat.com/ .

## Project Summary
This project is an AI powered rug check on the base network. The AI assistant analyses token security api responses and compares to other token on chain data. 

## Project Purpose
Create a free easy to use tool to help traders determine if crypto projects are scams and use AI to provide more information than current tools.

## Sample Screenshot
Safe coin (def goin to moon)
![alt text](image-2.png)
Possible rug coin
![alt text](image-1.png)

## Getting Started

### Postgres database

The Postgres database is used to cache some data from the goPlusLabs.io webservice.  You can install Postgres from following the instructions and downloads avaialble on the Postgres website here: https://www.postgresql.org/download/ .  BasedRugChat was tested on Postgres version 16.2.  As an alternative option to installing locally, you can also run a cloud base solution here.  A free option that was tested with BasedRugChat can be found here: https://neon.tech/

After the database is installed, it is also optional for you install PGAdmin.  The included backups of the data and schema were generated using PGAdmin 4 v8.5.  You can download this tool from here: https://www.pgadmin.org/download/ .

After you are setup with the database, you can install the schema (and optionally the data) leveraging either of the provided backups in the db directory.

To refresh the data in the database from GoPlusLabs.io, simply visit this URL after you start the NextJS server in the instructions below.  Note that the webpage will take a long time to return as this is an expensive operation.

    http://localhost:3000/api/chat-openai   <TODO -- need to confirm this is the correct endpoint>

### Ollama with Llama 3 LLM

Next you will need to download and install Ollama from here: https://ollama.com/download .

After Ollama is installed, you can run the service interactively using the command:

```bash
export OLLAMA_HOST=0.0.0.0:11434
ollama serve
```

After ollama service is running, you can switch to a new terminal window and type the following commands to download and install the Llama 3 model.

```bash
ollama pull llama3
```

### App Service for Ollama

Next you need to run rag/app2.py interactively as a service which acts as a bridge between NextJS Server, Postgres Database, Ollama Service.  This service was tested using Python 3.11.  You can start the service as follows.  You only need to create the virtual environment and install requriements once.

```bash
python -m venv /path/to/new/virtual/environment     # <-- FIRST TIME ONLY
soruce /venv-path/bin/activate
cd rag
pip -r requirements.txt                             # <-- FIRST TIME ONLY
export OLLAMA_HOST="http://localhost:11434"
export POSTGRES_CONNECTION_STRING="postgresql://basedrugchat_owner:PASSWORD@POSTGRES-HOSTNAME/basedrugchat?sslmode=require"
python ./app2.py
```

### Run NextJS Server

Now you need to run the NextJS Node server interactively as shown below.  BasedRugChat was tested on Node v20.12.1.

In the root directory, first create a .env file with the credentials to the Postgres database as follows:

```bash
PGHOST=<HOSTNAME>
PGDATABASE=<DATABASE>
PGUSER=<USERNAME>
PGPASSWORD=<PASSWORD>
```

```bash
npm install         # <-- FIRST TIME ONLY
npm run dev
```

### Web Browser

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.


