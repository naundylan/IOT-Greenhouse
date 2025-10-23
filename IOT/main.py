import uasyncio as asyncio
from machine import Pin, ADC, I2C, time_pulse_us
import dht, bh1750, onewire, ds18x20
from bh1750 import BH1750
import time, urequests, gc
import config

# ==== MQTT (LOCAL, không TLS) ====
try:
    from umqtt.robust import MQTTClient
except ImportError:
    raise

try:
    import ujson as json
except:
    import json
import ntptime

# ===== CONFIG =====
API_URL = config.API_URL
SAMPLES = config.SAMPLES
MAX_ERROR_BEFORE_REPORT = config.MAX_ERROR_BEFORE_REPORT
WARMUP_SEC = config.WARMUP_SEC
DEBUG = config.DEBUG
MQTT_BROKER = config.MQTT_BROKER
MQTT_CLIENT_ID = config.MQTT_CLIENT_ID
PORT = config.PORT
MQTT_TOPIC_PUB = config.MQTT_TOPIC_PUB
MQTT_TOPIC_SUB = config.MQTT_TOPIC_SUB

# ===== LED =====
led = Pin(2, Pin.OUT) #D4 GND 3V3
led.value(1)

# ===== SENSOR INIT =====
soil_sensor = ADC(0)  # Soil moisture D3 GND 3V3

i2c = I2C(scl=Pin(5), sda=Pin(4), freq=400000) # pin5 = D1, pin4 = D2
light_sensor = BH1750(i2c)

dht22 = dht.DHT22(Pin(14)) # D5 GND 3V3

ds_pin = Pin(0)  # DS18B20 A0 GND 3V3
ds_sensor = ds18x20.DS18X20(onewire.OneWire(ds_pin))
roms = ds_sensor.scan()

pwm_pin = Pin(12, Pin.IN)  # MH-Z19B D6 5V GND

# ===== SHARE DATA =====
data = {
    "soil_temperature": None,
    "soil_moisture": None,
    #"air_temperature": None,
    #"air_humidity": None,
    "light": None,
    "co2": None,
}
last_co2 = None
error_count = 0


# ===== HELPERS =====
async def blink_led(times=1, duration=0.2):
    for _ in range(times):
        led.value(0)
        await asyncio.sleep(duration)
        led.value(1)
        await asyncio.sleep(duration)

def read_co2_pwm():
    try:
        high_time = time_pulse_us(pwm_pin, 1, 1000000)
        low_time = time_pulse_us(pwm_pin, 0, 1000000)
    except:
        return None

    if high_time < 0 or low_time < 0:
        return None
    cycle_time = high_time + low_time
    if cycle_time <= 0:
        return None

    co2 = 5000 * (high_time - 2000) / (cycle_time - 4000)
    return int(co2) if 0 < co2 < 5000 else None


_mqtt = None

def _on_cmd(topic, msg):
    try:
        if DEBUG: print("[CMD]", topic, msg)
        obj = json.loads(msg)
        # ví dụ lệnh đơn giản: {"led":1} -> bật LED
        if obj.get("led") is not None:
            led.value(0 if obj["led"] else 1)
    except Exception as e:
        if DEBUG: print("cmd parse err:", e)

def mqtt_connect():
    # # gọi được nhiều lần, sẽ đóng kết nối cũ nếu có
    global _mqtt
    try:
        if _mqtt:
            try: _mqtt.disconnect()
            except: pass
        _mqtt = MQTTClient(
            client_id=MQTT_CLIENT_ID,
            server=MQTT_BROKER,
            port=PORT,
            keepalive=60,
            ssl=False  # # dùng LAN, không TLS
        )
        _mqtt.set_callback(_on_cmd)
        _mqtt.connect()
        _mqtt.subscribe(MQTT_TOPIC_SUB.encode())
        if DEBUG: print("MQTT connected -> PUB:", MQTT_TOPIC_PUB, "| SUB:", MQTT_TOPIC_SUB)
    except Exception as e:
        if DEBUG: print("MQTT connect error:", e)
        _mqtt = None

def mqtt_loop_step():
    # # gọi thường xuyên để nhận lệnh & tự chữa lỗi nhẹ
    global _mqtt
    if _mqtt is None:
        mqtt_connect(); return
    try:
        _mqtt.check_msg()  # non-blocking
    except Exception as e:
        if DEBUG: print("check_msg err:", e)
        try:
            _mqtt.reconnect()
            _mqtt.subscribe(MQTT_TOPIC_SUB.encode())
        except Exception as e2:
            if DEBUG: print("reconnect fail:", e2)
            _mqtt = None

