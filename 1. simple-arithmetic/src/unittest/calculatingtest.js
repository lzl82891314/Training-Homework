'use strict';

const CalculatingImpl = require('../core/calculatingimpl');
const CalculatingImplV2 = require('../core/calculatingimpl_v2');
const CalculatingImplV3 = require('../core/calculatingimpl_v3');
const AnalysisImpl = require('../core/analysisimpl');
const should = require('chai').should();

/**
 * 单元测试——calculating方法——以正确的结果——第一版
 */
function testFunc_calculating_withCorrectResult_v1() {
    const bar = new CalculatingImpl();

    let tokens = getTestingData('1+2+3+4+5');
    let result = bar.calculating(tokens);
    result.should.be.a('number');
    result.should.be.equal(15);
    console.log(result); // 15

    tokens = getTestingData('1+2*3+4/5');
    result = bar.calculating(tokens);
    result.should.be.a('number');
    result.should.be.equal(7.8);
    console.log(result); // 7.8

    // 错误结果
    tokens = getTestingData('1-2*3-4/5');
    result = bar.calculating(tokens);
    result.should.be.a('number');
    result.should.be.equal(-5.8);
    console.log(result); // -4.2

    // 错误结果
    tokens = getTestingData('1-2+3-4+5');
    result = bar.calculating(tokens);
    result.should.be.a('number');
    result.should.be.equal(3);
    console.log(result); // 5

    // 错误结果
    tokens = getTestingData('1-(2+3)-4+5');
    result = bar.calculating(tokens);
    result.should.be.a('number');
    result.should.be.equal(-3);
    console.log(result); // 1
}

/**
 * 单元测试——calculating方法——以正确的结果——第二版
 */
function testFunc_calculating_withCorrectResult_v2() {
    const bar = new CalculatingImplV2();

    let tokens = getTestingData('1-2*(3-4)/5');
    let result = bar.calculating(tokens);
    result.should.be.a('number');
    result.should.be.equal(1.4);
    console.log(result); // 1.4

    tokens = getTestingData('1-2*3-4/5');
    result = bar.calculating(tokens);
    result.should.be.a('number');
    result.should.be.equal(-5.8);
    console.log(result); // -5.8

    tokens = getTestingData('1-2+3-4+5');
    result = bar.calculating(tokens);
    result.should.be.a('number');
    result.should.be.equal(3);
    console.log(result); // 3

    tokens = getTestingData('1-(2+3)-4+5');
    result = bar.calculating(tokens);
    result.should.be.a('number');
    result.should.be.equal(-3);
    console.log(result); // -3

    tokens = getTestingData('1-(-3*((-1-4)/5)-2)');
    result = bar.calculating(tokens);
    result.should.be.a('number');
    result.should.be.equal(0);
    console.log(result); // 0

    tokens = getTestingData('6/2*(1+2)');
    result = bar.calculating(tokens);
    result.should.be.a('number');
    result.should.be.equal(9);
    console.log(result); // 9

    tokens = getTestingData('0-1-(-2*3-4*5/10)');
    result = bar.calculating(tokens);
    result.should.be.a('number');
    result.should.be.equal(7);
    console.log(result); // 7
}

/**
 * 单元测试——calculating方法——以正确的结果——第三版
 * 只支持简单四则运算，不支持括号
 */
function testFunc_calculating_withCorrectResult_v3() {
    const bar = new CalculatingImplV3();

    let tokens = getTestingData('1-2*3');
    let result = bar.calculating(tokens);
    result.should.be.a('number');
    result.should.be.equal(-5);
    console.log(result); // -5

    tokens = getTestingData('1-2*3/4');
    result = bar.calculating(tokens);
    result.should.be.a('number');
    result.should.be.equal(-0.5);
    console.log(result); // -0.5

    tokens = getTestingData('1-2*3-4/5');
    result = bar.calculating(tokens);
    result.should.be.a('number');
    result.should.be.equal(-5.8);
    console.log(result); // -5.8
}

function getTestingData(input) {
    const foo = new AnalysisImpl();
    const tokens = [];
    foo.lexicalAnalysis(input.split(''), tokens);
    return tokens;
}

// testFunc_calculating_withCorrectResult_v1();
testFunc_calculating_withCorrectResult_v2();
testFunc_calculating_withCorrectResult_v3();
