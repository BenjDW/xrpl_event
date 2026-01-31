// JS build of the token‑creation logic.
// It does two things:
// 1. Receiver creates a trust line for the issued token
// 2. Issuer sends some of that token to the receiver
import { TrustSetFlags } from "xrpl";

export const createToken = async ({ issuer, receiver, client, tokenCode }) => {
    // 1) Create the trust line that allows the receiver to hold the token
    const trustSet = {
        // Use an AccountSet‑style transaction for configuring trust
        TransactionType: "TrustSet",

        // Account that is opening the trust line (token holder)
        Account: receiver.address,

        // Which asset this trust line is for and its limit
        LimitAmount: {
            // Token/currency code (usually 3 chars or 20‑byte hex)
            currency: tokenCode,
            // Issuer of the token
            issuer: issuer.address,
            // Maximum amount of the token that receiver is willing to hold
            value: "500000000", // 500M tokens
        },

        // Clear the "No Ripple" flag so rippling is allowed if desired
        Flags: TrustSetFlags.tfClearNoRipple,
    };
    console.log(trustSet);

    // Prepare, sign and send the TrustSet transaction
    const preparedTrust = await client.autofill(trustSet);
    const signedTrust = receiver.sign(preparedTrust);
    const resultTrust = await client.submitAndWait(signedTrust.tx_blob);

    // Log the result and hash of the trust line transaction
    console.log(resultTrust);
    console.log("Trust line issuance tx result: ", resultTrust.result.hash);

    // 2) Once the trust line is active, send tokens from issuer to receiver
    const sendPayment = {
        // Standard Payment transaction carrying an issued asset
        TransactionType: "Payment",

        // Account that is sending the tokens
        Account: issuer.address,

        // Destination account that receives the tokens
        Destination: receiver.address,

        // Issued asset specification and amount
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

    // Log the result and hash for the transfer transaction
    console.log(resultPayment);
    console.log("Transfer issuance tx result: ", resultPayment.result.hash);

    // No explicit return value; effects are on‑ledger
    return;
};
