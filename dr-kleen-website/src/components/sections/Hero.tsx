import React from "react";

const Hero: React.FC = () => {
  return (
    <section className="relative min-h-screen bg-gradient-to-r from-gradientStart via-gradientMid to-gradientEnd overflow-hidden">
      {/* Floating Bubbles Background */}
      <div className="absolute inset-0 overflow-hidden">
        {/* Bubble Elements */}
        <div className="absolute top-20 left-10 w-4 h-4 bg-white/20 rounded-full animate-float"></div>
        <div className="absolute top-40 right-20 w-6 h-6 bg-white/15 rounded-full animate-float" style={{ animationDelay: '2s' }}></div>
        <div className="absolute bottom-40 left-20 w-8 h-8 bg-white/10 rounded-full animate-float" style={{ animationDelay: '4s' }}></div>
        <div className="absolute top-60 left-1/3 w-3 h-3 bg-white/25 rounded-full animate-float" style={{ animationDelay: '1s' }}></div>
        <div className="absolute bottom-60 right-1/4 w-5 h-5 bg-white/20 rounded-full animate-float" style={{ animationDelay: '3s' }}></div>
        <div className="absolute top-1/2 right-10 w-7 h-7 bg-white/15 rounded-full animate-float" style={{ animationDelay: '5s' }}></div>
      </div>

      <div className="container mx-auto px-6 py-20 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Left Content */}
          <div className="text-center lg:text-left">
            {/* Soap Icon */}
            <div className="flex justify-center lg:justify-start mb-6">
              <img
                src="https://i.ibb.co/dJMz9r8Q/sponge-1.png"
                alt="Soap Icon"
                className="h-16 w-16 animate-float"
              />
            </div>

            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white font-bree leading-tight mb-6">
              Experience the
              <br />
              <span className="text-white drop-shadow-lg">Ultimate</span>
              <br />
              <span className="text-yellow-100">Deep Cleaning with Dr.Kleen</span>
            </h1>

            <p className="text-lg md:text-xl text-white/90 mb-8 leading-relaxed max-w-lg mx-auto lg:mx-0">
              At DrKleen, we offer comprehensive cleaning solutions tailored to
              your needs, from residential deep cleans to commercial sanitation.
              Discover our eco-friendly products and services that ensure a
              spotless environment for your home or business.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start items-center">
              <a
                href="#about"
                className="bg-white text-primary font-semibold px-8 py-3 rounded-full hover:bg-yellow-50 transition-colors shadow-lg"
              >
                About us
              </a>
              
              {/* Arrow Icon */}
              <img
                src="https://i.ibb.co/Fk199VXF/swirly-arrow-4.png"
                alt="Arrow"
                className="h-8 w-8 hidden sm:block animate-float"
                style={{ animationDelay: '1.5s' }}
              />
            </div>
          </div>

          {/* Right Content - Image */}
          <div className="relative flex justify-center">
            <div className="relative">
              {/* Main Image */}
              <img
                src="https://i.ibb.co/ydGsRzk/cheerful-ethnic-housewife-has-braids-poses-with-mop-detergent-bottle-happy-clean.png"
                alt="Cleaning Professional"
                className="max-w-full h-auto rounded-lg shadow-2xl"
              />
              
              {/* Small circle with customer testimonial */}
              <div className="absolute -bottom-4 -left-4 bg-white rounded-full p-2 shadow-lg">
                <div className="flex items-center space-x-2 px-3 py-2">
                  <img
                    src="https://randomuser.me/api/portraits/women/44.jpg"
                    alt="Customer"
                    className="w-8 h-8 rounded-full"
                  />
                  <div className="text-xs">
                    <p className="font-semibold text-gray-800">Sarah M.</p>
                    <p className="text-gray-600">5 stars</p>
                  </div>
                </div>
              </div>
              
              {/* Professional Badge */}
              <div className="absolute -top-4 -right-4 bg-secondary text-white px-4 py-2 rounded-full shadow-lg">
                <p className="text-sm font-bold">12+ Years</p>
                <p className="text-xs">Experience</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Wave */}
      <div className="absolute bottom-0 left-0 w-full">
        <svg viewBox="0 0 1200 120" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path
            d="M0 120V46.29C47.79 22.94 103.59 14.67 158.21 22.27C212.83 29.86 265.98 53.21 319.13 76.56C372.28 99.91 425.43 123.26 478.58 120.51C531.73 117.76 584.88 88.91 638.03 85.47C691.18 82.03 744.33 103.99 797.48 109.31C850.63 114.63 903.78 103.31 956.93 85.47C1010.08 67.63 1063.23 43.27 1116.38 36.52C1169.53 29.77 1222.68 40.63 1248.26 46.05L1274 51.47V120H0Z"
            fill="white"
          />
        </svg>
      </div>
    </section>
  );
};

export default Hero;