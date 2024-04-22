'use client';

import Image from 'next/image'
import { useChat } from 'ai/react';
import { useState, useEffect, useRef } from 'react';

let logResults: { isPassed: boolean, testName: string, shortDescription: string, longDescription: string }[] = [
  { "isPassed": true, testName: "Checking for honeypots...", shortDescription: "Not a Honeypot", longDescription: "AI concise analysis and reasoning for decision" },
  { "isPassed": false, testName: "Checking for locked liquidity...", shortDescription: "Liquidity Unlocked", longDescription: "AI concise analysis and reasoning for decision" },
  { "isPassed": true, testName: "Checking for verified contracts...", shortDescription: "Contract Verified", longDescription: "AI concise analysis and reasoning for decision" },
];

export default function Chat() {
  const { messages, input, isLoading, append, handleInputChange, handleSubmit } = useChat();
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (messagesContainerRef.current) {
      messagesContainerRef.current.scrollTop = messagesContainerRef.current.scrollHeight;
    }
  }, [messages]);
  
  const [contractAddress, setContractAddress] = useState('');
  const [securityData, setSecurityData] = useState('');
  const [tokenName, setTokenName] = useState('');
  const [tokenSymbol, setTokenSymbol] = useState('');
  const [isDataLoading, setIsDataLoading] = useState(false);
  const networkId = '8453' // base chain

  return (
    <div className="relative flex flex-col items-center justify-center min-h-screen bg-white p-4">
      <div className='top-0 right-6 lg:absolute'>
        <Image className="-z-10 rounded-3xl" src="/logo.webp" alt="Logo" width={350} height={400}/>
      </div>
      <h1 className="text-4xl text-black m-10 text-center z-10"><a href='/'>BASED RUG CHAT</a><small className='text-sm block'>ai rug check on the base network</small></h1>
      <h1 className="text-lg text-black text-wrap w-1/2 text-center mb-8 capitalize">Be a smart degen <br />BasedRugChat kek skem</h1>
      <div className="bg-gray-200 mx-4 mt-4 w-2/4 items-stretch rounded p-4">
        <div className="flex pt-6 px-6">
          <input 
            className="appearance-none bg-white-100 border-none w-full text-gray-700 mr-3 py-1 px-2 leading-tight focus:outline-none rounded" 
            type="text" 
            placeholder="Token / Contract Address"
            onChange={(e) => setContractAddress(e.target.value.toLowerCase())}
            />
          <button 
            className="flex-shrink-0 w-1/6 mx-2 bg-yellow-400 hover:bg-yellow-500 border-yellow-400 hover:border-yellow-500 text-sm border-4 text-gray-900 hover:text-white py-1 px-2 rounded" 
            type="button"
            onClick={async () => {
              setIsDataLoading(true);
              const queryParams = new URLSearchParams({
                contractAddress,
                networkId
              }).toString();
        
              const response = await fetch(`api/tokenSecurity-GoPlus?${queryParams}`, {
                  method: "GET",
                  headers: {
                      "Content-Type": "application/json"
                  },
              });
              const tokenSecurity = await response.json();
              setSecurityData(JSON.stringify(tokenSecurity.result));
              setTokenName(JSON.stringify(tokenSecurity.result[contractAddress].token_name));
              setTokenSymbol(JSON.stringify(tokenSecurity.result[contractAddress].token_symbol));
              setIsDataLoading(false); 
            }}
            >
            Check
          </button>
        </div>
        <br />
      </div>

      <div className='flex flex-row items-center justify-center bg-white p-4 w-screen h-screen'>
        <div className='bg-gray-200 mx-4 mt-4 w-3/4 items-stretch rounded p-4 h-full'>
          <h1 className="text-1xl text-black">INFO</h1>
          <div className='h-px bg-white my-4'></div>
          {isDataLoading ? (
            <div className='w-full text-center'>
              <span className='text-gray-900 text-xl'>Loading...</span>
            </div>
          ) : tokenName !== '' ? (
            <>
              <div className="flex justify-center items-center text-black">
                <h2 className='text-2xl'>Analysis: {tokenName.replaceAll('"', '')} ({tokenSymbol.replaceAll('"', '')})</h2>
              </div>
              {logResults.map((logEntry, index) => (
                <div key={index} className="flex justify-center items-center text-black mt-9">
                  {logEntry.isPassed && (
                    <span className="text-green-500 text-xl">&#10003;</span>
                  )}
                  {!logEntry.isPassed && (
                    <span className="text-red-500 text-xl">&#10005;</span>
                  )}
                  <div className="ml-4">
                    <h2 className="text-1xl">{logEntry.testName}</h2>
                    {logEntry.isPassed && (
                      <p className="text-green-500">{logEntry.shortDescription}</p>
                    )}
                    {!logEntry.isPassed && (
                      <p className="text-red-500">{logEntry.shortDescription}</p>
                    )}
                    <p>{logEntry.longDescription}</p>
                  </div>
                </div>
              ))}
            </>
          ) : null}
        </div>

          <div className='bg-gray-200 mx-4 mt-4 w-3/4 items-stretch rounded p-4 h-full'>
          <h1 className="text-md text-black">BRC</h1>
          <div className="h-px bg-white my-4"></div>
            <div className="flex flex-col w-full max-w-md pb-24 mx-auto stretch h-screen">
              <div className='overflow-auto w-full' ref={messagesContainerRef}>
                {messages.map(m => (
                  <div 
                    key={m.id} 
                    className={`whitespace-pre-wrap text-gray-900 overflow-hidden ${
                      m.role === "user"
                        ? "bg-gray-300 p-3 m-2 rounded-lg"
                        : "p-3 m-2 rounded-lg"
                    }`}
                  >
                    {m.role === 'user' ? 'SmartDegen: ' : ''}
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
                <div className='flex flex-col justify-center mb-2 h-[4rem] items-center pt-4'>
                  <button
                    className='bg-gray-900 w-[22px] h-[22px] hover:w-auto hover:h-auto hover:py-2 hover:px-8 overflow-hidden text-white rounded-xl hover:rounded-md shadow-xl'
                    disabled={isLoading}
                    onClick={() =>
                      append({ role: "user", content: `Summarize this token security report ${securityData} and explain if this is a scam or a rugpull`})
                    }
                  >
                    To Ape Or Not To Ape
                  </button>
                </div>
                <form onSubmit={handleSubmit}>
                  <input
                    className="relative bottom-0 w-full max-w-md p-2 mb-8 border border-gray-300 rounded shadow-xl text-black"
                    value={input}
                    placeholder="Ask me anything but wen moon"
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
