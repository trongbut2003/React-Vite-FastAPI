import { useState } from "react";

export default function Goodwe() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const getStatistics = async () => {
    setLoading(true);
    setError("");

    try {
     const response = await fetch(
        "https://hk-gateway.semsportal.com/web/sems/sems-plant/api/v1/hems/power/statisticsAndPreV2",
        {
            method: "POST",
            headers: {
            "content-type": "application/json",
            token: JSON.stringify({
                uid: "d0301bf9-2063-4e90-8cad-0766f59e61af",
                timestamp: "1790300726407",
                token: "971795d7d879a0c365cc658d8934fb4a",
                client: "semsPlusWeb",
                version: "",
                language: "en",
                api: "https://hk-gateway.semsportal.com/web/sems",
                region: "hk",
                uuid: "e65c254f-80d7-4031-b27e-59e2a9ee21f2"
            }),
            uuid: "e65c254f-80d7-4031-b27e-59e2a9ee21f2",

            //Tham số x-sign này có thể thay đổi? Không rõ thời gian duy trì
            //"x-signature": "YzdlODQ0NmE0ZjU1ODUzYTk5YWE2ODZkZDBmMjhkOWI2YWI0MTgxYTFmZGEwOGMyM2E0ZmNkYjA4NGExZTJkNkAxNzkwMzA2NDM2ODAy"
            },
            body: JSON.stringify({
            stationId: "6ccaf0b6-fb92-4e7f-a956-b4b907334f5e",
            items: ["pSystem", "pConsum", "pGrid"],
            timeScale: 1, 
            timeZone: -7,
            startTime: "2026-09-25 00:00:00",
            endTime: "2026-09-25 23:59:59"
            })
        }
        );

  

      if (!response.ok) {
        throw new Error(
          `HTTP ${response.status}: ${response.statusText}`
        );
      }

      const result = await response.json();
      const data = result.data.dataList;
      const final = {
        "pSystem": data[0].powerData[data[0].powerData.length - 2].power,
        "pConsum": data[1].powerData[data[1].powerData.length - 2].power,
        "pGrid": data[2].powerData[data[2].powerData.length - 2].power,
      }

      setData(final);
    } catch (err) {
      console.error(err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: 30, fontFamily: "Arial" }}>
      <h1>SEMS Power Statistics</h1>

      <button onClick={getStatistics} disabled={loading}>
        {loading ? "Đang tải..." : "Lấy dữ liệu"}
      </button>

      {error && (
        <div style={{ color: "red", marginTop: 20 }}>
          Lỗi: {error}
        </div>
      )}

      {data && (
        <pre
          style={{
            marginTop: 20,
            padding: 20,
            background: "#f5f5f5",
            overflow: "auto",
            color: "black"
          }}
        >
          {JSON.stringify(data, null, 2)}
        </pre>
      )}
    </div>
  );
}
