import React from "react";

const Features: React.FC = () => {
  const features = [
    {
      icon: "fas fa-clock",
      title: "24/7 Support",
      description: "Round-the-clock customer service for emergency cleaning needs",
      color: "bg-blue-500",
    },
    {
      icon: "fas fa-shield-alt",
      title: "Payment Secure",
      description: "Safe and encrypted payment processing for your peace of mind",
      color: "bg-green-500",
    },
    {
      icon: "fas fa-award",
      title: "Top Cleaning Services",
      description: "Premium quality cleaning with 12+ years of professional experience",
      color: "bg-primary",
    },
  ];

  return (
    <section className="py-16 bg-white">
      <div className="container mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <div
              key={index}
              className="text-center p-6 rounded-lg hover:shadow-lg transition-shadow duration-300"
            >
              <div
                className={`${feature.color} w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4`}
              >
                <i className={`${feature.icon} text-white text-2xl`}></i>
              </div>
              <h3 className="text-xl font-bold text-gray-800 mb-2 font-bree">
                {feature.title}
              </h3>
              <p className="text-gray-600">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Features;