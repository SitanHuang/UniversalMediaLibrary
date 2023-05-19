
// all properties must be primitives
class Serializable {
  toJSON(spaces = 0) {
    const propertiesOnly = Object.getOwnPropertyNames(this).reduce((obj, key) => {
      obj[key] = this[key];
      return obj;
    }, {});
    return JSON.stringify(propertiesOnly, undefined, spaces);
  }

  toType(type) {
    const copy = new type();
    Object.assign(copy, this);
    return copy;
  }

  static fromJSON(dat) {
    const copy = new this();
    Object.assign(copy, JSON.parse(dat));
    return copy;
  }
}

global.Serializable = Serializable;

global.sanitize_fname = (fname) => fname.replace(/[^\u4E00-\u9FFFa-z0-9 -]/gi, ' ').replace(/[\s\n\r]+/gm, ' ').toLowerCase().trim();

function isObject(item) {
  return (item && typeof item === 'object' && !Array.isArray(item));
}

global.mergeDeep = (target, ...sources) => {
  if (!sources.length) return target;
  const source = sources.shift();

  if (isObject(target) && isObject(source)) {
    for (const key in source) {
      if (isObject(source[key])) {
        if (!target[key]) Object.assign(target, { [key]: {} });
        mergeDeep(target[key], source[key]);
      } else {
        Object.assign(target, { [key]: source[key] });
      }
    }
  }

  return mergeDeep(target, ...sources);
}