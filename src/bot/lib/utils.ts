interface TickRange {
  lowTick: number;
  highTick: number;
}

function calculateTickRanges(currentTick: number): {
  narrow: TickRange;
  common: TickRange;
  wide: TickRange;
} {
  // Narrow: ±3% volatility = ±300 ticks
  const narrowRange = 300;

  // Common: ±8% volatility = ±800 ticks
  const commonRange = 800;

  // Wide: ±15% volatility = ±1600 ticks
  const wideRange = 1600;

  return {
    narrow: {
      lowTick: Math.floor(currentTick - narrowRange),
      highTick: Math.ceil(currentTick + narrowRange),
    },
    common: {
      lowTick: Math.floor(currentTick - commonRange),
      highTick: Math.ceil(currentTick + commonRange),
    },
    wide: {
      lowTick: Math.floor(currentTick - wideRange),
      highTick: Math.ceil(currentTick + wideRange),
    },
  };
}
