"""
Lớp cơ sở cho LCD, được sử dụng bởi i2c_lcd.py
"""

class LcdApi:
    def __init__(self, num_lines, num_columns):
        self.num_lines = num_lines
        self.num_columns = num_columns
        self.cursor_x = 0
        self.cursor_y = 0

    def clear(self):
        self.hal_write_command(0x01)  # Clear display
        self.cursor_x = 0
        self.cursor_y = 0

    def home(self):
        self.hal_write_command(0x02)  # Return home
        self.cursor_x = 0
        self.cursor_y = 0

    def move_to(self, col, row):
        row_offsets = [0x00, 0x40, 0x14, 0x54]
        if row >= self.num_lines:
            row = self.num_lines - 1
        self.cursor_x = col
        self.cursor_y = row
        self.hal_write_command(0x80 | (col + row_offsets[row]))

    def putchar(self, char):
        self.hal_write_data(ord(char))

    def putstr(self, string):
        for char in string:
            self.putchar(char)

