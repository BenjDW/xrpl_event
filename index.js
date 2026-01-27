// Main entry point for the XRPL demo (JavaScript build).
// This version focuses on:
// 1. Connecting to XRPL Testnet
// 2. Creating a custom token
// 3. Showing balances and disconnecting
import xrpl from "xrpl";
import { createToken } from "./createToken.js";
import { convertStringToHexPadded } from "./utils.js";

// WebSocket client that talks to the XRPL Testnet
const client = new xrpl.Client("wss://s.altnet.rippletest.net:51233");

// Testnet seed phrases for issuer and receiver wallets
const issuerseed = "sEdTSKwqfyd8jVV7pEQaJTdV2P5q3fb";
const receiverseed = "sEd7XeHtrLNeqsCi3s6GydNckMmUC32";

// Build wallet instances from the seeds
const issuer = xrpl.Wallet.fromSeed(issuerseed);
const receiver = xrpl.Wallet.fromSeed(receiverseed);

// Human‑readable token code to be converted to hex
const tokenCode = "bde";

// Orchestrates the full flow for minting and sending a token
const main = async () => {
    console.log("lets get started...");

    // 1) Connect to XRPL Testnet
    await client.connect();

    // Example code for funding new wallets, left commented as reference:
    //   console.log('lets fund 2 accounts...')
    //   const { wallet: wallet1, balance: balance1 } = await client.fundWallet();
    //   const { wallet: wallet2, balance: balance2 } = await client.fundWallet();

    // 2) Create a token and send some of it from issuer to receiver
    await createToken({
        issuer,
        receiver,
        client,
        tokenCode: convertStringToHexPadded(tokenCode)
    });

    // 3) Log both wallets so you can inspect them
    console.log('wallet1', issuer);
    console.log('wallet2', receiver);

    // 4) Show the current balances of issuer and receiver
    console.log({
        'balance1': await client.getBalances(issuer.classicAddress),
        'balance2': await client.getBalances(receiver.classicAddress),
    });

    // Example payment of XRP between two wallets (kept commented)
    // to demonstrate how to send XRP instead of tokens:
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

    // 5) Also log balances again with slightly different labels
    console.log({
        'balance 1': await client.getBalances(issuer.classicAddress),
        'balance 2': await client.getBalances(receiver.classicAddress)
    });

    // 6) Disconnect cleanly from the network
    await client.disconnect();
    console.log("all done!");
};

// Start the async flow
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
