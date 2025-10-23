import { SignJWT, jwtVerify } from "jose";
import bcrypt from "bcryptjs";

function getSecret() {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error("JWT_SECRET no está definido en el entorno (.env)");
  }
  return new TextEncoder().encode(secret);
}

export interface JWTPayload {
  userId: number;
  email: string;
  rolId: number;
  rolNombre: string;
}

export async function generateToken(payload: JWTPayload): Promise<string> {
  const token = await new SignJWT({ ...payload })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("24h")
    .sign(getSecret());

  return token;
}

export async function verifyToken(token: string): Promise<JWTPayload | null> {
  try {
    const { payload } = await jwtVerify(token, getSecret());
    console.log("✅ Token válido:", payload);
    return payload as unknown as JWTPayload;
  } catch (error) {
    console.error("[v0] Error verificando token:", error);
    return null;
  }
}

export async function hashPassword(password: string): Promise<string> {
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash(password, salt);
}

export async function comparePassword(password: string, hashedPassword: string): Promise<boolean> {
  return bcrypt.compare(password, hashedPassword);
}

export function generateCaptcha(): { question: string; answer: string } {
  const num1 = Math.floor(Math.random() * 10) + 1;
  const num2 = Math.floor(Math.random() * 10) + 1;
  const operations = ["+", "-", "*"];
  const operation = operations[Math.floor(Math.random() * operations.length)];

  let answer: number;
  switch (operation) {
    case "+": answer = num1 + num2; break;
    case "-": answer = num1 - num2; break;
    case "*": answer = num1 * num2; break;
    default: answer = num1 + num2;
  }

  return {
    question: `¿Cuánto es ${num1} ${operation} ${num2}?`,
    answer: answer.toString(),
  };
}
