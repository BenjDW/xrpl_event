// ============================
// CYPHERCHAT - DECRYPT & READ
// ============================
//
// This file does the inverse of `index.js`:
// 1. Take the encrypted JSON (ciphertext + nonce) from the XRPL memo.
// 2. Convert sender + receiver Ed25519 keys to X25519 (Montgomery) format.
// 3. Use NaCl `box.open` to decrypt the message.
// 4. Return the original clear-text chat message.

import tweetnacl from 'tweetnacl';
import { Wallet } from "xrpl";
import { ed25519 } from "@noble/curves/ed25519.js";
// const { edwardsToMontgomeryPub, edwardsToMontgomeryPriv } = ed25519;

const { box } = tweetnacl;

export function decryptMessage(
  messageWithNonce,
  recipientPublicKey,
  senderSecretKey,
){
  // 1. Decode the Ed25519 keys from hex (strip the "ED" prefix).
  const pubKeyBytes = Buffer.from(recipientPublicKey.slice(2), "hex");
  const secretKeyBytes = Buffer.from(senderSecretKey.slice(2), "hex");

  // 2. Convert Ed25519 keys into X25519 (Montgomery) format that `box.open` expects.
  const pubKeyCurve = ed25519.utils.toMontgomery(pubKeyBytes);
  const privKeyCurve = ed25519.utils.toMontgomerySecret(secretKeyBytes);

  // 3. Parse the JSON string that contains:
  //    - encrypted: base64-encoded ciphertext
  //    - nonce: base64-encoded nonce
  console.log(messageWithNonce)
  const { encrypted, nonce } = JSON.parse(messageWithNonce);

  // 4. Convert base64 strings back into raw bytes.
  const messageBytes = Buffer.from(encrypted,"base64");
  const nonceBytes = Buffer.from(nonce,"base64");

  // 5. Decrypt using NaCl box (X25519 + XSalsa20-Poly1305).
  const decryptedMessage = box.open(
    messageBytes,
    nonceBytes,
    pubKeyCurve,
    privKeyCurve,
  );

  if (!decryptedMessage) {
    // If decryption fails (wrong keys / corrupted data), box.open returns null.
    throw new Error("Failed to decrypt message");
  }

  // 6. Convert the decrypted bytes back into a JavaScript string.
  return new TextDecoder().decode(decryptedMessage);
}

function main() {
  // Encrypted memo content, as hex string, copied from a real XRPL tx.
  // When you read a transaction from the ledger, you would:
  //   1) extract `MemoData` (hex)
  //   2) convert hex -> utf8 string
  //   3) pass that JSON string into `decryptMessage`.
  const cypherMessage =
    "7B22656E63727970746564223A2234786B3062483936327A49304B5970343333494B416546627A786F683464626350447942222C226E6F6E6365223A2270436F3769556D434F6D384B74564A4F376278372F315A4464746D6850637658227D";

  // Sender's Ed25519 public key (the one that encrypted the message).
  const senderPubKey =
    "ED8089150E9458FEDC81E231839DE44CAFE0456006AE8E821DAC5C0CDE0F7094C4";

  // Our own Testnet seed; from this we derive the private key used to decrypt.
  const mySeed = "sEd7XeHtrLNeqsCi3s6GydNckMmUC32";

  const myPrivateKey = Wallet.fromSeed(mySeed).privateKey;

  // Convert the hex memo back to its JSON string, then decrypt.
  const clearMessage = decryptMessage(
    Buffer.from(cypherMessage, "hex").toString(),
    senderPubKey,
    myPrivateKey,
  );

  console.log("==============CLEAR MESSAGE==============");
  console.log(clearMessage);
  
  console.log("all done");
}

// Run the demo decryption end‑to‑end.
main();