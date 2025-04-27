import React from 'react';
import { Link } from 'react-router-dom';
import { useAuthContext } from '../../context/AuthContext';
import { FaCode, FaPython, FaJava, FaCuttlefish, FaGithub, FaRocket } from 'react-icons/fa';
import { SiJavascript } from 'react-icons/si';
import { useSpring, animated, config } from 'react-spring';
import { useInView } from 'react-intersection-observer';
import './style.css';

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
    <animated.div ref={ref} style={slideAnimation} className="feature-card">
      <div className="feature-icon-wrapper">
        {icon}
      </div>
      <h3 className="feature-title">{title}</h3>
      <p className="feature-description">{description}</p>
    </animated.div>
  );
};

const Home = () => {
  const { user } = useAuthContext();

  const useCases = [
    { icon: <FaPython className="language-icon python" />, language: 'Python', description: 'Generate clean Python classes and interfaces' },
    { icon: <FaJava className="language-icon java" />, language: 'Java', description: 'Create robust Java object structures' },
    { icon: <SiJavascript className="language-icon javascript" />, language: 'JavaScript', description: 'Build modern ES6 classes and prototypes' },
    { icon: <FaCuttlefish className="language-icon cpp" />, language: 'C++', description: 'Design efficient C++ class hierarchies' },
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
    <div className="home-container">
      <div className="content-wrapper">
        <animated.div style={heroAnimation} className="hero-section">
          <div className="hero-content">
            <h1 className="hero-title">
              <span>Welcome to</span>
              <span className="hero-subtitle">CodeGen</span>
            </h1>
            <p className="hero-description">
              Revolutionize your development process with AI-powered OOP code generation. CodeGen streamlines your workflow, enhances productivity, and ensures code consistency across your projects.
            </p>
            <div className="cta-container">
              <Link to={user ? "/dashboard" : "/signup"} className="primary-button">
                Get Started
              </Link>
              <Link to="/about" className="secondary-button">
                Learn More
              </Link>
            </div>
          </div>
        </animated.div>

        <div className="section">
          <h2 className="section-title">Key Features</h2>
          <div className="features-grid">
            {features.map((feature, index) => (
              <FeatureCard key={index} {...feature} index={index} />
            ))}
          </div>
        </div>

        <div className="section">
          <h2 className="section-title">Supported Languages</h2>
          <div className="languages-grid">
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
                  className="language-card"
                >
                  <div className="language-content">
                    <div className="language-info">
                      <div className="language-icon">
                        {useCase.icon}
                      </div>
                      <div className="language-details">
                        <dt className="language-name">
                          {useCase.language}
                        </dt>
                        <dd className="language-description">
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
