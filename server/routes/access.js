const router = require('express').Router();
const { getAccessDocument, signDocument } = require('../controllers/accessController');
const { signLimiter } = require('../middleware/rateLimiter');

// Public endpoints accessed via unique cryptographic token
router.get('/:token', getAccessDocument);
router.post('/:token/sign', signLimiter, signDocument);

module.exports = router;
