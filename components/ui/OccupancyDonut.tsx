import React from "react";
import { StyleSheet, Text, View } from "react-native";
import Svg, { Circle } from "react-native-svg";

type Props = {
  percent: number;
  size?: number;
  strokeWidth?: number;
  color?: string;
  trackColor?: string;
  textColor?: string;
  subColor?: string;
};

/**
 * A donut/pie chart for occupancy percentage. Uses react-native-svg, with an
 * error boundary fallback (a plain ring) so it never crashes the dashboard if
 * the native module isn't present in the current build.
 */
export default function OccupancyDonut(props: Props) {
  return (
    <DonutErrorBoundary fallbackPercent={props.percent} size={props.size} color={props.color}>
      <DonutInner {...props} />
    </DonutErrorBoundary>
  );
}

function DonutInner({
  percent,
  size = 118,
  strokeWidth = 14,
  color = "#159df8",
  trackColor = "#e2e8f0",
  textColor = "#0f172a",
  subColor = "#94a3b8",
}: Props) {
  const pct = Math.max(0, Math.min(100, Number(percent) || 0));
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference * (1 - pct / 100);
  const center = size / 2;

  return (
    <View style={{ width: size, height: size }}>
      <Svg width={size} height={size}>
        <Circle
          cx={center}
          cy={center}
          r={radius}
          stroke={trackColor}
          strokeWidth={strokeWidth}
          fill="none"
        />
        <Circle
          cx={center}
          cy={center}
          r={radius}
          stroke={color}
          strokeWidth={strokeWidth}
          fill="none"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          transform={`rotate(-90 ${center} ${center})`}
        />
      </Svg>
      <View style={styles.centerWrap}>
        <Text style={[styles.centerValue, { color: textColor }]}>{Math.round(pct)}%</Text>
        <Text style={[styles.centerSub, { color: subColor }]}>occupied</Text>
      </View>
    </View>
  );
}

class DonutErrorBoundary extends React.Component<
  { children: React.ReactNode; fallbackPercent: number; size?: number; color?: string },
  { hasError: boolean }
> {
  state = { hasError: false };
  static getDerivedStateFromError() {
    return { hasError: true };
  }
  render() {
    if (this.state.hasError) {
      const size = this.props.size ?? 118;
      return (
        <View
          style={[
            styles.fallback,
            { width: size, height: size, borderRadius: size / 2, borderColor: this.props.color ?? "#159df8" },
          ]}
        >
          <Text style={styles.fallbackValue}>
            {Math.round(Math.max(0, Math.min(100, Number(this.props.fallbackPercent) || 0)))}%
          </Text>
          <Text style={styles.fallbackSub}>occupied</Text>
        </View>
      );
    }
    return this.props.children;
  }
}

const styles = StyleSheet.create({
  centerWrap: { ...StyleSheet.absoluteFillObject, alignItems: "center", justifyContent: "center" },
  centerValue: { fontSize: 26, fontWeight: "800" },
  centerSub: { fontSize: 11.5, fontWeight: "700", marginTop: -1 },
  fallback: { borderWidth: 8, alignItems: "center", justifyContent: "center" },
  fallbackValue: { fontSize: 24, fontWeight: "800", color: "#0f172a" },
  fallbackSub: { fontSize: 11, fontWeight: "700", color: "#94a3b8" },
});
