import * as joi from 'joi';
import {promisify} from 'util';

let joiValidate = promisify(joi.validate) as {
    <T>(value: Object, schema: Object, options: joi.ValidationOptions): Promise<T>
};

namespace joiType {
    export const vDouble = joi.extend((joi) => ({
        base: joi.number().min(Number.MIN_SAFE_INTEGER).max(Number.MAX_SAFE_INTEGER),
        name: 'activate'
    }));

    export const vFloat = vDouble;

    export const vNumber = joi.extend((joi) => ({
        base: joi.number().integer().min(Number.MIN_SAFE_INTEGER).max(Number.MAX_SAFE_INTEGER),
        name: 'activate'
    }));

    export const vInt32 = vNumber;

    export const vSint32 = vNumber;

    export const vSfixed32 = vNumber;

    export const vInt64 = vNumber;

    export const vSint64 = vNumber;

    export const vSfixed64 = vNumber;

    export const vUintNumber = joi.extend((joi) => ({
        base: joi.number().integer().positive().max(Number.MAX_SAFE_INTEGER),
        name: 'activate'
    }));

    export const vUint32 = vUintNumber;

    export const vFixed32 = vUintNumber;

    export const vUint64 = vUintNumber;

    export const vFixed64 = vUintNumber;

    export const vBool = joi.extend((joi) => ({
        base: joi.bool(),
        name: 'activate'
    }));

    export const vString = joi.extend((joi) => ({
        base: joi.string(),
        name: 'activate'
    }));
}

export {joi, joiValidate, joiType};