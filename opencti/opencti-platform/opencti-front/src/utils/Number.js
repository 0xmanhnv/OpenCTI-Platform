import { pathOr } from 'ramda';

export const random = (min, max) => Math.random() * (max - min) + min;

export const numberFormat = (number, digits = 2) => {
  const si = [
    { value: 1, symbol: '' },
    { value: 1e3, symbol: 'K' },
    { value: 1e6, symbol: 'M' },
    { value: 1e9, symbol: 'G' },
    { value: 1e12, symbol: 'T' },
    { value: 1e15, symbol: 'P' },
    { value: 1e18, symbol: 'E' },
  ];
  const rx = /\.0+$|(\.[0-9]*[1-9])0+$/;
  let i;
  for (i = si.length - 1; i > 0; i -= 1) {
    if (number >= si[i].value) {
      break;
    }
  }
  return {
    number: (number / si[i].value).toFixed(digits).replace(rx, '$1'),
    symbol: si[i].symbol,
  };
};

export const setNumberOfElements = (prevProps, props, key, callback, propKey = 'data') => {
  const currentNumberOfElements = pathOr(0, [key, 'pageInfo', 'globalCount'], props[propKey]);
  const prevNumberOfElements = pathOr(0, [key, 'pageInfo', 'globalCount'], prevProps[propKey]);
  if (currentNumberOfElements !== prevNumberOfElements) {
    callback(numberFormat(currentNumberOfElements));
  }
};
