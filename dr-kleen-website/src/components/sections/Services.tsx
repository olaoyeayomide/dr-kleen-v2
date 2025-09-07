import React, { useEffect, useState } from "react";
import { apiService } from "../../services/api";
import { Service } from "../../types";

const Services: React.FC = () => {
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchServices = async () => {
      try {
        const data = await apiService.getServices();
        setServices(data);
      } catch (err) {
        setError('Failed to load services');
        console.error('Error fetching services:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchServices();
  }, []);

  if (loading) {
    return (
      <section id="services" className="py-20 bg-white">
        <div className="container mx-auto px-6 text-center">
          <p className="text-lg text-gray-600">Loading services...</p>
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section id="services" className="py-20 bg-white">
        <div className="container mx-auto px-6 text-center">
          <p className="text-lg text-red-600">{error}</p>
        </div>
      </section>
    );
  }

  return (
    <section id="services" className="py-20 bg-white">
      <div className="container mx-auto px-6">
        {/* Section Header */}
        <div className="text-center mb-16">
          <span className="inline-block bg-primary text-black px-4 py-2 rounded-full text-sm font-bold mb-4">
            OUR BEST SERVICES
          </span>
          <h2 className="text-4xl md:text-5xl font-bold text-gray-800 font-bree leading-tight">
            Our Regular Services For{" "}
            <span className="text-primary">Our Customers</span>
          </h2>
          <div className="w-24 h-1 bg-primary mx-auto mt-6 rounded-full"></div>
        </div>

        {/* Services Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {services.map((service, index) => (
            <div
              key={service.id}
              className="group bg-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden border border-gray-100"
            >
              {/* Service Image */}
              <div className="relative overflow-hidden">
                <img
                  src={service.image}
                  alt={service.name}
                  className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              </div>

              {/* Service Content */}
              <div className="p-6">
                <h3 className="text-xl font-bold text-gray-800 mb-3 font-bree group-hover:text-primary transition-colors">
                  {service.name}
                </h3>
                <p className="text-gray-600 mb-4 leading-relaxed">
                  {service.description}
                </p>
                
                {/* Price Range */}
                <div className="flex items-center justify-between">
                  <span className="text-lg font-bold text-primary">
                    {service.price_range}
                  </span>
                  <button className="bg-primary text-black px-4 py-2 rounded-full font-semibold hover:bg-yellow-400 transition-colors">
                    Book Now
                  </button>
                </div>
              </div>

              {/* Hover Effect Icon */}
              <div className="absolute top-4 right-4 w-10 h-10 bg-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-y-2 group-hover:translate-y-0">
                <i className="fas fa-arrow-right text-primary"></i>
              </div>
            </div>
          ))}
        </div>

        {/* CTA Section */}
        <div className="text-center mt-16">
          <p className="text-lg text-gray-600 mb-6">
            Need a custom cleaning solution? We're here to help!
          </p>
          <a
            href="#contact"
            className="inline-block bg-secondary text-white font-semibold px-8 py-3 rounded-full hover:bg-blue-600 transition-colors shadow-lg"
          >
            Get Custom Quote
          </a>
        </div>
      </div>
    </section>
  );
};

export default Services;