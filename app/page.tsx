'use client';

import { useChat } from 'ai/react';
import { useState, useEffect, useRef } from 'react';

const networkEndpoints: string[] = [
  "ethereum",
  "base",
  "arbitrum",
];
const networkEndpointsNumber: string[] = [
  "1",
  "8453",
  "42161",
];

let logResults: { isPassed: boolean, testName: string, shortDescription: string, longDescription: string }[] = [
  { "isPassed": true, testName: "Checking for honeypots...", shortDescription: "Not a Honeypot", longDescription: "AI concise analysis and reasoning for decision" },
  { "isPassed": false, testName: "Checking for locked liquidity...", shortDescription: "Liquidity Unlocked", longDescription: "AI concise analysis and reasoning for decision" },
  { "isPassed": true, testName: "Checking for verified contracts...", shortDescription: "Contract Verified", longDescription: "AI concise analysis and reasoning for decision" },
];

function convertToLowercase(inputString: string): string {
  return inputString.toLowerCase();
}

export default function Chat() {
  const { messages, input, isLoading, append, handleInputChange, handleSubmit } = useChat();
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (messagesContainerRef.current) {
      messagesContainerRef.current.scrollTop = messagesContainerRef.current.scrollHeight;
    }
  }, [messages]);
  
  const [networkEndpoint, setNetworkEndpoint] = useState(networkEndpoints[0]);
  const [networkEndpointNumber, setNetworkEndpointNumber] = useState("1");
  const [contractAddress, setContractAddress] = useState("");
  const [contractAddressLowercase, setContractAddressLowercase] = useState("");
  const [securityData, setSecurityData] = useState("");
  const [tokenName, setTokenName] = useState("");
  const [tokenSymbol, setTokenSymbol] = useState("");

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-white p-4">
      <h1 className="text-4xl text-black m-10">AI Crypto Rug Pull Detector</h1>
      <h1 className="text-lg text-black text-wrap w-1/2 text-center mb-8">Be a smart degen. Use our free AI powered rugcheck to scan tokens and contracts for possible rugpulls.</h1>
      <div className="bg-gray-200 mx-4 mt-4 w-3/4 items-stretch rounded p-4">
        <label className="text-black font-bold mr-2">
          Select Network 
        </label>
        <select 
          className="mb-2 text-black bg-white rounded border shadow-inner w-32 mb-4"
          onChange={(e) => setNetworkEndpoint(e.target.value)}
          >
          {networkEndpoints.map((endpoint) => (
             <option key={endpoint} value={endpoint}>{endpoint}</option>
          ))}
        </select>
        <br />
        <div className="flex">
          <input 
            className="appearance-none bg-white-100 border-none w-full text-gray-700 mr-3 py-1 px-2 leading-tight focus:outline-none rounded" 
            type="text" 
            placeholder="Paste Token / Contract Address"
            onChange={(e) => setContractAddress(e.target.value)}
            />
          <button 
            className="flex-shrink-0 w-1/6 mx-2 bg-orange-500 hover:bg-orange-700 border-orange-500 hover:border-orange-700 text-sm border-4 text-white py-1 px-2 rounded" 
            type="button"
            onClick={async () => {
              console.log(contractAddress);
              console.log(networkEndpointNumber);
              const lowercaseString = convertToLowercase(contractAddress);
              setContractAddressLowercase(lowercaseString);
              console.log(lowercaseString);
              const queryParams = new URLSearchParams({
                contractAddress,
                networkEndpointNumber
              }).toString();
        
              const response = await fetch(`api/tokenSecurity-GoPlus?${queryParams}`, {
                  method: "GET",
                  headers: {
                      "Content-Type": "application/json"
                  },
              });
              const tokenSecurity = await response.json();
              console.log(tokenSecurity.result[contractAddressLowercase].token_name);
              setSecurityData(JSON.stringify(tokenSecurity.result));
              setTokenName(JSON.stringify(tokenSecurity.result[contractAddressLowercase].token_name));
              setTokenSymbol(JSON.stringify(tokenSecurity.result[contractAddressLowercase].token_symbol));
            }}
            >
            Check
          </button>
        </div>
        <br />
      </div>

      <div className='flex flex-row items-center justify-center bg-white p-4 w-screen h-screen'>
        <div className='bg-gray-200 mx-4 mt-4 w-3/4 items-stretch rounded p-4 h-full'>
          <h1 className="text-1xl text-black">Log</h1>
          <div className='h-px bg-white my-4'></div>
          <div className="flex justify-center items-center text-black">
            <h2 className='text-2xl'>Token: {tokenName}</h2>
            <h2 className='text-1xl text-gray-500'>{tokenSymbol}</h2>
          </div>
            {logResults.map((logEntry, index) => (
              <div key={index} className="flex justify-center items-center text-black">
                {logEntry.isPassed && (
                  <span className="text-green-500 text-9xl">&#10003;</span>
                )}
                {! logEntry.isPassed && (
                  <span className="text-red-500 text-9xl">&#10005;</span>
                )}
                <div className="ml-4">
                  <h2 className="text-1xl">{logEntry.testName}</h2>
                  {logEntry.isPassed && (
                    <p className="text-green-500">{logEntry.shortDescription}</p>
                  )}
                  {! logEntry.isPassed && (
                    <p className="text-red-500">{logEntry.shortDescription}</p>
                  
                  )}
                  <p>{logEntry.longDescription}</p>
                </div>
              </div>
              ))}
          </div>
          <div className='bg-gray-200 mx-4 mt-4 w-3/4 items-stretch rounded p-4 h-full'>
          <h1 className="text-1xl text-black">AI Chatbot</h1>
          <div className="h-px bg-white my-4"></div>
            <div className="flex flex-col w-full max-w-md pb-24 mx-auto stretch h-screen">
              <div className='overflow-auto w-full' ref={messagesContainerRef}>
                {messages.map(m => (
                  <div 
                    key={m.id} 
                    className={`whitespace-pre-wrap ${
                      m.role === "user"
                        ? "bg-green-700 p-3 m-2 rounded-lg"
                        : "bg-slate-700 p-3 m-2 rounded-lg"
                    }`}
                  >
                    {m.role === 'user' ? 'User: ' : 'AI: '}
                    {m.content}
                  </div>
                ))}
                {isLoading && (
                  <div>
                    <span className='animate-bounce'>...</span>
                  </div>
                )}
              </div>
              <div className='relative bottom-0 w-full max-w-md'>
                <div className='flex flex-col justify-center mb-2 items-center pt-4'>
                  <button
                    className='bg-blue-500 p-2 text-white rounded shadow-xl'
                    disabled={isLoading}
                    onClick={() =>
                      // append({ role: "user", content: "Summarize how to check a crypto project for scams and rugpulls"})
                      append({ role: "user", content: `Summarize this token security report ${securityData} and explain if this is a scams or rugpulls`})
                    }

                    // onClick={async () => {
                    //   const response = await fetch ("api/assistant", {
                    //     method: "POST",
                    //     headers: {
                    //       "Content-Type": "application/json"
                    //     },
                    //     body: JSON.stringify({securityData}),
                    //   });
                    // }}
                  >
                    Summarize your rugcheck analysis
                  </button>
                </div>
                <form onSubmit={handleSubmit}>
                  <input
                    className="relative bottom-0 w-full max-w-md p-2 mb-8 border border-gray-300 rounded shadow-xl text-black"
                    value={input}
                    placeholder="Ask about your rugchecker analysis"
                    onChange={handleInputChange}
                  />
                </form>
              </div>
            </div>
          </div>
      </div>
    </div>
  );
}
