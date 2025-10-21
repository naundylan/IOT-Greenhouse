# boot.py
# (Giữ nguyên file đã tạo ở bước trước)
# co2 D6
import network
import time
import config

ssid = config.WIFI_SSID
password = config.WIFI_PASSWORD

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
