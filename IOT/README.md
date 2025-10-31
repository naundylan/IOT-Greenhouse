# Tải file mosquitto từ web
# Mở CMD admin (Online bằng cloud)
- Chạy lệnh: "C:\Program Files\mosquitto\mosquitto_sub.exe" -h test.mosquitto.org -p 1883 --id -t smartfarm/nhakinh01/data để nghe data từ ESP gửi lên ở topic smartfarm/nhakinh01/data
- Chạy lệnh: "C:\Program Files\mosquitto\mosquitto_pub.exe" -h test.mosquitto.org -p 1883 --id -t smartfarm/nhakinh01/commands -m "{\"led\":1}" để gửi commands đến topic smartfarm/nhakinh01/commands (IOT sẽ lắng nghe ở topic này)
# Mở CMD (local)
Nhận : "C:\Program Files\mosquitto\mosquitto_sub.exe" -h <ipv4> -p 1883 -t "smartfarm/#" -v
Gửi : C:\Users\User>"C:\Program Files\mosquitto\mosquitto_pub.exe" -h <ipv4> -p 1883 -t smartfarm/data -m "{\"ping\":2}" 
Gửi chỉ để demo 