import jwt from 'jsonwebtoken'

export const encryptToken = (token: string, secret: string): string  => {
    return jwt.sign({token}, secret, {expiresIn: '24h'})
} 

export const decryptToken = (token: string, secret: string): string | null => {
    try {
        const decoded = jwt.verify(token, secret) as { token: string };
        return decoded.token;
    } catch (error: any) {
        return null
    }
}