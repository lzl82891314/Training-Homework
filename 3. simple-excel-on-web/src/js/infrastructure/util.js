'use strict';

/**
 * 事件辅助工具类
 */
class EventUtil {
    /**
     *添加事件方法
     * @static 静态方法
     * @param {*} target 需要绑定的事件目标元素
     * @param {*} eventType 事件类型
     * @param {*} handler 事件响应方法
     * @memberof EventHandler
     */
    static addEvent(target, eventType, handler) {
        try {
            target.addEventListener(eventType, handler, false);
        } catch (exception) {
            throw new Error(exception);
        }
    }

    /**
     *解绑事件方法
     * @static 静态方法
     * @param {*} target 需要解绑的事件目标元素
     * @param {*} eventType 事件类型
     * @param {*} handler 事件响应方法
     * @memberof EventHandler
     */
    static removeEvent(target, eventType, handler) {
        try {
            target.removeEventListener(eventType, handler);
        } catch (exception) {
            throw new Error(exception);
        }
    }
}

class CharCodeUtil {
    static letterFromIndex(index) {
        if (Number.isNaN(index)) {
            return undefined;
        }

        index = Number.parseInt(index);
        if (index < 0) {
            return '@';
        }
        if (index === 0) {
            return '';
        }
        if (Number.isInteger(index / 26)) {
            return this.letterFromIndex(index / 26 - 1) + 'Z';
        }
        if (Math.floor(index / 26) > 0) {
            return this.letterFromIndex(Math.floor(index / 26)) + this.letterFromIndex(index % 26);
        }
        return String.fromCharCode(65 + index - 1);
    }

    static letterChange(sourceLetter, step) {
        if (step === 0) {
            return sourceLetter;
        }
        if (!sourceLetter || !step) {
            return undefined;
        }
        return this.letterFromIndex(this.letterCharCodeFormat(sourceLetter) + step);
    }

    static letterCharCodeFormat(sourceLetter) {
        let totalCharCode = 0;
        for (let index = sourceLetter.length; index > 0; index--) {
            const indexPoint = sourceLetter.length - index;
            const char = sourceLetter[indexPoint];
            let charCode = Number(char.charCodeAt());
            totalCharCode += (charCode - 64) * Math.pow(26, index - 1);
        }
        return totalCharCode;
    }
}

class ArrayExtension {
    static remove(array, indexArr) {
        if (!Array.isArray(array)) {
            return undefined;
        }
        const newArray = [];
        for (let i = 0; i < array.length; i++) {
            if (indexArr.indexOf(i) > -1) {
                continue;
            }
            newArray.push(array[i]);
        }
        return newArray;
    }
}

export { EventUtil, CharCodeUtil, ArrayExtension };
