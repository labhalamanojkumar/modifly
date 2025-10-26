import jwt from 'jsonwebtoken'

const SECRET = process.env.ADMIN_JWT_SECRET || 'change_this_secret'

export function signToken(payload: object, opts: jwt.SignOptions = {}) {
  return jwt.sign(payload, SECRET, { expiresIn: '6h', ...opts })
}

export function verifyToken(token: string) {
  try {
    return jwt.verify(token, SECRET)
  } catch (e) {
    return null
  }
}

const authLib = { signToken, verifyToken }

export default authLib
