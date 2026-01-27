// Utility helpers for working with XRPL in this project.
import { AccountSetAsfFlags } from "xrpl";

// Convert a plain string into a hex string and pad it to a fixed length.
// Steps:
// 1. Convert each character to its char code, then to hex
// 2. Concatenate all hex codes into one string
// 3. Pad the right side with "0" so the final length is 40 characters
// 4. Return the result in uppercase
export const convertStringToHexPadded = (str) => {
    // Step 1: build a hex string from the input characters
    let hex = "";
    for (let i = 0; i < str.length; i++) {
        const hexChar = str.charCodeAt(i).toString(16);
        hex += hexChar;
    }

    // Step 2: pad the hex string with zeros so it has exactly 40 characters
    const paddedHex = hex.padEnd(40, "0");

    // Step 3: return in uppercase (convention for hex in XRPL tools)
    return paddedHex.toUpperCase(); // Typically, hex is handled in uppercase
};

// Turn on "Default Ripple" for an account so its issued tokens can ripple
// across trust lines instead of being locked to one holder.
// Params:
// - `wallet`: XRPL wallet object whose account settings we want to change
// - `client`: XRPL client used to prepare and submit the transaction
export const enableRippling = async ({ wallet, client }) => {
    // Build the AccountSet transaction to flip the default ripple flag
    const accountSet = {
        // Transaction that changes account configuration/flags
        TransactionType: "AccountSet",

        // Account being updated
        Account: wallet.address,

        // Specific flag: enable default rippling on this account
        SetFlag: AccountSetAsfFlags.asfDefaultRipple,
    };

    // Ask the XRPL client to autofill missing fields (Fee, Sequence, etc.)
    const prepared = await client.autofill(accountSet);

    // Sign with the provided wallet (locally)
    const signed = wallet.sign(prepared);

    // Submit the signed transaction and wait for validation
    const result = await client.submitAndWait(signed.tx_blob);

    // Log the full result and the transaction hash for inspection
    console.log(result);
    console.log("Enable rippling tx: ", result.result.hash);

    // Operation complete; no explicit return value needed
    return;
};
