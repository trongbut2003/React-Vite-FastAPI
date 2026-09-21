import { useState } from "react";
import  ReportTable from "../Component/table/Table.jsx";
import axios from 'axios';
import * as XLSX from "xlsx";



function Report() {

    const [startDate, setStartDate] = useState("");
    const [endDate, setEndDate] = useState("");
    const [isVisible, setVisible] = useState(false);
    const [result, setResult] = useState({});

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


        const response = await axios.get(
            "http://localhost:8080/api/report",
            {
                params: {
                    start: startDate,
                    end: endDate
                }
            }
        );
        const data = response.data.data;
        setVisible( data.length > 0 ? true : false);

        console.log("History:", response);
        setResult(response.data);

    };

    const downLoad = () => {
        const worksheetData = [
            result.headers,
            ...result.data
        ];

        const worksheet = XLSX.utils.aoa_to_sheet(worksheetData);

        // Độ rộng cột
        worksheet["!cols"] = [
            { wch: 22 }, // Time
            { wch: 15 }, // Temperature
            { wch: 15 }  // Humidity
        ];

        const workbook = XLSX.utils.book_new();

        XLSX.utils.book_append_sheet(
            workbook,
            worksheet,
            "Sensor Data"
        );

        const now = new Date();

        const time = [
            String(now.getFullYear()).slice(-2),
            String(now.getMonth() + 1).padStart(2, "0"),
            String(now.getDate()).padStart(2, "0"),
        ].join(".");



        XLSX.writeFile(workbook, "sensor-data-"+ time + ".xlsx");
        setVisible(false);
        };


    return (
        <div className="page">

            <h3 style={{position: "relative", top: '-60px'}}>Reports</h3>

            <div className = "center" style={{width: "100%"}}>
                <div className='full-side' style={{justifyContent: "normal", height: "calc(100vh - 120px)", flexDirection: "row", marginBottom: "5px", marginTop: "5px" }}>
                    <div className="date-filter" style={{position: "relative", left: "50px", top: "10px"}}>

                            <span className="date-item" style={{marginLeft: "30px"}}>
                                <label>Start time: </label>

                                <input
                                    type="date"
                                    value={startDate}
                                    onChange={(e) =>
                                        setStartDate(e.target.value)
                                    }
                                    style={{ marginLeft: "10px"}}
                                />
                            </span>


                            <span className="date-item" style={{ marginLeft: "30px"}}>
                                <label>Stop time: </label>

                                <input
                                    type="date"
                                    value={endDate}
                                    onChange={(e) =>
                                        setEndDate(e.target.value)
                                    }
                                    style={{ marginLeft: "10px"}}
                                />
                            </span>


                            <button
                                className="confirm-button"
                                onClick={getHistory}
                                style={{ marginLeft: "30px"}}
                            >
                                Check
                            </button>

                            {isVisible && (
                                <button
                                className="confirm-button"
                                onClick={downLoad}
                                style={{ marginLeft: "30px"}}
                                >
                                Download
                                </button>
                            )}

                        </div>
                    <div className="report-scroll" style={{overflow: "auto", position: "absolute", top: "50px", left: "50%", transform: "translateX(-50%)", width: "90%", height: "calc(90% - 20px)"}}>
                        <ReportTable headers = {result.headers} data = {result.data}></ReportTable>
                    </div>
                </div>
            </div>
        </div>
    );

}

export default Report;