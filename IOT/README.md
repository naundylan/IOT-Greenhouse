# Mở CMD admin
Chạy lệnh: "C:\Program Files\mosquitto\mosquitto.exe" -c "C:\mosquitto\mosquitto_local.conf" -v
# Mở CMD
Nhận : "C:\Program Files\mosquitto\mosquitto_sub.exe" -h <ipv4> -p 1883 -t "smartfarm/#" -v
Gửi : C:\Users\User>"C:\Program Files\mosquitto\mosquitto_pub.exe" -h <ipv4> -p 1883 -t smartfarm/data -m "{\"ping\":2}" 
Gửi chỉ để demo 