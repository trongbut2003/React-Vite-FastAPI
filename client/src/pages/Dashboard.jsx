import { useState, useEffect } from 'react'
import axios from 'axios';

function Dashboard() {

     const [array, setArray] = useState([]);
  const [val, setValue] = useState("");
  const [btnSta, setBtn] = useState(false);

  const [plcData, setPlcData] = useState({
    val: 0,
    btnSta: false
  });

  const fetchAPI =  async () => {
    const response = await axios.get("http://localhost:8080/api/fromPLC");
    setArray(response.data)
  }

  const sendToPLC = async () => {

    const response = await fetch("http://localhost:8080/api/toPLC", {
    method: "POST",
    headers: {
        "Content-Type": "application/json"
    },
    body: JSON.stringify({
        value: val,
        btnStatus: btnSta
    })
});

  const data = await response.json();

  console.log(data);
       
}; 

useEffect(() => {

    fetchAPI();

    const interval = setInterval(() => {
        fetchAPI();
    }, 1000);

    return () => {
        clearInterval(interval);
    };

}, []);

useEffect(() => {
    sendToPLC();
}, [btnSta]);

  const handleClick = async () => {
    const newStatus = !btnSta;      // Đảo trạng thái
    setBtn(newStatus);
  };

  const handleChange = (e) => {
    let value = e.target.value;

    if (value.includes(".")) {
      const [integer, decimal] = value.split(".");
      value = integer + "." + decimal.slice(0, 2);
    }

    setValue(value);
  };


    return (
        <div className="page">

            <div className="item header">
             <h3 style={{position: "relative", top: '-20px'}}>TestWeb</h3>
            </div>

        <div className = "center">
            <div className="full-side" style={{ height: "auto", flexDirection: "row", marginBottom: "2px"}}>
                <div className="item left-side">
                    <div style={{ position: "absolute", top: "0", left: '50%', transform: "translateX(-50%)"}}>Read value from PLC</div>
                    <div className = "temperature1">
                    <span>Temperature: </span>
                        <span>{array.temperature}</span>
                    <span></span>
                    <span> °C</span>
                    </div>
                    <div className = "humidity1">
                    <span>Humidity: </span>
                        <span>{array.humidity}</span>
                    <span> %</span>
                    </div>
                </div>
                <div className="item right-side">
                    <div style={{ position: "absolute", top: "0", left: '50%', transform: "translateX(-50%)"}}>Set value to PLC</div>
                    <div>
                        <div className = "setpoint1">
                        <span>Setpoint: </span>
                        <input id="num" value={val} onChange={handleChange}/>
                        </div>
                        <div><button onClick={sendToPLC}>Bấm để gửi</button></div>
                    </div>
                </div>
            </div>
            <div className="item full-side">
                <div style={{ position: "absolute", top: "0", left: '50%', transform: "translateX(-50%)"}}>Flash Led</div>
                <div>
                    <div><button onClick={handleClick} style ={{ backgroundColor: btnSta ? "green" : "red",}} >Flash led</button></div>
                    <br></br>
                    <br></br>
                    <div style={{display: "flex", flexDirection: "row", justifyContent: "space-around"}}>
                    <div className = "led" style ={{ backgroundColor: array.Q0 ? "green" : "red", width: "20px", height: "20px",}}></div>
                    <div className = "led" style ={{ backgroundColor: array.Q1 ? "green" : "red", width: "20px", height: "20px",}}></div>
                    <div className = "led" style ={{ backgroundColor: array.Q2 ? "green" : "red", width: "20px", height: "20px",}}></div>
                    <div className = "led" style ={{ backgroundColor: array.Q3 ? "green" : "red", width: "20px", height: "20px",}}></div>
                    <div className = "led" style ={{ backgroundColor: array.Q4 ? "green" : "red", width: "20px", height: "20px",}}></div>
                    <div className = "led" style ={{ backgroundColor: array.Q5 ? "green" : "red", width: "20px", height: "20px",}}></div>
                    </div>
                </div>
            </div>
        </div>
        </div>
    );

}

export default Dashboard;