import { useEffect, useState } from "react";

function AnimatedStat({ target, label, suffix = "" }) {
  const [count, setCount] = useState(0);
  // animate from 0 to target when component mounts
  useEffect(() => {
    let start = 0;
    const duration = 1500;
    const increment = target / (duration / 16);

    const counter = setInterval(() => {
      start += increment;
      if (start >= target) {
        start = target;
        clearInterval(counter);
      }
      setCount(Math.floor(start));
    }, 16);

    return () => clearInterval(counter);
  }, [target]);

  return (
    <div className="stat-card">
      <h2>{count}{suffix}</h2>
      <p>{label}</p>
    </div>
  );
}

export default AnimatedStat;
