// Import XRPL types for account setting transactions and flags
import { AccountSet, AccountSetAsfFlags } from "xrpl"

// Convert a normal string into an uppercase hex string,
// then pad it with zeros on the right so the final result
// is always 40 hex characters long (20 bytes).
// This is useful where fixed‑length hex fields are required.
export const convertStringToHexPadded = (str: string): string => {
  // Step 1: convert each character to its char code, then to hex
  let hex: string = "";
  for (let i = 0; i < str.length; i++) {
    const hexChar: string = str.charCodeAt(i).toString(16);
    hex += hexChar;
  }

  // Step 2: pad the hex string on the right with "0" so that
  // it is exactly 40 characters long. Extra characters are NOT trimmed.
  const paddedHex: string = hex.padEnd(40, "0");
  // Step 3: return as uppercase, which is the common convention for hex
  return paddedHex.toUpperCase(); // Typically, hex is handled in uppercase
}

// Enable "Default Ripple" on an XRPL account.
// This allows issued tokens from this account to ripple (be forwarded)
// across trust lines instead of being "frozen" to a single holder.
// Params:
// - `wallet`: the XRPL wallet object of the issuer account
// - `client`: connected XRPL client used to autofill + submit the tx
export const enableRippling = async ({ wallet, client }: any) => { 
  // Build the AccountSet transaction that turns on the DefaultRipple flag
  const accountSet: AccountSet = {
    // Transaction type used to change account configuration on XRPL
    TransactionType: "AccountSet",

    // Account whose settings (flags) we are changing
    Account: wallet.address,

    // Specific flag that enables rippling for this account's issued tokens
    SetFlag: AccountSetAsfFlags.asfDefaultRipple,
  };

  // Ask the client to fill in missing fields (Fee, Sequence, etc.)
  const prepared = await client.autofill(accountSet);

  // Sign the prepared transaction with the issuer's wallet
  const signed = wallet.sign(prepared);

  // Submit the signed transaction and wait until it is validated
  const result = await client.submitAndWait(signed.tx_blob);

  // Log full result for debugging
  console.log(result);

  // Log the transaction hash so it can be checked in an explorer
  console.log("Enable rippling tx: ", result.result.hash);

  return;
}
