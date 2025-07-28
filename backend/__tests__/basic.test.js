const request = require('supertest');
const express = require('express');

describe('Basic Test Suite', () => {
  it('should run a simple test', () => {
    expect(2 + 2).toBe(4);
  });

  it('should test environment variables', () => {
    expect(process.env.NODE_ENV).toBe('test');
    expect(process.env.JWT_SECRET).toBe('test-jwt-secret');
  });

  it('should test async function', async () => {
    const promise = Promise.resolve('success');
    const result = await promise;
    expect(result).toBe('success');
  });

  it('should test JSON operations', () => {
    const testObj = { id: 1, name: 'test' };
    const jsonString = JSON.stringify(testObj);
    const parsed = JSON.parse(jsonString);

    expect(parsed).toEqual(testObj);
    expect(parsed.id).toBe(1);
    expect(parsed.name).toBe('test');
  });

  it('should test Express app creation', () => {
    const app = express();
    app.get('/test', (req, res) => {
      res.json({ message: 'test success' });
    });

    return request(app)
      .get('/test')
      .expect(200)
      .then(response => {
        expect(response.body.message).toBe('test success');
      });
  });
});
