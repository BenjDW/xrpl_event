import { AccountSetAsfFlags } from "xrpl";
export const convertStringToHexPadded = (str) => {
    // Convert string to hexadecimal
    let hex = "";
    for (let i = 0; i < str.length; i++) {
        const hexChar = str.charCodeAt(i).toString(16);
        hex += hexChar;
    }
    // Pad with zeros to ensure it's 40 characters long
    const paddedHex = hex.padEnd(40, "0");
    return paddedHex.toUpperCase(); // Typically, hex is handled in uppercase
};
export const enableRippling = async ({ wallet, client }) => {
    const accountSet = {
        TransactionType: "AccountSet",
        Account: wallet.address,
        SetFlag: AccountSetAsfFlags.asfDefaultRipple,
    };
    const prepared = await client.autofill(accountSet);
    const signed = wallet.sign(prepared);
    const result = await client.submitAndWait(signed.tx_blob);
    console.log(result);
    console.log("Enable rippling tx: ", result.result.hash);
    return;
};
