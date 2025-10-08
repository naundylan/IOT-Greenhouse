import uasyncio as asyncio
from machine import Pin, ADC, I2C, time_pulse_us
import dht, bh1750, onewire, ds18x20
from bh1750 import BH1750
import time, urequests, gc

# ===== CONFIG =====
API_URL = "http://192.168.1.9:8000/api"
SAMPLES = 6
MAX_ERROR_BEFORE_REPORT = 5
WARMUP_SEC = 30   # demo: giảm xuống để test nhanh
DEBUG = True

# ===== LED =====
led = Pin(2, Pin.OUT)
led.value(1)

# ===== SENSOR INIT =====
soil_sensor = ADC(0)  # Soil moisture

i2c = I2C(scl=Pin(5), sda=Pin(4), freq=400000)
light_sensor = BH1750(i2c)

dht22 = dht.DHT22(Pin(14))

ds_pin = Pin(0)  # DS18B20
ds_sensor = ds18x20.DS18X20(onewire.OneWire(ds_pin))
roms = ds_sensor.scan()

pwm_pin = Pin(12, Pin.IN)  # MH-Z19B


# ===== SHARE DATA =====
data = {
    "soil_temperature": None,
    "soil_moisture": None,
    "air_temperature": None,
    "air_humidity": None,
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


async def task_air():
    while True:
        try:
            dht22.measure()
            data["air_temperature"] = dht22.temperature()
            data["air_humidity"] = dht22.humidity()
        except Exception as e:
            if DEBUG: print("DHT22 error:", e)
        await asyncio.sleep(4)


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


async def task_send_api():
    await asyncio.sleep(WARMUP_SEC)  # chờ sensor CO₂ warmup
    while True:
        try:
            res = urequests.post(API_URL, json=data, headers={"Content-Type": "application/json"})
            print("Server:", res.status_code, res.text)
            res.close()
            await blink_led(1)
        except Exception as e:
            print("API error:", e)
            led.value(0)
        gc.collect()
        await asyncio.sleep(10)


# ===== MAIN =====
async def main():
    # Chạy tất cả task song song
    await asyncio.gather(
        task_soil_temp(),
        task_soil_moist(),
        task_air(),
        task_light(),
        task_co2(),
        task_send_api(),
    )


# ===== RUN =====
try:
    asyncio.run(main())
finally:
    asyncio.new_event_loop()
