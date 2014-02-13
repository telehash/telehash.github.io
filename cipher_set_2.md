Cipher Set 2
============

Based on Daniel J. Bernstein's ciphers and NaCl work

## Example Code For Discussion
var sodium = require("sodium").api;

// Identity Keys
var senderKeys = sodium.crypto_box_keypair();
var receiverKeys = sodium.crypto_box_keypair();

// Line Keys
var senderLineKeys = sodium.crypto_box_keypair();

var nonce = new Buffer(24);
for (var i = 0; i < 24; ++i) {
  nonce[i] = 0;
}

//console.log("Nonce: ", nonce);

var agreedKey = sodium.crypto_box_beforenm(receiverKeys.publicKey, senderLineKeys.secretKey);
console.log("Agreed key:", agreedKey);

var plainText = JSON.stringify("This is a test chunk of data for the inner packet. it would have JSON and a payload of the sender publicKey");

var innerPacketData = sodium.crypto_secretbox(new Buffer(plainText), nonce, agreedKey);

var openPacketData = Buffer.concat([senderLineKeys.publicKey, innerPacketData]);
//console.log("openPacketData:", openPacketData);

var macKey = sodium.crypto_box_beforenm(receiverKeys.publicKey, senderKeys.secretKey);
console.log("Mac Key:", macKey);
var openHMAC = sodium.crypto_onetimeauth(openPacketData, macKey);
//console.log("openHMAC:", openHMAC);

// Sender can now send HMAC, public line key and the encrypted open packet data

var receiverLineKeys = sodium.crypto_box_keypair();

// Get the key out of the packet
var recvAgreedKey = sodium.crypto_box_beforenm(senderLineKeys.publicKey, receiverKeys.secretKey);
var matches = 0;
for (var i = 0 ; i < recvAgreedKey.length; ++i) {
  matches |= recvAgreedKey[i] ^ agreedKey[i];
}
console.log("line key matches:", matches === 0);

// Decrypt the inner packet, this also validates the mac
var decryptedPacketData = sodium.crypto_secretbox_open(innerPacketData, nonce, recvAgreedKey);
console.log("Decrypted data is good:", decryptedPacketData.toString() === plainText);

var recvMacKey = sodium.crypto_box_beforenm(senderKeys.publicKey, receiverKeys.secretKey);
var matches = 0;
for (var i = 0 ; i < recvMacKey.length; ++i) {
  matches |= recvMacKey[i] ^ macKey[i];
}
console.log("recvMacKey matches:", matches === 0);
// At this point we would have the sender public key and can check the mac of the outer packet
var authed = sodium.crypto_onetimeauth_verify(openHMAC, openPacketData, recvMacKey) === 0 ;
console.log("Open hmac verify:", authed);


