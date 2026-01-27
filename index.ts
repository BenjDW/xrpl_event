// Main entry point for the XRPL demo.
// This script:
// 1. Connects to XRPL Testnet
// 2. Enables rippling on the issuer account
// 3. (Optionally) mints a token
// 4. Creates an AMM pool for the token/XRP pair
// 5. Prints balances and disconnects
import xrpl  from "xrpl"
import { createToken } from "./createToken";
import { createAMM } from "./createAMM";
import { convertStringToHexPadded, enableRippling } from "./utils";

// Create a WebSocket client pointed at the XRPL Testnet
const client = new xrpl.Client("wss://s.altnet.rippletest.net:51233")

// Seed phrases for the issuer and receiver wallets (Testnet only!)
const issuerseed = "sEdTSKwqfyd8jVV7pEQaJTdV2P5q3fb";
const receiverseed = "sEd7XeHtrLNeqsCi3s6GydNckMmUC32";

// Construct wallet objects from the seeds
const issuer = xrpl.Wallet.fromSeed(issuerseed);
const receiver = xrpl.Wallet.fromSeed(receiverseed);

// Human‑readable token code that we will convert to hex
const tokenCode = "bde"

// Top‑level async workflow
const main = async () => {
  console.log("lets get started...");

  // 1) Connect to the XRPL Testnet
  await client.connect();

  // Example: If you wanted to fund two brand‑new test wallets,
  // you could use `client.fundWallet()` as shown below.
  // (Kept commented so the current flow uses fixed issuer/receiver.)
  //   console.log('lets fund 2 accounts...')
  //   const { wallet: wallet1, balance: balance1 } = await client.fundWallet();
  //   const { wallet: wallet2, balance: balance2 } = await client.fundWallet();

  // 2) Enable default rippling on the issuer account
  await enableRippling({ wallet: issuer, client });

  // 3) (Optional) Mint and distribute a custom token from issuer to receiver
  //    This is currently commented out; uncomment if you want to mint first.
  // await createToken({ 
  //   issuer, 
  //   receiver, 
  //   client, 
  //   tokenCode: convertStringToHexPadded(tokenCode)
  // });

  // console.log('wallet1', issuer)
  // console.log('wallet2', receiver)

  // console.log({ 
  //   'balance1': await client.getBalances(issuer.classicAddress), 
  //   'balance2': await client.getBalances(receiver.classicAddress), 
  // });

  // 4) Create an Automated Market Maker (AMM) for (token, XRP)
  //    We convert the short token code into the fixed‑length hex format.
  await createAMM({
    issuer,
    receiver,
    client,
    tokenCode: convertStringToHexPadded(tokenCode),
  });

  // Example payment flow (kept as a commented reference).
  // It shows how to send XRP from one wallet to another.
  //   const tx:xrpl.Payment  = {
  //     TransactionType: "Payment",
  //     Account: wallet1.classicAddress,
  //     Destination: wallet2.classicAddress,
  //     Amount: xrpl.xrpToDrops("13")
  //   };
  //   console.log('submitting the payment transaction... ', tx)
  //   const result = await client.submitAndWait(tx, {
  //     autofill: true,
  //     wallet: wallet1,
  //   }); 
  //   console.log(result)

  // 5) Print the final balances for both accounts
  console.log({
    'balance 1': await client.getBalances(issuer.classicAddress), 
    'balance 2': await client.getBalances(receiver.classicAddress)
  })

  // 6) Disconnect cleanly from the Testnet
  await client.disconnect();
  console.log("all done!");
};

// Kick off the async main function
main();


// import xrpl from 'xrpl';

// // connect to the testnet websocket (access to the testnet network)
// const client = new xrpl.Client('wss://s.altnet.rippletest.net:51233');

// // async function
// const main = async () => {
//     console.log('Lets get started..');

//     await client.connect();

//     console.log('Connected to the testnet');
//     const { wallet: wallet1, balance: balance1 } = await client.fundWallet();
//     const { wallet: wallet2, balance: balance2 } = await client.fundWallet();

//     console.log('Wallet 1:', wallet1);
//     console.log('Balance 1:', balance1);
//     console.log('Wallet 2:', wallet2);
//     console.log('Balance 2:', balance2);

//     const tx: xrpl.Payment() {
//         transactionType: 'Payment',
//         Account: wallet1.classicAddress,
//         Amount: xrpl.dropsToXrp("12"),
//         //Amount: "12000000" is the same as 12 XRP
//         Destination: wallet2.classicAddress,

//     };

//     const result = await client.submitAndWait(tx, { wallet: wallet1 });
//     console.log('Transaction result:', result);

//     console.log({
//         'balance1': await client.getBalance(wallet1.classicAddress),
//         'balance2': await client.getBalance(wallet2.classicAddress),
//     });
    
//     await client.disconnect();
//     console.log('Disconnected from the testnet');
// };

// main();