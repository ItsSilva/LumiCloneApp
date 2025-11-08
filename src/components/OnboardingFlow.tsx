import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { OnboardingWelcome } from "./OnboardingWelcome";
import { OnboardingBlue } from "./OnboardingBlue";
import { OnboardingOrange } from "./OnboardingOrange";
import { OnboardingGreen } from "./OnboardingGreen";
import { OnboardingYellow } from "./OnboardingYellow";

interface OnboardingFlowProps {
  onComplete: () => void;
}

export function OnboardingFlow({ onComplete }: OnboardingFlowProps) {
  const [currentStep, setCurrentStep] = useState(0);

  const handleNext = () => {
    if (currentStep < 4) {
      setCurrentStep(currentStep + 1);
    } else {
      onComplete();
    }
  };

  const screens = [
    <OnboardingWelcome key="welcome" onNext={handleNext} />,
    <OnboardingBlue key="blue" onNext={handleNext} />,
    <OnboardingOrange key="orange" onNext={handleNext} />,
    <OnboardingGreen key="green" onNext={handleNext} />,
    <OnboardingYellow key="yellow" onNext={handleNext} />,
  ];

  return (
    <div className="relative w-full h-full">
      <AnimatePresence mode="wait">
        <motion.div
          key={currentStep}
          initial={{ opacity: 0, x: 100 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -100 }}
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
          className="absolute inset-0"
        >
          {screens[currentStep]}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
