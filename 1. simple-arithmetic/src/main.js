'use strict';

// 引入词法分析类
const AnalysisImpl = require('./core/analysisimpl');
// 引入数值计算类，目前V1存在bug不可用，V2测试通过完全可用，V3没有完成只支持简单运算不支持括号，因此默认都引用V2
const CalculatingImpl = require('./core/calculatingimpl_v2');
// 引入计算器主类
const Calculator = require('./core/calculator');

// 说明：项目中引用的包是chai，是用来做单元测试的，项目功能代码中没有使用任何其他包的依赖，全部手动完成

// 创建计算器运算对象
const analysisBar = new AnalysisImpl();
const calculatingBar = new CalculatingImpl();
const foo = new Calculator(analysisBar, calculatingBar);

// 执行计算
let input = null;
// 以下列出了几个开发中主要遇到的经典测试用例
// 1、简单括号匹配计算
input = '0-((((-1)+2)-3)+4)-5';
console.log(foo.calculate(input)); // -7

// 2、复杂混合运算
input = '1-(-3*((-1-4)/5)-2)';
console.log(foo.calculate(input)); // 0

// 3、以双栈为基础开发的算法下会存在的减号匹配错误计算
let input1 = '1-(-3)';
let input2 = '-(1-3)';
console.log(foo.calculate(input1)); // 4
console.log(foo.calculate(input2)); // 2

// 4、小数的混合运算导致的精度问题计算
input = '0.12-0.23*0.3/0.2';
console.log(foo.calculate(input)); // -0.225
