import { useEffect, useState, useRef } from "react";
import axios from "axios";

import "./realtimeChart.css"

import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend,
} from "chart.js";

import { Line } from "react-chartjs-2";

ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend
);

function Chartjs({title = "Title" }) {

        // ========== DỮ LIỆU ==========
    const LIST_VALUES = {
        "U":   ["Ua", "Ub", "Uc", "Uab", "Ubc", "Uca"],
        "I": ["Ia", "Ib", "Ic"],
        "P": ["Pb", "Pa", "Pc", "P"],
        "cos": ["cosφa", "cosφb", "cosφc", "cosφ"],
        "Q": ["Qa", "Qb", "Qc", "Q"],
    };
    const ALL_VALUES = ["--Chọn--", "Ua", "Ub", "Uc", "Ia", "Ib", "Ic", "Pa", "Pb", "Pc", "cosφa", "cosφb", "cosφc", "Qa", "Qb", "Qc", "P", "Q", "Sa", "Sb",
    "Sc", "S", "cosφ", "Uab", "Ubc", "Uca"];

    // ========== STATE ==========
    const [stop, setStop] = useState(false);
    const [visible, setVisible] = useState("hidden");
    const [trends, setTrends] = useState([
    "--Chọn--",
    "--Chọn--",
    "--Chọn--",
    "--Chọn--",
    "--Chọn--",
    "--Chọn--"
    ]);
    const trendsRef = useRef(trends);
    const [colors, setColors] = useState(["#4ade80","#60a5fa","#facc15","#f87171","#c084fc", "#22d3ee"]);

    const handleTrendChange = (index, value) => {
        setTrends(prev => {
            const newTrends = [...prev];
            newTrends[index] = value;
            return newTrends;
        });
    };

    const ChangeColors = (index, value) => {
        setColors(prev => {
            const newColor = [...prev];
            newColor[index] = value;
            return newColor;
        });
    };

    const getOptions = (currentIndex) => {
        const groupStart = currentIndex < 3 ? 0 : 3;
        const groupEnd = groupStart + 3;

        const currentGroup = trends.slice(groupStart, groupEnd);

        // Tìm trend đầu tiên đã chọn
        const firstValue = currentGroup.find(
            value => value !== "--Chọn--"
        );

        // Các giá trị đã chọn ở các ô khác
        const selectedValues = trends.filter(
            (value, index) =>
                index !== currentIndex &&
                value !== "--Chọn--"
        );

        // Chưa chọn trend nào
        if (!firstValue) {
            return ALL_VALUES.filter(
                option =>
                    option === "--Chọn--" ||
                    !selectedValues.includes(option)
            );
        }

        const group = Object.values(LIST_VALUES).find(
            values => values.includes(firstValue)
        );

        if (!group) {
            return ALL_VALUES;
        }

        // Chỉ cho cùng nhóm + không cho trùng
        return ALL_VALUES.filter(
            option =>
                option === "--Chọn--" ||
                (
                    group.includes(option) &&
                    !selectedValues.includes(option)
                )
        );
    };


    function buildChart(){};
    function f_clearBtnA(){
        setTrends(prev => [
        "--Chọn--",
        "--Chọn--",
        "--Chọn--",
        prev[3],
        prev[4],
        prev[5],
        ]);
    };
    function f_clearBtnB(){
        setTrends(prev => [
        prev[0],
        prev[1],
        prev[2],
        "--Chọn--",
        "--Chọn--",
        "--Chọn--"
        ]);
    };

    const changeAxisPosition = (axis, position) => {
        setOptions(prev => ({
            ...prev,
            scales: {
                ...prev.scales,
                [axis]: {
                    ...prev.scales[axis],
                    position: position,
                },
            },
        }));
    };

    const toggleAxis = (axis, sta) => {
    setOptions(prev => ({
        ...prev,
        scales: {
            ...prev.scales,
            [axis]: {
                ...prev.scales[axis],
                display: sta,
            },
        },
    }));
};



    //=====================================================================================

    const [theme, setTheme] = useState(() =>
        document.body.classList.contains("light")
            ? "light"
            : "dark"
    );

    const [chartData, setChartData] = useState({
        labels: [],
        datasets: [
            {
                label: "",
                data: [],
            },
            {
                label: "",
                data: [],
            },
            {
                label: "",
                data: [],
            },
            {
                label: "",
                data: [],
            },
            {
                label: "",
                data: [],
            },
            {
                label: "",
                data: [],
            },
        ],
    });

    /*
     * ==========================================
     * 1. Lấy 30 dữ liệu ban đầu
     * ==========================================
     */

    const getBaseData = async (trends) => {
        try {

            const response = await axios.get(
                "http://localhost:8080/test-api/random-data-base"
            );

            const data = response.data;

            console.log("🔥 Base data:", data);

            if( leftAxisRef.current !== "" || rightAxisRef.current !== "")
            setChartData({
                labels: data.timeData || [],

                datasets: [
                    trends[0] !== "--Chọn--" ? {
                        label: trends[0],
                        data: data[trends[0]] || [],
                        yAxisID: leftAxisRef.current,
                        borderColor: colors[0],
                        pointBackgroundColor: colors[0],
                        pointBorderColor: colors[0],
                        borderWidth: 2,
                        tension: 0.3,
                    } : {
                        label: "",
                        data: [],
                        yAxisID: "y",
                    },

                    trends[1] !== "--Chọn--" ? {
                        label: trends[1],
                        data: data[trends[1]] || [],
                        yAxisID: leftAxisRef.current,
                        borderColor: colors[1],
                        pointBackgroundColor: colors[1],
                        pointBorderColor: colors[1],
                        borderWidth: 2,
                        tension: 0.3,
                    } : {
                        label: "",
                        data: [],
                        yAxisID: "y",
                    },

                    trends[2] !== "--Chọn--" ? {
                        label: trends[2],
                        data: data[trends[2]] || [],
                        yAxisID: leftAxisRef.current,
                        borderColor: colors[2],
                        pointBackgroundColor: colors[2],
                        pointBorderColor: colors[2],
                        borderWidth: 2,
                        tension: 0.3,
                    } : {
                        label: "",
                        data: [],
                        yAxisID: "y",
                    },

                    trends[3] !== "--Chọn--" ? {
                        label: trends[3],
                        data: data[trends[3]] || [],
                        yAxisID: rightAxisRef.current,
                        borderColor: colors[3],
                        pointBackgroundColor: colors[3],
                        pointBorderColor: colors[3],
                        borderWidth: 2,
                        tension: 0.3,
                    } : {
                        label: "",
                        data: [],
                        yAxisID: "y",
                    },

                    trends[4] !== "--Chọn--" ? {
                        label: trends[4],
                        data: data[trends[4]] || [],
                        yAxisID: rightAxisRef.current,
                        borderColor: colors[4],
                        pointBackgroundColor: colors[4],
                        pointBorderColor: colors[4],
                        borderWidth: 2,
                        tension: 0.3,
                    } : {
                        label: "",
                        data: [],
                        yAxisID: "y",
                    },

                    trends[5] !== "--Chọn--" ? {
                        label: trends[5],
                        data: data[trends[5]] || [],
                        yAxisID: rightAxisRef.current,
                        borderColor: colors[5],
                        pointBackgroundColor: colors[5],
                        pointBorderColor: colors[5],
                        borderWidth: 2,
                        tension: 0.3,
                    } : {
                        label: "",
                        data: [],
                        yAxisID: "y",
                    },
                ],
            });

        } catch (error) {

            console.error(
                "Không thể lấy dữ liệu ban đầu:",
                error
            );

        }
    };

    /*
     * ==========================================
     * 2. Lấy 1 data realtime
     * ==========================================
     */

    const fetchData = async (trends) => {

        console.log(trends);
        trends.forEach((value) => {
            if(value !== "--Chọn--"){
                console.log("Đã chọn trend!");
            }
            else{
                console.log("Chưa chọn trend!");
                return;
            }
        })

        try {

            const response = await axios.get(
                "http://localhost:8080/test-api/random-data"
            );

            const data = response.data.value;

            const now = new Date();

            const time = now.toLocaleTimeString(
                "vi-VN",
                {
                    hour: "2-digit",
                    minute: "2-digit",
                    second: "2-digit",
                }
            );


            setChartData((prev) => {

                let trend0, trend1, trend2, trend3, trend4, trend5

                let labels = [
                    ...prev.labels,
                    time,
                ];
                if(trends[0] !== "--Chọn--")
                trend0 = [
                    ...prev.datasets[0].data || [],
                    data[trends[0]],
                ];
                if(trends[1] !== "--Chọn--")
                trend1 = [
                    ...prev.datasets[1].data || [],
                    data[trends[1]],
                ];
                if(trends[2] !== "--Chọn--")
                trend2 = [
                    ...prev.datasets[2].data || [],
                    data[trends[2]],
                ];
                if(trends[3] !== "--Chọn--")
                trend3 = [
                    ...prev.datasets[3].data || [],
                    data[trends[3]],
                ];
                if(trends[4] !== "--Chọn--")
                trend4 = [
                    ...prev.datasets[4].data || [],
                    data[trends[4]],
                ];
                if(trends[5] !== "--Chọn--")
                trend5 = [
                    ...prev.datasets[5].data || [],
                    data[trends[5]],
                ];


                /*
                 * Chỉ giữ 30 điểm gần nhất
                 */

                if (labels.length > 30) {

                    labels = labels.slice(-30);
                    trend0 = trend0?.slice(-30);
                    trend1 = trend1?.slice(-30);
                    trend2 = trend2?.slice(-30);
                    trend3 = trend3?.slice(-30);
                    trend4 = trend4?.slice(-30);
                    trend5 = trend5?.slice(-30);

                }


                return {

                    labels,

                    datasets: [
                        trends[0] !== "--Chọn--" && {
                            ...prev.datasets[0],
                            data: trend0,
                        },
                        trends[1] !== "--Chọn--" && {
                            ...prev.datasets[1],
                            data: trend1,
                        },
                        trends[2] !== "--Chọn--" && {
                            ...prev.datasets[2],
                            data: trend2,
                        },
                        trends[3] !== "--Chọn--" && {
                            ...prev.datasets[3],
                            data: trend3,
                        },
                        trends[4] !== "--Chọn--" && {
                            ...prev.datasets[4],
                            data: trend4,
                        },
                        trends[5] !== "--Chọn--" && {
                            ...prev.datasets[5],
                            data: trend5,
                        }
                    ],

                };

            });

        } catch (error) {

            console.error(
                "Không thể lấy dữ liệu realtime:",
                error
            );

        }
    };


    /*
     * ==========================================
     * 3. Load base trước
     *    Sau đó mới realtime
     * ==========================================
     */

    useEffect(() => {

        let interval;

        const init = async () => {

            interval = setInterval(() => {
                fetchData(trendsRef.current);
            }, 3000);

        };


        init();


        return () => {

            if (interval) {
                clearInterval(interval);
            }

        };

    }, []);


    /*
     * ==========================================
     * 4. Theo dõi theme
     * ==========================================
     */

    useEffect(() => {

        const updateTheme = () => {

            const newTheme =
                document.body.classList.contains("light")
                    ? "light"
                    : "dark";

            setTheme(newTheme);

        };


        updateTheme();


        const observer = new MutationObserver(
            updateTheme
        );


        observer.observe(document.body, {
            attributes: true,
            attributeFilter: ["class"],
        });


        return () => {
            observer.disconnect();
        };

    }, []);

    useEffect(() => {
        const root = getComputedStyle(document.body);
        const colors = {
            text: root.getPropertyValue("--chart-text").trim(),
            grid: root.getPropertyValue("--chart-grid").trim(),
            border: root.getPropertyValue("--chart-border").trim(),
        };

        setOptions(prev => ({
            ...prev,
            plugins: {
                ...prev.plugins,
                legend: {
                    ...prev.plugins.legend,
                    labels: { ...prev.plugins.legend.labels, color: colors.text },
                },
                title: { ...prev.plugins.title, color: colors.text },
            },
            scales: Object.fromEntries(
                Object.entries(prev.scales).map(([key, scale]) => [
                    key,
                    {
                        ...scale,
                        ticks: scale.ticks ? { ...scale.ticks, color: colors.text } : scale.ticks,
                        grid: scale.grid ? { ...scale.grid, color: colors.grid } : scale.grid,
                        border: scale.border ? { ...scale.border, color: colors.border } : scale.border,
                        title: scale.title ? { ...scale.title, color: colors.text } : scale.title,
                    },
                ])
            ),
        }));
    }, [theme]);

    const leftAxisRef = useRef("");
    const rightAxisRef = useRef("");

    useEffect(() => {
        let newLeft = "";
        let newRight = "";

        trends.forEach((val, index) => {
            const group = Object.keys(LIST_VALUES).find(key => LIST_VALUES[key].includes(val));
            if (index < 3 && group) newLeft = group;
            if (index >= 3 && group) newRight = group;
        });


        if (leftAxisRef.current !== newLeft) {
            if (leftAxisRef.current){
                toggleAxis(leftAxisRef.current, false);
            } 
            if (newLeft) {
                changeAxisPosition(newLeft, "left");
                toggleAxis(newLeft, true);
            }
            leftAxisRef.current = newLeft;
        }

        if (rightAxisRef.current !== newRight) {
            if (rightAxisRef.current){
                toggleAxis(rightAxisRef.current, false);
            } 
            if (newRight) {
                changeAxisPosition(newRight, "right");
                toggleAxis(newRight, true);
            }
            rightAxisRef.current = newRight;
        }

        getBaseData(trends);

        setVisible((newLeft || newRight)? "visible" : "hidden");
        trendsRef.current = trends;

    }, [trends, colors]);

    /*input
     * ==========================================
     * 6. Chart options
     * ==========================================
     */

    const [options, setOptions] = useState({

        responsive: true,
        animation: true,
        maintainAspectRatio: false,
        interaction: {
            mode: "index",
            intersect: false,
        },

        plugins: {

            legend: {

                position: "top",

                labels: {

                    filter: (legendItem, data) => {
                        const ds = data.datasets[legendItem.datasetIndex];
                        return ds.data && ds.data.length > 0;
                    },

                    boxWidth: 100,
                    boxHeight: 20,
                    usePointStyle: true,
                    pointStyle: "line",

                },

            },

            title: {

                display: true,
                text: title,

            },
        },


        scales: {
            x: {
                title: {
                    display: true,
                    text: "Thời gian",
                },

                grid: {
                    lineWidth: 1,
                },

                border: {
                    width: 2,

                },

                ticks: {
                    font: {
                        size: 12,
                    },

                },

            },


            I: {
                display: false,
                min: 0,
                max: 100,
                type: "linear",
                position: "left",
                title: {
                    display: true,
                    text: "Dòng điện (A)",
                },
                grid: {
                    lineWidth: 1,
                },
                border: {
                    width: 2,
                },
                ticks: {
                    font: {
                        size: 12,
                    },
                },
            },
            U: {
                display: false,
                min: 0,
                max: 500,
                type: "linear",
                position: "left",
                title: {
                    display: true,
                    text: "Điện áp (V)",
                },
                grid: {
                    lineWidth: 1,
                },
                border: {
                    width: 2,
                },
                ticks: {
                    font: {
                        size: 12,
                    },
                },
            },
            P: {
                display: false,
                min: 0,
                max: 1000,
                type: "linear",
                position: "left",
                title: {
                    display: true,
                    text: "Công suất (KW)",
                },
                grid: {
                    lineWidth: 1,
                },
                border: {
                    width: 2,
                },
                ticks: {
                    font: {
                        size: 12,
                    },
                },
            },
            Q: {
                display: false,
                min: -1000,
                max: 1000,
                type: "linear",
                position: "left",
                title: {
                    display: true,
                    text: "Công suất phản kháng (Kvar)",
                },
                grid: {
                    lineWidth: 1,
                },
                border: {
                    width: 2,
                },
                ticks: {
                    font: {
                        size: 12,
                    },
                },
            },
            cos: {
                display: false,
                min: 0,
                max: 1,
                type: "linear",
                position: "left",
                title: {
                    display: true,
                    text: "Cosφ",
                },
                grid: {
                    lineWidth: 1,
                },
                border: {
                    width: 2,
                },
                ticks: {
                    font: {
                        size: 12,
                    },
                },
            },
            Power: {
                display: false,
                min: 0,
                max: 1000,
                type: "linear",
                position: "left",
                title: {
                    display: true,
                    text: "Công suất (KWh)",
                },
                grid: {
                    lineWidth: 1,
                },
                border: {
                    width: 2,
                },
                ticks: {
                    font: {
                        size: 12,
                    },
                },
            },
            y:{
                display: false,
                type: "linear",
                position: "left",
                title: {
                    display: true,
                    text: "Trục ảo",
                },
            }
        },

    })


    return (

        <div className="chart-page" style={{height: "90%", position: "relative", top: "-10px"}}>

        <div className="trend-bar">
            <div className="trend-item" id="trendItem1">
                <select
                    id="trend1"
                    value={trends[0]}
                    onChange={e => handleTrendChange(0, e.target.value)}
                >
                    {getOptions(0).map(option => (
                        <option key={option} value={option}>
                            {option}
                        </option>
                    ))}
                </select>

                <input
                    type="color"
                    id="colorPicker1"
                    value={colors[0]}
                    onChange={e => ChangeColors(0, e.target.value)}
                />
            </div>
            <div className="trend-item" id="trendItem2">
                <select
                    id="trend2"
                    value={trends[1]}
                    onChange={e => handleTrendChange(1, e.target.value)}
                >
                    {getOptions(1).map(option => (
                        <option key={option} value={option}>
                            {option}
                        </option>
                    ))}
                </select>

                <input
                    type="color"
                    id="colorPicker2"
                    value={colors[1]}
                    onChange={e => ChangeColors(1, e.target.value)}
                />
            </div>
            <div className="trend-item" id="trendItem3">
                <select
                    id="trend3"
                    value={trends[2]}
                    onChange={e => handleTrendChange(2, e.target.value)}
                >
                    {getOptions(2).map(option => (
                        <option key={option} value={option}>
                            {option}
                        </option>
                    ))}
                </select>

                <input
                    type="color"
                    id="colorPicker3"
                    value={colors[2]}
                    onChange={e => ChangeColors(2, e.target.value)}
                />
            </div>

            <button className="clear-btn" id="clearBtnA" onClick={f_clearBtnA} title="Xóa nhóm 1-2-3">✕</button>
            <div className="trend-item" id="trendItem4">
                <select
                    value={trends[3]}
                    onChange={e => handleTrendChange(3, e.target.value)}
                >
                    {getOptions(3).map(option => (
                        <option key={option} value={option}>
                            {option}
                        </option>
                    ))}
                </select>
                <input type="color" id="colorPicker4" value={colors[3]} onChange={e => ChangeColors(3, e.target.value)}/>
            </div>
            <div className="trend-item" id="trendItem5">
                <select
                    value={trends[4]}
                    onChange={e => handleTrendChange(4, e.target.value)}
                >
                    {getOptions(4).map(option => (
                        <option key={option} value={option}>
                            {option}
                        </option>
                    ))}
                </select>

                <input type="color" id="colorPicker4" value={colors[4]} onChange={e => ChangeColors(4, e.target.value)}/>
            </div>
            <div className="trend-item" id="trendItem6">
                <select
                    value={trends[5]}
                    onChange={e => handleTrendChange(5, e.target.value)}
                >
                    {getOptions(5).map(option => (
                        <option key={option} value={option}>
                            {option}
                        </option>
                    ))}
                </select>
                <input type="color" id="colorPicker5" value={colors[5]} onChange={e => ChangeColors(5, e.target.value)}/>
            </div>
            <button className="clear-btn" id="clearBtnB" onClick={f_clearBtnB} title="Xóa nhóm 4-5-6">✕</button>
            <button
                className = "stop-btn"
                id="pauseBtn"
                onClick={() => {setStop(!stop); console.log(stop);}}
                style={{
                    backgroundColor: stop ? '#22c55e' : '#ef4444', width: "90px"
                }}
            >
                {stop ? '▶ Resume' : '⏸ Pause'}
            </button>
        </div>

        <div
                style={{
                    width: "100%",
                    maxWidth: "1000px",
                    margin: "0 auto",
                    height: "100%",
                    visibility: visible,
                }}
            >

                <Line
                    data={chartData}
                    options={options}
                    style={{
                    width: "100%",
                    maxWidth: "1000px",
                    margin: "0 auto",
                    visibility: visible,
                }}
                />
                <span style={{
                    visibility: visible == "visible" ? "hidden" : "visible",
                    top: "-50%",
                    position: "relative",
                    color: "gray"
                }}> Chọn chart để quan sát </span>

            </div>

        </div>

    );

}

export default Chartjs;
