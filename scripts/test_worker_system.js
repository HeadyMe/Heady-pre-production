const axios = require('axios');

async function testWorkerSystem() {
  const managerUrl = 'http://localhost:3300';
  
  // 1. Test worker registration
  try {
    const registerResponse = await axios.post(`${managerUrl}/api/workers/register`, {
      workerId: 'test-worker-1',
      capabilities: ['hf_inference', 'data_processing']
    });
    console.log('Worker registration:', registerResponse.data);
  } catch (error) {
    console.error('Worker registration failed:', error.response?.data || error.message);
    return;
  }
  
  // 2. Test task assignment
  try {
    const taskResponse = await axios.get(`${managerUrl}/api/workers/task`, {
      params: { workerId: 'test-worker-1' }
    });
    console.log('Task assignment:', taskResponse.data);
  } catch (error) {
    console.error('Task assignment failed:', error.response?.data || error.message);
  }
  
  // 3. Test worker health status
  try {
    const healthResponse = await axios.get(`${managerUrl}/api/workers/health`);
    console.log('Worker health status:', healthResponse.data);
  } catch (error) {
    console.error('Health check failed:', error.response?.data || error.message);
  }
}

testWorkerSystem();
