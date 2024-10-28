const express = require('express');
const {getAllRules, createRule, evaluateRule, combineRules } = require('../controllers/ruleController');
const router = express.Router();

router.get('/', getAllRules);
router.post('/create', createRule);
router.post('/evaluate', evaluateRule);
router.post('/combine', combineRules);

module.exports = router;