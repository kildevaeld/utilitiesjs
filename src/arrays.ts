
import {equal} from './utils';

const __slice = Array.prototype.slice;


export function isArray(array: any): array is Array<any> {
    return Array.isArray(array);
}

// Return a new array with duplicates removed
export function unique(array: any[]): any[] {
  return array.filter(function(e, i) {
    for (i += 1; i < array.length; i += 1) {
      if (equal(e, array[i])) {
        return false;
      }
    }
    return true;
  })
}


export function any(array: any[], predicate: Function): boolean {
  for (let i = 0, ii = array.length; i < ii; i++) {
    if (predicate(array[i])) return true;
  }
  return false;
}

export function indexOf(array, item): number {
  for (var i = 0, len = array.length; i < len; i++) if (array[i] === item) return i;
  return -1;
}

export function find<T>(array: T[], callback: (item: T, index?: number) => boolean, ctx?: any): T {
  let v;
  for (let i = 0, ii = array.length; i < ii; i++) {
    if (callback.call(ctx, array[i])) return array[i];
  }
  return null;
}

export function filter<T>(array: T[], callback: (item: T, index?: number) => boolean, ctx?: any): T[] {
    return array.filter((e, i) => {
        return callback.call(ctx, e, i);
    });
}

export function slice(array: any, begin?:number, end?:number): any {
  return __slice.call(array, begin, end);
}

export function flatten(arr) {
  return arr.reduce(function(flat, toFlatten) {
    return flat.concat(Array.isArray(toFlatten) ? flatten(toFlatten) : toFlatten);
  }, []);
}

export function sortBy<T>(obj: T[], value: string|Function, context?: any): T[] {
    var iterator = typeof value === 'function' ? value : function(obj: any) { return obj[<string>value]; };
    return obj
      .map(function(value, index, list) {
        return {
          value: value,
          index: index,
          criteria: iterator.call(context, value, index, list)
        };
      })
      .sort(function(left, right) {
        let a = left.criteria,
            b = right.criteria;
        if (a !== b) {
          if (a > b || a === void 0) return 1;
          if (a < b || b === void 0) return -1;
        }
        return left.index - right.index;
      })
      .map(function(item) {
        return item.value;
      });
  }