"use strict";
var utils_1 = require('./utils');
var __slice = Array.prototype.slice;
function isArray(array) {
    return Array.isArray(array);
}
exports.isArray = isArray;
function unique(array) {
    return array.filter(function (e, i) {
        for (i += 1; i < array.length; i += 1) {
            if (utils_1.equal(e, array[i])) {
                return false;
            }
        }
        return true;
    });
}
exports.unique = unique;
function any(array, predicate) {
    for (var i = 0, ii = array.length; i < ii; i++) {
        if (predicate(array[i]))
            return true;
    }
    return false;
}
exports.any = any;
function indexOf(array, item) {
    for (var i = 0, len = array.length; i < len; i++)
        if (array[i] === item)
            return i;
    return -1;
}
exports.indexOf = indexOf;
function find(array, callback, ctx) {
    var v;
    for (var i = 0, ii = array.length; i < ii; i++) {
        if (callback.call(ctx, array[i]))
            return array[i];
    }
    return null;
}
exports.find = find;
function filter(array, callback, ctx) {
    return array.filter(function (e, i) {
        return callback.call(ctx, e, i);
    });
}
exports.filter = filter;
function slice(array, begin, end) {
    return __slice.call(array, begin, end);
}
exports.slice = slice;
function flatten(arr) {
    return arr.reduce(function (flat, toFlatten) {
        return flat.concat(Array.isArray(toFlatten) ? flatten(toFlatten) : toFlatten);
    }, []);
}
exports.flatten = flatten;
function sortBy(obj, value, context) {
    var iterator = typeof value === 'function' ? value : function (obj) { return obj[value]; };
    return obj
        .map(function (value, index, list) {
        return {
            value: value,
            index: index,
            criteria: iterator.call(context, value, index, list)
        };
    })
        .sort(function (left, right) {
        var a = left.criteria, b = right.criteria;
        if (a !== b) {
            if (a > b || a === void 0)
                return 1;
            if (a < b || b === void 0)
                return -1;
        }
        return left.index - right.index;
    })
        .map(function (item) {
        return item.value;
    });
}
exports.sortBy = sortBy;
