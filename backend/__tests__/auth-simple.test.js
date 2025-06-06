const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

describe('Auth Components Test', () => {
  it('should hash and verify passwords correctly', async () => {
    const password = 'TestPassword123!';
    const hashedPassword = await bcrypt.hash(password, 10);
    
    expect(hashedPassword).toBeDefined();
    expect(hashedPassword).not.toBe(password);
    
    const isValid = await bcrypt.compare(password, hashedPassword);
    expect(isValid).toBe(true);
    
    const isInvalid = await bcrypt.compare('WrongPassword', hashedPassword);
    expect(isInvalid).toBe(false);
  });

  it('should create and verify JWT tokens', () => {
    const payload = { userId: 1, role: 'user' };
    const secret = process.env.JWT_SECRET;
    
    const token = jwt.sign(payload, secret, { expiresIn: '1h' });
    expect(token).toBeDefined();
    
    const decoded = jwt.verify(token, secret);
    expect(decoded.userId).toBe(1);
    expect(decoded.role).toBe('user');
  });

  it('should reject invalid JWT tokens', () => {
    const secret = process.env.JWT_SECRET;
    
    expect(() => {
      jwt.verify('invalid-token', secret);
    }).toThrow();
  });

  it('should handle expired tokens', () => {
    const payload = { userId: 1, role: 'user' };
    const secret = process.env.JWT_SECRET;
    
    const expiredToken = jwt.sign(payload, secret, { expiresIn: '-1h' });
    
    expect(() => {
      jwt.verify(expiredToken, secret);
    }).toThrow();
  });
});