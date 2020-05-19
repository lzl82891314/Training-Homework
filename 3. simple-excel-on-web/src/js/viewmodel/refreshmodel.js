'use strict';

export class RefreshModel {
    constructor() {
        this.refreshDictionary = [];
    }

    // 一级参数
    static STYLE = 'STYLE';
    static CLASS = 'CLASS';
    static CSS = 'CSS';
    static FOCUS = 'FOCUS';

    // 二级参数
    static CLASS_ADD = 'CLASS_ADD';
    static CLASS_TOGGLE = 'CLASS_TOGGLE';
    static CLASS_REMOVE = 'CLASS_REMOVE';

    add(type, target, value, targets, operateType) {
        this.refreshDictionary.push({
            type: type,
            operateType: operateType,
            target: target,
            value: value,
            targets: targets,
        });
    }
}
