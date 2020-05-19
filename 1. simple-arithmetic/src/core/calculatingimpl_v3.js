'use strict';

const CalculatingAbstract = require('./calculatingabstract');

/**
 * 计算器实现V3——待完成
 * AST后序遍历模式，最终形态
 */
class CalculatingImpl extends CalculatingAbstract {
    constructor() {
        super();
    }

    /**
     * 将计算好的运算符按照四则运算规则进行计算
     * @param tokens 分析后的运算符集合
     */
    calculating(tokens) {
        // 版本三逻辑：
        // 1、定义四则运算：产出四则运算的词法定义和语法定义。（已完成，即定义四则运算的规则）
        // 2、词法分析：把输入的字符串流变成 token。（已完成）
        // 3、语法分析：把 token 变成抽象语法树 AST。
        // 4、解释执行：后序遍历 AST，执行得出结果。

        if (!tokens) {
            throw new Error('argument error');
        }

        // 处理tokens，将其中的Operator改为自己的value值，以供语法分析
        tokens.forEach((element) => {
            if (element.type === 'Operator') {
                element.type = element.value;
            }
        });

        // 添加结束字符EOF，由于上一步做的词法分析中为了符合其他计算方法，因此没有加入EOF标志
        tokens.push({ type: 'EOF', value: 'EOF' });

        // 开始语法分析
        const nodeAST = this.expression(tokens);

        // 解释执行
        const result = this.evaluate(nodeAST);
        return result;
    }

    /**
     * 语法分析，生成AST
     * @param tokens 计算源数据，通过源数据生成AST表达式树
     */
    expression(tokens) {
        if (tokens[0].type === 'AdditiveExpression' && tokens[1] && tokens[1].type === 'EOF') {
            let node = {
                type: 'Expression',
                children: [tokens.shift(), tokens.shift()],
            };
            tokens.unshift(node);
            return node;
        }
        this.additiveExpression(tokens);
        return this.expression(tokens);
    }

    /**
     * 加减法操作
     * @param tokens 需要生成的AST树
     */
    additiveExpression(tokens) {
        if (tokens[0].type === 'MultiplicativeExpression') {
            let node = {
                type: 'AdditiveExpression',
                children: [tokens[0]],
            };
            tokens[0] = node;
            return this.additiveExpression(tokens);
        }
        if (tokens[0].type === 'AdditiveExpression' && tokens[1] && tokens[1].type === '+') {
            let node = {
                type: 'AdditiveExpression',
                operator: '+',
                children: [],
            };
            node.children.push(tokens.shift());
            node.children.push(tokens.shift());
            this.multiplicativeExpression(tokens);
            node.children.push(tokens.shift());
            tokens.unshift(node);
            return this.additiveExpression(tokens);
        }
        if (tokens[0].type === 'AdditiveExpression' && tokens[1] && tokens[1].type === '-') {
            let node = {
                type: 'AdditiveExpression',
                operator: '-',
                children: [],
            };
            node.children.push(tokens.shift());
            node.children.push(tokens.shift());
            this.multiplicativeExpression(tokens);
            node.children.push(tokens.shift());
            tokens.unshift(node);
            return this.additiveExpression(tokens);
        }
        if (tokens[0].type === 'AdditiveExpression') return tokens[0];
        this.multiplicativeExpression(tokens);
        return this.additiveExpression(tokens);
    }

    /**
     * 乘除法操作
     * @param tokens 需要生成的AST树
     */
    multiplicativeExpression(tokens) {
        if (tokens[0].type === 'Number') {
            let node = {
                type: 'MultiplicativeExpression',
                children: [tokens[0]],
            };
            tokens[0] = node;
            return this.multiplicativeExpression(tokens);
        }
        if (tokens[0].type === 'MultiplicativeExpression' && tokens[1] && tokens[1].type === '*') {
            let node = {
                type: 'MultiplicativeExpression',
                operator: '*',
                children: [],
            };
            node.children.push(tokens.shift());
            node.children.push(tokens.shift());
            node.children.push(tokens.shift());
            tokens.unshift(node);
            return this.multiplicativeExpression(tokens);
        }
        if (tokens[0].type === 'MultiplicativeExpression' && tokens[1] && tokens[1].type === '/') {
            let node = {
                type: 'MultiplicativeExpression',
                operator: '/',
                children: [],
            };
            node.children.push(tokens.shift());
            node.children.push(tokens.shift());
            node.children.push(tokens.shift());
            tokens.unshift(node);
            return this.multiplicativeExpression(tokens);
        }
        if (tokens[0].type === 'MultiplicativeExpression') return tokens[0];

        return this.multiplicativeExpression(tokens);
    }

    /**
     * 解释执行，方法就是后序遍历语法分析生成的AST树
     * @param node 语法分析生成的AST树
     */
    evaluate(node) {
        if (node.type === 'Expression') {
            return this.evaluate(node.children[0]);
        }
        if (node.type === 'AdditiveExpression') {
            if (node.operator === '-') {
                return this.doCalculate(this.evaluate(node.children[0]), '-', this.evaluate(node.children[2]));
            }
            if (node.operator === '+') {
                return this.doCalculate(this.evaluate(node.children[0]), '+', this.evaluate(node.children[2]));
            }
            return this.evaluate(node.children[0]);
        }
        if (node.type === 'MultiplicativeExpression') {
            if (node.operator === '*') {
                return this.doCalculate(this.evaluate(node.children[0]), '*', this.evaluate(node.children[2]));
            }
            if (node.operator === '/') {
                return this.doCalculate(this.evaluate(node.children[0]), '/', this.evaluate(node.children[2]));
            }
            return this.evaluate(node.children[0]);
        }
        if (node.type === 'Number') {
            return Number(node.value);
        }
    }
}

module.exports = CalculatingImpl;
