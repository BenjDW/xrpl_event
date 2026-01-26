import xrpl  from "xrpl"
import { createToken } from "./createToken";
import { convertStringToHexPadded } from "./utils";

const client = new xrpl.Client("wss://s.altnet.rippletest.net:51233")

const issuerseed = "sEdTSKwqfyd8jVV7pEQaJTdV2P5q3fb";
const receiverseed = "sEd7XeHtrLNeqsCi3s6GydNckMmUC32";

const issuer = xrpl.Wallet.fromSeed(issuerseed);
const receiver = xrpl.Wallet.fromSeed(receiverseed);
const tokenCode = "bde"

const main = async () => {
  console.log("lets get started...");
  await client.connect();

  // do something interesting here
//   console.log('lets fund 2 accounts...')
//   const { wallet: wallet1, balance: balance1 } = await client.fundWallet();
//   const { wallet: wallet2, balance: balance2 } = await client.fundWallet();
    // create a token
  await createToken({ 
    issuer, 
    receiver, 
    client, 
    tokenCode: convertStringToHexPadded(tokenCode)
    });

  console.log('wallet1', issuer)
  console.log('wallet2', receiver)

  console.log({ 
    'balance1': await 
    client.getBalances(issuer.classicAddress), 
    'balance2': await 
    client.getBalances(receiver.classicAddress), 
  });


  // create a payment transaction
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

  console.log({
    'balance 1': await client.getBalances(issuer.classicAddress), 
    'balance 2': await client.getBalances(receiver.classicAddress)
  })

  await client.disconnect();
  console.log("all done!");
};

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