import React, { Fragment, useState, useLayoutEffect, useRef } from 'react';
import ReactDOM from 'react-dom';
import { Inspector, useRangeKnob } from 'retoggle';
import { randomNormal } from './modules/randomNormal';
import { scaleLinear } from './modules/scaleLinear';
import { scaleTicks } from './modules/scaleTicks';

let generator = randomNormal(0, 1);
let datapoints = Array.from(new Array(150), () => generator.next().value);

function Stage() {
  let width = 800;
  let height = 200;
  let [extent, setExtent] = useRangeKnob('extent', {
    initialValue: 3,
    min: 1,
    max: 20,
  });
  let [ticks, setTicks] = useRangeKnob('ticks', {
    initialValue: 5,
    min: 5,
    max: 100,
  });
  let scaleX = scaleLinear([0, datapoints.length - 1], [0, width]);
  let scaleY = scaleLinear([-extent, extent], [height, 0]);
  let lines = scaleTicks(-extent, extent, ticks);
  let stageRef = useRef();
  let pointerX = usePointer(stageRef, [0, 800]);
  let focusedPointIndex = scaleX.inverse(pointerX) | 0;
  let focusedPoint = pointerX ? datapoints[focusedPointIndex] : null;
  return (
    <svg
      width={width}
      height={height}
      style={{ overflow: 'visible', margin: '20px' }}
      ref={stageRef}
    >
      {lines.map(v => (
        <Fragment key={v}>
          <text
            x={0}
            y={scaleY(v) + 3}
            style={{
              fontSize: '10px',
              fontFamily: 'monospace',
            }}
            textAnchor="end"
          >
            {v}
          </text>
          <line
            x1={scaleX(0)}
            x2={scaleX(datapoints.length - 1)}
            y1={scaleY(v)}
            y2={scaleY(v)}
            stroke="rgba(0, 0, 0, 0.2)"
            strokeDasharray="4 1"
            fill="transparent"
          />
        </Fragment>
      ))}
      <path
        d={curve(datapoints, (d, i) => scaleX(i), (d, i) => scaleY(d))}
        stroke="#3CA3E8"
        strokeWidth={2}
        fill="transparent"
      />
      {pointerX ? (
        <Fragment>
          <line
            x1={scaleX(focusedPointIndex)}
            x2={scaleX(focusedPointIndex)}
            y1={0}
            y2={height}
            stroke="red"
            strokeDasharray="4 1"
          />
          <circle
            cx={scaleX(focusedPointIndex)}
            cy={scaleY(focusedPoint)}
            r={2}
            stroke="red"
            fill="#3CA3E8"
          />
          <g
            transform={`translate(${scaleX(focusedPointIndex) - 75}, ${scaleY(
              focusedPoint
            ) - 30})`}
          >
            <rect
              x={0}
              y={0}
              width={150}
              height={18}
              fill="white"
              stroke="red"
            />
            <text
              x={75}
              y={12}
              textAnchor="middle"
              style={{ fontSize: '10px', fontFamily: 'monospace' }}
            >
              {focusedPoint}
            </text>
          </g>
        </Fragment>
      ) : null}
    </svg>
  );
}

function usePointer(ref, range) {
  let [position, setPosition] = useState(null);
  useLayoutEffect(
    () => {
      let rect = ref.current.getBoundingClientRect();
      ref.current.addEventListener(
        'mousemove',
        event => setPosition(constrain(range, event.clientX - rect.left)),
        true
      );
    },
    [ref]
  );
  return position;
}

function constrain(range, x) {
  return x < range[0] ? range[0] : x > range[1] ? range[1] : x;
}

function curve(data, x, y) {
  return data.reduce((curve, datum, index) => {
    let prefix = index === 0 ? 'M' : 'L';
    let point = prefix + x(datum, index) + ',' + y(datum, index);
    return curve + point;
  }, '');
}

ReactDOM.render(
  <Fragment>
    <Inspector />
    <Stage />
  </Fragment>,
  document.querySelector('main')
);
