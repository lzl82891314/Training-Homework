'use strict';

const CalculatingAbstract = require('./calculatingabstract');

/**
 * 计算器实现V2——测试完备可用
 * 递归模式
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
        // 版本二逻辑：版本一出问题的主要原因是因为每次遇到低优先级的运算就跳过，导致最终会执行为从右向左的结果
        // 因此逻辑二中加入多重判断规则，当优先计算之后还需要做一次优先判断，如果leftOperator依然低于nextOperator，则继续优先计算

        if (!tokens) {
            throw new Error('argument error');
        }

        const result = this.calculateRecursive(tokens, 0);
        return result;
    }

    /**
     * 算数递归
     * @param tokens 运算token集合
     * @param leftResult 运算中介结果
     */
    calculateRecursive(tokens, leftResult) {
        // 两种递归结束条件
        if (tokens.length === 0) {
            return leftResult;
        }
        if (tokens.length === 1 && tokens[0].type === 'Number') {
            return tokens.shift().value;
        }
        // 一种数字条件直接下一轮递归
        const fir_Token = tokens[0];
        if (fir_Token.type === 'Number') {
            leftResult = fir_Token.value;
            tokens.shift();
            return this.calculateRecursive(tokens, leftResult);
        }

        // 运算逻辑处理
        let curr_Operator = tokens.shift();
        let next_Operator = tokens.find((element) => element.type !== 'Number');

        // 如果优先级高于下一个运算符，则直接计算
        if (this.isPrimary(curr_Operator, next_Operator)) {
            if (curr_Operator.type === 'Parenthesis-Left') {
                tokens.unshift(curr_Operator);
                leftResult = this.parenthesesPrimary(tokens);
                curr_Operator = tokens.shift();
            }
            if (tokens.length === 0) {
                return leftResult;
            }
            const next_Number = tokens.shift();
            leftResult = this.doCalculate(leftResult, curr_Operator.value, next_Number.value);
            return this.calculateRecursive(tokens, leftResult);
        }

        // 否则，递归计算下一个运算符之后再进行当前计算
        else {
            // 首先计算出第一个优先运算的结果
            let rightResult = this.primaryCalculating(tokens);
            // 然后继续判定
            next_Operator = tokens.find((element) => element.type !== 'Number');
            // 如果下个运算依然是高优先级的运算，则递归计算结果
            if (!this.isPrimary(curr_Operator, next_Operator)) {
                // 注意，此时的rightResult就变成了这次递归的leftResult
                rightResult = this.calculateRecursive(tokens, rightResult);
            }

            leftResult = this.doCalculate(leftResult, curr_Operator.value, rightResult);
            return this.calculateRecursive(tokens, leftResult);
        }
    }

    /**
     * 括号优先规则
     * @param tokens 运算token集合
     */
    parenthesesPrimary(tokens) {
        const innerTokens = this.removeOuterParentheses(tokens);
        const result = this.calculateRecursive(innerTokens, 0);
        return result;
    }

    /**
     * 优先计算规则
     * @param tokens 运算token集合
     */
    primaryCalculating(tokens) {
        if (tokens[0].type === 'Parenthesis-Left') {
            return this.parenthesesPrimary(tokens);
        }

        const fir_Token = tokens.shift();
        const curr_Operator = tokens.shift();
        const next_Operator = tokens.find((element) => element.type !== 'Number');
        if (this.isPrimary(curr_Operator, next_Operator)) {
            const next_Token = tokens.shift();
            return this.doCalculate(fir_Token.value, curr_Operator.value, next_Token.value);
        } else {
            return this.doCalculate(fir_Token.value, curr_Operator.value, this.primaryCalculating(tokens));
        }
    }
}

module.exports = CalculatingImpl;
