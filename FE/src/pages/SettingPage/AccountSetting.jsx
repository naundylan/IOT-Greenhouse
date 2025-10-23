import React, { useState } from "react"; // SỬA 1: Import useState
import { useNavigate } from 'react-router-dom';

// Ant Design Imports
import { Form, Input, Button, Typography, message, Divider } from 'antd';

// Material-UI Imports
import { 
  Box, 
  AppBar, 
  Toolbar, 
  IconButton, 
  Typography as MuiTypography, // SỬA 2: Dùng tên MuiTypography rõ ràng
  Avatar, 
  Menu, 
  MenuItem,
  Divider as MuiDivider // SỬA 3: Import Divider của MUI
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';

// KHÔNG CẦN: axios, LineChart, Dialog... (vì bạn chưa dùng)

const { Title } = Typography; // Lấy Title từ Typography của Antd

// --- DỮ LIỆU GIẢ (MOCK DATA) ---
const MOCK_USER = {
    fullName: 'Nguyễn Văn A',
    email: 'nguyenvana@email.com',
    username: 'nguyenvana',
    bio: 'Lập trình viên yêu thích React và Ant Design.',
};
// ------------------------------

function AccountSettings() {
    // Ant Design cung cấp hook 'useForm' để quản lý trạng thái form
    const [infoForm] = Form.useForm();
    const [passwordForm] = Form.useForm();

    // SỬA 4: Khai báo state cho Menu
    const [anchorEl, setAnchorEl] = useState(null);
    const openMenu = Boolean(anchorEl);

    // Hàm xử lý khi submit thông tin (GIẢ LẬP)
    const onFinishInfo = (values) => {
        console.log('Đang gửi thông tin (giả lập):', values);
        message.success('Cập nhật thông tin thành công (giả lập)!');
    };

    // Hàm xử lý khi submit mật khẩu (GIẢ LẬP)
    const onFinishPassword = (values) => {
        console.log('Đang đổi mật khẩu (giả lập):', values);
        message.success('Đổi mật khẩu thành công (giả lập)!');
        passwordForm.resetFields();
    };
    
    // Logic cho Menu và Navigation
    const navigate = useNavigate();
    const handleClickMenu = (event) => setAnchorEl(event.currentTarget);
    const handleCloseMenu = () => setAnchorEl(null);
    const handleGoToSettings = () => {
        navigate("/settings");
        handleCloseMenu();
    };
    const handleLogout = () => {
        navigate("/login");
        handleCloseMenu();
    };

    return (
        <Box
            sx={{
                display: "flex",
                flexDirection: "column",
                minHeight: "100vh", // Dùng minHeight để đảm bảo nội dung dài vẫn hiển thị
                backgroundImage: "url(/nen.png)",
                backgroundSize: "cover",
                backgroundPosition: "center",
                backgroundAttachment: "fixed",
            }}
        >
            {/* ✅ Thanh AppBar (Đã sửa lỗi Typography) */}
            <AppBar
                position="sticky"
                elevation={1}
                sx={{ background: "linear-gradient(to right, #6d8c33ff, #184d1bff)", color: "white" }}
            >
                <Toolbar sx={{ display: "flex", justifyContent: "space-between" }}>
                    <MuiTypography variant="h5" fontWeight="bold"> {/* SỬA 5: Dùng MuiTypography */}
                        GREEHOUSE
                    </MuiTypography>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                        <MuiTypography sx={{ display: { xs: "none", sm: "block" } }}> {/* SỬA 5: Dùng MuiTypography */}
                            {MOCK_USER.username} {/* Hiển thị tên user thật */}
                        </MuiTypography>
                        <Avatar />
                        <IconButton color="inherit" onClick={handleClickMenu}>
                            <MenuIcon />
                        </IconButton>
                        <Menu anchorEl={anchorEl} open={openMenu} onClose={handleCloseMenu}>
                            <MenuItem onClick={handleLogout}>Đăng xuất</MenuItem>
                            <MuiDivider /> {/* SỬA 6: Dùng MuiDivider */}
                            <MenuItem onClick={handleGoToSettings}>Cài Đặt</MenuItem>
                        </Menu>
                    </Box>
                </Toolbar>
            </AppBar>

            {/* SỬA 7: PHẦN NỘI DUNG TRANG (BỊ THIẾU TRONG CODE CỦA BẠN) */}
            <Box
              component="main" // Dùng thẻ <main> cho nội dung chính
              sx={{
                flexGrow: 1,
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'flex-start', // Căn trên cùng
                padding: '40px 20px', // Thêm padding cho nội dung
              }}
            >
              {/* Box trắng chứa form */}
              <Box
                sx={{
                  maxWidth: 700,
                  width: '100%',
                  padding: '30px',
                  background: '#fff',
                  borderRadius: '12px',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.05)'
                }}
              >
                <Title level={1} style={{ textAlign: 'center', marginBottom: 30 }}>
                  Cài đặt tài khoản
                </Title>
    
                {/* === FORM THÔNG TIN CÁ NHÂN === */}
                <Title level={3}>Thông tin cá nhân</Title>
                <Divider /> {/* Đây là Divider của Antd, dùng ở đây là đúng */}
                <Form
                  form={infoForm}
                  layout="vertical"
                  initialValues={MOCK_USER} // Tự động điền dữ liệu giả
                  onFinish={onFinishInfo}
                >
                  <Form.Item
                    label="Họ và tên"
                    name="fullName"
                    rules={[{ required: true, message: 'Vui lòng nhập họ tên!' }]}
                  >
                    <Input placeholder="Nhập họ và tên của bạn" />
                  </Form.Item>
    
                  <Form.Item
                    label="Email"
                    name="email"
                    rules={[{ required: true, type: 'email', message: 'Email không hợp lệ!' }]}
                  >
                    <Input placeholder="email@example.com" />
                  </Form.Item>
    
                  <Form.Item
                    label="Tên người dùng"
                    name="username"
                    rules={[{ required: true, message: 'Vui lòng nhập tên người dùng!' }]}
                  >
                    <Input placeholder="nguyenvana" />
                  </Form.Item>
    
                  <Form.Item
                    label="Tiểu sử"
                    name="bio"
                  >
                    <Input.TextArea rows={4} placeholder="Viết gì đó về bạn..." />
                  </Form.Item>
    
                  <Form.Item>
                    <Button type="primary" htmlType="submit">
                      Lưu thay đổi
                    </Button>
                  </Form.Item>
                </Form>
    
                {/* === FORM ĐỔI MẬT KHẨU === */}
                <Title level={3} style={{ marginTop: 40 }}>Đổi mật khẩu</Title>
                <Divider /> {/* Đây là Divider của Antd */}
                <Form
                  form={passwordForm}
                  layout="vertical"
                  onFinish={onFinishPassword}
                >
                  <Form.Item
                    label="Mật khẩu hiện tại"
                    name="currentPassword"
                    rules={[{ required: true, message: 'Vui lòng nhập mật khẩu hiện tại!' }]}
                  >
                    <Input.Password />
                  </Form.Item>
    
                  <Form.Item
                    label="Mật khẩu mới"
                    name="newPassword"
                    rules={[{ required: true, message: 'Vui lòng nhập mật khẩu mới!' }]}
                  >
                    <Input.Password />
                  </Form.Item>
    
                  <Form.Item
                    label="Xác nhận mật khẩu mới"
                    name="confirmPassword"
                    dependencies={['newPassword']}
                    rules={[
                      { required: true, message: 'Vui lòng xác nhận mật khẩu!' },
                      ({ getFieldValue }) => ({
                        validator(_, value) {
                          if (!value || getFieldValue('newPassword') === value) {
                            return Promise.resolve();
                          }
                          return Promise.reject(new Error('Hai mật khẩu không khớp!'));
                        },
                      }),
                    ]}
                  >
                    <Input.Password />
                  </Form.Item>
    
                  <Form.Item>
                    <Button type="default" htmlType="submit">
                      Đổi mật khẩu
                    </Button>
                  </Form.Item>
                </Form>
              </Box>
            </Box>
        </Box>
    );
}

export default AccountSettings;