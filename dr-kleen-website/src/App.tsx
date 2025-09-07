import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Header from "./components/layout/Header";
import Hero from "./components/sections/Hero";
import Features from "./components/sections/Features";
import About from "./components/sections/About";
import Services from "./components/sections/Services";
import WorkProcess from "./components/sections/WorkProcess";
import ContactTestimonials from "./components/sections/ContactTestimonials";
import GetEstimate from "./components/sections/GetEstimate";
import Footer from "./components/layout/Footer";
import Shop from "./components/Shop/Shop";
import AdminDashboard from "./components/Admin/AdminDashboard";
import AdminRegistrationForm from "./components/Admin/AdminRegistrationForm";
import EmailVerificationPage from "./components/Admin/EmailVerificationPage";
import EmailViewerPage from "./pages/EmailViewerPage";
import ProductDetail from "./components/Shop/ProductDetail";

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-white">
        <Header />
        <Routes>
          <Route
            path="/home"
            element={
              <>
                <Hero />
                <Features />
                <About />
                <Services />
                <WorkProcess />
                <ContactTestimonials />
                <GetEstimate />
              </>
            }
          />
          <Route path="/shop" element={<Shop />} />
          <Route path="/admin" element={<AdminDashboard />} />
          <Route path="/admin/login" element={<AdminDashboard />} />
          <Route path="/admin/register" element={<AdminRegistrationForm />} />
          <Route path="/admin/verify-email" element={<EmailVerificationPage />} />
          <Route path="/admin/emails" element={<EmailViewerPage />} />
          <Route path="/product/:id" element={<ProductDetail />} />
          <Route
            path="/"
            element={
              <>
                <Hero />
                <Features />
                <About />
                <Services />
                <WorkProcess />
                <ContactTestimonials />
                <GetEstimate />
              </>
            }
          />
        </Routes>
        <Footer />
      </div>
    </Router>
  );
}

export default App;