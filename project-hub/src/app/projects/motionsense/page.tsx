import type { Metadata } from "next";
import MotionSenseSite from "@/components/motionsense/MotionSenseSite";

export const metadata: Metadata = {
  title: "MotionSense — Motion Intelligence Lab",
  description: "Real-time human activity recognition (MobileNetV3-Large + LSTM) running in your browser: live webcam, video analysis, model insights.",
};

export default function MotionSensePage() {
  return <MotionSenseSite />;
}
