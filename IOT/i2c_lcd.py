"""
Thư viện điều khiển LCD I2C cho ESP8266/ESP32 (MicroPython)
Hỗ trợ LCD 16x2, 20x4 sử dụng module I2C PCF8574
"""

import time
from lcd_api import LcdApi
from machine import I2C

# Các bit điều khiển
MASK_RS = 0x01
MASK_RW = 0x02
MASK_E  = 0x04
SHIFT_BACKLIGHT = 3

# Lệnh LCD
CMD_CLEAR_DISPLAY = 0x01
CMD_RETURN_HOME   = 0x02

class I2cLcd(LcdApi):
    def __init__(self, i2c, i2c_addr, num_lines, num_columns):
        self.i2c = i2c
        self.i2c_addr = i2c_addr
        self.num_lines = num_lines
        self.num_columns = num_columns
        self.backlight = 1

        # Khởi tạo LCD
        time.sleep_ms(20)
        self._write_init_nibble(0x03)
        time.sleep_ms(5)
        self._write_init_nibble(0x03)
        time.sleep_ms(1)
        self._write_init_nibble(0x03)
        self._write_init_nibble(0x02)  # Chuyển sang chế độ 4-bit

        self.hal_write_command(0x28)  # Function set: 4-bit, 2 line, 5x8 dots
        self.hal_write_command(0x0C)  # Display on, cursor off, blink off
        self.hal_write_command(0x06)  # Entry mode: tăng địa chỉ, không dịch màn hình
        self.hal_write_command(CMD_CLEAR_DISPLAY)
        time.sleep_ms(2)

    # --- Các hàm nội bộ ---
    def _write_byte(self, data):
        self.i2c.writeto(self.i2c_addr, bytearray([data | (self.backlight << SHIFT_BACKLIGHT)]))

    def _pulse_enable(self, data):
        self._write_byte(data | MASK_E)
        time.sleep_us(40)
        self._write_byte(data & ~MASK_E)
        time.sleep_us(40)

    def _write_init_nibble(self, nibble):
        data = (nibble << 4) & 0xF0
        self._pulse_enable(data)

    def hal_write_command(self, cmd):
        self._write4bits(cmd & 0xF0, 0)
        self._write4bits((cmd << 4) & 0xF0, 0)
        if cmd == CMD_CLEAR_DISPLAY or cmd == CMD_RETURN_HOME:
            time.sleep_ms(2)

    def hal_write_data(self, data):
        self._write4bits(data & 0xF0, MASK_RS)
        self._write4bits((data << 4) & 0xF0, MASK_RS)

    def _write4bits(self, data, mode):
        self._write_byte(data | mode)
        self._pulse_enable(data | mode)

    # --- Điều khiển đèn nền ---
    def backlight_on(self):
        self.backlight = 1
        self._write_byte(0)

    def backlight_off(self):
        self.backlight = 0
        self._write_byte(0)

