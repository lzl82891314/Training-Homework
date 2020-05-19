'use strict';

/**
 * 计算器主类
 */
class Calculator {
    constructor(analysisBar, calculatingBar) {
        this.analysisBar = analysisBar;
        this.calculatingBar = calculatingBar;
    }

    /**
     * 运算函数
     * @param input 输入参数
     */
    calculate(input) {
        // 四则运算方法：
        // 1、词法分析，把输入的input参数变为tokens
        const tokens = this.inputAnalysis(input);

        // 2、解析执行：解析tokens执行计算结果
        const result = this.calculatingBar.calculating(tokens);
        return result;
    }

    /**
     * 输入参数分析，将输入的参数分解为规则的token
     * @param input 输入参数
     */
    inputAnalysis(input) {
        let tokens = [];

        // 可以做一些简单的异常处理
        if (!this.argumentCheck(input)) {
            throw new Error('input arugment error');
        }

        // 将输入的input通过分析转换为一个数组
        let inputArr = input.trim().split('');
        this.analysisBar.lexicalAnalysis(inputArr, tokens);
        return tokens;
    }

    /**
     * 异常参数Check
     * @param input 需要check的参数
     */
    argumentCheck(input) {
        return /^[0-9*+-/()\s.]+$/.test(input);
    }
}

module.exports = Calculator;
