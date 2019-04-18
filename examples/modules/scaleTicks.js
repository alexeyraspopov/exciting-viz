export function scaleTicks(start, stop, count) {
  let step = tickIncrement(start, stop, count);
  if (step > 0) {
    let t0 = Math.ceil(start / step);
    let t1 = Math.floor(stop / step);
    let ticks = new Array(Math.ceil(t1 - t0 + 1));
    return Array.from(ticks, (_, i) => (t0 + i) * step);
  } else {
    let t0 = Math.floor(start * step);
    let t1 = Math.ceil(stop * step);
    let ticks = new Array(Math.ceil(t0 - t1 + 1));
    return Array.from(ticks, (_, i) => (t0 - i) / step);
  }
}

let e10 = Math.sqrt(50);
let e5 = Math.sqrt(10);
let e2 = Math.sqrt(2);

function tickIncrement(start, stop, count) {
  let step = (stop - start) / Math.max(0, count);
  let power = Math.floor(Math.log(step) / Math.LN10);
  let error = step / 10 ** power;
  let k = error >= e10 ? 10 : error >= e5 ? 5 : error >= e2 ? 2 : 1;
  return power >= 0 ? k * 10 ** power : -(10 ** -power) / k;
}
