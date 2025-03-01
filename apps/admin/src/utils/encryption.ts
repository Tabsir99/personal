import crypto from "crypto";

const IV_LENGTH = 16; // AES block size

// Function to generate a secure 32-byte encryption key
export function generateKey() {
  return crypto.randomBytes(32).toString("hex");
}

// Encrypt function
export function encrypt(text: string, key: string) {
  const encryptionKey = Buffer.from(key, "hex");
  const iv = crypto.randomBytes(IV_LENGTH);
  const cipher = crypto.createCipheriv("aes-256-cbc", encryptionKey, iv);
  let encrypted = cipher.update(text, "utf8", "hex");
  encrypted += cipher.final("hex");
  return iv.toString("hex") + encrypted;
}

// Decrypt function
export function decrypt(encryptedText: string, key: string) {
  const encryptionKey = Buffer.from(key, "hex");
  const iv = Buffer.from(encryptedText.slice(0, IV_LENGTH * 2), "hex");
  const encryptedData = encryptedText.slice(IV_LENGTH * 2);
  const decipher = crypto.createDecipheriv("aes-256-cbc", encryptionKey, iv);
  let decrypted = decipher.update(encryptedData, "hex", "utf8");
  decrypted += decipher.final("utf8");
  return decrypted;
}
