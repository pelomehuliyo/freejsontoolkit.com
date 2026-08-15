import { hashSync } from "bcryptjs";

/**
 * Pure engine for bcrypt password hashing.
 * bcryptjs is pure JavaScript with zero dependencies, worker-safe, and uses
 * the Web Crypto API for its random salt. Each call draws a fresh salt, so
 * the same password produces a different hash every time.
 */
export function run(password: string, rounds: number): string {
    if (!password.trim()) {
        throw new Error("Input is empty. Enter a password to hash.");
    }
    if (!Number.isInteger(rounds) || rounds < 4 || rounds > 15) {
        throw new Error("Cost factor must be an integer between 4 and 15.");
    }

    return hashSync(password, rounds);
}