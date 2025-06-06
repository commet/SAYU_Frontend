const validator = require('validator');

describe('Validation Components Test', () => {
  describe('Email Validation', () => {
    it('should validate correct email formats', () => {
      expect(validator.isEmail('test@example.com')).toBe(true);
      expect(validator.isEmail('user.name@domain.co.uk')).toBe(true);
      expect(validator.isEmail('user+tag@example.org')).toBe(true);
    });

    it('should reject invalid email formats', () => {
      expect(validator.isEmail('invalid-email')).toBe(false);
      expect(validator.isEmail('@example.com')).toBe(false);
      expect(validator.isEmail('test@')).toBe(false);
      expect(validator.isEmail('test.example.com')).toBe(false);
    });
  });

  describe('Password Validation', () => {
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/;

    it('should validate strong passwords', () => {
      expect(passwordRegex.test('TestPass123!')).toBe(true);
      expect(passwordRegex.test('MySecure@Pass1')).toBe(true);
      expect(passwordRegex.test('Complex&Pass99')).toBe(true);
    });

    it('should reject weak passwords', () => {
      expect(passwordRegex.test('password')).toBe(false);
      expect(passwordRegex.test('PASSWORD')).toBe(false);
      expect(passwordRegex.test('12345678')).toBe(false);
      expect(passwordRegex.test('TestPass')).toBe(false); // No number or special char
      expect(passwordRegex.test('testpass123')).toBe(false); // No uppercase
    });
  });

  describe('String Length Validation', () => {
    it('should validate string lengths', () => {
      expect(validator.isLength('test', { min: 2, max: 10 })).toBe(true);
      expect(validator.isLength('username', { min: 3, max: 50 })).toBe(true);
    });

    it('should reject strings outside length limits', () => {
      expect(validator.isLength('a', { min: 2, max: 10 })).toBe(false);
      expect(validator.isLength('a'.repeat(51), { min: 3, max: 50 })).toBe(false);
    });
  });

  describe('Alphanumeric Validation', () => {
    it('should validate alphanumeric strings', () => {
      expect(validator.isAlphanumeric('test123')).toBe(true);
      expect(validator.isAlphanumeric('UserName')).toBe(true);
    });

    it('should reject non-alphanumeric strings', () => {
      expect(validator.isAlphanumeric('test@123')).toBe(false);
      expect(validator.isAlphanumeric('user name')).toBe(false);
      expect(validator.isAlphanumeric('test-123')).toBe(false);
    });
  });

  describe('Numeric Validation', () => {
    it('should validate numbers', () => {
      expect(validator.isInt('123')).toBe(true);
      expect(validator.isInt('0')).toBe(true);
      expect(validator.isInt('-50')).toBe(true);
    });

    it('should validate numbers within ranges', () => {
      expect(validator.isInt('25', { min: 1, max: 100 })).toBe(true);
      expect(validator.isInt('1', { min: 1, max: 100 })).toBe(true);
      expect(validator.isInt('100', { min: 1, max: 100 })).toBe(true);
    });

    it('should reject numbers outside ranges', () => {
      expect(validator.isInt('0', { min: 1, max: 100 })).toBe(false);
      expect(validator.isInt('101', { min: 1, max: 100 })).toBe(false);
      expect(validator.isInt('abc')).toBe(false);
    });
  });
});