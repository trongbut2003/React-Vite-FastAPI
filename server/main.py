from fastapi import FastAPI, Query, WebSocket, WebSocketDisconnect
from contextlib import asynccontextmanager
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel

import snap7
from snap7.util import set_real, get_real, set_bool, get_bool
import mysql.connector

from pathlib import Path

import time
import threading
import random
from datetime import date, timedelta, datetime
import asyncio

# =========================================================
# FASTAPI STARTUP
# =========================================================

@asynccontextmanager
async def lifespan(app: FastAPI):

    loop = asyncio.get_running_loop()

    random_thread = threading.Thread(
        target=randomData1,
        args=(loop,),
        daemon=True
    )

    random_thread.start()

    yield


app = FastAPI(lifespan=lifespan)



# =========================================================
# CORS
# =========================================================

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)


# =========================================================
# PLC
# =========================================================

PLC_IP = "107.105.30.45"

plc = snap7.Client()

temp1 = None
hum1 = None
Q0 = None
Q1 = None
Q2 = None
Q3 = None
Q4 = None
Q5 = None
Q6 = None
Q7 = None
hisData = {
    "Ia": [0]*30,
    "Ib": [0]*30,
    "Ua": [0]*30,
    "Ub": [0]*30,
    "timeData": [0]*30
}
realtime = {
    "Ia": 0,
    "Ib": 0,
    "Ua": 0,
    "Ub": 0,
    "timeData": 0
}

# =========================================================
# KẾT NỐI PLC
# =========================================================

def connect_plc():

    if not plc.get_connected():

        try:
            plc.connect(PLC_IP, 0, 1)

        except Exception as e:
            print("Lỗi kết nối PLC:", e)
            return False

    return plc.get_connected()


# =========================================================
# GHI DỮ LIỆU VÀO PLC
# =========================================================

def write_to_plc(data):

    if not connect_plc():

        print("Lỗi không kết nối với PLC!")

        return False

    try:

        value = data.get("value")
        btnSta = data.get("btnStatus")
        value = round(float(value), 2)
        # Đọc DB1, byte 0 -> 4 byte
        data = plc.db_read(1, 0, 5)

        # Ghi REAL tại DBD0
        set_real(data, 0, value)
        set_bool(data, 4, 0, btnSta)

        # Ghi ngược lại PLC
        plc.db_write(1, 0, data)

        return True

    except Exception as e:

        print("Lỗi ghi PLC:", e)

        return False


# =========================================================
# ĐỌC DỮ LIỆU TỪ PLC
# =========================================================

def read_from_plc():

    global temp1
    global hum1
    global Q0,Q1,Q2,Q3,Q4,Q5,Q6,Q7

    if not connect_plc():
        return None

    try:

        # Đọc DB1 từ byte 4 đến byte 12
        data = plc.db_read(2, 0, 10)

        # DBD2 = REAL
        temperature = get_real(data, 0)

        # DBD6 = REAL
        humidity = get_real(data, 4)

        Q0 = get_bool(data, 8, 0)
        Q1 = get_bool(data, 8, 1)
        Q2 = get_bool(data, 8, 2)
        Q3 = get_bool(data, 8, 3)
        Q4 = get_bool(data, 8, 4)
        Q5 = get_bool(data, 8, 5)
        Q6 = get_bool(data, 8, 6)
        Q7 = get_bool(data, 8, 7)

        temp1 = round(temperature, 1)
        hum1 = round(humidity, 1)

    except Exception as e:

        print("Lỗi đọc PLC:", e)
        return None


# =========================================================
# API GHI PLC
# =========================================================

@app.post("/api/toPLC")
async def receive_plc(data: dict):

    value = data.get("value")
    btnSta = data.get("btnStatus")

    try:
        success = write_to_plc(data)

        return {
            "success": success,
            "value": value,
            "btnStatus": btnSta
        }

    except Exception as e:

        return {
            "success": False,
            "value": 0.00,
            "btnStatus": btnSta
        }

# =========================================================
# API ĐỌC PLC
# =========================================================

@app.get("/api/fromPLC")
def from_plc():

    return {
        "success": True,
        "temperature": temp1,
        "humidity": hum1,
        "Q0": Q0,
        "Q1": Q1,
        "Q2": Q2,
        "Q3": Q3,
        "Q4": Q4,
        "Q5": Q5,
        "Q6": Q6,
        "Q7": Q7,
    }

