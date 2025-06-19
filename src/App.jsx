import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import { AuthProvider } from "./utils/auth";
import Header from "./components/Header/Header";
import Footer from "./components/Footer/Footer";
import Home from "./pages/Home";
import Question from "./pages/Question";
import AskQuestion from "./pages/AskQuestion";
import AuthPage from "./pages/AuthPage";
import ProtectedRoute from "./components/ProtectedRoute";
import ForgotPassword from "./pages/Forgotpassword";
import ResetPassword from "./pages/ResetPassword";
import About from "./pages/About";


function App() {
  return (
    <Router>
      <AuthProvider>
        <Header />
        {/* main-content wrapper */}
        <div className="main-content">
          <Routes>
            <Route path="/" element={<ProtectedRoute />}>
              <Route index element={<Home />} />
              <Route path="question/:questionid" element={<Question />} />
              <Route path="ask" element={<AskQuestion />} />
            </Route>
            <Route path="/auth" element={<AuthPage />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/reset-password/:token" element={<ResetPassword />} />
            <Route path="/about" element={<About />} />
          </Routes>
        </div>
        <Footer />
      </AuthProvider>
    </Router>
  );
}

export default App;
