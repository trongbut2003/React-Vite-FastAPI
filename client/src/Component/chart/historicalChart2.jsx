import { useState, useEffect } from "react";
import axios from "axios";

import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend
} from "chart.js";

import { Line } from "react-chartjs-2";

import "./HistoricalChart.css";


ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend
);


function HistoricalChart({width = 800, height = 400, title = "Title"}) {

    const [startDate, setStartDate] = useState("");
    const [endDate, setEndDate] = useState("");

    const [chartData, setChartData] = useState(null);

    const [loading, setLoading] = useState(false);

    const [error, setError] = useState("");


    //Theme
    
        const [theme, setTheme] = useState(() =>
        document.body.classList.contains("light")
            ? "light"
            : "dark"
        );
    
        useEffect(() => {
            console.log("🔥 Chartjs observer mounted");
    
            const updateTheme = () => {
                const newTheme = document.body.classList.contains("light")
                    ? "light"
                    : "dark";
                setTheme(newTheme);
    
                console.log("🔥 Theme changed:", theme);
            };
    
            // Lấy theme hiện tại ngay khi mount
            updateTheme();
    
            const observer = new MutationObserver(updateTheme);
    
            observer.observe(document.body, {
                attributes: true,
                attributeFilter: ["class"],
            });
    
    
            return () => {
                console.log("🔥 Chartjs observer disconnected");
                observer.disconnect();
            };
        }, []);
    
    
        const getThemeColors = (theme) => {
            const root = getComputedStyle(document.body);
            console.log("🔥 Theme changed 1:", theme);
            return {
                text: root.getPropertyValue("--chart-text").trim(),
                grid: root.getPropertyValue("--chart-grid").trim(),
                border: root.getPropertyValue("--chart-border").trim()
            };
        };


    // =====================================================
    // GET DATA FROM API
    // =====================================================

    const getHistory = async () => {

        if (!startDate || !endDate) {
            alert(
                "Vui lòng chọn ngày bắt đầu và ngày kết thúc"
            );
            return;
        }


        if (startDate > endDate) {
            alert(
                "Ngày bắt đầu không được lớn hơn ngày kết thúc"
            );
            return;
        }


        try {
            setLoading(true);
            setError("");

            const response = await axios.get(
                "http://localhost:8080/api/history",
                {
                    params: {
                        start: startDate,
                        end: endDate
                    }
                }
            );

            const result = response.data;
            console.log("History:", result);

            const { headers, data } = result;

            const columns = {};

            headers.forEach((header, index) => {
                columns[header] = data.map(row => row[index]);
            });


            // =================================================
            // CHART DATA
            // =================================================

            const colors = [
                "red",
                "blue",
                "green",
                "orange",
                "purple",
                "brown"
            ];


            setChartData({
                labels: columns[headers[0]],

                datasets: headers.slice(1).map((header, index) => ({
                    label: header,

                    data: columns[header],

                    borderColor: colors[index % colors.length],

                    backgroundColor: colors[index % colors.length],

                    borderWidth: 2,

                    pointRadius: 3,

                    tension: 0.3
                }))
            });

        }
        catch (err) {

            console.error(err);

            setError(
                "Không thể lấy dữ liệu từ server"
            );

            setChartData(null);

        }
        finally {

            setLoading(false);

        }

    };


    // =====================================================
    // OPTIONS
    // =====================================================

    const colors = getThemeColors();

    const options = {

        responsive: true,

        maintainAspectRatio: false,

        interaction: {
            mode: "index",
            intersect: false
        },


        plugins: {

            legend: {

                display: true,

                labels: {
                    color: colors.text
                }

            },


            title: {

                display: true,

                text: "Historical Data",

                color: colors.text,

                font: {
                    size: 16
                }

            }

        },


        scales: {

            x: {

                ticks: {
                    color: colors.text
                },

                grid: {
                    color: "#dddddd"
                },

                title: {

                    display: true,

                    text: "Thời gian",

                    color: colors.text

                }

            },


            y: {

                ticks: {
                    color: colors.text
                },

                grid: {
                    color: "#dddddd"
                },

                title: {

                    display: true,

                    text: "Giá trị",

                    color: colors.text

                }

            }

        }

    };


    return (

        <div className="historical-chart">


            {/* =========================================
                DATE FILTER
            ========================================= */}

            <div className="history-filter">


                <div className="history-date">

                    <label>
                        Start time
                    </label>

                    <input
                        type="date"
                        value={startDate}
                        onChange={(e) =>
                            setStartDate(e.target.value)
                        }
                    />

                </div>


                <div className="history-date">

                    <label>
                        Stop time
                    </label>

                    <input
                        type="date"
                        value={endDate}
                        onChange={(e) =>
                            setEndDate(e.target.value)
                        }
                    />

                </div>


                <button
                    onClick={getHistory}
                    disabled={loading}
                >

                    {loading
                        ? "Loading..."
                        : "Check"
                    }

                </button>


            </div>


            {/* =========================================
                ERROR
            ========================================= */}

            {error && (

                <div className="history-error">

                    {error}

                </div>

            )}


            {/* =========================================
                CHART
            ========================================= */}

            <div className="history-chart-container">

                {chartData ? (

                    <Line
                        data={chartData}
                        options={options}
                        width={width}
                        height={height}
                        title= {title}
                    />

                ) : (

                    <div className="no-history">

                        Chọn khoảng thời gian
                        rồi bấm "Xác nhận"

                    </div>

                )}

            </div>


        </div>

    );

}


export default HistoricalChart;