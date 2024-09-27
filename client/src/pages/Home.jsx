import React from 'react';
import { Link } from 'react-router-dom';
import { useAuthContext } from '../context/AuthContext';
import { FaCode, FaPython, FaJava, FaCuttlefish, FaGithub, FaRocket } from 'react-icons/fa';
import { SiJavascript } from 'react-icons/si';
import { useSpring, animated, config } from 'react-spring';
import { useInView } from 'react-intersection-observer';

const FeatureCard = ({ icon, title, description, index }) => {
  const [ref, inView] = useInView({
    threshold: 0.1,
    triggerOnce: true,
  });

  const slideAnimation = useSpring({
    opacity: inView ? 1 : 0,
    transform: inView ? 'translateX(0)' : 'translateX(-50px)',
    delay: index * 200,
    config: config.molasses,
  });

  return (
    <animated.div ref={ref} style={slideAnimation} className="bg-white rounded-lg shadow-xl p-6">
      <div className="flex items-center justify-center h-12 w-12 rounded-md bg-indigo-500 text-white mb-4">
        {icon}
      </div>
      <h3 className="text-xl font-semibold mb-2">{title}</h3>
      <p className="text-gray-600">{description}</p>
    </animated.div>
  );
};

const Home = () => {
  const { user } = useAuthContext();

  const useCases = [
    { icon: <FaPython className="text-4xl text-green-500" />, language: 'Python', description: 'Generate clean Python classes and interfaces' },
    { icon: <FaJava className="text-4xl text-red-500" />, language: 'Java', description: 'Create robust Java object structures' },
    { icon: <SiJavascript className="text-4xl text-yellow-500" />, language: 'JavaScript', description: 'Build modern ES6 classes and prototypes' },
    { icon: <FaCuttlefish className="text-4xl text-blue-500" />, language: 'C++', description: 'Design efficient C++ class hierarchies' },
  ];

  const features = [
    { icon: <FaCode />, title: "AI-Powered Generation", description: "Leverage advanced AI algorithms to generate clean, efficient, and maintainable code structures." },
    { icon: <FaGithub />, title: "Version Control Integration", description: "Seamlessly integrate with popular version control systems like Git for efficient collaboration." },
    { icon: <FaRocket />, title: "Boost Productivity", description: "Accelerate your development process by automating repetitive coding tasks and focusing on core logic." }
  ];

  const heroAnimation = useSpring({
    from: { opacity: 0, transform: 'translateY(30px)' },
    to: { opacity: 1, transform: 'translateY(0)' },
    config: config.molasses,
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 pt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <animated.div style={heroAnimation} className="py-12 md:py-20">
          <div className="text-center">
            <h1 className="text-5xl tracking-tight font-extrabold text-white sm:text-6xl md:text-7xl">
              <span className="block">Welcome to</span>
              <span className="block text-yellow-300">CodeGen</span>
            </h1>
            <p className="mt-3 max-w-md mx-auto text-base text-gray-100 sm:text-lg md:mt-5 md:text-xl md:max-w-3xl">
              Revolutionize your development process with AI-powered OOP code generation. CodeGen streamlines your workflow, enhances productivity, and ensures code consistency across your projects.
            </p>
            <div className="mt-5 max-w-md mx-auto sm:flex sm:justify-center md:mt-8">
              <div className="rounded-md shadow">
                <Link to={user ? "/dashboard" : "/signup"} className="w-full flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-md text-indigo-600 bg-white hover:bg-gray-50 md:py-4 md:text-lg md:px-10 transition duration-300 ease-in-out transform hover:-translate-y-1 hover:scale-105">
                  Get Started
                </Link>
              </div>
              <div className="mt-3 rounded-md shadow sm:mt-0 sm:ml-3">
                <Link to="/about" className="w-full flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 md:py-4 md:text-lg md:px-10 transition duration-300 ease-in-out transform hover:-translate-y-1 hover:scale-105">
                  Learn More
                </Link>
              </div>
            </div>
          </div>
        </animated.div>

        <div className="py-12">
          <h2 className="text-3xl font-extrabold text-white text-center mb-12">Key Features</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <FeatureCard key={index} {...feature} index={index} />
            ))}
          </div>
        </div>

        <div className="py-12">
          <h2 className="text-3xl font-extrabold text-white text-center mb-12">Supported Languages</h2>
          <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {useCases.map((useCase, index) => {
              const [ref, inView] = useInView({
                threshold: 0.1,
                triggerOnce: true,
              });

              const cardAnimation = useSpring({
                opacity: inView ? 1 : 0,
                transform: inView ? 'translateY(0)' : 'translateY(50px)',
                delay: index * 100,
                config: config.molasses,
              });

              return (
                <animated.div
                  ref={ref}
                  style={cardAnimation}
                  key={index}
                  className="bg-white bg-opacity-20 backdrop-filter backdrop-blur-lg overflow-hidden shadow-lg rounded-lg hover:shadow-2xl transition-shadow duration-300"
                >
                  <div className="px-4 py-5 sm:p-6">
                    <div className="flex items-center">
                      <div className="flex-shrink-0">
                        {useCase.icon}
                      </div>
                      <div className="ml-5 w-0 flex-1">
                        <dt className="text-lg font-medium text-white truncate">
                          {useCase.language}
                        </dt>
                        <dd className="mt-1 text-sm text-gray-200">
                          {useCase.description}
                        </dd>
                      </div>
                    </div>
                  </div>
                </animated.div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;
