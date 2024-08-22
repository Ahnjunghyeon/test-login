import React, { useEffect, useRef, useState } from "react";

const useOnScreen = (options) => {
  const [isVisible, setIsVisible] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => {
      setIsVisible(entry.isIntersecting);
    }, options);

    if (ref.current) {
      observer.observe(ref.current);
    }

    return () => {
      if (ref.current) {
        observer.unobserve(ref.current);
      }
    };
  }, [ref, options]);

  return [ref, isVisible];
};

const FeatureItem = ({ title, text }) => {
  const [ref, isVisible] = useOnScreen({
    threshold: 0.1,
  });

  return (
    <div ref={ref} className={`feature-item ${isVisible ? "in-view" : ""}`}>
      <h3 className="feature-item-title">{title}</h3>
      <p className="feature-item-text">{text}</p>
    </div>
  );
};

export default FeatureItem;
