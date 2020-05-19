'use strict';

/**
 * 输入分析抽象类
 * 将输入的字符串参数通过分析形成tokens
 */
class AnalysisAbstract {
    /**
     * 词法分析，具体实现将每个输入的每个char进行分析计算
     * @param input 输入参数
     * @param tokens 分析之后的运算符结果集合
     */
    lexicalAnalysis(input, tokens) {}

    /**
     * 运算数字分析，做此分析纯粹是为了将连续的单个数字拼接为一个数字
     * @param input 仅限于数字数据
     */
    numberAnalysis(input) {}
}

module.exports = AnalysisAbstract;
