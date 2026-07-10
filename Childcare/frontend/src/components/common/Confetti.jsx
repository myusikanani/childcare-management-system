import React, { useEffect, useState } from 'react';

const Confetti = () => {
  const [pieces, setPieces] = useState([]);

  useEffect(() => {
    // Generate confetti pieces
    const newPieces = [];
    for (let i = 0; i < 50; i++) {
      newPieces.push({
        id: i,
        left: Math.random() * 100,
        animationDelay: Math.random() * 3,
        animationDuration: 3 + Math.random() * 2,
        backgroundColor: `hsl(${Math.random() * 360}, 70%, 60%)`
      });
    }
    setPieces(newPieces);

    // Remove confetti after animation
    const timer = setTimeout(() => {
      setPieces([]);
    }, 5000);

    return () => clearTimeout(timer);
  }, []);

  if (pieces.length === 0) return null;

  return (
    <div style={styles.container}>
      {pieces.map((piece) => (
        <div
          key={piece.id}
          style={{
            ...styles.piece,
            left: `${piece.left}%`,
            animationDelay: `${piece.animationDelay}s`,
            animationDuration: `${piece.animationDuration}s`,
            backgroundColor: piece.backgroundColor
          }}
        />
      ))}
      <style>{`
        @keyframes confettiFall {
          0% {
            opacity: 1;
            transform: translateY(0) rotateZ(0deg);
          }
          100% {
            opacity: 0;
            transform: translateY(100vh) rotateZ(720deg);
          }
        }
      `}</style>
    </div>
  );
};

const styles = {
  container: {
    position: 'fixed',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    pointerEvents: 'none',
    zIndex: 9998,
    overflow: 'hidden'
  },
  piece: {
    position: 'absolute',
    width: '10px',
    height: '10px',
    top: '-10px',
    opacity: 0,
    animation: 'confettiFall linear forwards'
  }
};

export default Confetti;