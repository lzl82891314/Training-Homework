'use strict';

const CalculatingAbstract = require('./calculatingabstract');

/**
 * 计算器默认实现——弃用，未实现完成，存在严重bug
 * 因为内部代码有严重计算漏洞，直接计算了当前运算符和优先运算符，导致优先级混乱，因此弃用重写
 */
class CalculatingImpl extends CalculatingAbstract {
    constructor() {
        super();
    }

    /**
     * 将计算好的运算符按照四则运算规则进行计算
     * @param tokens 分析后的运算符集合
     */
    calculating(tokens, tempResult = 0) {
        if (!tokens) {
            throw new Error('argument error');
        }
        if (tokens.length === 0) {
            return tempResult;
        }
        if (tokens.length === 1) {
            let token = tokens.shift();
            if (token.type === 'Number') {
                return token.value;
            }
        }

        let token = tokens.shift();
        if (token.type === 'Number') {
            let operator = tokens.shift();
            if (operator.value === '+' || operator.value === '-') {
                // return this.doCalculate(token.value, operator.value, this.calculating(tokens, tempResult));
                let calculatingResult = this.calculating(tokens, tempResult);
                let result = this.doCalculate(token.value, operator.value, calculatingResult);
                return result;
            } else if (operator.value === '*' || operator.value === '/') {
                let nextToken = tokens.shift();
                if (nextToken.type === 'Number') {
                    // return this.calculating(tokens, this.doCalculate(token.value, operator.value, nextToken.value));
                    tempResult = this.doCalculate(token.value, operator.value, nextToken.value);
                    let result = this.calculating(tokens, tempResult);
                    return result;
                } else if (nextToken.type === 'Parenthesis-Right') {
                    // return this.doCalculate(token.value, operator.value, this.calculating(tokens, tempResult));
                    let calculatingResult = this.calculating(tokens, tempResult);
                    let result = this.doCalculate(token.value, operator.value, calculatingResult);
                    return result;
                }
            } else if (operator.type === 'Parenthesis-Left') {
                return token.value;
            }
        } else if (token.type === 'Operator') {
            // return this.doCalculate(tempResult, token.value, this.calculating(tokens, tempResult));
            let calculatingResult = this.calculating(tokens, tempResult);
            let result = this.doCalculate(tempResult, token.value, calculatingResult);
            return result;
        } else if (token.type === 'Parenthesis-Right') {
            tempResult = this.calculating(tokens, tempResult);
            let result = this.calculating(tokens, tempResult);
            return result;
        } else if (token.type === 'Parenthesis-Left') {
            return tempResult;
        }
    }
}

module.exports = CalculatingImpl;
