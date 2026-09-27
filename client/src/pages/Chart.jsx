import Chartjs from "../Component/chart/realtimechart";
import "./assets/Chart.css"
import { useState } from "react";
import HistoricalChart from "../Component/chart/historicalChart2";
import axios from 'axios';

function Chart() {

    const [mode, setMode] = useState("realtime");
    const [startDate, setStartDate] = useState("");
    const [endDate, setEndDate] = useState("");
    const [chartData, setChart] = useState([]);

    const handleConfirm = () => {

    if (!startDate || !endDate) {
        alert("Vui lòng chọn đầy đủ ngày bắt đầu và ngày kết thúc");
        return;
    }

    if (startDate > endDate) {
        alert("Ngày bắt đầu không được lớn hơn ngày kết thúc");
        return;
    }

    console.log("Ngày bắt đầu:", startDate);
    console.log("Ngày kết thúc:", endDate);


    // Sau này gọi API Historical ở đây
    };


    return (
        <div className="page">

            <div className="item header">
             <h3 style={{position: "relative", top: '-20px'}}>Charts</h3>
            </div>

            <div
            className="center"
            style={{ width: "100%" }}
        >

            <div className="chart-nav" style = {{marginTop: "35px"}}>

                {/* Thanh nền */}
                <div
                    className={`chart-nav-indicator ${
                        mode === "historical"
                            ? "historical"
                            : ""
                    }`}
                />

                <button
                    className={
                        mode === "realtime"
                            ? "active"
                            : ""
                    }
                    onClick={() => setMode("realtime")}
                >
                    Real time
                </button>

                <button
                    className={
                        mode === "historical"
                            ? "active"
                            : ""
                    }
                    onClick={() => setMode("historical")}
                >
                    Historical
                </button>

            </div>


            <div
                className="full-side"
                style={{
                    height: "calc(100vh - 170px)",
                    marginBottom: "5px",
                    marginTop: "5px"
                }}
            >

                {mode === "realtime" ? (

                    <Chartjs
                        title = {"Realtime Chart"}
                    />

                ) : (
                    <HistoricalChart 
                        width={1400}
                        height={500}
                        title = {"Dữ liệu random"}
                    />

                )}

            </div>

        </div>
        </div>
    );

}

export default Chart;