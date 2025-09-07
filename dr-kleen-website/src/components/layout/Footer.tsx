import React from "react";

const Footer: React.FC = () => {
  return (
    <footer className="bg-gray-900 text-white">
      <div className="container mx-auto px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Company Info */}
          <div className="col-span-1 md:col-span-1">
            <div className="flex items-center space-x-3 mb-4">
              <img
                src="https://i.ibb.co/LtcYFd9/Dr-Kleen-Logo2.png"
                alt="Dr-Kleen-Logo2"
                className="h-10 w-10"
              />
              <h3 className="text-xl font-bold font-bree">Dr.Kleen</h3>
            </div>
            <p className="text-sm font-semibold mb-2">
              Professional Cleaning Services
            </p>
            <div className="mb-4">
              <span className="inline-block bg-primary text-black px-3 py-1 rounded-full text-sm font-bold">
                12+ Years Experience
              </span>
            </div>
            <p className="text-gray-400 text-sm leading-relaxed">
              Providing exceptional cleaning services with attention to detail
              and customer satisfaction. Over 1000+ happy customers served.
            </p>
            <div className="flex items-center space-x-4 mt-4">
              <div className="text-center">
                <p className="text-lg font-bold text-primary">1000+</p>
                <p className="text-xs text-gray-400">Happy Customers</p>
              </div>
              <div className="text-center">
                <p className="text-lg font-bold text-primary">100%</p>
                <p className="text-xs text-gray-400">Service Guarantee</p>
              </div>
              <div className="text-center">
                <p className="text-lg font-bold text-primary">1800+</p>
                <p className="text-xs text-gray-400">Cleans Completed</p>
              </div>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-lg font-semibold mb-4 font-bree">Quick Links</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <a href="/" className="text-gray-400 hover:text-primary transition-colors">
                  Home
                </a>
              </li>
              <li>
                <a href="/#about" className="text-gray-400 hover:text-primary transition-colors">
                  About Us
                </a>
              </li>
              <li>
                <a href="/#services" className="text-gray-400 hover:text-primary transition-colors">
                  Services
                </a>
              </li>
              <li>
                <a href="/shop" className="text-gray-400 hover:text-primary transition-colors">
                  Shop
                </a>
              </li>
              <li>
                <a href="/#contact" className="text-gray-400 hover:text-primary transition-colors">
                  Contact
                </a>
              </li>
            </ul>
          </div>

          {/* Services */}
          <div>
            <h4 className="text-lg font-semibold mb-4 font-bree">Our Services</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <a href="/#services" className="text-gray-400 hover:text-primary transition-colors">
                  Deep Cleaning
                </a>
              </li>
              <li>
                <a href="/#services" className="text-gray-400 hover:text-primary transition-colors">
                  Window Cleaning
                </a>
              </li>
              <li>
                <a href="/#services" className="text-gray-400 hover:text-primary transition-colors">
                  Carpet Cleaning
                </a>
              </li>
              <li>
                <a href="/#services" className="text-gray-400 hover:text-primary transition-colors">
                  Office Cleaning
                </a>
              </li>
              <li>
                <a href="/#services" className="text-gray-400 hover:text-primary transition-colors">
                  Kitchen & Bathroom
                </a>
              </li>
              <li>
                <a href="/#services" className="text-gray-400 hover:text-primary transition-colors">
                  Post-Construction
                </a>
              </li>
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h4 className="text-lg font-semibold mb-4 font-bree">Contact Us</h4>
            <ul className="space-y-2 text-sm text-gray-400">
              <li className="flex items-start space-x-2">
                <i className="fas fa-map-marker-alt mt-1 text-primary"></i>
                <span>123 Cleaning Street, Professional District, City 12345</span>
              </li>
              <li className="flex items-center space-x-2">
                <i className="fas fa-phone text-primary"></i>
                <span>+1 (555) 123-CLEAN</span>
              </li>
              <li className="flex items-center space-x-2">
                <i className="fas fa-envelope text-primary"></i>
                <span>info@drkleen.com</span>
              </li>
              <li className="flex items-center space-x-2">
                <i className="fas fa-clock text-primary"></i>
                <span>24/7 Emergency Service</span>
              </li>
            </ul>

            {/* Social Media */}
            <div className="mt-6">
              <h5 className="text-sm font-semibold mb-3 text-primary">Follow Us</h5>
              <div className="flex space-x-3">
                <a href="#" className="w-8 h-8 bg-primary text-black rounded-full flex items-center justify-center hover:bg-yellow-400 transition-colors">
                  <i className="fab fa-facebook-f text-sm"></i>
                </a>
                <a href="#" className="w-8 h-8 bg-primary text-black rounded-full flex items-center justify-center hover:bg-yellow-400 transition-colors">
                  <i className="fab fa-twitter text-sm"></i>
                </a>
                <a href="#" className="w-8 h-8 bg-primary text-black rounded-full flex items-center justify-center hover:bg-yellow-400 transition-colors">
                  <i className="fab fa-instagram text-sm"></i>
                </a>
                <a href="#" className="w-8 h-8 bg-primary text-black rounded-full flex items-center justify-center hover:bg-yellow-400 transition-colors">
                  <i className="fab fa-linkedin-in text-sm"></i>
                </a>
              </div>
            </div>
          </div>
        </div>

        <hr className="border-gray-800 my-8" />

        <div className="flex flex-col md:flex-row justify-between items-center">
          {/* Copyright */}
          <p className="text-gray-400 text-sm mb-4 md:mb-0">
            © {new Date().getFullYear()} Dr.Kleen Professional Cleaning Services. All rights reserved. | 12+ Years of Excellence
          </p>

          {/* Professional Certifications */}
          <div className="flex items-center space-x-4 text-xs text-gray-500">
            <span>Licensed & Insured</span>
            <span>•</span>
            <span>Eco-Friendly Certified</span>
            <span>•</span>
            <span>Professional Association Member</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;