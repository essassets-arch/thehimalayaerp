
export default function CountdownCard({ 
  daysLeft = 12, 
  totalDots = 24, 
  desc = "We are pleased to announce that we will be celebrating our 16th anniversary." 
}) {
  const dots = Array.from({ length: totalDots }, (_, i) => i < daysLeft);

  return (
    <div className="app-card countdown-card">
      <div className="card-top-bar">
        <h2 className="card-heading" id="countdownTitle">{daysLeft} Days left</h2>
      </div>
      <p className="countdown-desc">{desc}</p>
      
      <div className="countdown-dots-grid" id="dotsGrid">
        {dots.map((isActive, index) => (
          <div 
            key={index} 
            className={`countdown-dot ${isActive ? '' : 'empty'}`}
          ></div>
        ))}
      </div>
    </div>
  );
}
