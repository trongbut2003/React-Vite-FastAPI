import "./Arrow.css";

export default function Arrow({
  box = "0 0 500 300",
  id = "z-line",
  path = "M 0 0 H 150 V 150 H 150",
  duration = 3,
  reverse = 0,
  arrow = 0,
  lineColor = "#ddd",
  color = "#1677ff",
  width = 500,
  height = 300,
}) {
  return (
    <div className="z-path" style={{ width, height }}>
      <svg viewBox={box}>
        {/* Đường chính */}
        <path
          id={id}
          d={path}
          fill="none"
          stroke={lineColor}
          strokeWidth="1"
        />

        {arrow === 0 ? (
          <>
            {/* Mũi tên 1 */}
            <polygon
              points={
                reverse
                  ? "0,-6 -14,0 0,6"
                  : "0,-6 14,0 0,6"
              }
              fill={color}
            >
              <animateMotion
                dur={duration}
                repeatCount="indefinite"
                rotate="auto"
                keyPoints={reverse ? "1;0" : "0;1"}
                keyTimes="0;1"
              >
                <mpath href={`#${id}`} />
              </animateMotion>
            </polygon>

            {/* Mũi tên 2 */}
            <polygon
              points={
                reverse
                  ? "0,-6 -14,0 0,6"
                  : "0,-6 14,0 0,6"
              }
              fill={color}
            >
              <animateMotion
                dur={duration}
                begin={-duration / 2}
                repeatCount="indefinite"
                rotate="auto"
                keyPoints={reverse ? "1;0" : "0;1"}
                keyTimes="0;1"
              >
                <mpath href={`#${id}`} />
              </animateMotion>
            </polygon>
          </>
        ) : (
          <>
            <defs>
              <filter id={`${id}-glow`} x="-100%" y="-300%" width="300%" height="700%">
                <feGaussianBlur stdDeviation="4" />
              </filter>
              <filter id={`${id}-soft-glow`} x="-100%" y="-300%" width="300%" height="700%">
                <feGaussianBlur stdDeviation="1.5" />
              </filter>
            </defs>
            {[0, 1].map((index) => (
              <g key={index}>
                {[
                  { length: 10, width: 15, opacity: 0.16, filter: `url(#${id}-glow)` },
                  ...Array.from({ length: 9 }, (_, layerIndex) => {
                    const progress = (layerIndex + 1) / 9;
                    return {
                      length: 10 - progress * 9.2,
                      width: 1.2 + progress * 6.8,
                      opacity: 0.55 + progress * 0.4,
                      filter: progress < 0.65 ? undefined : `url(#${id}-soft-glow)`,
                    };
                  }),
                ].map((layer, layerIndex) => {
                  const fromOffset = reverse ? -90 : -(10 - layer.length);
                  const toOffset = fromOffset + (reverse ? 100 : -100);

                  return (
                    <path
                      key={layerIndex}
                      d={path}
                      pathLength="100"
                      fill="none"
                      stroke={color}
                      strokeWidth={layer.width}
                      strokeLinecap="round"
                      strokeDasharray={`${layer.length} ${100 - layer.length}`}
                      opacity={layer.opacity}
                      filter={layer.filter}
                    >
                      <animate
                        attributeName="stroke-dashoffset"
                        from={fromOffset}
                        to={toOffset}
                        dur={`${duration}s`}
                        begin={index === 0 ? "0s" : `-${duration / 2}s`}
                        repeatCount="indefinite"
                      />
                    </path>
                  );
                })}
                <circle r="4.5" fill={color} opacity="0.8" filter={`url(#${id}-glow)`}>
                  <animateMotion
                    dur={`${duration}s`}
                    begin={`-${duration * (index * 0.5 + 0.1)}s`}
                    repeatCount="indefinite"
                    keyPoints={reverse ? "1;0" : "0;1"}
                    keyTimes="0;1"
                    calcMode="linear"
                  >
                    <mpath href={`#${id}`} />
                  </animateMotion>
                </circle>
                <circle r="1.8" fill="#fff">
                  <animateMotion
                    dur={`${duration}s`}
                    begin={`-${duration * (index * 0.5 + 0.1)}s`}
                    repeatCount="indefinite"
                    keyPoints={reverse ? "1;0" : "0;1"}
                    keyTimes="0;1"
                    calcMode="linear"
                  >
                    <mpath href={`#${id}`} />
                  </animateMotion>
                </circle>
              </g>
            ))}
          </>
        )}
      </svg>
    </div>
  );
}
