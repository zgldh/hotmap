/**
 * Color.js
 *
 * Authors: nconrad
 */

import { matMinMax } from './utils';

const schemeCategory20RGBs = [
  'rgb(31, 119, 180)',
  'rgb(174, 199, 232)',
  'rgb(255, 127, 14)',
  'rgb(255, 187, 120)',
  'rgb(44, 160, 44)',
  'rgb(152, 223, 138)',
  'rgb(214, 39, 40)',
  'rgb(255, 152, 150)',
  'rgb(148, 103, 189)',
  'rgb(197, 176, 213)',
  'rgb(140, 86, 75)',
  'rgb(196, 156, 148)',
  'rgb(227, 119, 194)',
  'rgb(247, 182, 210)',
  'rgb(127, 127, 127)',
  'rgb(199, 199, 199)',
  'rgb(188, 189, 34)',
  'rgb(219, 219, 141)',
  'rgb(23, 190, 207)',
  'rgb(158, 218, 229)',
];

const schemeCategory20Hex = [
  '#1f77b4',
  '#aec7e8',
  '#ff7f0e',
  '#ffbb78',
  '#2ca02c',
  '#98df8a',
  '#d62728',
  '#ff9896',
  '#9467bd',
  '#c5b0d5',
  '#8c564b',
  '#c49c94',
  '#e377c2',
  '#f7b6d2',
  '#7f7f7f',
  '#c7c7c7',
  '#bcbd22',
  '#dbdb8d',
  '#17becf',
  '#9edae5',
];

const schemeCategory20 = [
  0x8c564b,
  0xc49c94,
  0xe377c2,
  0xf7b6d2,
  0x7f7f7f,
  0xc7c7c7,
  0xbcbd22,
  0xdbdb8d,
  0x17becf,
  0x9edae5,
  0x1f77b4,
  0xaec7e8,
  0xff7f0e,
  0xffbb78,
  0x2ca02c,
  0x98df8a,
  0xd62728,
  0xff9896,
  0x9467bd,
  0xc5b0d5,
];

export function sanitizeColor(colors) {
  colors = [].concat(colors || []);

  let sanitized = colors.map((color) => {
    if (isNaN(color) && color[0] == '#') {
      return parseInt('0x' + color.slice(1));
    }
    return color;
  });

  return sanitized;
}

// reference:
// https://gist.github.com/0x263b/2bdd90886c2036a1ad5bcf06d6e6fb37
function str2Color(str) {
  let colors = schemeCategory20;

  let hash = 0;
  if (str.length === 0) return hash;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
    hash = hash & hash;
  }
  hash = ((hash % colors.length) + colors.length) % colors.length;
  return colors[hash];
}

export function categoryColors(categories) {
  let colorMatrix = [];

  categories.forEach((set, i) => {
    let row = [];
    set.forEach((cat, j) => {
      let color = cat == 'undefined' || cat == null ? 0x666666 : str2Color(cat);
      row.push(color);
    });
    colorMatrix.push(row);
  });

  return colorMatrix;
}

export function hexToHexColor(hex) {
  hex = hex.toString(16);
  const len = hex.length;
  return '#' + (len != 6 ? '0'.repeat(6 - len) + hex : hex);
}

export function decToHex(c) {
  var hex = c.toString(16);
  if (hex === 0) return 0;
  return hex.length == 1 ? '0' + hex : hex;
}

export function rgbToHex(rgb) {
  return '0x' + decToHex(rgb[0]) + decToHex(rgb[1]) + decToHex(rgb[2]);
}

export function rgbToInteger(rgb) {
  return rgb[0] * 65536 + rgb[1] * 256 + rgb[2];
}

/*
 * colorMatrix
 * @param {[[]]} matrix matrix of values
 * @param {Object} scheme {bins: string, colors}
 */
