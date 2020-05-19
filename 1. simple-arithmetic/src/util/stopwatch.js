'use strict';

/**
 * 时间监控工具类
 * 用来监控一段时间内的两次操作
 */
class Stopwatch {
    constructor() {
        this.start = Date.now();
    }

    static refreshTime() {
        this.start = Date.now();
    }

    static timeSpan() {
        const result = Date.now() - this.start;
        this.refreshTime();
        return result;
    }

    static showTimeSpan() {
        console.log(`----- this calling spent [${this.timeSpan()}]ms -----`);
    }
}

module.exports = Stopwatch;
