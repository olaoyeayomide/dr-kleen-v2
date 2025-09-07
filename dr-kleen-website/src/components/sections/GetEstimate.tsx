import React, { useState } from "react";
import { apiService } from "../../services/api";
import { Booking } from "../../types";

const GetEstimate: React.FC = () => {
  const [formData, setFormData] = useState({
    customer_name: "",
    email: "",
    phone: "",
    service_type: "",
    booking_date: "",
    message: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitMessage, setSubmitMessage] = useState("");

  const serviceTypes = [
    "Deep Cleaning",
    "Window Cleaning",
    "Carpet Cleaning",
    "Kitchen Cleaning",
    "Bathroom Cleaning",
    "Office Cleaning",
    "Post-Construction Cleaning",
    "Custom Service",
  ];

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitMessage("");

    try {
      const bookingData: Omit<Booking, 'id' | 'created_at'> = {
        customer_name: formData.customer_name,
        email: formData.email,
        phone: formData.phone,
        service_type: formData.service_type,
        booking_date: formData.booking_date,
        status: 'pending'
      };

      await apiService.createBooking(bookingData);
      setSubmitMessage("Your booking request has been submitted successfully! We'll contact you soon.");
      setFormData({
        customer_name: "",
        email: "",
        phone: "",
        service_type: "",
        booking_date: "",
        message: "",
      });
    } catch (error) {
      setSubmitMessage("Failed to submit booking request. Please try again.");
      console.error('Booking submission error:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section id="contact" className="py-20 bg-white">
      <div className="container mx-auto px-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Left Side - Information */}
          <div>
            <span className="inline-block bg-primary text-black px-4 py-2 rounded-full text-sm font-bold mb-4">
              GET FREE ESTIMATE
            </span>
            <h2 className="text-4xl md:text-5xl font-bold text-gray-800 font-bree leading-tight mb-6">
              Request Your
              <br />
              <span className="text-primary">Free Cleaning Quote</span>
            </h2>
            <p className="text-lg text-gray-600 mb-8 leading-relaxed">
              Get a personalized quote for your cleaning needs. Our team will assess 
              your requirements and provide you with a competitive estimate within 24 hours.
            </p>

            {/* Why Choose Us */}
            <div className="space-y-4 mb-8">
              <div className="flex items-center space-x-3">
                <div className="w-6 h-6 bg-primary rounded-full flex items-center justify-center">
                  <i className="fas fa-check text-black text-sm"></i>
                </div>
                <span className="text-gray-700 font-medium">Free on-site assessment</span>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-6 h-6 bg-primary rounded-full flex items-center justify-center">
                  <i className="fas fa-check text-black text-sm"></i>
                </div>
                <span className="text-gray-700 font-medium">No hidden fees or charges</span>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-6 h-6 bg-primary rounded-full flex items-center justify-center">
                  <i className="fas fa-check text-black text-sm"></i>
                </div>
                <span className="text-gray-700 font-medium">100% satisfaction guarantee</span>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-6 h-6 bg-primary rounded-full flex items-center justify-center">
                  <i className="fas fa-check text-black text-sm"></i>
                </div>
                <span className="text-gray-700 font-medium">Licensed & insured professionals</span>
              </div>
            </div>

            {/* Contact Info */}
            <div className="bg-gray-50 p-6 rounded-lg">
              <h3 className="text-xl font-bold text-gray-800 mb-4 font-bree">Prefer to Call?</h3>
              <div className="space-y-2">
                <p className="flex items-center text-gray-700">
                  <i className="fas fa-phone text-primary mr-3"></i>
                  +1 (555) 123-CLEAN
                </p>
                <p className="flex items-center text-gray-700">
                  <i className="fas fa-envelope text-primary mr-3"></i>
                  info@drkleen.com
                </p>
                <p className="text-sm text-gray-600 mt-2">
                  Available 24/7 for emergency services
                </p>
              </div>
            </div>
          </div>

          {/* Right Side - Form */}
          <div>
            <div className="bg-gradient-to-br from-gray-50 to-white p-8 rounded-xl shadow-lg border border-gray-100">
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Name */}
                <div>
                  <label htmlFor="customer_name" className="block text-sm font-medium text-gray-700 mb-2">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    id="customer_name"
                    name="customer_name"
                    value={formData.customer_name}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent transition-colors"
                    placeholder="Your full name"
                  />
                </div>

                {/* Email and Phone */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                      Email Address *
                    </label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      required
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent transition-colors"
                      placeholder="your@email.com"
                    />
                  </div>
                  <div>
                    <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-2">
                      Phone Number
                    </label>
                    <input
                      type="tel"
                      id="phone"
                      name="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent transition-colors"
                      placeholder="(555) 123-4567"
                    />
                  </div>
                </div>

                {/* Service Type */}
                <div>
                  <label htmlFor="service_type" className="block text-sm font-medium text-gray-700 mb-2">
                    Service Type *
                  </label>
                  <select
                    id="service_type"
                    name="service_type"
                    value={formData.service_type}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent transition-colors"
                  >
                    <option value="">Select a service</option>
                    {serviceTypes.map((service) => (
                      <option key={service} value={service}>
                        {service}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Preferred Date */}
                <div>
                  <label htmlFor="booking_date" className="block text-sm font-medium text-gray-700 mb-2">
                    Preferred Date
                  </label>
                  <input
                    type="date"
                    id="booking_date"
                    name="booking_date"
                    value={formData.booking_date}
                    onChange={handleInputChange}
                    min={new Date().toISOString().split('T')[0]}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent transition-colors"
                  />
                </div>

                {/* Message */}
                <div>
                  <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-2">
                    Additional Details
                  </label>
                  <textarea
                    id="message"
                    name="message"
                    value={formData.message}
                    onChange={handleInputChange}
                    rows={4}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent transition-colors resize-none"
                    placeholder="Tell us more about your cleaning needs..."
                  ></textarea>
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-primary text-black font-semibold py-3 px-6 rounded-lg hover:bg-yellow-400 transition-colors shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? "Submitting..." : "Get Free Estimate"}
                </button>

                {/* Submit Message */}
                {submitMessage && (
                  <div className={`text-center p-3 rounded-lg ${
                    submitMessage.includes('successfully') 
                      ? 'bg-green-100 text-green-700' 
                      : 'bg-red-100 text-red-700'
                  }`}>
                    {submitMessage}
                  </div>
                )}
              </form>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default GetEstimate;