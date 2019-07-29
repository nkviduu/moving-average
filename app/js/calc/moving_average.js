export function getMovingAverage(days, getValue, arr) {
  const result = [];
  let sum = 0;

  arr.forEach((el, index) => {
    let movingAverage = null;
    const value = getValue ? getValue(el) : el;
    sum += value;

    if (index + 1 === days) {
      movingAverage = sum / days;
    } else if (index + 1 > days) {
      const outOfRangeElement = arr[index - days];
      const outOfRangeValue = getValue
        ? getValue(outOfRangeElement)
        : outOfRangeElement;

      sum -= outOfRangeValue;
      movingAverage = sum / days;
    }

    result.push(movingAverage);
  });

  return result;
}

// twentyDayMovingAverage = getMovingAverage.bind(null, 20, 'closing');
