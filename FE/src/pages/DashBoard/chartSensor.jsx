import React, { useState, useMemo, useRef, useEffect } from "react";
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

const ONE_SECOND = 1000;
const ONE_MINUTE = 60 * ONE_SECOND;
const ONE_HOUR = 60 * ONE_MINUTE;
const TWENTY_FOUR_HOURS = 24 * ONE_HOUR;
const SEVEN_HOURS = 7 * ONE_HOUR;

const SensorChart = ({ chartData }) => {
    const processedData = useMemo(() => {
        if (!chartData) return [];
        return chartData
            .map((item) => {
                const originalDate = new Date(item.time);
                return {
                    ...item,
                    time: originalDate.getTime(),
                };
            })
            .sort((a, b) => a.time - b.time);
    }, [chartData]);

    const dayBounds = useMemo(() => {
        const now = new Date();
        const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0).getTime();
        const endOfDay = startOfDay + TWENTY_FOUR_HOURS;
        return { min: startOfDay, max: endOfDay };
    }, []);

    const [domain, setDomain] = useState([0, 0]);
    const chartContainerRef = useRef(null);

    useEffect(() => {
        const now = Date.now();
        const DEFAULT_VIEW_DURATION = 15 * ONE_MINUTE; 
        
        let start = now - (DEFAULT_VIEW_DURATION / 2);
        let end = now + (DEFAULT_VIEW_DURATION / 2);

        if (start < dayBounds.min) {
            start = dayBounds.min;
            end = Math.min(start + DEFAULT_VIEW_DURATION, dayBounds.max);
        }
        if (end > dayBounds.max) {
            end = dayBounds.max;
            start = Math.max(end - DEFAULT_VIEW_DURATION, dayBounds.min);
        }

        setDomain([start, end]);
    }, [dayBounds]);

    const ticks = useMemo(() => {
        const [start, end] = domain;
        if (!start || !end) return [];

        const duration = end - start;
        let step;

        if (duration <= 1 * ONE_MINUTE) {
            step = 5 * ONE_SECOND;     
        } else if (duration <= 5 * ONE_MINUTE) {
            step = 30 * ONE_SECOND;     
        } else if (duration <= 30 * ONE_MINUTE) {
            step = 5 * ONE_MINUTE;     
        } else if (duration <= 3 * ONE_HOUR) {
            step = 30 * ONE_MINUTE;     
        } else if (duration <= 12 * ONE_HOUR) {
            step = 2 * ONE_HOUR;    
        } else {
            step = 4 * ONE_HOUR;        
        }

        const tickList = [];
        let currentTick = Math.ceil(start / step) * step;
        
        if (currentTick < dayBounds.min) currentTick = Math.ceil(dayBounds.min / step) * step;

        while (currentTick <= end) {
            if (currentTick >= dayBounds.min && currentTick <= dayBounds.max) {
                tickList.push(currentTick);
            }
            currentTick += step;
        }
        return tickList;
    }, [domain, dayBounds]);

    useEffect(() => {
        const container = chartContainerRef.current;
        if (!container) return;

        const handleWheelNative = (e) => {
            e.preventDefault();

            setDomain((prevDomain) => {
                const [start, end] = prevDomain;
                const currentDuration = end - start;
                const ZOOM_FACTOR = 0.2;
                const direction = e.deltaY > 0 ? 1 : -1;

                let newDuration = currentDuration + (currentDuration * ZOOM_FACTOR * direction);

                if (newDuration < 10 * ONE_SECOND) newDuration = 10 * ONE_SECOND;
                if (newDuration > TWENTY_FOUR_HOURS) newDuration = TWENTY_FOUR_HOURS;

                const dataInView = processedData.filter(d => d.time >= start && d.time <= end);
                
                let center;
                if (dataInView.length > 0) {
                    const latestData = dataInView.reduce((latest, current) => 
                        current.time > latest.time ? current : latest
                    );
                    center = latestData.time;
                } else {
                    center = (start + end) / 2;
                }

                let newStart = center - newDuration / 2;
                let newEnd = center + newDuration / 2;

                if (newStart < dayBounds.min) {
                    const diff = dayBounds.min - newStart;
                    newStart += diff;
                    newEnd += diff;
                }
                if (newEnd > dayBounds.max) {
                    const diff = newEnd - dayBounds.max;
                    newEnd -= diff;
                    newStart -= diff;
                }
                if (newStart < dayBounds.min) newStart = dayBounds.min;

                return [newStart, newEnd];
            });
        };

        container.addEventListener('wheel', handleWheelNative, { passive: false });
        return () => container.removeEventListener('wheel', handleWheelNative);
    }, [dayBounds, processedData]);

    const isDragging = useRef(false);
    const lastClientX = useRef(0);

    const handleMouseDown = (e) => {
        isDragging.current = true;
        lastClientX.current = e.clientX;
        if (chartContainerRef.current) chartContainerRef.current.style.cursor = "grabbing";
    };

    const handleMouseMove = (e) => {
        if (!isDragging.current || !chartContainerRef.current) return;
        e.preventDefault();

        const dx = e.clientX - lastClientX.current;
        const { width } = chartContainerRef.current.getBoundingClientRect();
        
        setDomain(([start, end]) => {
            const currentDuration = end - start;
            const msPerPixel = currentDuration / width;
            const shiftMs = -dx * msPerPixel;
            
            let newStart = start + shiftMs;
            let newEnd = end + shiftMs;

            if (newStart < dayBounds.min) {
                newStart = dayBounds.min;
                newEnd = newStart + currentDuration;
            }
            if (newEnd > dayBounds.max) {
                newEnd = dayBounds.max;
                newStart = newEnd - currentDuration;
            }

            return [newStart, newEnd];
        });
        
        lastClientX.current = e.clientX;
    };

    const handleMouseUp = () => {
        isDragging.current = false;
        if (chartContainerRef.current) chartContainerRef.current.style.cursor = "grab";
    };

    const formatXAxis = (tickItem) => {
        const date = new Date(tickItem);
        const [start, end] = domain;
        const duration = end - start;

        if (duration < ONE_HOUR) {
            return `${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}:${date.getSeconds().toString().padStart(2, '0')}`;
        }
        return `${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`;
    };

    return (
        <div
            ref={chartContainerRef}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
            style={{ width: "100%", height: 350, cursor: "grab", userSelect: "none" }}
        >
            <ResponsiveContainer width="100%" height="100%">
                <LineChart data={processedData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    
                    <XAxis
                        dataKey="time"
                        type="number"
                        domain={domain}
                        ticks={ticks}
                        tickFormatter={formatXAxis}
                        allowDataOverflow={true}
                        scale="time"
                        tick={{ fontSize: 10 }}
                        minTickGap={25}
                    />
                    
                    <YAxis yAxisId="left" label={{ value: 'PPM / Lux', angle: -90, position: 'insideLeft' }} />
                    <YAxis yAxisId="right" orientation="right" label={{ value: '°C / %', angle: 90, position: 'insideRight' }} />
                    
                    <Tooltip 
                        labelFormatter={(label) => new Date(label).toLocaleTimeString('vi-VN')}
                        contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                    />
                    
                    <Legend verticalAlign="bottom" height={36}/>

                    <Line yAxisId="left" type="monotone" dataKey="co2" stroke="#4caf50" dot={false} name="CO₂" isAnimationActive={false} />
                    <Line yAxisId="left" type="monotone" dataKey="light" stroke="#fdd835" dot={false} name="Ánh sáng" isAnimationActive={false} />
                    <Line yAxisId="right" type="monotone" dataKey="air_temperature" stroke="#ff9800" dot={false} name="Nhiệt độ KK" isAnimationActive={false} />
                    <Line yAxisId="right" type="monotone" dataKey="soil_temperature" stroke="#2196f3" dot={false} name="Nhiệt độ Đất" isAnimationActive={false} />
                    <Line yAxisId="right" type="monotone" dataKey="air_humidity" stroke="#00bcd4" dot={false} name="Độ ẩm KK" isAnimationActive={false} />
                    <Line yAxisId="right" type="monotone" dataKey="soil_moisture" stroke="#9c27b0" dot={false} name="Độ ẩm Đất" isAnimationActive={false} />

                </LineChart>
            </ResponsiveContainer>
        </div>
    );
};

export default SensorChart;