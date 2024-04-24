'use client';

import Image from 'next/image'
import { useChat } from 'ai/react';
import { useState, useEffect, useRef } from 'react';

const networkEndpoints: { networkEndpointName:String, goPlusNetworkEndpointNumber: number}[] = [
  {networkEndpointName: "base",     goPlusNetworkEndpointNumber: 8453},
];

enum Check {
  Fail = -1,
  Warning = 0,
  Pass = 1,
  None = 2,
};

interface LogResult {
  check: Check;
  description: string;
  value: string;
  info: string;
};

interface Message { 
  role: string;
  content: string;
}

function analyzeTokenSecurity(tokenSecurity: any): LogResult[] {

  let logResults: LogResult[] = [ ];

  // Tax modifiable
  if(tokenSecurity.hasOwnProperty("slippage_modifiable") && tokenSecurity.slippage_modifiable !== null && tokenSecurity.slippage_modifiable !== "") {
    logResults.push({ 
      check: tokenSecurity.slippage_modifiable==="1" ? Check.Fail : Check.Pass, 
      description: "Tax Modifiable", 
      value: tokenSecurity.slippage_modifiable==="1" ? "Yes" : "No", 
      info: "The trading tax can be modifiable by the token contract." });
  }

  // Ownership Renouncable
  if(tokenSecurity.hasOwnProperty("can_take_back_ownership") && tokenSecurity.can_take_back_ownership !== null && tokenSecurity.can_take_back_ownership !== "") {
    logResults.push({ 
      check: tokenSecurity.can_take_back_ownership==="1" ? Check.Fail : Check.Pass, 
      description: "Ownership Renouncable", 
      value: tokenSecurity.can_take_back_ownership==="1" ? "Yes" : "No", 
      info: "Ownership is usually used to adjust the parameters and status of the contract, such as minting, modification of slippage, suspension of trading, setting blacklist, etc. When the contract's owner cannot be retrieved, is a black hole address, or does not have an owner, ownership-related functionality will most likely be disabled. These risky functions may be able to be reactivated if ownership is reclaimed." });
  }

  // Has whitelist?
  if(tokenSecurity.hasOwnProperty("is_whitelisted") && tokenSecurity.is_whitelisted !== null && tokenSecurity.is_whitelisted !== "") {
    logResults.push({ 
      check: tokenSecurity.is_whitelisted==="1" ? Check.Warning : Check.Pass, 
      description: "Has Whitelist Function", 
      value: tokenSecurity.can_take_back_ownership==="1" ? "Yes" : "No", 
      info: "It describes whether the whitelist function is not included in the contract. If there is a whitelist, some addresses may not be able to trade normally. '1' means true; '0' means false; No return means unknown.  Whitelisting is mostly used to allow specific addresses to make early transactions, tax-free, and not affected by transaction suspension.  For contracts without an owner (or the owner is a black hole address), the whitelist will not be able to get updated. However, the existing whitelist is still in effect.",
     });
  }

  // Buy Tax
  if(tokenSecurity.hasOwnProperty("buy_tax") && tokenSecurity.buy_tax !== null && tokenSecurity.buy_tax !== "") {
    logResults.push({ 
      check: tokenSecurity.buy_tax==="0" ? Check.Pass : (tokenSecurity.buy_tax==="1" ? Check.Fail : Check.Warning), 
      description: "Buy Tax", 
      value: `${Number(tokenSecurity.buy_tax) * 100.0}%`, 
      info: "When buying a token, a buy tax will cause the actual token value received to be less than the amount paid. An excessive buy tax may lead to heavy losses.  A buy_tax of '100%', or a 100% buy tax, will result in all purchase funds to go towards the tax. This results in a token that is effectively not able to be purchased.",
    });
  }

  // Sell Tax
  if(tokenSecurity.hasOwnProperty("sell_tax") && tokenSecurity.sell_tax !== null && tokenSecurity.sell_tax !== "") {
    logResults.push({ 
      check: tokenSecurity.sell_tax==="0" ? Check.Pass : (tokenSecurity.sell_tax==="1" ? Check.Fail : Check.Warning), 
      description: "Sell Tax", 
      value: `${Number(tokenSecurity.sell_tax) * 100.0}%`, 
      info: "Sell tax will cause the actual value received when selling a token to be less than expected, and too much buy tax may lead to large losses.  When sell_tax of 100%, it means sell-tax is 100% or this token cannot be sold.",
    });
  }

  // Hidden Owner
  if(tokenSecurity.hasOwnProperty("hidden_owner") && tokenSecurity.hidden_owner !== null && tokenSecurity.hidden_owner !== "") {
    logResults.push({ 
      check: tokenSecurity.hidden_owner==="1" ? Check.Fail : Check.Pass, 
      description: "Hidden Owner", 
      value: tokenSecurity.hidden_owner==="1" ? "Yes" : "No", 
      info: " Hidden ownership is used by developers to maintain ownership ability even after abandoning ownership, and is often an indicator of malicious intent. When a hidden owner exists, it is safe to assume that ownership has not been abandoned.",
    });
  }

  // Open Source
  if(tokenSecurity.hasOwnProperty("is_open_source") && tokenSecurity.is_open_source !== null && tokenSecurity.is_open_source !== "") {
    logResults.push({ 
      check: tokenSecurity.is_open_source==="1" ? Check.Pass : Check.Fail, 
      description: "Open Source", 
      value: tokenSecurity.is_open_source==="1" ? "Yes" : "No", 
      info: "Open-source contracts are transparent and can be verified by the community. Closed-source contracts may hide various unknown mechanisms and are extremely risky. When the contract is closed-source, other risk items will return null.",
    });
  }

  // Honeypot
  if(tokenSecurity.hasOwnProperty("is_honeypot") && tokenSecurity.is_honeypot !== null && tokenSecurity.is_honeypot !== "") {
    logResults.push({ 
      check: tokenSecurity.is_honeypot==="1" ? Check.Fail : Check.Pass, 
      description: "Honeypot", 
      value: tokenSecurity.is_honeypot==="1" ? "Yes" : "No", 
      info: "Honeypot means that the token maybe cannot be sold because of the token contract's function, or the token contains malicious code. High risk, definitely scam.",
    });
  }

  // Proxy Contract
  if(tokenSecurity.hasOwnProperty("is_proxy") && tokenSecurity.is_proxy !== null && tokenSecurity.is_proxy !== "") {
    logResults.push({ 
      check: tokenSecurity.is_proxy==="1" ? Check.Warning : Check.Pass, 
      description: "Proxy Contract", 
      value: tokenSecurity.is_proxy==="1" ? "Yes" : "No", 
      info: "Proxy contracts are often used to upgrade contracts. When the contract is a proxy, other risk items may not be returned. Most proxy contracts are accompanied by implementation contracts which are modifiable, potentially containing significant risk.",
    });
  }

  // Mint Function
  if(tokenSecurity.hasOwnProperty("is_mintable") && tokenSecurity.is_mintable !== null && tokenSecurity.is_mintable !== "") {
    logResults.push({ 
      check: tokenSecurity.is_mintable==="1" ? Check.Fail : Check.Pass, 
      description: "Mint Function", 
      value: tokenSecurity.is_mintable==="1" ? "Yes" : "No", 
      info: "Mint functions can trigger a massive sell-off, causing the coin price to plummet. It is an extremely risky function for a contract to have. This function generally relies on ownership. When the contract does not have an owner (or if the owner is a black hole address) and the owner cannot be retrieved.",
    });
  }

  // Transfer Pausable
  if(tokenSecurity.hasOwnProperty("transfer_pausable") && tokenSecurity.transfer_pausable !== null && tokenSecurity.transfer_pausable !== "") {
    logResults.push({ 
      check: tokenSecurity.transfer_pausable==="1" ? Check.Warning : Check.Pass, 
      description: "Pausable Transfer", 
      value: tokenSecurity.transfer_pausable==="1" ? "Yes" : "No", 
      info: "Pausable transfer means that the contract owner will be able to suspend trading at any time, after that anyone will not be able to sell, except those who have special authority. This function generally relies on ownership. When the contract does not have an owner (or if the owner is a black hole address) and the owner cannot be retrieved.",
    });
  }

  // Trading with CooldownTime	trading_cooldown	It describes whether the contract has a trading-cool-down mechanism that can limit the minimum time between two transactions. "1" means true; "0" means false; No return means unknown.	(1) When "is_open_source": "0", there will be no return.
	//		(2) Sometimes, when "is_proxy": "1", there will be no return.
  if(tokenSecurity.hasOwnProperty("trading_cooldown") && tokenSecurity.trading_cooldown !== null && tokenSecurity.trading_cooldown !== "") {
    logResults.push({ 
      check: tokenSecurity.trading_cooldown==="1" ? Check.Warning : Check.Pass, 
      description: "Trading with Cooldown Time", 
      value: tokenSecurity.trading_cooldown==="1" ? "Yes" : "No", 
      info: "Trading with cooldown time means that the contract has a trading-cool-down mechanism that can limit the minimum time between two transactions. This function generally relies on ownership. When the contract does not have an owner (or if the owner is a black hole address) and the owner cannot be retrieved.",
    });
  }

  // Cannot Sell All	cannot_sell_all	It describes whether the contract has the function restricting the token holders from selling all the tokens. "1" means true; "0" means false; No return means unknown.	(1) When "is_in_dex": "0", there will be no return.
	//		(2) This feature means that you will not be able to sell all your tokens in a single sale. Sometimes you need to leave a certain percentage of the token, e.g. 10%, sometimes you need to leave a fixed number of tokens, such as 10 tokens.
	//		(3) When "buy_tax": "1", there will be no return.
  if(tokenSecurity.hasOwnProperty("cannot_sell_all") && tokenSecurity.cannot_sell_all !== null && tokenSecurity.cannot_sell_all !== "") {
    logResults.push({ 
      check: tokenSecurity.cannot_sell_all==="1" ? Check.Warning : Check.Pass, 
      description: "Cannot Sell All", 
      value: tokenSecurity.cannot_sell_all==="1" ? "Yes" : "No", 
      info: "Cannot sell all means that the contract has the function restricting the token holders from selling all the tokens. This feature means that you will not be able to sell all your tokens in a single sale. Sometimes you need to leave a certain percentage of the token, e.g. 10%, sometimes you need to leave a fixed number of tokens, such as 10 tokens.",
    });
  }

  // Owner Can Change Balance	owner_change_balance	Returns "1" if the contract owner can change token holder balances; "0" if it cannot. Will not be returned if reclamation data is unknown.	(1) Will not be returned if "is_open_source" is 0.
	//		(2) May not be returned if "is_proxy" is 1.
	//		(3) Tokens with this feature allow the owner to modify anyone's balance, resulting in a holder's asset to be changed (i.e. to 0) or a massive minting and sell-off.
	//		(4) This function generally relies on ownership. When the contract's owner cannot be retrieved, is a black hole address, or does not have an owner, ownership-related functionality will most likely be disabled.
  if(tokenSecurity.hasOwnProperty("owner_change_balance") && tokenSecurity.owner_change_balance !== null && tokenSecurity.owner_change_balance !== "") {
    logResults.push({ 
      check: tokenSecurity.owner_change_balance==="1" ? Check.Fail : Check.Pass, 
      description: "Owner Can Change Balance", 
      value: tokenSecurity.owner_change_balance==="1" ? "Yes" : "No", 
      info: "Owner can change balance means that the contract owner can change token holder balances. Tokens with this feature allow the owner to modify anyone's balance, resulting in a holder's asset to be changed (i.e. to 0) or a massive minting and sell-off. This function generally relies on ownership. When the contract's owner cannot be retrieved, is a black hole address, or does not have an owner, ownership-related functionality will most likely be disabled.",
    });
  }

  // Blacklist	is_blacklisted	It describes whether the blacklist function is not included in the contract. If there is a blacklist, some addresses may not be able to trade normally. "1" means true; "0" means false; No return means unknown.	(1) When "is_open_source": "0", there will be no return.
	//		(2) Sometimes, when "is_proxy": "1", there will be no return.
	//		(3) The contract owner may add any address to the blacklist, and the token holder in the blacklist will not be able to trade. Abuse of the blacklist function will lead to great risks.
	//		(4) For contracts without an owner (or the owner is a black hole address), the blacklist will not be able to get updated. However, the existing blacklist is still in effect.
  if(tokenSecurity.hasOwnProperty("is_blacklisted") && tokenSecurity.is_blacklisted !== null && tokenSecurity.is_blacklisted !== "") {
    logResults.push({ 
      check: tokenSecurity.is_blacklisted==="1" ? Check.Warning : Check.Pass, 
      description: "Has Blacklist Function", 
      value: tokenSecurity.is_blacklisted==="1" ? "Yes" : "No", 
      info: "Blacklist means that the blacklist function is not included in the contract. If there is a blacklist, some addresses may not be able to trade normally. The contract owner may add any address to the blacklist, and the token holder in the blacklist will not be able to trade. Abuse of the blacklist function will lead to great risks. For contracts without an owner (or the owner is a black hole address), the blacklist will not be able to get updated. However, the existing blacklist is still in effect.",
    });
  }

  // Anti Whale	is_anti_whale	It describes whether the contract has the function to limit the maximum amount of transactions or the maximum token position for a single address. "1" means true; "0" means false; No return means unknown.	(1) When "is_open_source": "0", there will be no return.
	//		(2) Sometimes, when "is_proxy": "1", there will be no return.
  if(tokenSecurity.hasOwnProperty("is_anti_whale") && tokenSecurity.is_anti_whale !== null && tokenSecurity.is_anti_whale !== "") {
    logResults.push({ 
      check: tokenSecurity.is_anti_whale==="1" ? Check.Warning : Check.Pass, 
      description: "Is Anti Whale", 
      value: tokenSecurity.is_anti_whale==="1" ? "Yes" : "No", 
      info: "Anti whale means that the contract has the function to limit the maximum amount of transactions or the maximum token position for a single address. This function generally relies on ownership. When the contract does not have an owner (or if the owner is a black hole address) and the owner cannot be retrieved.",
    });
  }

  // Token holder number	holder_count	It describes the number of token holders. Example:"holder_count": "4342"
  if(tokenSecurity.hasOwnProperty("holder_count") && tokenSecurity.holder_count !== null && tokenSecurity.holder_count !== "") {
    logResults.push({ 
      check: Number(tokenSecurity.holder_count) > 1000 ? Check.Pass : Check.Warning, 
      description: "Token Holder Number", 
      value: tokenSecurity.holder_count, 
      info: "The number of token holders. A large number of token holders may indicate a more decentralized distribution of tokens, which is generally considered a positive sign. However, a large number of token holders may also indicate a high risk of a rug pull.",
    });
  }

  // LP token holder number	lp_holder_count	It describes the number of LP token holders.	When "is_in_dex": "0", there will be no return.
	// 	Example: "lp_holder_count": "4342".	
	//	No return means no LP.	
  if(tokenSecurity.hasOwnProperty("lp_holder_count") && tokenSecurity.lp_holder_count !== null && tokenSecurity.lp_holder_count !== "") {
    logResults.push({ 
      check: Number(tokenSecurity.lp_holder_count) > 1000 ? Check.Pass : Check.Warning, 
      description: "LP Token Holder Number", 
      value: tokenSecurity.lp_holder_count, 
      info: "The number of LP token holders. A large number of LP token holders may indicate a more decentralized distribution of tokens, which is generally considered a positive sign. However, a large number of LP token holders may also indicate a high risk of a rug pull.",
    });
  }

  // Creator Address	creator_address	It describes this contract's owner address.
  if(tokenSecurity.hasOwnProperty("creator_address") && tokenSecurity.creator_address !== null && tokenSecurity.creator_address !== "") {
    logResults.push({ 
      check: Check.None, 
      description: "Creator Address", 
      value: `${tokenSecurity.creator_address.slice(0, 6)}...${tokenSecurity.creator_address.slice(-4)}`, 
      info: "It describes this contract's owner address.",
    });
  }

  // Creator Balance	creator_balance	It describes the balance of the contract owner. Example:"owner_balance": 100000000.
  if(tokenSecurity.hasOwnProperty("creator_balance") && tokenSecurity.creator_balance !== null && tokenSecurity.creator_balance !== "") {
    logResults.push({ 
      check: Check.None, 
      description: "Creator Balance", 
      value: Number(tokenSecurity.creator_balance).toLocaleString(), 
      info: "It describes the balance of the contract owner.",
    });
  }

  // Owner Address	owner_address	This contract's owner address. No value will be returned if the owner address is unknown. An empty sting will be returned if the contract has no owner.	(1) Will not be returned if "is_open_source" is 0.
	//		(2) May not be returned if "is_proxy" is 1.
	//		(3) Ownership is usually used to adjust the parameters and status of the contract, such as minting, modification of slippage, suspension of trading, setting blacklist, etc. When the contract's owner cannot be retrieved, is a black hole address, or does not have an owner, ownership-related functionality will most likely be disabled.
  if(tokenSecurity.hasOwnProperty("owner_address") && tokenSecurity.owner_address !== null && tokenSecurity.owner_address !== "") {
    logResults.push({ 
      check: Check.None, 
      description: "Owner Address", 
      value: `${tokenSecurity.owner_address.slice(0, 6)}...${tokenSecurity.owner_address.slice(-4)}`, 
      info: "This contract's owner address. No value will be returned if the owner address is unknown. An empty sting will be returned if the contract has no owner.",
    });
  }

  // Owner Balance	owner_balance	It describes the balance of the contract owner.	When "owner_address" returns empty, or no return, there will be no return.
  if(tokenSecurity.hasOwnProperty("owner_balance") && tokenSecurity.owner_balance !== null && tokenSecurity.owner_balance !== "") {
    logResults.push({ 
      check: Check.None, 
      description: "Owner Balance", 
      value: Number(tokenSecurity.owner_balance).toLocaleString(), 
      info: "It describes the balance of the contract owner.",
    });
  }

  return logResults;
}

