// Import the `AMMCreate` TypeScript type so `createAmm` object
// matches the exact shape that the XRPL client expects
import { AMMCreate } from "xrpl";

// `createAMM` builds and sends an `AMMCreate` transaction to the XRPL.
// Params:
// - `issuer`: wallet that issued the token you want in the pool
// - `receiver`: wallet that will own the AMM LP tokens (and pay the fee)
// - `client`: connected XRPL client used to autofill + submit the tx
// - `tokenCode`: currency code for the issued token in the pool
export const createAMM = async ({
  issuer,
  receiver,
  client,
  tokenCode,
}: any) => {
  // Log basic info so we can see which AMM is being created
  console.log("create AMM", { issuer, receiver, tokenCode });

  // Build the AMMCreate transaction object.
  // This defines the 2 assets that will form the pool (token + XRP),
  // the account that creates/owns the AMM, and the trading fee.
  let createAmm: AMMCreate = {
    // XRPL transaction type that creates a new AMM pool
    TransactionType: "AMMCreate",

    // The account that creates the AMM and receives the LP tokens
    Account: receiver.address,

    // Trading fee charged by this AMM, in basis points (600 = 6%)
    TradingFee: 600,

    // First asset of the pool: the issued token
    Amount: {
      // Token/currency code of the issued asset
      currency: tokenCode,
      // Issuer account that actually created this token on XRPL
      issuer: issuer.classicAddress,
      // How many tokens to deposit into the AMM (2,000,000 units)
      value: "2000000", // 2M tokens
    },

    // Second asset of the pool: XRP, expressed in drops
    // 1 XRP = 1,000,000 drops, so 50,000,000 drops = 50 XRP
    Amount2: "50000000", // 50 XRP in drops
  };

  // Show the exact transaction we are about to send
  console.log(createAmm);

  // Ask the XRPL client to fill in missing fields (Fee, Sequence, etc.)
  const prepared = await client.autofill(createAmm);

  // Receiver wallet signs the prepared transaction locally
  const signed = receiver.sign(prepared);

  // Submit the signed transaction to the network and wait for validation
  const result = await client.submitAndWait(signed.tx_blob);

  // Log the full result for debugging/inspection
  console.log(result);

  // Log the transaction hash so it can be looked up in explorers
  console.log("Create amm tx: ", result.result.hash);

  // Function completed successfully; nothing specific to return
  return;
};
