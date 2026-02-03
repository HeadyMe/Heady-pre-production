const crypto = require('crypto');

class HardwareAttestation {
  constructor() {
    this.trustedKeys = [
      process.env.TPM_PUBLIC_KEY,
      process.env.SGX_PUBLIC_KEY
    ].filter(Boolean);
  }
  
  verify(signature, data) {
    for (const key of this.trustedKeys) {
      const verifier = crypto.createVerify('sha256');
      verifier.update(data);
      if (verifier.verify(key, signature, 'base64')) {
        return true;
      }
    }
    return false;
  }
}

module.exports = new HardwareAttestation();
