# boot.py
# (Giữ nguyên file đã tạo ở bước trước)

import network
import time

ssid = "Manh Ben."
password = "manhben262"

station = network.WLAN(network.STA_IF)
station.active(True)

if not station.isconnected():
    print("Đang kết nối WiFi...")
    station.connect(ssid, password)
    timeout = 15
    while not station.isconnected() and timeout > 0:
        time.sleep(1)
        timeout -= 1

if station.isconnected():
    print("Kết nối thành công!")
    print("Địa chỉ IP của ESP:", station.ifconfig()[0])
else:
    print("Kết nối thất bại.")
