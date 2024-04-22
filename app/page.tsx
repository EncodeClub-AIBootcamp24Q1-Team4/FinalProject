'use client';

import { useChat } from 'ai/react';
import { useState, useEffect, useRef } from 'react';

const networkEndpoints: { networkEndpointName:String, goPlusNetworkEndpointNumber: number}[] = [
  {networkEndpointName: "ethereum", goPlusNetworkEndpointNumber: 1},
  {networkEndpointName: "base",     goPlusNetworkEndpointNumber: 8453},
  {networkEndpointName: "arbitrum", goPlusNetworkEndpointNumber: 42161},
];

enum Check {
  Warning = -1,
  Fail = 0,
  Pass = 1,
};

interface LogResult {
  check: Check;
  description: string;
  value: string;
  info: string;
};

function analyzeTokenSecurity(tokenSecurity: any): LogResult[] {

  let logResults: LogResult[] = [ ];

  // Tax modifiable
  if(tokenSecurity.hasOwnProperty("slippage_modifiable")) {
    logResults.push({ 
      check: tokenSecurity.slippage_modifiable==="1" ? Check.Fail : Check.Pass, 
      description: "Tax Modifiable", 
      value: tokenSecurity.slippage_modifiable==="1" ? "Yes" : "No", 
      info: "The trading tax can be modifiable by the token contract." });
  }

  // Ownership Renouncable
  if(tokenSecurity.hasOwnProperty("can_take_back_ownership")) {
    logResults.push({ 
      check: tokenSecurity.can_take_back_ownership==="1" ? Check.Fail : Check.Pass, 
      description: "Ownership Renouncable", 
      value: tokenSecurity.can_take_back_ownership==="1" ? "Yes" : "No", 
      info: "Ownership is usually used to adjust the parameters and status of the contract, such as minting, modification of slippage, suspension of trading, setting blacklist, etc. When the contract's owner cannot be retrieved, is a black hole address, or does not have an owner, ownership-related functionality will most likely be disabled. These risky functions may be able to be reactivated if ownership is reclaimed." });
  }

  // Has whitelist?
  if(tokenSecurity.hasOwnProperty("is_whitelisted")) {
    logResults.push({ 
      check: tokenSecurity.is_whitelisted==="1" ? Check.Warning : Check.Pass, 
      description: "Has Whitelist Function", 
      value: tokenSecurity.can_take_back_ownership==="1" ? "Yes" : "No", 
      info: "It describes whether the whitelist function is not included in the contract. If there is a whitelist, some addresses may not be able to trade normally. '1' means true; '0' means false; No return means unknown.  Whitelisting is mostly used to allow specific addresses to make early transactions, tax-free, and not affected by transaction suspension.  For contracts without an owner (or the owner is a black hole address), the whitelist will not be able to get updated. However, the existing whitelist is still in effect.",
     });
  }

  
  return logResults;
}

