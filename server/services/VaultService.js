const { encrypt, decrypt } = require('../utils/encryptor');
const User = require('../models/User');

class VaultService {
  static async storeCredentials(userId, credentials) {
    const existing = await this.getCredentials(userId);
    const merged = { ...existing, ...credentials };
    const encrypted = encrypt(merged);
    await User.findByIdAndUpdate(userId, { 'vault.encryptedData': encrypted });
    return true;
  }

  static async getCredentials(userId) {
    const user = await User.findById(userId).select('vault');
    if (!user || !user.vault?.encryptedData) return {};
    return decrypt(user.vault.encryptedData);
  }

  static async deleteCredential(userId, key) {
    const credentials = await this.getCredentials(userId);
    delete credentials[key];
    const encrypted = encrypt(credentials);
    await User.findByIdAndUpdate(userId, { 'vault.encryptedData': encrypted });
    return true;
  }
}

module.exports = VaultService;
