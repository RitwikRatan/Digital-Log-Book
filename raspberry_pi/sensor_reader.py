from pymodbus.client import ModbusSerialClient
from datetime import datetime
import time
import requests
import json

# -------------------------------
# SENSOR SETTINGS
# -------------------------------
PORT = "/dev/ttyUSB0"
SLAVE_ID = 2
GAS_REGISTER_ADDRESS = 31
READ_INTERVAL = 15

# -------------------------------
# BACKEND SETTINGS
# -------------------------------
# Replace with the actual IP address of the PC running the FastAPI backend.
# For example: "http://192.168.1.100:8000/readings/"
# If testing locally on the same machine, use "http://localhost:8000/readings/"
BACKEND_URL = "http://192.168.1.37:8000/readings/"

def create_client():
    return ModbusSerialClient(
        port=PORT,
        baudrate=9600,
        bytesize=8,
        parity="N",
        stopbits=1,
        timeout=2
    )

client = None

print("====================================")
print(" Uniphos 500DT Gas Sensor Gateway")
print("====================================")
print(f"Port       : {PORT}")
print(f"Slave ID   : {SLAVE_ID}")
print(f"Interval   : {READ_INTERVAL} seconds")
print(f"Target URL : {BACKEND_URL}")
print("Auto reconnect enabled")
print()

try:
    while True:
        timestamp = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
        gas_value = None
        status = "OFFLINE"

        try:
            # Create a client if required
            if client is None:
                client = create_client()

            # Open/reopen RS485 connection
            if not client.connected:
                connected = client.connect()
                if not connected:
                    raise Exception("Cannot open RS485 port")

            # Read H2S gas value
            response = client.read_holding_registers(
                address=GAS_REGISTER_ADDRESS,
                count=1,
                slave=SLAVE_ID
            )

            if response.isError():
                status = "OFFLINE"
                gas_value = None
            else:
                gas_value = response.registers[0]
                status = "ONLINE"

        except Exception as error:
            status = "OFFLINE"
            gas_value = None
            print("Communication Error:", error)
            
            # Close broken connection
            try:
                if client is not None:
                    client.close()
            except Exception:
                pass
            
            # Force a new connection on the next loop
            client = None

        # -------------------------------
        # SEND TO BACKEND
        # -------------------------------
        payload = {
            "sensor_id": SLAVE_ID,
            "device_name": "Uniphos 500DT",
            "gas_type": "H2S",
            "value": float(gas_value) if gas_value is not None else None,
            "unit": "ppm",
            "status": status
        }

        print("------------------------------------")
        print("Time      :", timestamp)
        print("Sensor ID :", payload["sensor_id"])
        print("Gas       :", payload["gas_type"])
        print("Value     :", payload["value"] if payload["value"] is not None else "---")
        print("Status    :", payload["status"])
        
        try:
            # Send HTTP POST request
            res = requests.post(BACKEND_URL, json=payload, timeout=5)
            if res.status_code == 200:
                print(">> Data sent successfully to backend.")
            else:
                print(f">> Failed to send data. Status code: {res.status_code}")
        except requests.exceptions.RequestException as e:
            print(">> Network error while sending to backend:", e)

        print("------------------------------------")

        # Wait 15 seconds
        time.sleep(READ_INTERVAL)

except KeyboardInterrupt:
    print("\nProgram stopped by user.")

finally:
    try:
        if client is not None:
            client.close()
    except Exception:
        pass
    print("RS485 connection closed.")
