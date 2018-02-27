import * as joi from 'joi';
import {promisify} from 'util';

let joiValidate = promisify(joi.validate) as {
    <T>(value: Object, schema: Object, options: joi.ValidationOptions): Promise<T>
};

export {joi, joiValidate};