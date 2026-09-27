
import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useNavigation } from "../Component/NavigationContext";

function Inv({ number }) {
    const [open, setOpen] = useState(false);

    const navigate = useNavigate();
    const { startNavigation } = useNavigation();


    // Chuyển trang
    const goToPage = (path) => {

        startNavigation(navigate, path);

        // Đóng menu sau khi chọn
        setOpen(false);
    };


    const goNext = () => {
        startNavigation(navigate,`/home/inv${number + 1}`);
    };
    const goPre = () => {
        startNavigation(navigate,`/home/inv${number - 1}`);
    };
    return (
        <div className="page">
            <div className="item header">
             <h3 style={{position: "relative", top: '-20px'}}>Home</h3>
            </div>

            <div className = "center">
                <div className = "item bread-crumb">
                    <span onClick={() => goToPage("/home")} style={{cursor: "pointer", marginLeft: "20px"}}>⌂ Home</span>
                    <span>&nbsp;›&nbsp;</span>
                    <span>☀ Inverter 0{number}</span>
                    </div>
                <div className='full-side' style={{ height: "calc(100vh - 80px)", flexDirection: "row", marginBottom: "5px"}}>
                    <div className='item left-side' style={{height: "100%", width: "400px"}}>
                        <div style={{ position: "absolute", top: "0", left: '50%', transform: "translateX(-50%)"}}>Inverter 0{number}</div>
                        <button className="inv-nav-btn" onClick={goPre} disabled={number <= 1} style={{left: "5px"}}>
                            &lt;
                        </button>
                        <img src = "/img/GT125-2.png" style={{ height: "70%", width: "auto", objectFit: "contain"}}/>
                        <button className="inv-nav-btn" onClick={goNext} disabled={number >= 4} style={{right: "5px"}}>
                            &gt;
                        </button>
                    </div>
                    <div className='item right-side' style={{height: "100%", width: "calc(100% - 405px)"}} >
                        <div style={{ position: "absolute", top: "0", left: '50%', transform: "translateX(-50%)"}}>Parameter</div>
                        <div style={{ position: "relative", top: '0', left: '5%', width: "90%", height: "93%", background: "transparent"}}>
                            <div style={{ position: "absolute", top: '0', left: '5%', width: "40%", height: "100%", background: "transparent", display: "flex", flexDirection: "column", justifyContent: "center"}}>
                                <div  className="measure-box">
                                    <span style={{position: "absolute", left: "50px"}}>AB Grid Voltage: </span>
                                    <span style={{position: "absolute", right: "50px"}}>580  VDC</span>
                                </div>
                                <div  className="measure-box">
                                    <span style={{position: "absolute", left: "50px"}}>BC Grid Voltage: </span>
                                    <span style={{position: "absolute", right: "50px"}}>580  VDC</span>
                                </div>
                                <div  className="measure-box">
                                    <span style={{position: "absolute", left: "50px"}}>CA Grid Voltage: </span>
                                    <span style={{position: "absolute", right: "50px"}}>580  VDC</span>
                                </div>
                                <div  className="measure-box">
                                    <span style={{position: "absolute", left: "50px"}}>A Phase Voltage: </span>
                                    <span style={{position: "absolute", right: "50px"}}>580  VDC</span>
                                </div>
                                <div  className="measure-box">
                                    <span style={{position: "absolute", left: "50px"}}>B Phase Voltage: </span>
                                    <span style={{position: "absolute", right: "50px"}}>580  VDC</span>
                                </div>
                                <div  className="measure-box">
                                    <span style={{position: "absolute", left: "50px"}}>C Phase Voltage: </span>
                                    <span style={{position: "absolute", right: "50px"}}>580  VDC</span>
                                </div>
                                <div  className="measure-box">
                                    <span style={{position: "absolute", left: "50px"}}>A Phase Current: </span>
                                    <span style={{position: "absolute", right: "50px"}}>580  VDC</span>
                                </div>
                                <div  className="measure-box">
                                    <span style={{position: "absolute", left: "50px"}}>B Phase Current: </span>
                                    <span style={{position: "absolute", right: "50px"}}>580  VDC</span>
                                </div>
                                <div  className="measure-box">
                                    <span style={{position: "absolute", left: "50px"}}>C Phase Current: </span>
                                    <span style={{position: "absolute", right: "50px"}}>580  VDC</span>
                                </div>
                            </div>
                            <div style={{ position: "absolute", top: '0', right: '5%', width: "40%", height: "100%", background: "transparent", display: "flex", flexDirection: "column", justifyContent: "center"}}>
                                <div  className="measure-box">
                                    <span style={{position: "absolute", left: "50px"}}>P: </span>
                                    <span style={{position: "absolute", right: "50px"}}>580  VDC</span>
                                </div>
                                <div  className="measure-box">
                                    <span style={{position: "absolute", left: "50px"}}>Q: </span>
                                    <span style={{position: "absolute", right: "50px"}}>580  VDC</span>
                                </div>
                                <div  className="measure-box">
                                    <span style={{position: "absolute", left: "50px"}}>Cosφ: </span>
                                    <span style={{position: "absolute", right: "50px"}}>0.85</span>
                                </div>
                                <div  className="measure-box">
                                    <span style={{position: "absolute", left: "50px"}}>Frequence: </span>
                                    <span style={{position: "absolute", right: "50px"}}>50 Hz</span>
                                </div>
                                <div  className="measure-box">
                                    <span style={{position: "absolute", left: "50px"}}>Daily generation: </span>
                                    <span style={{position: "absolute", right: "50px"}}>3.5 kW</span>
                                </div>
                                <div  className="measure-box">
                                    <span style={{position: "absolute", left: "50px"}}>Cumulative   : </span>
                                    <span style={{position: "absolute", right: "50px"}}>1500 kWh</span>
                                </div>
                            </div>
                        </div>
                        
                    </div>
                </div>

            </div>
        </div>
    );

}

export default Inv;