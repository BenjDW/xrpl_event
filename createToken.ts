// Logic to create and distribute a custom issued token on XRPL.
// Steps:
// 1. Receiver creates a trust line for the new token
// 2. Issuer sends some of that token to the receiver
import { TrustSet, TrustSetFlags } from "xrpl";
import { Payment } from "xrpl/src/models";

// `createToken` sets up a trust line and then sends tokens.
// Params:
// - `issuer`: wallet that issues the token and sends it
// - `receiver`: wallet that will hold the new token
// - `client`: XRPL client instance connected to the network
// - `tokenCode`: currency code of the issued token (in hex)
export const createToken = async ({ issuer, receiver, client, tokenCode }: any) => {
  // 1) Create the trust line from receiver to issuer
  //    Without this, the receiver cannot hold the issued token.
  const trustSet: TrustSet = {
    // Transaction to configure trust between accounts
    TransactionType: "TrustSet",

    // Account that is opening the trust line
    Account: receiver.address,

    // Limit and details of the asset this trust line is for
    LimitAmount: {
      // Token/currency code (usually a 3‑letter code or 20‑byte hex)
      currency: tokenCode,
      // Issuer address of the token
      issuer: issuer.address,
      // Maximum amount of this token the receiver is willing to hold
      value: "500000000", // 500M tokens
    },

    // Flag to control rippling behaviour; here we clear "No Ripple"
    Flags: TrustSetFlags.tfClearNoRipple,
  };
  console.log(trustSet);

  // Prepare, sign and submit the TrustSet transaction
  const preparedTrust = await client.autofill(trustSet);
  const signedTrust = receiver.sign(preparedTrust);
  const resultTrust = await client.submitAndWait(signedTrust.tx_blob);

  // Log result and transaction hash so you can look it up
  console.log(resultTrust);
  console.log("Trust line issuance tx result: ", resultTrust.result.hash);

  // 2) After the trust line is established, send tokens from issuer to receiver
  const sendPayment: Payment = {
    // Standard payment transaction on XRPL
    TransactionType: "Payment",

    // Account that is sending the issued tokens
    Account: issuer.address,

    // Destination account to receive the issued tokens
    Destination: receiver.address,

    // Issued currency structure specifying token details and amount
    Amount: {
      currency: tokenCode,
      issuer: issuer.address,
      value: "200000000", // 200M tokens
    },
  };
  console.log(sendPayment);

  // Prepare, sign and submit the Payment transaction
  const preparedPayment = await client.autofill(sendPayment);
  const signedPayment = issuer.sign(preparedPayment);
  const resultPayment = await client.submitAndWait(signedPayment.tx_blob);

  // Log result and transaction hash for the token transfer
  console.log(resultPayment);
  console.log("Transfer issuance tx result: ", resultPayment.result.hash);

  // Nothing specific to return; the work happens on‑ledger
  return;
}