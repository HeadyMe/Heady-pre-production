// HEADY_BRAND:BEGIN
// ╔══════════════════════════════════════════════════════════════════╗
// ║  █╗  █╗███████╗ █████╗ ██████╗ █╗   █╗                     ║
// ║  █║  █║█╔════╝█╔══█╗█╔══█╗╚█╗ █╔╝                     ║
// ║  ███████║█████╗  ███████║█║  █║ ╚████╔╝                      ║
// ║  █╔══█║█╔══╝  █╔══█║█║  █║  ╚█╔╝                       ║
// ║  █║  █║███████╗█║  █║██████╔╝   █║                        ║
// ║  ╚═╝  ╚═╝╚══════╝╚═╝  ╚═╝╚═════╝    ╚═╝                        ║
// ║                                                                  ║
// ║  ∞ SACRED GEOMETRY ∞  Organic Systems · Breathing Interfaces    ║
// ║  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━  ║
// ║  FILE: backend/src/routes/adminRoutes.js                          ║
// ║  LAYER: backend                                                   ║
// ╚══════════════════════════════════════════════════════════════════╝
// HEADY_BRAND:END

const express = require("express");
const router = express.Router();
const adminController = require("../controllers/adminController");
const { asyncHandler } = require("../utils/helpers");
const { requireApiKey } = require("../middleware/auth");

// Apply auth middleware to all admin routes
router.use(requireApiKey);

router.post("/scan-patterns", asyncHandler(adminController.scanPatterns));
router.get("/registry", asyncHandler(adminController.getRegistry));
router.get("/config/render-yaml", asyncHandler(adminController.getRenderYaml));
router.get("/config/mcp", asyncHandler(adminController.getMcpConfig));
router.get("/settings/gpu", asyncHandler(adminController.getGpuSettings));
router.post("/gpu/infer", asyncHandler(adminController.inferGpu));
router.post("/assistant", asyncHandler(adminController.assistant));
router.post("/lint", asyncHandler(adminController.lintFile));
router.post("/test", asyncHandler(adminController.testFile));

module.exports = router;
