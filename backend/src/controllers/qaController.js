// HEADY_BRAND:BEGIN
// HEADY SYSTEMS :: SACRED GEOMETRY
// FILE: backend/src/controllers/qaController.js
// LAYER: backend
// 
//         _   _  _____    _    ____   __   __
//        | | | || ____|  / \  |  _ \ \ \ / /
//        | |_| ||  _|   / _ \ | | | | \ V / 
//        |  _  || |___ / ___ \| |_| |  | |  
//        |_| |_||_____/_/   \_\____/   |_|  
// 
//    Sacred Geometry :: Organic Systems :: Breathing Interfaces
// HEADY_BRAND:END

const { runNodeQa } = require("../utils/ai");

// QA Controller Logic (if separated from adminController)
// Currently, adminController handles assistant logic using python-hf backend.
// This controller can handle node-hf backend or specific QA routes.

async function handleQa(req, res) {
  const { question, context, model, parameters } = req.body;
  if (!question) {
    throw new Error("Question is required");
  }

  const result = await runNodeQa({ 
    question, 
    context, 
    model, 
    parameters 
  });

  res.json(result);
}

module.exports = {
  handleQa
};
