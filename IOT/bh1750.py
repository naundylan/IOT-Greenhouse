# bh1750.py - MicroPython driver for BH1750 light sensor

import time

# Modes
CONTINUOUS_HIGH_RES_MODE = 0x10
CONTINUOUS_HIGH_RES_MODE_2 = 0x11
CONTINUOUS_LOW_RES_MODE = 0x13
ONE_TIME_HIGH_RES_MODE = 0x20
ONE_TIME_HIGH_RES_MODE_2 = 0x21
ONE_TIME_LOW_RES_MODE = 0x23

class BH1750:
    def __init__(self, i2c, addr=0x23):
        self.i2c = i2c
        self.addr = addr

    def luminance(self, mode=CONTINUOUS_HIGH_RES_MODE):
        # gửi lệnh
        self.i2c.writeto(self.addr, bytes([mode]))
        # đợi cảm biến đo
        time.sleep_ms(180 if mode in (0x10, 0x20) else 24)
        # đọc 2 byte
        data = self.i2c.readfrom(self.addr, 2)
        result = (data[0] << 8) | data[1]
        return result / 1.2  # lux
