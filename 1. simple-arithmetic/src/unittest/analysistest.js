'use strict';

const AnalysisImpl = require('../core/analysisimpl');
const should = require('chai').should();

/**
 * 单元测试——lexicalAnalysis方法——返回正确的结果
 */
function testFunc_lexicalAnalysis_withCorrectResult() {
    const bar = new AnalysisImpl();
    let token = [];
    bar.lexicalAnalysis('1+2+3+4'.split(''), token);
    token.should.be.a('array').that.length(7);
    let item1 = token[0];
    item1.should.be.a('object');
    item1.type.should.be.a('string').that.equal('Number');
    item1.value.should.be.a('string').that.equal('1');
    let item2 = token[1];
    item2.should.be.a('object');
    item2.type.should.be.a('string').that.equal('Operator');
    item2.value.should.be.a('string').that.equal('+');
    console.log(token); // [1, +, 2, +, 3, +, 4]

    token = [];
    bar.lexicalAnalysis('1+2*3-4'.split(''), token);
    token.should.be.a('array').that.length(7);
    item1 = token[0];
    item1.should.be.a('object');
    item1.type.should.be.a('string').that.equal('Number');
    item1.value.should.be.a('string').that.equal('1');
    item2 = token[3];
    item2.should.be.a('object');
    item2.type.should.be.a('string').that.equal('Operator');
    item2.value.should.be.a('string').that.equal('*');
    console.log(token); // [1, +, 2, *, 3, -, 4]

    token = [];
    bar.lexicalAnalysis('1-(2+3)*4'.split(''), token);
    token.should.be.a('array').that.length(9);
    item1 = token[0];
    item1.should.be.a('object');
    item1.type.should.be.a('string').that.equal('Number');
    item1.value.should.be.a('string').that.equal('1');
    item2 = token[2];
    item2.should.be.a('object');
    item2.type.should.be.a('string').that.equal('Parenthesis-Left');
    item2.value.should.be.a('string').that.equal('(');
    console.log(token); // [1, -, (, 2, +, 3, ), *, 4]

    token = [];
    bar.lexicalAnalysis('1.23 + 2.34 * 3.567 / 4.1'.split(''), token);
    token.should.be.a('array').that.length(7);
    item1 = token[0];
    item1.should.be.a('object');
    item1.type.should.be.a('string').that.equal('Number');
    item1.value.should.be.a('string').that.equal('1.23');
    item2 = token[5];
    item2.should.be.a('object');
    item2.type.should.be.a('string').that.equal('Operator');
    item2.value.should.be.a('string').that.equal('/');
    console.log(token); // [1.23, +, 2.34, *, 3.567, /, 4.1]
}

/**
 * 单元测试——numberAnalysis方法——以正确的返回结果
 */
function testFunc_numberAnalysis_withCorrectResult() {
    const bar = new AnalysisImpl();

    let result = bar.numberAnalysis('12345'.split(''));
    result.should.be.a('string');
    result.should.to.not.be.NaN;
    result.should.to.equal('12345');
    console.log(result); // 12345

    result = bar.numberAnalysis('  123 45  '.split(''));
    result.should.be.a('string');
    result.should.to.not.be.NaN;
    result.should.to.equal('12345');
    console.log(result); // 12345

    result = bar.numberAnalysis('123.456'.split(''));
    result.should.be.a('string');
    result.should.to.not.be.NaN;
    result.should.to.equal('123.456');
    console.log(result); // 123.456

    result = bar.numberAnalysis('1 2 3.4 5 6'.split(''));
    result.should.be.a('string');
    result.should.to.not.be.NaN;
    result.should.to.equal('123.456');
    console.log(result); // 123.456

    result = bar.numberAnalysis(' 0 1 2 3.4 5 6'.split(''));
    result.should.be.a('string');
    result.should.to.not.be.NaN;
    result.should.to.equal('0123.456');
    console.log(result); // 0123.456  值得优化
}

testFunc_lexicalAnalysis_withCorrectResult();
testFunc_numberAnalysis_withCorrectResult();
