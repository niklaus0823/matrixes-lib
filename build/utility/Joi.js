"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const joi = require("joi");
exports.joi = joi;
const util_1 = require("util");
let joiValidate = util_1.promisify(joi.validate);
exports.joiValidate = joiValidate;
var joiType;
(function (joiType) {
    joiType.vDouble = joi.extend((joi) => ({
        base: joi.number().min(Number.MIN_SAFE_INTEGER).max(Number.MAX_SAFE_INTEGER),
        name: 'activate'
    }));
    joiType.vFloat = joiType.vDouble;
    joiType.vNumber = joi.extend((joi) => ({
        base: joi.number().integer().min(Number.MIN_SAFE_INTEGER).max(Number.MAX_SAFE_INTEGER),
        name: 'activate'
    }));
    joiType.vInt32 = joiType.vNumber;
    joiType.vSint32 = joiType.vNumber;
    joiType.vSfixed32 = joiType.vNumber;
    joiType.vInt64 = joiType.vNumber;
    joiType.vSint64 = joiType.vNumber;
    joiType.vSfixed64 = joiType.vNumber;
    joiType.vUintNumber = joi.extend((joi) => ({
        base: joi.number().integer().positive().max(Number.MAX_SAFE_INTEGER),
        name: 'activate'
    }));
    joiType.vUint32 = joiType.vUintNumber;
    joiType.vFixed32 = joiType.vUintNumber;
    joiType.vUint64 = joiType.vUintNumber;
    joiType.vFixed64 = joiType.vUintNumber;
    joiType.vBool = joi.extend((joi) => ({
        base: joi.bool(),
        name: 'activate'
    }));
    joiType.vString = joi.extend((joi) => ({
        base: joi.string(),
        name: 'activate'
    }));
})(joiType || (joiType = {}));
exports.joiType = joiType;
