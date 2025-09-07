import React, { useEffect, useState } from "react";
import { apiService } from "../../services/api";
import { Testimonial } from "../../types";

const ContactTestimonials: React.FC = () => {
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTestimonials = async () => {
      try {
        const data = await apiService.getTestimonials();
        setTestimonials(data);
      } catch (err) {
        console.error('Error fetching testimonials:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchTestimonials();
  }, []);

  useEffect(() => {
    if (testimonials.length > 0) {
      const timer = setInterval(() => {
        setCurrentSlide((prev) => (prev + 1) % testimonials.length);
      }, 5000);
      return () => clearInterval(timer);
    }
  }, [testimonials.length]);

  return (
    <section className="py-20 bg-gradient-to-r from-gradientStart via-gradientMid to-gradientEnd">
      <div className="container mx-auto px-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Contact Information */}
          <div>
            <span className="inline-block bg-white text-primary px-4 py-2 rounded-full text-sm font-bold mb-4">
              CONTACT US
            </span>
            <h2 className="text-4xl md:text-5xl font-bold text-white font-bree leading-tight mb-6">
              Let's Discuss Your
              <br />
              <span className="text-yellow-100">Cleaning Needs</span>
            </h2>
            <p className="text-white/90 text-lg mb-8 leading-relaxed">
              Get in touch with our professional cleaning experts. We're here to 
              provide you with the best cleaning solutions tailored to your specific needs.
            </p>

            {/* Contact Details */}
            <div className="space-y-4 mb-8">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center">
                  <i className="fas fa-phone text-primary"></i>
                </div>
                <div>
                  <p className="text-white font-semibold">Call Us Anytime</p>
                  <p className="text-white/80">+1 (555) 123-CLEAN</p>
                </div>
              </div>
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center">
                  <i className="fas fa-envelope text-primary"></i>
                </div>
                <div>
                  <p className="text-white font-semibold">Email Support</p>
                  <p className="text-white/80">info@drkleen.com</p>
                </div>
              </div>
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center">
                  <i className="fas fa-clock text-primary"></i>
                </div>
                <div>
                  <p className="text-white font-semibold">24/7 Emergency Service</p>
                  <p className="text-white/80">Available round the clock</p>
                </div>
              </div>
            </div>

            <a
              href="#contact"
              className="inline-block bg-white text-primary font-semibold px-8 py-3 rounded-full hover:bg-yellow-50 transition-colors shadow-lg"
            >
              Get Free Quote
            </a>
          </div>

          {/* Testimonials Slider */}
          <div>
            <div className="bg-white rounded-xl p-8 shadow-xl">
              <h3 className="text-2xl font-bold text-gray-800 mb-6 font-bree text-center">
                What Our Customers Say
              </h3>
              
              {loading ? (
                <div className="text-center py-8">
                  <p className="text-gray-600">Loading testimonials...</p>
                </div>
              ) : testimonials.length > 0 ? (
                <div className="relative">
                  {/* Testimonial Content */}
                  <div className="text-center">
                    {/* Stars */}
                    <div className="flex justify-center mb-4">
                      {[...Array(testimonials[currentSlide]?.rating || 5)].map((_, i) => (
                        <i key={i} className="fas fa-star text-yellow-400 text-lg"></i>
                      ))}
                    </div>
                    
                    {/* Review Text */}
                    <blockquote className="text-gray-700 text-lg italic mb-6 leading-relaxed">
                      "{testimonials[currentSlide]?.review}"
                    </blockquote>
                    
                    {/* Customer Info */}
                    <div>
                      <p className="font-bold text-gray-800 text-lg">
                        {testimonials[currentSlide]?.customer_name}
                      </p>
                      <p className="text-primary text-sm font-medium">
                        {testimonials[currentSlide]?.service_type} Customer
                      </p>
                    </div>
                  </div>

                  {/* Navigation Dots */}
                  <div className="flex justify-center mt-6 space-x-2">
                    {testimonials.map((_, index) => (
                      <button
                        key={index}
                        onClick={() => setCurrentSlide(index)}
                        className={`w-3 h-3 rounded-full transition-colors ${
                          currentSlide === index ? "bg-primary" : "bg-gray-300"
                        }`}
                      />
                    ))}
                  </div>
                </div>
              ) : (
                <div className="text-center py-8">
                  <p className="text-gray-600">No testimonials available at the moment.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ContactTestimonials;