def mqtt_publish(payload_dict):
    global _mqtt
    if _mqtt is None:
        mqtt_connect()
        if _mqtt is None:
            return False
    try:
        _mqtt.publish(MQTT_TOPIC_PUB.encode(), json.dumps(payload_dict))
        return True
    except Exception as e:
        if DEBUG: print("publish err:", e)
        try:
            _mqtt.reconnect()
            _mqtt.subscribe(MQTT_TOPIC_SUB.encode())
            _mqtt.publish(MQTT_TOPIC_PUB.encode(), json.dumps(payload_dict))
            return True
        except Exception as e2:
            if DEBUG: print("repub fail:", e2)
            _mqtt = None
            return False

# ===== TASKS =====
async def task_soil_temp():
    while True:
        if roms:
            ds_sensor.convert_temp()
            await asyncio.sleep(0.75)
            data["soil_temperature"] = ds_sensor.read_temp(roms[0])
        await asyncio.sleep(5)  # đọc 5s/lần


async def task_soil_moist():
    while True:
        raw = soil_sensor.read()
        data["soil_moisture"] = 100 - int((raw / 1023) * 100)
        await asyncio.sleep(3)


# async def task_air():
#     while True:
#         try:
#             dht22.measure()
#             data["air_temperature"] = dht22.temperature()
#             data["air_humidity"] = dht22.humidity()
#         except Exception as e:
#             if DEBUG: print("DHT22 error:", e)
#         await asyncio.sleep(4)


async def task_light():
    while True:
        data["light"] = light_sensor.luminance(bh1750.ONE_TIME_HIGH_RES_MODE)
        await asyncio.sleep(2)


async def task_co2():
    global last_co2, error_count
    while True:
        values = []
        for _ in range(SAMPLES):
            v = read_co2_pwm()
            if v is not None:
                values.append(v)
            await asyncio.sleep(0.15)

        if values:
            co2_val = sum(values) // len(values)
            last_co2 = co2_val
            data["co2"] = co2_val
            error_count = 0
        else:
            error_count += 1
            data["co2"] = last_co2
            if error_count >= MAX_ERROR_BEFORE_REPORT:
                if DEBUG: print("CO₂ sensor error")
                error_count = 0
        await asyncio.sleep(6)
# đồng bộ NTP trước khi publish
async def task_ntp_sync():
    host = config.NTP_HOST 
    ntptime.host = host
    for _ in range(5):  # thử 5 lần, mỗi lần cách nhau 3s
        try:
            ntptime.settime()  # UTC
            if DEBUG: print("NTP synced:", time.gmtime())
            return True
        except Exception as e:
            if DEBUG: print("# NTP fail:", e)
        await asyncio.sleep(3)
    if DEBUG: print("# NTP not synced, will retry later")
    return False


# ==== task gửi MQTT  ====
# trong task_send_mqtt, đảm bảo chỉ format thời gian khi RTC đã hợp lệ
async def task_send_mqtt():
    await asyncio.sleep(WARMUP_SEC)
    while True:
        try:
            # # nếu chưa sync thì sync NTP
            if time.gmtime()[0] < 2024:
                await task_ntp_sync()

            payload = dict(data)  # # tạo payload từ data

            # # chỉ dùng giờ địa phương VN (UTC+7) và GÁN vào "time"
            secs = time.time() + 7*3600
            lt = time.gmtime(secs)
            local_iso = "%04d-%02d-%02dT%02d:%02d:%02d" % lt[:6]
            payload["time"] = local_iso 

            ok = mqtt_publish(payload)
            if DEBUG: print("MQTT PUB:", ok, payload)
            mqtt_loop_step()
        except Exception as e:
            if DEBUG: print("MQTT task error:", e)
        gc.collect()
        await asyncio.sleep(7)



# ===== MAIN =====
async def main():
    mqtt_connect()  
    # Chạy tất cả task song song
    await task_ntp_sync()
    await asyncio.gather(
        task_soil_temp(),
        task_soil_moist(),
#         task_air(),
        task_light(),
        task_co2(),
#         task_send_api(),
        task_send_mqtt()
    )


# ===== RUN =====
try:
    asyncio.run(main())
finally:
    asyncio.new_event_loop()

