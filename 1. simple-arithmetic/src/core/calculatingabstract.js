'use strict';

const Arithmetic = require('../util/arithmetic.js');

/**
 * 计算功能抽象
 */
class CalculatingAbstract {
    /**
     * 计算tokens，返回计算结果
     * @param tokens 分析得到的token集合
     */
    calculating(tokens) {}

    /**
     * 计算逻辑
     * @param tokenValueX 第一个运算数字
     * @param operator 运算符
     * @param tokenValueY 第二个运算数字
     */
    doCalculate(tokenValueX, operator, tokenValueY) {
        const numberX = Number(tokenValueX);
        const numberY = Number(tokenValueY);

        if (operator === '+') {
            return Arithmetic.addition(numberX, numberY);
        } else if (operator === '-') {
            return Arithmetic.subtraction(numberX, numberY);
        } else if (operator === '*') {
            return Arithmetic.multiplication(numberX, numberY);
        } else if (operator === '/') {
            return Arithmetic.division(numberX, numberY);
        }
    }

    /**
     * 提取token集合中的最外层括号，并且返回一个括号内的子集合
     * @param tokens 待去除的token父集合
     */
    removeOuterParentheses(tokens) {
        const fir_Parentheses = tokens.shift();
        const tempStack = [];
        tempStack.push(fir_Parentheses.value);

        let index = 0;
        do {
            const tempToken = tokens[index++];
            if (tempToken.type === 'Parenthesis-Left') {
                tempStack.push(tempToken.value);
            } else if (tempToken.type === 'Parenthesis-Right') {
                tempStack.pop();
            }
        } while (tempStack.length > 0);

        let innerTokens = [];
        do {
            innerTokens.push(tokens.shift());
        } while (--index > 1);
        tokens.shift();
        return innerTokens;
    }

    /**
     * 是否是高优先级运算
     * @param curr_Operator 当前需要运算的运算符
     * @param next_Operator 下一个遇到的运算符
     */
    isPrimary(curr_Operator, next_Operator) {
        if (curr_Operator.type === 'Parenthesis-Left') {
            return true;
        }
        if (!next_Operator || next_Operator.type === 'Parenthesis-Right') {
            return true;
        }
        if (curr_Operator.value === '+' || curr_Operator.value === '-') {
            if (next_Operator.value === '+' || next_Operator.value === '-') {
                return true;
            } else {
                return false;
            }
        } else if (curr_Operator.value === '*' || curr_Operator.value === '/') {
            if (next_Operator.value === '+' || next_Operator.value === '-' || next_Operator.value === '*' || next_Operator.value === '/') {
                return true;
            } else {
                return false;
            }
        }
        return false;
    }
}

module.exports = CalculatingAbstract;