export default function Chat() {
  const { messages, input, isLoading, append, handleInputChange, handleSubmit } = useChat();
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (messagesContainerRef.current) {
      messagesContainerRef.current.scrollTop = messagesContainerRef.current.scrollHeight;
    }
  }, [messages]);
  
  const [networkEndpointName, setNetworkEndpointName] = useState(networkEndpoints[0].networkEndpointName);
  const [goPlusNetworkEndpointNumber, setGoPlusNetworkEndpointNumber] = useState(networkEndpoints[0].goPlusNetworkEndpointNumber);
  const [contractAddress, setContractAddress] = useState("");
  const [securityData, setSecurityData] = useState("");
  const [tokenName, setTokenName] = useState("");
  const [tokenSymbol, setTokenSymbol] = useState("");
  const [logResults, setLogResults] = useState<LogEntry[]>([]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-white p-4">
      <h1 className="text-4xl text-black m-10">AI Crypto Rug Pull Detector</h1>
      <h1 className="text-lg text-black text-wrap w-1/2 text-center mb-8">Be a smart degen. Use our free AI powered rugcheck to scan tokens and contracts for possible rugpulls.</h1>
      <div className="bg-gray-200 mx-4 mt-4 w-3/4 items-stretch rounded p-4">
        <label className="text-black font-bold mr-2">
          Select Network 
          <select 
            name="networkEndpointName"
            className="mb-2 text-black bg-white rounded border shadow-inner w-32 mb-4"
            onChange={(e) => {
              setNetworkEndpointName(networkEndpoints[Number(e.target.value)].networkEndpointName);
              setGoPlusNetworkEndpointNumber(networkEndpoints[Number(e.target.value)].goPlusNetworkEndpointNumber);
            }}
            >
            {networkEndpoints.map((endpoint, index) => (
              <option key={index} value={index}>{endpoint.networkEndpointName}</option>
            ))}
          </select>
        </label>
        <br />
        <div className="flex">
          <input 
            className="appearance-none bg-white-100 border-none w-full text-gray-700 mr-3 py-1 px-2 leading-tight focus:outline-none rounded" 
            name="contractAddress"
            type="text" 
            placeholder="Paste Token / Contract Address"
            value={contractAddress}
            onChange={(e) => {
              const hexRegex = /^(0x)?[0-9a-fA-F]*$/;
              if (hexRegex.test(e.target.value)) {
                if(e.target.value.length > 2 && e.target.value.substring(0, 2) !== "0x") {
                  setContractAddress("0x" + e.target.value.toLowerCase());
                } else {
                  setContractAddress(e.target.value.toLowerCase());
                }
              }
            }}
            />
          <button 
            className="flex-shrink-0 w-1/6 mx-2 bg-orange-500 hover:bg-orange-700 border-orange-500 hover:border-orange-700 text-sm border-4 text-white py-1 px-2 rounded" 
            type="button"
            onClick={async () => {
              console.log(contractAddress);
              console.log(goPlusNetworkEndpointNumber);
              const queryParams = new URLSearchParams({
                contractAddress,
                goPlusNetworkEndpointNumber: String(goPlusNetworkEndpointNumber)
              }).toString();

              const response = await fetch(`api/tokenSecurity-GoPlus?${queryParams}`, {
                method: "GET",
                headers: {
                  "Content-Type": "application/json"
                },
              });
              const tokenSecurity = await response.json();
              console.log(tokenSecurity); 
              if (tokenSecurity.result[contractAddress] === undefined) {
                setTokenName("CONTRACT NOT FOUND");
                setTokenSymbol("");
                setLogResults([]);
              } else {
                setSecurityData(JSON.stringify(tokenSecurity.result[contractAddress]));
                setTokenName(tokenSecurity.result[contractAddress].token_name);
                setTokenSymbol(tokenSecurity.result[contractAddress].token_symbol);
                console.log(tokenSecurity.result[contractAddress].slippage_modifiable);
                setLogResults(analyzeTokenSecurity(tokenSecurity.result[contractAddress]));
                console.log(analyzeTokenSecurity(logResults));
              }
            }}
            >
            Check
          </button>
        </div>
        <br />
      </div>

      <div className='flex flex-row items-center justify-center bg-white p-4 w-screen h-screen'>
        <div className='bg-gray-200 mx-4 mt-4 w-1/4 items-stretch rounded p-4 h-full'>
          <h1 className="text-1xl text-black">Log</h1>
          <div className='h-px bg-white my-4'></div>
          <div className="flex justify-center items-center text-black">
            {tokenSymbol.length > 0 && 
              <h2 className='text-2xl'>Token: {tokenName}</h2>
            }
            {tokenSymbol.length == 0 && 
              <h2 className='text-2xl text-red-500'>{tokenName}</h2>
            }
            {tokenSymbol.length > 0 && tokenName !== tokenSymbol &&
              <h2 className='text-2xl text-gray-500'> (Symbol: {tokenSymbol})</h2>
            }
          </div>
            {logResults.map((logEntry, index) => (
              <div key={index} className="flex justify-between items-center text-black">
                <div className="flex items-center">
                  {logEntry.check === Check.Pass && (
                    <span className="text-green-500 font-bold">&#10003;</span>
                  )}
                  {logEntry.check === Check.Fail && (
                    <span className="text-red-500 font-bold">&#10005;</span>
                  )}
                  {logEntry.check === Check.Warning && (
                    <span className="text-amber-500 font-bold">&#10005;</span>
                  )}
                  <div className="ml-2 bg-blue-500 text-white rounded-full w-5 h-5 flex items-center justify-center cursor-pointer" title={logEntry.info}>i</div>
                  <h2 className="text-1xl">{logEntry.description}</h2>
                </div>
                {logEntry.check === Check.Pass && (
                  <h2 className="text-1xl text-green-500">{logEntry.value}</h2>
                )}
                {logEntry.check === Check.Fail && (
                  <h2 className="text-1xl text-red-500">&#9888; {logEntry.value}</h2>
                )}
                {logEntry.check === Check.Warning && (
                  <h2 className="text-1xl text-amber-500">&#9888; {logEntry.value}</h2>
                )}
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
                    name="input"
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
