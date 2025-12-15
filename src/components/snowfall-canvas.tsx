"use client";

import { useEffect, useState } from "react";
import Snowfall from "react-snowfall";

export default function SnowfallCanvas() {
  const [isDecember, setIsDecember] = useState(false);

  useEffect(() => {
    const today = new Date();
    setIsDecember(today.getMonth() === 11);
  }, []);

  if (!isDecember) {
    return null;
  }

  return (
    <div className="pointer-events-none absolute inset-0 z-10">
      <Snowfall snowflakeCount={60} speed={[0.5, 1]} wind={[-0.5, 0.5]} />
    </div>
  );
}
