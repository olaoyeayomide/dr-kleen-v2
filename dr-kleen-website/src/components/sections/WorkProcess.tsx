import React from "react";

const WorkProcess: React.FC = () => {
  const steps = [
    {
      number: "01",
      title: "Book Your Service",
      description: "Schedule your cleaning service online or call us. Choose your preferred date and time.",
      icon: "fas fa-calendar-check",
    },
    {
      number: "02",
      title: "Assessment & Quote",
      description: "Our team visits your location to assess the cleaning requirements and provide a detailed quote.",
      icon: "fas fa-clipboard-list",
    },
    {
      number: "03",
      title: "Professional Cleaning",
      description: "Our trained professionals arrive with all necessary equipment and eco-friendly products.",
      icon: "fas fa-broom",
    },
    {
      number: "04",
      title: "Quality Inspection",
      description: "We conduct a thorough quality check to ensure every corner meets our high standards.",
      icon: "fas fa-check-circle",
    },
  ];

  return (
    <section className="py-20 bg-gradient-to-br from-gray-50 to-white">
      <div className="container mx-auto px-6">
        {/* Section Header */}
        <div className="text-center mb-16">
          <span className="inline-block bg-primary text-black px-4 py-2 rounded-full text-sm font-bold mb-4">
            OUR WORK PROCESS
          </span>
          <h2 className="text-4xl md:text-5xl font-bold text-gray-800 font-bree leading-tight">
            How We Work
            <br />
            <span className="text-primary">Step by Step</span>
          </h2>
          <div className="w-24 h-1 bg-primary mx-auto mt-6 rounded-full"></div>
        </div>

        {/* Process Steps */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {steps.map((step, index) => (
            <div key={index} className="relative text-center group">
              {/* Connection Line */}
              {index < steps.length - 1 && (
                <div className="hidden lg:block absolute top-16 left-full w-full h-px bg-gradient-to-r from-primary to-transparent transform translate-x-4 z-0"></div>
              )}
              
              {/* Step Card */}
              <div className="relative z-10 bg-white rounded-xl p-6 shadow-lg group-hover:shadow-xl transition-all duration-300 border border-gray-100">
                {/* Step Number */}
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 w-8 h-8 bg-primary text-black rounded-full flex items-center justify-center font-bold text-sm">
                  {step.number}
                </div>
                
                {/* Icon */}
                <div className="w-16 h-16 bg-gradient-to-r from-gradientStart to-gradientEnd rounded-full flex items-center justify-center mx-auto mb-4 mt-4">
                  <i className={`${step.icon} text-white text-2xl`}></i>
                </div>
                
                {/* Content */}
                <h3 className="text-xl font-bold text-gray-800 mb-3 font-bree group-hover:text-primary transition-colors">
                  {step.title}
                </h3>
                <p className="text-gray-600 text-sm leading-relaxed">
                  {step.description}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* CTA Section */}
        <div className="text-center mt-16">
          <div className="bg-white rounded-xl p-8 shadow-lg border border-gray-100">
            <h3 className="text-2xl font-bold text-gray-800 mb-4 font-bree">
              Ready to Experience Professional Cleaning?
            </h3>
            <p className="text-gray-600 mb-6">
              Join over 1000+ satisfied customers who trust Dr.Kleen for their cleaning needs.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a
                href="#contact"
                className="bg-primary text-black font-semibold px-8 py-3 rounded-full hover:bg-yellow-400 transition-colors shadow-lg"
              >
                Start Your Service
              </a>
              <a
                href="tel:+1555123CLEAN"
                className="bg-secondary text-white font-semibold px-8 py-3 rounded-full hover:bg-blue-600 transition-colors shadow-lg"
              >
                Call Now: +1 (555) 123-CLEAN
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default WorkProcess;