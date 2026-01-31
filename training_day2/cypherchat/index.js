// ============================
// CYPHERCHAT - ENCRYPT & SEND
// ============================
//
// High‑level flow:
// 1. Take a clear‑text message.
// 2. Encrypt it using sender's Ed25519 private key + recipient's Ed25519 public key.
// 3. Convert both keys to the X25519 (Montgomery) format required by NaCl `box`.
// 4. Put the encrypted payload + nonce into a JSON string.
// 5. Store that JSON (hex‑encoded) in the memo field of an XRPL Payment.
// 6. Submit the Payment on XRPL Testnet.
//
// The receiver will later read the memo and decrypt it in `decypher.js`.

// Crypto library that provides `box` (public‑key authenticated encryption)
import tweetnacl from 'tweetnacl';
// Node buffer – we use it a lot to convert between hex, base64 and raw bytes
import { Buffer } from "buffer";
// XRPL SDK – lets us create wallets and send transactions to the ledger
import { Wallet, Client, deriveAddress } from "xrpl";
// Ed25519 library that also knows how to convert keys into X25519 format
import { ed25519 } from "@noble/curves/ed25519.js";
// const { edwardsToMontgomeryPub, edwardsToMontgomeryPriv } = ed25519;
// const { edwardsToMontgomeryPub, edwardsToMontgomeryPriv } = ed25519.utils;


//partner wallet public key
//const receiverPubKey = "EDDBB4B2F77A8744A2C5B4362433FF387DE6360EE0BA477D6F0D06D2CC35B351B0"

//const myWallet = Wallet.fromSeed("sEd7XeHtrLNeqsCi3s6GydNckMmUC32")

// Pull out the helpers we need from tweetnacl:
// - box: encrypt/decrypt using sender private key + recipient public key
// - randomBytes: generate a random nonce so every message is unique
const { box, randomBytes } = tweetnacl;

/**
 * Encrypts a message using X25519 (Montgomery curve) for Diffie-Hellman key exchange
 *
 * @param message - Plain text message to encrypt
 * @param recipientPublicKey - Recipient's Ed25519 public key (hex encoded)
 * @param senderSecretKey - Sender's Ed25519 private key (hex encoded)
 * @returns JSON string containing base64 encoded encrypted message and nonce
 *
 * Steps:
 * 1. Convert hex keys to byte arrays
 * 2. Generate random nonce for uniqueness
 * 3. Convert message to bytes
 * 4. Convert Ed25519 keys to X25519 (Montgomery) format for encryption
 * 5. Encrypt using NaCl box with converted keys
 * 6. Return encrypted message and nonce as base64 JSON
 */
export function encryptMessage(
    message,
    recipientPublicKey,
    senderSecretKey,
  ){
    // 1) Convert Ed25519 keys (hex strings that start with "ED") into raw bytes.
    const pubKeyBytes = Buffer.from(recipientPublicKey.slice(2), "hex");
    const secretKeyBytes = Buffer.from(senderSecretKey.slice(2), "hex");
  
    // 2) Create a fresh random nonce for this encryption (prevents replay / reuse).
    const nonce = randomBytes(box.nonceLength);
    // 3) Turn the human‑readable message into bytes.
    const messageUint8 = Buffer.from(message);
  
    // 4) Convert Ed25519 keys into X25519 (Montgomery) keys
    //    so that NaCl `box` can use them for Diffie‑Hellman.
    const pubKeyCurve = ed25519.utils.toMontgomery(pubKeyBytes);
    const privKeyCurve = ed25519.utils.toMontgomerySecret(secretKeyBytes);
  
    // 5) Actually encrypt the message bytes.
    const encryptedMessage = box(messageUint8, nonce, pubKeyCurve, privKeyCurve);
  
    // 6) Pack everything into a JSON string so that it can be stored in XRPL memo.
    return JSON.stringify({
      encrypted: Buffer.from(encryptedMessage).toString("base64"),
      nonce: Buffer.from(nonce).toString("base64"),
    });
  }
  
  async function sendTX(
    cypherMessage,
    myWallet,
    recipientPublicKey,
  ) {
    // Create a client connected to XRPL Testnet (Clio server).
    const client = new Client("wss://clio.altnet.rippletest.net:51233/");
    try {
      // 1) Open WebSocket connection to the XRPL node.
      await client.connect();
      // 2) Derive the classic XRPL address from the recipient public key.
      const receiverAddress = deriveAddress(recipientPublicKey);
  
      // 3) Build a simple Payment transaction that carries:
      //    - 1 XRP (1,000,000 drops) as Amount
      //    - our encrypted chat message inside the MemoData field
      const tx = {
        TransactionType: "Payment",
        Account: myWallet.classicAddress,
        Destination: receiverAddress,
        Amount: "1000000",
        Memos: [
          {
            Memo: {
              // XRPL memos must be hex, so we:
              //   JSON string -> bytes -> hex string
              MemoData: Buffer.from(cypherMessage).toString("hex"),
            },
          },
        ],
      };
  
      // 4) Ask the client to fill in missing fields (Fee, Sequence, etc.).
      const prepared = await client.autofill(tx);
      // 5) Sign the transaction locally with our wallet private key.
      const signed = myWallet.sign(prepared);
      // 6) Send the signed transaction and wait for validation result.
      const result = await client.submitAndWait(signed.tx_blob);
  
      return result;
    } catch (error) {
      console.log(error);
    } finally {
      await client.disconnect();
    }
  }

  async function main(){
    // Recipient's Ed25519 public key (who we are sending the secret message to).
    // this is the public key of the wallet that will receive the message you can find it in a tx of the receiver (SigningPubKey:).
    // example: https://testnet.xrpl.org/transactions/DDE12A739912D317FB43418C16D8DAC2DE6200B21BEF05B978FD286AF55FF307/raw
    const recipientPublicKey = "ED8089150E9458FEDC81E231839DE44CAFE0456006AE8E821DAC5C0CDE0F7094C4";
    // Our own wallet derived from the seed – this is the "sender".
    const myWallet = Wallet.fromSeed("sEd7XeHtrLNeqsCi3s6GydNckMmUC32");
  
    // 1) Encrypt the clear‑text chat message for the recipient,
    //    using our private key + their public key.
    const cypherMessage = encryptMessage(
      "Hello World Loic From bde! How are you ?",
      recipientPublicKey,
      myWallet.privateKey,
    );
  
    console.log("==============CYPHERED MESSAGE==============");
    console.log(cypherMessage);
  
    // 2) Send the encrypted payload to XRPL as a memo inside a Payment.
    const tx = await sendTX(cypherMessage, myWallet, recipientPublicKey);
  
    console.log("==============TRANSACTION==============");
    console.log(tx);
  
    console.log("all done");
  }
  
  main().then(() => process.exit(0));