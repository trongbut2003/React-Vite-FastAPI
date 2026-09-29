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
}) {
  return (
    <div className="z-path">
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
            <path
              d={path}
              pathLength="100"
              fill="none"
              stroke={color}
              strokeWidth="3"
              strokeLinecap="round"
              strokeDasharray="10 90"
            >
              <animate
                attributeName="stroke-dashoffset"
                from="0"
                to="-100"
                dur={`${duration}s`}
                repeatCount="indefinite"
              />
            </path>

            <path
              d={path}
              pathLength="100"
              fill="none"
              stroke={color}
              strokeWidth="3"
              strokeLinecap="round"
              strokeDasharray="10 90"
            >
              <animate
                attributeName="stroke-dashoffset"
                from="0"
                to="-100"
                dur={`${duration}s`}
                begin={`-${duration / 2}s`}
                repeatCount="indefinite"
              />
            </path>
            <path
              d={path}
              pathLength="100"
              fill="none"
              stroke={color}
              strokeWidth="8"
              strokeLinecap="round"
              strokeDasharray="10 90"
              opacity="0.35"
              filter="blur(5px)"
            >
              <animate
                attributeName="stroke-dashoffset"
                from="0"
                to="-100"
                dur={`${duration}s`}
                repeatCount="indefinite"
              />
            </path>

            <path
              d={path}
              pathLength="100"
              fill="none"
              stroke={color}
              strokeWidth="8"
              strokeLinecap="round"
              strokeDasharray="10 90"
              opacity="0.35"
              filter="blur(5px)"
            >
              <animate
                attributeName="stroke-dashoffset"
                from="0"
                to="-100"
                dur={`${duration}s`}
                begin={`-${duration / 2}s`}
                repeatCount="indefinite"
              />
            </path>
          </>


        )}
      </svg>
    </div>
  );
}