export function colorMatrix(matrix, colors, minValue, maxValue) {
  let colorSize = colors.length;
  let maxIndex = colorSize - 1;
  let n = matrix[0].length,
    m = matrix.length;

  const range = maxValue - minValue;
  let cMatrix = [];
  for (let i = 0; i < m; i++) {
    let row = [];
    for (let j = 0; j < n; j++) {
      let val = matrix[i][j];
      let rate =
        range === 0 ? (val <= minValue ? 0 : 1) : (val - minValue) / range;
      rate = Math.min(1, Math.max(0, rate));
      const color = pickRgbFromColorList(colors, maxIndex, rate);

      if (color === null)
        throw Error(
          `Could not map value ${val} to a color for (i,j)=(${i},${j})\n\n` +
            `The colors provided were parsed as:\n ${JSON.stringify(colors)}`
        );

      row.push(color);
    }
    cMatrix.push(row);
  }

  return cMatrix;
}
function rgbToLab(r, g, b) {
  // 将RGB值转换为XYZ值
  function rgbToXyz(r, g, b) {
    r = r / 255;
    g = g / 255;
    b = b / 255;

    r = r > 0.04045 ? Math.pow((r + 0.055) / 1.055, 2.4) : r / 12.92;
    g = g > 0.04045 ? Math.pow((g + 0.055) / 1.055, 2.4) : g / 12.92;
    b = b > 0.04045 ? Math.pow((b + 0.055) / 1.055, 2.4) : b / 12.92;

    var x = r * 0.4124 + g * 0.3576 + b * 0.1805;
    var y = r * 0.2126 + g * 0.7152 + b * 0.0722;
    var z = r * 0.0193 + g * 0.1192 + b * 0.9505;

    return [x, y, z];
  }

  // 将XYZ值转换为CIELab值
  function xyzToLab(x, y, z) {
    var refX = 95.047;
    var refY = 100.0;
    var refZ = 108.883;

    x = x / refX;
    y = y / refY;
    z = z / refZ;

    x = x > 0.008856 ? Math.pow(x, 1 / 3) : 7.787 * x + 16 / 116;
    y = y > 0.008856 ? Math.pow(y, 1 / 3) : 7.787 * y + 16 / 116;
    z = z > 0.008856 ? Math.pow(z, 1 / 3) : 7.787 * z + 16 / 116;

    var L = 116 * y - 16;
    var a = 500 * (x - y);
    var b = 200 * (y - z);

    return [L, a, b];
  }

  var xyz = rgbToXyz(r, g, b);
  return xyzToLab(xyz[0], xyz[1], xyz[2]);
}

function labToRgb(L, a, b) {
  // 将CIELab值转换为XYZ值
  function labToXyz(L, a, b) {
    var refX = 95.047;
    var refY = 100.0;
    var refZ = 108.883;

    var y = (L + 16) / 116;
    var x = a / 500 + y;
    var z = y - b / 200;

    y = y > 0.206893 ? Math.pow(y, 3) : (y - 16 / 116) / 7.787;
    x = x > 0.206893 ? Math.pow(x, 3) : (x - 16 / 116) / 7.787;
    z = z > 0.206893 ? Math.pow(z, 3) : (z - 16 / 116) / 7.787;

    x = x * refX;
    y = y * refY;
    z = z * refZ;

    return [x, y, z];
  }

  // 将XYZ值转换为RGB值
  function xyzToRgb(x, y, z) {
    var r = x * 3.2406 + y * -1.5372 + z * -0.4986;
    var g = x * -0.9689 + y * 1.8758 + z * 0.0415;
    var b = x * 0.0557 + y * -0.204 + z * 1.057;

    r = r > 0.0031308 ? 1.055 * Math.pow(r, 1 / 2.4) - 0.055 : 12.92 * r;
    g = g > 0.0031308 ? 1.055 * Math.pow(g, 1 / 2.4) - 0.055 : 12.92 * g;
    b = b > 0.0031308 ? 1.055 * Math.pow(b, 1 / 2.4) - 0.055 : 12.92 * b;

    return [Math.round(r * 255), Math.round(g * 255), Math.round(b * 255)];
  }

  var xyz = labToXyz(L, a, b);
  if (!xyz || isNaN(xyz[0]) || isNaN(xyz[1]) || isNaN(xyz[2])) {
    return [0, 0, 0]; // Return black for invalid colors
  }
  return xyzToRgb(xyz[0], xyz[1], xyz[2]);
}

function colorGradient(rgb1, rgb2, t) {
  // 将RGB颜色转换为CIELab颜色
  var lab1 = rgbToLab(rgb1[0], rgb1[1], rgb1[2]);
  var lab2 = rgbToLab(rgb2[0], rgb2[1], rgb2[2]);

  // 计算CIELab颜色之间的渐变
  var lab = [
    lab1[0] + t * (lab2[0] - lab1[0]),
    lab1[1] + t * (lab2[1] - lab1[1]),
    lab1[2] + t * (lab2[2] - lab1[2]),
  ];

  // 将CIELab颜色转换回RGB颜色
  var rgb = labToRgb(lab[0], lab[1], lab[2]);

  return rgb;
}

function pickRgbFromColorList(colors, maxIndex, rate) {
  if (maxIndex === 0) {
    return rgbToInteger(colors[0]);
  }

  const colorIndex = Math.max(0, Math.floor(rate * maxIndex));
  const lowerColor = colors[colorIndex];
  const upperColor = colors[Math.min(colorIndex + 1, maxIndex)];

  const segmentLength = 1 / maxIndex;
  const segmentIndex = Math.floor(rate / segmentLength);

  // 计算区间内的相对权重
  const localWeight = (rate - segmentIndex * segmentLength) / segmentLength;

  let rgb = colorGradient(lowerColor, upperColor, localWeight);
  let color = rgbToInteger(rgb);
  return color;
}

export function parseColorBins(bins) {
  let opRegex = /(>|<|=|<=|>=)+/gm;
  let valRegex = /(-|\+)*\d+/gm;
  bins = bins.map((binStr) => {
    return {
      op: binStr.match(opRegex)[0],
      val: binStr.match(valRegex)[0],
    };
  });

  return bins;
}
