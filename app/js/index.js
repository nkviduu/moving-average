import { drawPline, drawShapes, drawXaxis, drawYAxis } from './draw';
import { getMovingAverage } from './calc/moving_average';
import { getData } from './api';
import { roundTo } from './utils/steps';

let config = {
  symbol: 'IBM',
  axisFont: '10px Arial',
  itemWidth: 8,
  movingAverageLen: 20,
  colors: {
    Close: 'blue',
    CloseConnect: 'lightblue',
    ma: '#a404',
    axisLines: '#888',
    axisFont: 'black'
  },
  margin: {
    top: 40,
    right: 40,
    bottom: 40,
    left: 10
  },
  offset: 0
};

const canvas = qs('.canvas-wrapper canvas');
const ctx = canvas.getContext('2d');

init();

function init() {
  window.addEventListener('resize', onResize);

  const ht = new Hammer(canvas, {
    direction: Hammer.DIRECTION_HORIZONTAL,
    threshold: 100
  });

  ht.on('pan', ev => {
    const { deltaX, isFinal } = ev;
    const { itemWidth, itemCount, offset, data: { OHLC } = {} } = config;

    if (!OHLC) {
      return;
    }

    const maxOffsetDelta = OHLC.length - itemCount - offset - 1;

    let offsetDelta = Math.round(deltaX / itemWidth);

    if (offsetDelta + offset < 0) {
      offsetDelta = 0;
    }

    if (offsetDelta > maxOffsetDelta) {
      offsetDelta = maxOffsetDelta;
    }

    const newOffset = isFinal ? Math.max(offset + offsetDelta, 0) : offset;

    const slice = arr => {
      const start = Math.max(
        arr.length - itemCount - (offsetDelta + offset),
        0
      );
      const end = start + config.itemCount;

      return arr.slice(start, end);
    };

    // update configuration
    config = { ...config, offset: newOffset, slice };

    mapDataPoints();
    render();
  });

  onResize();

  loadSymbolData(config.symbol);

  const maInput = qs('.input-moving-average');
  maInput.value = config.movingAverageLen;
  maInput.addEventListener('input', () => {
    const value = maInput.value;
    if (isNaN(+value) || !value) {
      return;
    }
    updateMovingAverage(+value);
  });

  const symbolInput = qs('.input-symbol');
  symbolInput.addEventListener('change', () => {
    console.log('loading', symbolInput.value);
    loadSymbolData(symbolInput.value);
  });

  function updateMovingAverage(value) {
    config.movingAverageLen = value;

    mapDataPoints();
    render();
  }
}

function onResize() {
  const { clientWidth: width, clientHeight: height } = document.body;

  const {
    itemWidth,
    margin: { left, right }
  } = config;

  // update itemCount based on new width;
  const itemCount = ((width - left - right) / config.itemWidth) >> 0;

  canvas.style.width = width + 'px';
  canvas.style.height = height + 'px';

  canvas.width = width;
  canvas.height = height;

  const slice = arr => {
    const start = arr.length - itemCount - (config.offset || 0);
    const end = start + itemCount;
    return arr.slice(start, end);
  };

  config = { ...config, width, height, itemCount, slice };

  mapDataPoints();
  render();
}

function loadSymbolData(symbol) {
  getData(symbol).then(data => {
    config.data = {
      OHLC: data,
      dates: data.map(el => el.Date)
    };

    onResize();
  });
}

function render() {
  clearCanvas(canvas);
  if (!config.data) {
    return;
  }

  const {
    ma20dayPoints,
    height,
    width,
    margin: { top, right },
    xAxisPoints,
    yAxisPoints,
    axisFont,
    closeArrPoints,
    colors
  } = config;

  ctx.font = axisFont;
  ctx.strokeStyle = colors.axisLines;
  ctx.lineWidth = 0.8;
  drawXaxis(ctx, height - top * 0.7, xAxisPoints);
  drawYAxis(ctx, width - right, yAxisPoints);

  if (config.closeArrPoints) {
    ctx.fillStyle = colors.Close;
    drawShapes(ctx, 'square', closeArrPoints);

    ctx.strokeStyle = colors.CloseConnect;
    ctx.lineWidth = 0.5;
    drawPline(ctx, closeArrPoints);

    ctx.strokeStyle = colors.ma;
    ctx.lineWidth = 2;
    drawPline(ctx, ma20dayPoints);
  }

  function clearCanvas(canvas) {
    canvas.width = canvas.width;
  }
}

function mapDataPoints() {
  const {
    data: { OHLC, dates } = {},
    itemWidth,
    slice,
    height,
    margin: { top, bottom, left, right }
  } = config;

  if (!OHLC) {
    return;
  }

  const ma20day = getMovingAverage(
    config.movingAverageLen,
    el => el.Close,
    OHLC
  );

  const closeArr = slice(OHLC.map(el => el.Close));
  const ma20dayArr = slice(ma20day);

  const { min, max } = getRange(
    closeArr.concat(ma20dayArr).filter(el => el !== null)
  );
  const range = max - min;
  const scale = (height - top - bottom) / range;

  const yScale = value =>
    value === null ? null : height - bottom - (value - min) * scale;
  const xScale = value => left + value * itemWidth;

  const xArr = closeArr.map((_, index) => xScale(index));

  const closeArrPoints = zip(xArr, closeArr.map(el => yScale(el)));
  const ma20dayPoints = zip(xArr, ma20dayArr.map(el => yScale(el)));

  const xAxisPoints = zip(xArr, slice(dates));

  const yAxisPoints = getYAxisPoints(min, max, yScale);

  config = {
    ...config,
    closeArrPoints,
    xAxisPoints,
    yAxisPoints,
    ma20dayPoints
  };
}

function getRange(arr) {
  return {
    min: Math.min(...arr),
    max: Math.max(...arr)
  };
}

function getXScale(arr, width, offset) {
  return value => offset + width * value;
}

function getYAxisPoints(min, max, yScale) {
  const step = 2.5;
  let i = roundTo(min + step, step);
  let top = roundTo(max + step, step);
  let result = [];

  while (i < top) {
    result.push([yScale(i), i]);
    i += step;
  }

  return result;
}

function zip(arr1, arr2) {
  return arr1.map((el, index) => [el, arr2[index]]);
}

// dom utils
function qs(path, context) {
  return (context || document).querySelector(path);
}
