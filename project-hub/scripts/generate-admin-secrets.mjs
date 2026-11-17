import { randomBytes } from "node:crypto";
import { createInterface } from "node:readline/promises";
import { stdin, stdout } from "node:process";
import bcrypt from "bcryptjs";

const readline = createInterface({ input: stdin, output: stdout });
const username = (await readline.question("Admin username: ")).trim();
readline.close();

if (!username || username.length > 120) {
  console.error("Choose a username between 1 and 120 characters.");
  process.exit(1);
}

if (typeof stdin.setRawMode !== "function") {
  console.error("Run this script in a terminal that supports hidden password input (for example, Windows Terminal or PowerShell in VS Code).");
  process.exit(1);
}

function readHidden(prompt) {
  return new Promise((resolve, reject) => {
    stdout.write(prompt);
    let value = "";
    stdin.setRawMode(true);
    stdin.resume();
    const finish = (error) => {
      stdin.setRawMode(false);
      stdin.pause();
      stdin.removeListener("data", onData);
      stdout.write("\n");
      if (error) reject(error);
      else resolve(value);
    };
    const onData = (chunk) => {
      for (const char of chunk.toString("utf8")) {
        if (char === "\u0003") return finish(new Error("Cancelled."));
        if (char === "\r" || char === "\n") return finish();
        if (char === "\u007f" || char === "\b") value = value.slice(0, -1);
        else if (char >= " ") value += char;
      }
    };
    stdin.on("data", onData);
  });
}

const password = await readHidden("Admin password (input hidden): ");
if (password.length < 12 || password.length > 1024) {
  console.error("Use a password between 12 and 1024 characters.");
  process.exit(1);
}

const passwordHash = await bcrypt.hash(password, 12);
const sessionSecret = randomBytes(32).toString("base64url");
console.log("\nCopy these values to the server environment. Keep them private:\n");
console.log(`ADMIN_USERNAME=${username}`);
console.log(`ADMIN_PASSWORD_HASH=${passwordHash}`);
console.log(`SESSION_SECRET=${sessionSecret}`);
