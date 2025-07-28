// 간단한 API 키 관리 시스템 (파일 기반)
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

class APIKeyService {
  constructor() {
    this.keysFile = path.join(__dirname, '../data/api-keys.json');
    this.usageFile = path.join(__dirname, '../data/api-usage.json');
    this.ensureDataFiles();
  }

  ensureDataFiles() {
    const dataDir = path.dirname(this.keysFile);
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true });
    }

    // API 키 파일 초기화
    if (!fs.existsSync(this.keysFile)) {
      const initialKeys = {
        // 테스트용 API 키
        'sayu_test_key_123': {
          name: 'Test Key',
          tier: 'premium',
          dailyLimit: 1000,
          created: new Date().toISOString(),
          active: true
        }
      };
      fs.writeFileSync(this.keysFile, JSON.stringify(initialKeys, null, 2));
    }

    // 사용량 파일 초기화
    if (!fs.existsSync(this.usageFile)) {
      fs.writeFileSync(this.usageFile, JSON.stringify({}, null, 2));
    }
  }

  getKeys() {
    try {
      const data = fs.readFileSync(this.keysFile, 'utf8');
      return JSON.parse(data);
    } catch (error) {
      console.error('Failed to read API keys:', error);
      return {};
    }
  }

  getUsage() {
    try {
      const data = fs.readFileSync(this.usageFile, 'utf8');
      return JSON.parse(data);
    } catch (error) {
      console.error('Failed to read API usage:', error);
      return {};
    }
  }

  saveUsage(usage) {
    try {
      fs.writeFileSync(this.usageFile, JSON.stringify(usage, null, 2));
    } catch (error) {
      console.error('Failed to save API usage:', error);
    }
  }

  async validateAPIKey(apiKey) {
    if (!apiKey) {
      return { valid: false, reason: 'No API key provided' };
    }

    const keys = this.getKeys();
    const keyData = keys[apiKey];

    if (!keyData) {
      return { valid: false, reason: 'Invalid API key' };
    }

    if (!keyData.active) {
      return { valid: false, reason: 'API key is disabled' };
    }

    // 오늘 사용량 체크
    const today = new Date().toISOString().split('T')[0];
    const usage = this.getUsage();
    const todayUsage = usage[apiKey]?.[today] || 0;

    if (todayUsage >= keyData.dailyLimit) {
      return { valid: false, reason: 'Daily limit exceeded' };
    }

    return {
      valid: true,
      keyData,
      usageToday: todayUsage,
      remainingToday: keyData.dailyLimit - todayUsage
    };
  }

  async trackUsage(apiKey, endpoint) {
    const today = new Date().toISOString().split('T')[0];
    const usage = this.getUsage();

    if (!usage[apiKey]) {
      usage[apiKey] = {};
    }

    if (!usage[apiKey][today]) {
      usage[apiKey][today] = 0;
    }

    usage[apiKey][today]++;

    // 사용량 저장
    this.saveUsage(usage);

    // 로그 기록
    this.logUsage(apiKey, endpoint);

    return usage[apiKey][today];
  }

  logUsage(apiKey, endpoint) {
    const logEntry = {
      timestamp: new Date().toISOString(),
      apiKey: `${apiKey.substring(0, 8)}***`, // 일부만 로깅
      endpoint,
      ip: 'hidden' // IP는 별도 처리 필요
    };

    const logDir = path.join(__dirname, '../logs');
    if (!fs.existsSync(logDir)) {
      fs.mkdirSync(logDir, { recursive: true });
    }

    const logFile = path.join(logDir, 'api-usage.log');
    fs.appendFileSync(logFile, `${JSON.stringify(logEntry)}\n`);
  }

  generateAPIKey(name, tier = 'free') {
    const keyId = crypto.randomBytes(16).toString('hex');
    const apiKey = `sayu_${tier}_${keyId}`;

    const keyData = {
      name,
      tier,
      dailyLimit: tier === 'premium' ? 10000 : 100,
      created: new Date().toISOString(),
      active: true
    };

    const keys = this.getKeys();
    keys[apiKey] = keyData;

    try {
      fs.writeFileSync(this.keysFile, JSON.stringify(keys, null, 2));
      return { apiKey, ...keyData };
    } catch (error) {
      console.error('Failed to save new API key:', error);
      return null;
    }
  }
}

module.exports = new APIKeyService();
