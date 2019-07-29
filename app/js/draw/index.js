export function drawShapes(ctx, shape, arr) {
  arr.forEach(([x, y]) => drawShape(ctx, shape, x, y));
}

export function drawPline(ctx, points) {
  const [[x, y], ...rest] = points;
  let firstPoint = true;
  ctx.beginPath();

  points.forEach(([x, y]) => {
    if (x === null || y === null) {
      return;
    }
    if (firstPoint) {
      firstPoint = false;
      ctx.moveTo(x, y);
    } else {
      ctx.lineTo(x, y);
    }
  });
  ctx.stroke();
}

export function drawXaxis(ctx, y, points) {
  const monthAbbr = ',Jan,Feb,Mar,Apr,May,Jun,Jul,Aug,Sep,Oct,Nov,Dec'.split(
    ','
  );
  let prevMonth = '';
  let markedForMonth = true;

  const [[x1]] = points;
  const [x2] = points[points.length - 1];

  drawLine(ctx, x1, y, x2, y);

  points.forEach(([x, date]) => {
    const month = monthAbbr[+date.substr(5, 2)];

    if (month !== prevMonth) {
      if (prevMonth) {
        addXMark(
          ctx,
          month === 'Jan' ? month + ', ' + date.substr(0, 4) : month,
          x,
          y
        );
      }

      markedForMonth = false;
      prevMonth = month;
    }

    const dateText = date.substr(8, 2);
    if (+dateText >= 14 && +dateText < 18 && !markedForMonth) {
      addXMark(ctx, dateText, x, y);
      markedForMonth = true;
    }
  });
}

function drawLine(ctx, x1, y1, x2, y2) {
  ctx.beginPath();
  ctx.moveTo(x1, y1);
  ctx.lineTo(x2, y2);
  ctx.stroke();
}

export function drawYAxis(ctx, x, points) {
  const [[y1]] = points;
  const [y2] = points[points.length - 1];

  drawLine(ctx, x, y1, x, y2);

  points.forEach(([y, label]) => {
    addYMark(ctx, label, x, y);
  });
}

function addXMark(ctx, text, x, y) {
  const w = ctx.measureText(text).width / 2;
  const xPos = Math.round(x);
  const yPos = Math.round(y);
  ctx.fillText(text, x - w, y + 16);
  ctx.beginPath();

  ctx.moveTo(xPos, yPos);
  ctx.lineTo(xPos, yPos + 5);
  ctx.stroke();
}

function addYMark(ctx, text, x, y) {
  ctx.textBaseline = 'middle';
  const xPos = Math.round(x);
  const yPos = Math.round(y);

  ctx.fillText(text, x + 8, y);
  ctx.beginPath();

  ctx.moveTo(xPos, yPos);
  ctx.lineTo(xPos + 5, yPos);
  ctx.stroke();
}

function drawShape(ctx, shape, x, y, width = 4, height = 6) {
  ctx.lineWidth = '1';

  ctx.fillRect(
    Math.round(x) - width / 2,
    Math.round(y) - height / 2,
    width,
    height
  );
}

// function drawCurve(ctx, points, tension) {
//   ctx.beginPath();
//   ctx.moveTo(points[0].x, points[0].y);

//   var t = tension != null ? tension : 1;
//   for (var i = 0; i < points.length - 1; i++) {
//     var p0 = i > 0 ? points[i - 1] : points[0];
//     var p1 = points[i];
//     var p2 = points[i + 1];
//     var p3 = i != points.length - 2 ? points[i + 2] : p2;

//     var cp1x = p1.x + ((p2.x - p0.x) / 6) * t;
//     var cp1y = p1.y + ((p2.y - p0.y) / 6) * t;

//     var cp2x = p2.x - ((p3.x - p1.x) / 6) * t;
//     var cp2y = p2.y - ((p3.y - p1.y) / 6) * t;

//     ctx.bezierCurveTo(cp1x, cp1y, cp2x, cp2y, p2.x, p2.y);
//   }
//   ctx.stroke();
// }