@app.get("/test-api/random-data")
def randomValue():
    global hisData, realtime
    time = datetime.now().strftime("%H:%M:%S")
    hisData["timeData"].append(time)

    realtime["Ia"] = random.randint(10, 80)
    hisData["Ia"].append(realtime["Ia"])
    realtime["Ib"] = random.randint(10, 80)
    hisData["Ib"].append(realtime["Ib"])
    realtime["Ua"] = random.randint(360, 390)
    hisData["Ua"].append(realtime["Ua"])
    realtime["Ub"] = random.randint(360, 390)
    hisData["Ub"].append(realtime["Ub"])


    if len(hisData["timeData"]) > 30:
        for i in hisData:
            hisData[i].pop(0)
        

    return {
        "value": realtime
    }


@app.get("/test-api/random-data-base")
def randomData():
    return hisData

# =========================================================
# MYSQL
# =========================================================

def get_connection():

    return mysql.connector.connect(
        host="localhost",
        user="root",
        password="root",
        database="plc_data"
    )


# =========================================================
# HISTORY API
# =========================================================

@app.get("/api/history")
def get_history(
    start: date = Query(...),
    end: date = Query(...)
):

    # Lấy trọn ngày end
    end_datetime = end + timedelta(days=1)

    conn = None
    cursor = None

    try:

        conn = get_connection()

        cursor = conn.cursor()

        sql = """
            SELECT *
            FROM sensor_data
            WHERE time >= %s
              AND time < %s
            ORDER BY time ASC
        """

        cursor.execute(
            sql,
            (
                start,
                end_datetime
            )
        )

        rows = cursor.fetchall()

        data = []

        for row in rows:

            timestamp = row[1]

            # Chuyển datetime thành chuỗi
            if timestamp is not None:
                time_string = timestamp.strftime(
                    "%Y-%m-%d %H:%M:%S"
                )
            else:
                time_string = ""

            data.append([
                time_string,
                row[2],
                row[3],
            ])

        return {
            "headers": [
                "Time",
                "Temperature",
                "Humidity",
            ],
            "data": data
        }

    finally:

        if cursor:
            cursor.close()

        if conn:
            conn.close()


# =========================================================
# REPORT
# =========================================================

@app.get("/api/report")
def get_history(
    start: date = Query(...),
    end: date = Query(...)
):

    # Lấy trọn ngày end
    end_datetime = end + timedelta(days=1)

    conn = None
    cursor = None

    try:

        conn = get_connection()

        cursor = conn.cursor()

        sql = """
            SELECT *
            FROM sensor_data
            WHERE time >= %s
              AND time < %s
            ORDER BY time ASC
        """

        cursor.execute(
            sql,
            (
                start,
                end_datetime
            )
        )

        rows = cursor.fetchall()

        headers = [column[0] for column in cursor.description]

        data = []

        for row in rows:

            timestamp = row[1]

            # Chuyển datetime thành chuỗi
            if timestamp is not None:
                time_string = timestamp.strftime(
                    "%Y-%m-%d %H:%M:%S"
                )
            else:
                time_string = ""

            data.append([
                time_string,
                row[2],
                row[3],
            ])

        return {
            "headers": headers,
            "data": data
        }

    finally:

        if cursor:
            cursor.close()

        if conn:
            conn.close()



# =========================================================
# CHẠY SERVER
# =========================================================


def plc_loop():

    while True:

        read_from_plc()

        time.sleep(1)

# =========================================================
# WEB SOCKET
# =========================================================

data_queue = asyncio.Queue()
main_loop = None


def randomData1(loop):

    global realtime

    while True:

        realtime["Ia"] = random.randint(10, 80)
        realtime["Ib"] = random.randint(10, 80)
        realtime["Ic"] = random.randint(10, 80)

        realtime["Ua"] = random.randint(200, 300)
        realtime["Ub"] = random.randint(200, 300)
        realtime["Uc"] = random.randint(200, 300)

        # Copy snapshot
        data = realtime.copy()

        # Thread → asyncio
        loop.call_soon_threadsafe(
            data_queue.put_nowait,
            data 
        )
        time.sleep(1)


@app.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket):

    await websocket.accept()
    print("WebSocket connected")

    try:
        while True:
            # Không sleep.
            # Đứng đây chờ randomData1 tạo data.
            data = await data_queue.get()
            await websocket.send_json(data)

    except WebSocketDisconnect:
        print("Client disconnected")


    print("Web server đang chạy...")
    plc_thread = threading.Thread(
    target=plc_loop,
    daemon=True
    )

    plc_thread.start()


    import uvicorn

    uvicorn.run(
        app,
        host="0.0.0.0",
        port=8080
    )