export default function Chat() {
  const [networkEndpointName, setNetworkEndpointName] = useState(networkEndpoints[0].networkEndpointName);
  const [goPlusNetworkEndpointNumber, setGoPlusNetworkEndpointNumber] = useState(networkEndpoints[0].goPlusNetworkEndpointNumber);
  const [contractAddress, setContractAddress] = useState("");
  const [userQuery, setUserQuery] = useState("");
  const [securityData, setSecurityData] = useState("");
  const [tokenName, setTokenName] = useState("");
  const [tokenSymbol, setTokenSymbol] = useState("");
  const [logResults, setLogResults] = useState<LogResult[]>([]);
  const [isDataLoading, setIsDataLoading] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);

  return (
  <div className="relative flex flex-col items-center justify-center min-h-screen bg-[#00325a] rounded p-4 pb-0">
  <div className='w-full flex justify-center'>
    <Image className="rounded-3xl" src="/logo.webp" alt="Logo" width={350} height={400}/>
  </div>
  <h1 className="text-lg text-[#ffbe1e] text-wrap w-1/2 text-center mb-8">ai rug check on the base network</h1>
  <div className="bg-gradient-to-r from-[#014570] to-[#1ff3d4] mx-4 mt-4 w-2/4 items-stretch rounded-lg p-4 border-white border-4">
    <div className="flex pt-6 px-6">
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
        className="flex-shrink-0 w-1/6 mx-2 bg-yellow-400 hover:bg-yellow-500 border-yellow-400 hover:border-yellow-500 text-sm border-4 text-gray-900 hover:text-white py-1 px-2 rounded" 
        type="button"
        onClick={async () => {
          setIsDataLoading(true);
          setTokenName("");
          setTokenSymbol("");
          setMessages([]);
          setLogResults([]);
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

            const query = `What is the likelyhood of ${contractAddress} being a rug pull?`;
            const queryParams = new URLSearchParams({
              query: query,
              token_address: contractAddress,
            }).toString();
      
            const response = await fetch(`api/chat-ollama?${queryParams}`, {
                method: "GET",
                headers: {
                    "Content-Type": "application/json"
                },
            });
  
            const ai_response = await response.json();
            console.log(ai_response); 
            const answer = ai_response.answer;
            const messages = [];
            messages.push({ role: 'user', content: query});
            messages.push({ role: 'ai', content: answer});
            setMessages(messages);
          }
          setIsDataLoading(false); 
        }}
        >
        Check
      </button>
    </div>
    <br />
  </div>

  <div className='flex flex-row items-center justify-center bg-gradient-to-b from-[#00325a] to-[#1ff3d4] p-4 pb-10 w-screen h-screen'>
    <div className='bg-gradient-to-r from-[#014570] to-[#00325a] mx-4 mt-4 w-1/4 items-stretch rounded-lg border-white border-4 p-4 h-full'>
           <h1 className="text-1xl text-white">GoPlus INFO (Heuristic Based Analysis) </h1>
           <div className='h-px bg-white my-4'></div>
           <div className="flex justify-center items-center text-white">
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
             {logResults.sort((a, b) => {
                 if (a.check !== b.check) {
                   return a.check - b.check;
                 }
                 return a.description.localeCompare(b.description);
               }).map((logEntry, index) => (
               <div key={index} className="flex justify-between items-center text-white">
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
                 { (logEntry.check === Check.Pass || logEntry.check === Check.None) && (
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
      <div className='bg-gradient-to-l from-[#014570] to-[#00325a] mx-4 mt-4 w-3/4 items-stretch rounded-lg border-white border-4 p-4 h-full'>
      <h1 className="text-md text-white">Analysis from Llama3 Chatbot</h1>
      <div className="h-px bg-white my-4"></div>
        <div className="flex flex-col w-full pb-24 mx-auto stretch h-screen">
          <div className='overflow-auto w-full'>
            {messages.map((m, idx) => (
              <div 
                key={idx} 
                className={`whitespace-pre-wrap text-gray-900 overflow-hidden ${
                  m.role === "user"
                    ? "bg-gray-300 p-3 m-2 rounded-lg w-full"
                    : "bg-teal-100 p-3 m-2 rounded-lg w-full"
                }`}
              >
                {m.role === 'user' ? 'User: ' : 'AI: '}
                {m.content}
              </div>
            ))}
            {isDataLoading && (
              <div>
                <span className='animate-bounce'>...</span>
                <Image className="rounded-3xl" src="/loading.gif" alt="Logo" width={250} height={200}/>
              </div>
            )}

          </div>
          {logResults.length > 0 && (
          <div className="bg-gradient-to-r from-[#014570] to-[#1ff3d4] mx-4 mt-4 w-2/4 items-stretch rounded-lg p-4 border-white border-4">
            <div className="flex pt-6 px-6">
              <input 
                className="appearance-none bg-white-100 border-none w-full text-gray-700 mr-3 py-1 px-2 leading-tight focus:outline-none rounded" 
                name="userQuery"
                type="text" 
                placeholder="Ask a question about the contract"
                value={userQuery}
                onChange={(e) => {
                  setUserQuery(e.target.value);
                }}
                />
              <button 
                className="flex-shrink-0 w-1/6 mx-2 bg-yellow-400 hover:bg-yellow-500 border-yellow-400 hover:border-yellow-500 text-sm border-4 text-gray-900 hover:text-white py-1 px-2 rounded" 
                type="button"
                onClick={async () => {
                  setIsDataLoading(true);

                  const query = `${userQuery}`;
                  const queryParams = new URLSearchParams({
                    query: query,
                    token_address: contractAddress,
                  }).toString();
              
                  const response = await fetch(`api/chat-ollama?${queryParams}`, {
                      method: "GET",
                      headers: {
                          "Content-Type": "application/json"
                      },
                  });
          
                  const ai_response = await response.json();
                  console.log(ai_response); 
                  const answer = ai_response.answer;
                  messages.push({ role: 'user', content: query});
                  messages.push({ role: 'ai', content: answer});
                  setMessages(messages);
                  setIsDataLoading(false); 
                }}
                >
                Ask
              </button>
            </div>
          </div>
          )}
        </div>
      </div>
  </div>
</div>
);
}
