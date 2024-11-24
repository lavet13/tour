import { cn } from "@/lib/utils";

interface Props {
  max: number;
  value: number;
  min: number;
  gaugePrimaryColor: string;
  gaugeSecondaryColor: string;
  className?: string;
}

export default function AnimatedCircularProgressBar({
  max = 100,
  min = 0,
  value = 0,
  gaugePrimaryColor,
  gaugeSecondaryColor,
  className,
}: Props) {
  const circumference = 2 * Math.PI * 45;
  const percentPx = circumference / 100;
  const currentPercent = Math.round(((value - min) / (max - min)) * 100);

  return (
    <div
      className={cn("relative size-40 text-2xl font-semibold", className)}
      style={{
        "--circle-size": "100px",
        "--circumference": circumference,
        "--percent-to-px": `${percentPx}px`,
        "--gap-percent": "5",
        "--offset-factor": "0",
        transform: "translateZ(0)",
      } as React.CSSProperties}
    >
      <svg
        fill="none"
        className="size-full"
        strokeWidth="2"
        viewBox="0 0 100 100"
      >
        {currentPercent <= 90 && currentPercent >= 0 && (
          <circle
            cx="50"
            cy="50"
            r="45"
            strokeWidth="10"
            strokeDashoffset="0"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="opacity-100 transition-all duration-1000"
            style={{
              stroke: gaugeSecondaryColor,
              "--stroke-percent": 90 - currentPercent,
              "--offset-factor-secondary": "calc(1 - var(--offset-factor))",
              strokeDasharray:
                "calc(var(--stroke-percent) * var(--percent-to-px)) var(--circumference)",
              transform:
                "rotate(calc(1turn - 90deg - (var(--gap-percent) * 3.6deg * var(--offset-factor-secondary)))) scaleY(-1)",
              transformOrigin: "50px 50px",
            } as React.CSSProperties}
          />
        )}
        <circle
          cx="50"
          cy="50"
          r="45"
          strokeWidth="10"
          strokeDashoffset="0"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="opacity-100 transition-all duration-1000"
          style={{
            stroke: gaugePrimaryColor,
            "--stroke-percent": currentPercent,
            strokeDasharray:
              "calc(var(--stroke-percent) * var(--percent-to-px)) var(--circumference)",
            transform:
              "rotate(calc(-90deg + var(--gap-percent) * var(--offset-factor) * 3.6deg))",
            transformOrigin: "50px 50px",
          } as React.CSSProperties}
        />
      </svg>
      <span className="absolute inset-0 m-auto size-fit animate-in fade-in duration-1000">
        {currentPercent}
      </span>
    </div>
  );
}