import React, { useMemo } from "react";
import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer,
} from "recharts";

const SensorChart = ({ chartData }) => {
    // 1️⃣ Chuẩn hoá data thật
    const actualData = useMemo(() => {
        return chartData.map((item, index) => {
            const t = new Date(item.time);
            return {
                id: `${item.time}-${index}`,
                time: t.getTime(),
                label: `${t.getHours().toString().padStart(2, "0")}:${t
                    .getMinutes()
                    .toString()
                    .padStart(2, "0")}:${t.getSeconds().toString().padStart(2, "0")}`,
                co2: item.co2 ?? null,
                air_temperature: item.air_temperature ?? null,
                soil_temperature: item.soil_temperature ?? null,
                air_humidity: item.air_humidity ?? null,
                soil_moisture: item.soil_moisture ?? null,
                light: item.light ?? null,
            };
        });
    }, [chartData]);

    // 2️⃣ Tạo mốc 2 tiếng (00:00 → 22:00) + mốc 24:00 riêng
    const hourlySlots = useMemo(() => {
        const arr = [];
        const base = new Date();
        base.setHours(0, 0, 0, 0);
        for (let h = 0; h < 24; h += 2) {
            const t = new Date(base);
            t.setHours(h);
            arr.push({
                id: `slot-${h}`,
                time: t.getTime(),
                label: `${h.toString().padStart(2, "0")}:00`,
                co2: null,
                air_temperature: null,
                soil_temperature: null,
                air_humidity: null,
                soil_moisture: null,
                light: null,
            });
        }
        // Thêm mốc 24:00 (hiển thị cuối)
        const end = new Date(base);
        end.setHours(23, 59, 59, 999);
        arr.push({
            id: "slot-24",
            time: end.getTime(),
            label: "24:00",
            co2: null,
            air_temperature: null,
            soil_temperature: null,
            air_humidity: null,
            soil_moisture: null,
            light: null,
        });
        return arr;
    }, []);

    // 3️⃣ Merge 2 loại data
    const mergedData = useMemo(() => {
        const all = [...actualData, ...hourlySlots];
        all.sort((a, b) => a.time - b.time);
        return all;
    }, [actualData, hourlySlots]);

    // 4️⃣ Format tick
    const tickFormatter = (time) => {
        const d = new Date(time);
        const hour = d.getHours();
        if (hour % 2 === 0 && d.getMinutes() === 0) {
            return `${hour.toString().padStart(2, "0")}:00`;
        }
        if (hour === 23 && d.getMinutes() === 59) return "24:00";
        return "";
    };

    return (
        <ResponsiveContainer height={300}>
            <LineChart data={mergedData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis
                    dataKey="time"
                    type="number"
                    domain={["dataMin", "dataMax"]}
                    tickFormatter={tickFormatter}
                    scale="time"
                    allowDuplicatedCategory={false}
                    tick={{ fontSize: 10 }}
                    interval="preserveStartEnd"
                    minTickGap={20}
                />
                <YAxis yAxisId="left" />
                <YAxis yAxisId="right" orientation="right" />
                <Tooltip
                    labelFormatter={(value) =>
                        new Date(value).toLocaleTimeString("vi-VN", {
                            hour: "2-digit",
                            minute: "2-digit",
                            second: "2-digit",
                        })
                    }
                />
                <Legend
                    layout="horizontal"
                    verticalAlign="top"
                    align="center"
                    wrapperStyle={{ top: 285 }} // đẩy vị trí xuống
                />

                {/* Các đường dữ liệu */}
                <Line
                    yAxisId="left"
                    type="monotone"
                    dataKey="co2"
                    stroke="#4caf50"
                    dot={false}
                    connectNulls={false}
                    name="CO₂ (ppm)"
                />
                <Line
                    yAxisId="right"
                    type="monotone"
                    dataKey="air_temperature"
                    stroke="#ff9800"
                    dot={false}
                    connectNulls={false}
                    name="Nhiệt độ KK (°C)"
                />
                <Line
                    yAxisId="right"
                    type="monotone"
                    dataKey="soil_temperature"
                    stroke="#2196f3"
                    dot={false}
                    connectNulls={false}
                    name="Nhiệt độ đất (°C)"
                />
                <Line
                    yAxisId="right"
                    type="monotone"
                    dataKey="air_humidity"
                    stroke="#00bcd4"
                    dot={false}
                    connectNulls={false}
                    name="Độ ẩm KK (%)"
                />
                <Line
                    yAxisId="right"
                    type="monotone"
                    dataKey="soil_moisture"
                    stroke="#9c27b0"
                    dot={false}
                    connectNulls={false}
                    name="Độ ẩm đất (%)"
                />
                <Line
                    yAxisId="right"
                    type="monotone"
                    dataKey="light"
                    stroke="#fdd835"
                    dot={false}
                    connectNulls={false}
                    name="Ánh sáng (lux)"
                />
            </LineChart>
        </ResponsiveContainer>
    );
};

export default SensorChart;
