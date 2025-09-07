import React from "react";

const About: React.FC = () => {
  return (
    <section id="about" className="py-20 bg-gradient-to-br from-gray-50 to-white">
      <div className="container mx-auto px-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Left Content */}
          <div>
            <div className="mb-6">
              <span className="inline-block bg-primary text-black px-4 py-2 rounded-full text-sm font-bold mb-4">
                12+ Years Experience
              </span>
              <h2 className="text-4xl md:text-5xl font-bold text-gray-800 font-bree leading-tight">
                Professional Cleaning
                <br />
                <span className="text-primary">Services You Can Trust</span>
              </h2>
            </div>
            
            <p className="text-lg text-gray-600 mb-6 leading-relaxed">
              Dr.Kleen has been setting the standard for professional cleaning services 
              for over 12 years. We specialize in janitorial services, fumigation & pest 
              control, and post-construction cleaning with a commitment to excellence 
              and customer satisfaction.
            </p>
            
            <p className="text-gray-600 mb-8">
              Our experienced team uses eco-friendly products and state-of-the-art 
              equipment to deliver spotless results for both residential and commercial 
              clients. We take pride in our attention to detail and 100% service guarantee.
            </p>

            {/* Statistics */}
            <div className="grid grid-cols-3 gap-6 mb-8">
              <div className="text-center">
                <h3 className="text-3xl font-bold text-primary font-bree">1000+</h3>
                <p className="text-sm text-gray-600 font-medium">Happy Customers</p>
              </div>
              <div className="text-center">
                <h3 className="text-3xl font-bold text-primary font-bree">100%</h3>
                <p className="text-sm text-gray-600 font-medium">Service Guarantee</p>
              </div>
              <div className="text-center">
                <h3 className="text-3xl font-bold text-primary font-bree">1800+</h3>
                <p className="text-sm text-gray-600 font-medium">Cleans Completed</p>
              </div>
            </div>

            {/* CTA Button */}
            <a
              href="#contact"
              className="inline-block bg-primary text-black font-semibold px-8 py-3 rounded-full hover:bg-yellow-400 transition-colors shadow-lg"
            >
              Get Free Estimate
            </a>
          </div>

          {/* Right Content - Images */}
          <div className="relative">
            {/* Main Image */}
            <div className="relative z-10">
              <img
                src="https://i.ibb.co/ykT2qjZ/side-view-man-cleaning-window.jpg"
                alt="Professional Cleaner"
                className="w-full h-96 object-cover rounded-lg shadow-xl"
              />
            </div>
            
            {/* Secondary Image */}
            <div className="absolute -bottom-8 -left-8 z-0">
              <img
                src="https://i.ibb.co/7g8h2mL/cleaning-team.jpg"
                alt="Cleaning Team"
                className="w-48 h-32 object-cover rounded-lg shadow-lg"
              />
            </div>
            
            {/* Experience Badge */}
            <div className="absolute -top-4 -right-4 bg-white p-4 rounded-lg shadow-lg z-20">
              <div className="text-center">
                <h4 className="text-2xl font-bold text-primary font-bree">12+</h4>
                <p className="text-sm text-gray-600 font-medium">Years of</p>
                <p className="text-sm text-gray-600 font-medium">Excellence</p>
              </div>
            </div>
            
            {/* Quality Badge */}
            <div className="absolute bottom-4 right-4 bg-secondary text-white p-3 rounded-full z-20">
              <i className="fas fa-check text-xl"></i>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default About;