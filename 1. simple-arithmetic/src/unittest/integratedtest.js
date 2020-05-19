'use strict';

const AnalysisImpl = require('../core/analysisimpl');
const CalculatingImpl = require('../core/calculatingimpl_v2');
const Calculator = require('../core/calculator');
const Stopwatch = require('../util/stopwatch');
const should = require('chai').should();

/**
 * 集成单元测试——主方法calculate——以正确的结果
 */
function testFunc_calculate_withCorrectResult() {
    const analysisBar = new AnalysisImpl();
    const calculatingBar = new CalculatingImpl();
    const bar = new Calculator(analysisBar, calculatingBar);

    // 测试1：简单加减乘除计算
    Stopwatch.refreshTime();
    let result = bar.calculate('1+2-3*4/5');
    Stopwatch.showTimeSpan();
    result.should.be.a('number');
    result.should.be.equal(0.6);
    console.log(result); // 0.6

    // 测试2：简单括号匹配计算
    Stopwatch.refreshTime();
    result = bar.calculate('((((-1))))');
    Stopwatch.showTimeSpan();
    result.should.be.a('number');
    result.should.be.equal(-1);
    console.log(result); // -1

    // 测试3：括号匹配+乘法优先级计算
    Stopwatch.refreshTime();
    result = bar.calculate('6/2*(1+2)');
    Stopwatch.showTimeSpan();
    result.should.be.a('number');
    result.should.be.equal(9);
    console.log(result); // 9

    // 测试4：复杂混合运算
    Stopwatch.refreshTime();
    result = bar.calculate('1-(-3*((-1-4)/5)-2)');
    Stopwatch.showTimeSpan();
    result.should.be.a('number');
    result.should.be.equal(0);
    console.log(result); // 0

    // 测试5：双栈模式下会存在的减号匹配错误计算
    Stopwatch.refreshTime();
    result = bar.calculate('0-1-(-2*3-4*5/10)');
    Stopwatch.showTimeSpan();
    result.should.be.a('number');
    result.should.be.equal(7);
    console.log(result); // 7

    // 测试6：双栈模式下会存在的入栈出栈相同结果不同的计算
    Stopwatch.refreshTime();
    const result1 = bar.calculate('1-(-3)');
    const result2 = bar.calculate('-(1-3)');
    Stopwatch.showTimeSpan();
    result1.should.be.a('number');
    result2.should.be.a('number');
    result1.should.not.be.equal(result2);
    result1.should.be.equal(4);
    result2.should.be.equal(2);
    console.log(result1); // 4
    console.log(result2); // 2

    // 测试7：小数的混合运算导致的精度问题计算
    Stopwatch.refreshTime();
    result = bar.calculate('0.12-0.23*0.3/0.2');
    Stopwatch.showTimeSpan();
    result.should.be.a('number');
    result.should.be.equal(-0.225);
    console.log(result); // -0.225
}

testFunc_calculate_withCorrectResult();
