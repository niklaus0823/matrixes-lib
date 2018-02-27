"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const joi = require("joi");
exports.joi = joi;
const util_1 = require("util");
let joiValidate = util_1.promisify(joi.validate);
exports.joiValidate = joiValidate;
