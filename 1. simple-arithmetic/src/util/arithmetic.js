'use strict';

/**
 * 工具类：四则运算
 * 由于JavaScript中浮点数的精度问题，常常两个浮点数运算的结果是无限循环小数，因此通过此工具类进行格式化
 */
class Arithmetic {
    constructor() {}

    /**
     * 加法运算
     * @param numberX 运算数字X
     * @param numberY 运算数字Y
     */
    static addition(numberX, numberY) {
        if (Number.isNaN(numberX) || Number.isNaN(numberY)) {
            throw new Error('argument error');
        }

        if (Number.isInteger(numberX) && Number.isInteger(numberY)) {
            return numberX + numberY;
        }

        const aX = this.getAccuracy(numberX);
        const aY = this.getAccuracy(numberY);
        const accuracyNumber = Math.pow(10, Math.max(aX, aY));
        return (numberX * accuracyNumber + numberY * accuracyNumber) / accuracyNumber;
    }

    /**
     * 减法运算
     * @param numberX 运算数字X
     * @param numberY 运算数字Y
     */
    static subtraction(numberX, numberY) {
        if (Number.isNaN(numberX) || Number.isNaN(numberY)) {
            throw new Error('argument error');
        }

        if (Number.isInteger(numberX) && Number.isInteger(numberY)) {
            return numberX - numberY;
        }

        const aX = this.getAccuracy(numberX);
        const aY = this.getAccuracy(numberY);
        const accuracyNumber = Math.pow(10, Math.max(aX, aY));
        return (numberX * accuracyNumber - numberY * accuracyNumber) / accuracyNumber;
    }

    /**
     * 乘法运算
     * @param numberX 运算数字X
     * @param numberY 运算数字Y
     */
    static multiplication(numberX, numberY) {
        if (Number.isNaN(numberX) || Number.isNaN(numberY)) {
            throw new Error('argument error');
        }

        if (Number.isInteger(numberX) && Number.isInteger(numberY)) {
            return numberX * numberY;
        }

        const result = numberX * numberY;
        if (!Number.isFinite(result)) {
            return result;
        }

        const aResult = this.getAccuracy(result);
        const accuracyNumber = Math.pow(10, aResult);
        return (result * accuracyNumber) / accuracyNumber;
    }

    /**
     * 除法运算
     * @param numberX 运算数字X
     * @param numberY 运算数字Y
     */
    static division(numberX, numberY) {
        if (Number.isNaN(numberX) || Number.isNaN(numberY)) {
            throw new Error('argument error');
        }

        if (Number.isInteger(numberX) && Number.isInteger(numberY)) {
            return numberX / numberY;
        }

        const aX = this.getAccuracy(numberX);
        const aY = this.getAccuracy(numberY);
        const accuracyX = Math.pow(10, aX);
        const accuracyY = Math.pow(10, aY);
        return (((numberX * accuracyX) / (numberY * accuracyY)) * accuracyY) / accuracyX;
    }

    /**
     * 获取浮点数的小数位数
     * @param number 计算浮点数
     */
    static getAccuracy(number) {
        try {
            return number.toString().split('.')[1].length;
        } catch {
            return 0;
        }
    }
}

module.exports = Arithmetic;
