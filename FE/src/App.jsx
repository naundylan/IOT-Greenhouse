import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import LoginPage from './components/LoginPage'
import SignInPage from './components/SigninPage'
import ForgetPassword from './components/ForgetPassWords'
import ForgetPassword2 from './components/ForgetPassWords2'
import Dashboard from './components/Dashboard'

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<LoginPage />} />
        <Route path="/signin" element={<SignInPage />} />
        <Route path="/forgetpassword" element={<ForgetPassword />} />
        <Route path="/forgetpassword2" element={<ForgetPassword2 />} />
        <Route path="/dashboard" element={<Dashboard />} />
      </Routes>
    </Router>

  );
}
export default App;
