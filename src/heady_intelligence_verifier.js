const HeadyIntelligenceVerifier = require('./client/heady_intelligence_verifier');

if (require.main === module) {
  const verifier = new HeadyIntelligenceVerifier({ verbose: true });

  verifier.verify()
    .then(results => {
      console.log('\n📊 Verification Summary:');
      console.log(JSON.stringify(verifier.getSummary(), null, 2));
      process.exit(results.passed ? 0 : 1);
    })
    .catch(error => {
      console.error('❌ Verification failed:', error.message);
      process.exit(1);
    });
}

module.exports = HeadyIntelligenceVerifier;
