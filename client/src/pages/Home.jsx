
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useNavigation } from "../Component/NavigationContext";

function Home() {
    const [open, setOpen] = useState(false);

    const navigate = useNavigate();
    const { startNavigation } = useNavigation();


    // Chuyển trang
    const goToPage = (path) => {

        startNavigation(navigate,path);

        // Đóng menu sau khi chọn
        setOpen(false);
    };
    return (
        <div className="page">

            <h3 style={{position: "relative", top: '-60px'}}>Home</h3>

            <div className = "center" style={{width: "100%"}}>
                <div className='full-side' style={{ height: "calc(50vh - 60px)", flexDirection: "row", marginBottom: "5px", marginTop: "5px" }}>
                    <div className='item left-side inv-btn' style={{height: "100%"}} onClick={() => goToPage("/home/inv1")}>
                        <div style={{ position: "absolute", top: "0", left: '50%', transform: "translateX(-50%)"}}>Inverter 01</div>
                        <img src = "/img/GT125-2.png" style={{ height: "70%", width: "auto", objectFit: "contain"}}/>
                    </div>
                    <div className='item right-side inv-btn' style={{height: "100%"}} onClick={() => goToPage("/home/inv2")}>
                        <div style={{ position: "absolute", top: "0", left: '50%', transform: "translateX(-50%)"}}>Inverter 02</div>
                        <img src = "/img/GT125-2.png" style={{ height: "70%", width: "auto", objectFit: "contain"}}/>
                    </div>
                </div>
            
                <div className='full-side' style={{ height: "calc(50vh - 60px)", flexDirection: "row", marginBottom: "2px"  }}>
                    <div className='item left-side inv-btn' style={{height: "100%"}} onClick={() => goToPage("//home/inv3")}>
                        <div style={{ position: "absolute", top: "0", left: '50%', transform: "translateX(-50%)"}}>Inverter 03</div>
                        <img src = "/img/GT150kW-2.png" style={{ height: "70%", width: "auto", objectFit: "contain"}}/>
                    </div>
                    <div className='item right-side inv-btn' style={{height: "100%"}} onClick={() => goToPage("//home/inv4")}>
                        <div style={{ position: "absolute", top: "0", left: '50%', transform: "translateX(-50%)"}}>Inverter 04</div>
                        <img src = "/img/GT150kW-2.png" style={{ height: "70%", width: "auto", objectFit: "contain"}}/>
                    </div>
                </div>
            </div>
        </div>
    );

}

export default Home;