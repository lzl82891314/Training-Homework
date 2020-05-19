'use strict';

const AnalysisAbstract = require('./analysisabstract');

/**
 * 输入分析默认实现
 */
class AnalysisImpl extends AnalysisAbstract {
    constructor() {
        super();
    }

    /**
     * 词法分析，具体实现将每个输入的每个char进行分析计算
     * @param input 输入参数
     * @param tokens 分析之后的运算符结果集合
     */
    lexicalAnalysis(input, tokens) {
        // 限制输入数组，方便递归使用
        if (!Array.isArray(input)) {
            throw new Error('only array legal');
        }
        // 如果数组为空，说明是最后一个元素，直接返回空字符串
        if (input.length === 0) {
            return;
        }

        // 每次只判断第一个输入的char，通过此char断定当前需要处理的数据为什么类型
        const char = input[0];
        // 如果是空字符，直接跳过
        if (char === ' ') {
            input.shift();
            return this.lexicalAnalysis(input, tokens);
        }

        // 语法分析，状态机
        // 如果是数字，则处理为运算数
        if (
            char === '0' ||
            char === '1' ||
            char === '2' ||
            char === '3' ||
            char === '4' ||
            char === '5' ||
            char === '6' ||
            char === '7' ||
            char === '8' ||
            char === '9' ||
            char === '.'
        ) {
            tokens.push({ type: 'Number', value: this.numberAnalysis(input) });
            return this.lexicalAnalysis(input, tokens);
        } else if (char === '+' || char === '-' || char === '*' || char === '/') {
            tokens.push({ type: 'Operator', value: input.shift() });
            return this.lexicalAnalysis(input, tokens);
        } else if (char === '(') {
            tokens.push({ type: 'Parenthesis-Left', value: input.shift() });
            return this.lexicalAnalysis(input, tokens);
        } else if (char === ')') {
            tokens.push({ type: 'Parenthesis-Right', value: input.shift() });
            return this.lexicalAnalysis(input, tokens);
        }
        return;
    }

    /**
     * 运算数字分析，做此分析纯粹是为了将连续的单个数字拼接为一个数字
     * @param input 仅限于数字数据
     */
    numberAnalysis(input) {
        // 限制输入数组，方便递归使用
        if (!Array.isArray(input)) {
            throw new Error('only array legal');
        }
        // 如果数组为空，说明是最后一个元素，直接返回空字符串
        if (input.length === 0) {
            return '';
        }

        // 每次只判断第一个输入的char，通过此char断定当前需要处理的数据为什么类型
        const char = input[0];
        // 如果是空字符，直接跳过
        if (char === ' ') {
            input.shift();
            return this.numberAnalysis(input);
        }

        if (
            char === '0' ||
            char === '1' ||
            char === '2' ||
            char === '3' ||
            char === '4' ||
            char === '5' ||
            char === '6' ||
            char === '7' ||
            char === '8' ||
            char === '9' ||
            char === '.'
        ) {
            return input.shift() + this.numberAnalysis(input);
        } else {
            return '';
        }
    }
}

module.exports = AnalysisImpl;
