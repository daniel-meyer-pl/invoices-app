import jwt from "jsonwebtoken"

const JWT_SECRET = process.env.JWT_SECRET!

export function signToken(userId: string) {
  return jwt.sign({ sub: userId }, JWT_SECRET, { expiresIn: "7d" })
}

export function verifyToken(token: string) {
  return jwt.verify(token, JWT_SECRET) as { sub: string }
}
