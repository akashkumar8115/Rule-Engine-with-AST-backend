const Rule = require('../models/ruleModel');
const { parseRuleToAST, evaluateAST, combineRulesAST } = require('../utils/astParser');

exports.getAllRules = async (req, res) => {
    try {
        const rules = await Rule.find({}).sort({ createdAt: -1 });
        res.status(200).json(rules);
    } catch (error) {
        res.status(400).json({ message: 'Error fetching rules', error: error.message });
    }
};

exports.createRule = async (req, res) => {
    const { ruleString, name } = req.body;

    try {
        const ast = parseRuleToAST(ruleString);
        const newRule = new Rule({ ruleString, name, ast });
        await newRule.save();
        res.status(201).json(newRule);
    } catch (error) {
        res.status(400).json({ message: 'Invalid rule format', error: error.message });
    }
};

exports.evaluateRule = async (req, res) => {
    const { ruleId, data } = req.body;

    try {
        const rule = await Rule.findById(ruleId);
        if (!rule) {
            return res.status(404).json({ message: 'Rule not found' });
        }
        const result = evaluateAST(rule.ast, data);
        res.status(200).json({ result });
    } catch (error) {
        res.status(400).json({ message: 'Error evaluating rule', error: error.message });
    }
};

exports.combineRules = async (req, res) => {
    const { rule1Id, rule2Id, operator } = req.body;

    try {
        const rule1 = await Rule.findById(rule1Id);
        const rule2 = await Rule.findById(rule2Id);
 
        if (!rule1 || !rule2) {
            return res.status(404).json({ message: 'One or both rules not found' });
        }

        const combinedAST = combineRulesAST(rule1.ast, rule2.ast, operator);
        const combinedRuleString = `(${rule1.ruleString}) ${operator} (${rule2.ruleString})`;

        const newRule = new Rule({
            ruleString: combinedRuleString,
            name: `Combined Rule (${rule1.name} ${operator} ${rule2.name})`,
            ast: combinedAST
        });

        await newRule.save();
        res.status(201).json(newRule);
    } catch (error) {
        res.status(400).json({ message: 'Error combining rules', error: error.message });
    }
};
