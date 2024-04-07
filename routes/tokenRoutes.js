const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');
const tokenController = require('../controllers/tokenController')

router.get('/token_usage', authMiddleware, tokenController.getTokenUsage);
router.get('/plans', authMiddleware, tokenController.fetchPlan);
router.post('/couponverify', authMiddleware, tokenController.couponverify);


module.exports = router;