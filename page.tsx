'use client';
 
import { useState } from 'react';

const networkEndpoints: string[] = [
  "eth",
  "base",
  "arbitrum",
];

let logResults: { isPassed: boolean, testName: string, shortDescription: string, longDescription: string }[] = [
  { "isPassed": true, testName: "Checking for honeypots...", shortDescription: "Not a Honeypot", longDescription: "AI concise analysis and reasoning for decision" },
  { "isPassed": false, testName: "Checking for locked liquidity...", shortDescription: "Liquidity Unlocked", longDescription: "AI concise analysis and reasoning for decision" },
  { "isPassed": true, testName: "Checking for verified contracts...", shortDescription: "Contract Verified", longDescription: "AI concise analysis and reasoning for decision" },
];

export default function Chat() {

  const [networkEndpoint, setNetworkEndpoint] = useState(networkEndpoints[0]);
  const [contractAddress, setContractAddress] = useState("");
  const [prompt, setPrompt] = useState("");

  return (
    <div className="bg-white mx-4 w-full h-screen items-stretch">
      <h1 className="text-4xl text-black">AI Crypto Rug Pull Detector</h1>

      <div className="bg-gray-200 mx-4 mt-4 w-1/4 items-stretch rounded">
        <label className="text-black font-bold mr-2 ">
          Select Network 
        </label>
        <select 
          className="mb-2 text-black bg-white rounded border shadow-inner w-32"
          onChange={(e) => setNetworkEndpoint(e.target.value)}
          >
          {networkEndpoints.map((endpoint) => (
             <option key={endpoint} value={endpoint}>{endpoint}</option>
          ))}
        </select>
        <br />
        <div className="flex">
          <input 
            className="appearance-none bg-white-100 border-none mx-2 w-full text-gray-700 mr-3 py-1 px-2 leading-tight focus:outline-none" 
            type="text" 
            placeholder="Paste Token / Contract Address"
            onChange={(e) => setContractAddress(e.target.value)}
            />
          <button 
            className="flex-shrink-0 mx-2 bg-orange-500 hover:bg-orange-700 border-orange-500 hover:border-orange-700 text-sm border-4 text-white py-1 px-2 rounded" 
            type="button"
            >
            Check
          </button>
        </div>
        <br />
      </div>

      <div className="bg-gray-200 mx-4 mt-4 w-1/4 items-stretch rounded">
      <h1 className="text-1xl">Log</h1>
      <div className="h-px bg-white my-4"></div>
        {logResults.map((logEntry) => (
          <div className="flex justify-center items-center">
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

      <div className="bg-gray-200 mx-4 mt-4 w-1/4 items-stretch rounded">
        <h1 className="text-1xl">AI Chatbot</h1>
        <div className="h-px bg-white my-4"></div>
        <p> TODO - Prompts and Responses go here</p>
        <br />
        <div className="flex">
          <input 
            className="appearance-none bg-white-100 border-none mx-2 w-full text-gray-700 mr-3 py-1 px-2 leading-tight focus:outline-none" 
            type="text" 
            placeholder="Ask AI about token analysis"
            onChange={(e) => setContractAddress(e.target.value)}
            />
          <button 
            className="flex-shrink-0 mx-2 bg-orange-500 hover:bg-orange-700 border-orange-500 hover:border-orange-700 text-sm border-4 text-white py-1 px-2 rounded" 
            type="button"
            >
            Send
          </button>
        </div>
        <br />
      </div>

    </div>
  );
}
