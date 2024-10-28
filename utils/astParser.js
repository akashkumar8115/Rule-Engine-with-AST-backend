class Node {
    constructor(type, value = null) {
        this.type = type;
        this.left = null;
        this.right = null;
        this.value = value;
        this.operator = null;
        this.attribute = null;
    }

    static createOperatorNode(operator) {
        const node = new Node('operator');
        node.operator = operator;
        return node;
    }

    static createOperandNode(attribute, operator, value) {
        const node = new Node('operand');
        node.attribute = attribute;
        node.operator = operator;
        node.value = value;
        return node;
    }
}

function parseRuleToAST(ruleString) {
    // Tokenize the rule string
    const tokens = tokenize(ruleString);

    // Use the shunting-yard algorithm to convert infix to postfix notation
    const postfix = shuntingYard(tokens);

    // Build the AST from the postfix notation
    const stack = [];
    for (const token of postfix) {
        if (isOperator(token)) {
            const right = stack.pop();
            const left = stack.pop();
            const node = new Node('operator', token);
            node.left = left;
            node.right = right;
            stack.push(node);
        } else {
            stack.push(new Node('operand', token));
        }
    }

    // The last element in the stack is the root of the AST
    return stack[0];
}

function combineRulesAST(rules) {
    if (rules.length === 0) {
        return null;
    }

    if (rules.length === 1) {
        return rules[0];
    }

    // Combine rules using AND operator by default
    const rootNode = new Node('operator', 'AND');
    rootNode.left = rules[0];
    rootNode.right = combineRulesAST(rules.slice(1));

    return rootNode;
}

function evaluateAST(ast, data) {
    if (ast.type === 'operand') {
        // Evaluate operand condition (e.g., "age > 30")
        const [attr, operator, value] = ast.value.split(/\s+(?=(?:'[^']*'|[^'])+$)/); // Split by space but consider single-quoted strings
        const formattedValue = isNaN(value) ? value.replace(/'/g, '') : parseFloat(value); // Remove quotes from string values
        return eval(`${data[attr]} ${operator} ${formattedValue}`);
    } else if (ast.type === 'operator') {
        if (ast.value === 'AND') {
            return evaluateAST(ast.left, data) && evaluateAST(ast.right, data);
        } else if (ast.value === 'OR') {
            return evaluateAST(ast.left, data) || evaluateAST(ast.right, data);
        }
    }
}

function tokenize(ruleString) {
    const operators = ['AND', 'OR', '>', '<', '=', '>=', '<=', '!='];
    const tokens = [];
    let current = '';
    
    for (let i = 0; i < ruleString.length; i++) {
        if (ruleString[i] === ' ') {
            if (current) {
                tokens.push(current);
                current = '';
            }
            continue;
        }
        
        if ('()'.includes(ruleString[i])) {
            if (current) {
                tokens.push(current);
                current = '';
            }
            tokens.push(ruleString[i]);
            continue;
        }
        
        current += ruleString[i];
        
        if (operators.includes(current)) {
            tokens.push(current);
            current = '';
        }
    }
    
    if (current) tokens.push(current);
    return tokens;
}

function shuntingYard(tokens) {
    const output = [];
    const operators = [];
    const precedence = {
        'OR': 1,
        'AND': 2,
    };

    for (const token of tokens) {
        if (!isOperator(token) && token !== '(' && token !== ')') {
            output.push(token);
        } else if (isOperator(token)) {
            while (
                operators.length > 0 &&
                isOperator(operators[operators.length - 1]) &&
                precedence[token] <= precedence[operators[operators.length - 1]]
            ) {
                output.push(operators.pop());
            }
            operators.push(token);
        } else if (token === '(') {
            operators.push(token);
        } else if (token === ')') {
            while (operators.length > 0 && operators[operators.length - 1] !== '(') {
                output.push(operators.pop());
            }
            operators.pop(); // Remove the '('
        }
    }

    while (operators.length > 0) {
        output.push(operators.pop());
    }

    return output;
}

function isOperator(token) {
    return ['AND', 'OR'].includes(token);
}

function evaluateNode(node, data) {
    if (!node) return true;

    if (node.type === 'operand') {
        const value = data[node.attribute];
        switch (node.operator) {
            case '>': return value > node.value;
            case '<': return value < node.value;
            case '=': return value === node.value;
            case '>=': return value >= node.value;
            case '<=': return value <= node.value;
            case '!=': return value !== node.value;
            default: return false;
        }
    }

    if (node.type === 'operator') {
        const leftResult = evaluateNode(node.left, data);
        const rightResult = evaluateNode(node.right, data);
        
        switch (node.operator) {
            case 'AND': return leftResult && rightResult;
            case 'OR': return leftResult || rightResult;
            default: return false;
        }
    }

    return false;
}

module.exports = {
    Node,
    tokenize,
    evaluateNode,
    parseRuleToAST,
    evaluateAST,
    combineRulesAST
};