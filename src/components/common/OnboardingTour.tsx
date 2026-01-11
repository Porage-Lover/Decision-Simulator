import { useState, useEffect } from 'react';
import Joyride, { CallBackProps, STATUS, Step } from 'react-joyride';

const TOUR_KEY = 'decision-simulator-tour-completed';

const tourSteps: Step[] = [
  {
    target: 'body',
    content: (
      <div className="space-y-3">
        <h3 className="text-lg font-bold">Welcome to Decision Simulator! 🎉</h3>
        <p>Let's take a quick tour to help you get started with modeling your decisions.</p>
      </div>
    ),
    placement: 'center',
    disableBeacon: true
  },
  {
    target: '[data-tour="create-simulation"]',
    content: (
      <div className="space-y-2">
        <h4 className="font-semibold">Create New Simulation</h4>
        <p>Click here to start modeling a new decision. You can choose from templates or create from scratch.</p>
      </div>
    ),
    placement: 'right'
  },
  {
    target: '[data-tour="saved-simulations"]',
    content: (
      <div className="space-y-2">
        <h4 className="font-semibold">Saved Simulations</h4>
        <p>Access all your previous simulations here. You can view results, edit, or delete them.</p>
      </div>
    ),
    placement: 'right'
  },
  {
    target: '[data-tour="dashboard"]',
    content: (
      <div className="space-y-2">
        <h4 className="font-semibold">Dashboard</h4>
        <p>Your home base showing recent simulations and quick access to key features.</p>
      </div>
    ),
    placement: 'right'
  },
  {
    target: 'body',
    content: (
      <div className="space-y-3">
        <h3 className="text-lg font-bold">You're all set! 🚀</h3>
        <p>Start by creating your first simulation. The app uses Monte Carlo simulation to generate probability distributions, not single predictions.</p>
        <p className="text-sm text-muted-foreground">You can restart this tour anytime from your profile menu.</p>
      </div>
    ),
    placement: 'center'
  }
];

interface OnboardingTourProps {
  run?: boolean;
  onComplete?: () => void;
}

export default function OnboardingTour({ run: externalRun, onComplete }: OnboardingTourProps) {
  const [run, setRun] = useState(false);

  useEffect(() => {
    // Check if tour has been completed
    const tourCompleted = localStorage.getItem(TOUR_KEY);
    if (!tourCompleted && externalRun === undefined) {
      // Auto-start tour for new users after a short delay
      const timer = setTimeout(() => {
        setRun(true);
      }, 1000);
      return () => clearTimeout(timer);
    } else if (externalRun !== undefined) {
      setRun(externalRun);
    }
  }, [externalRun]);

  const handleJoyrideCallback = (data: CallBackProps) => {
    const { status } = data;
    const finishedStatuses: string[] = ['finished', 'skipped'];

    if (finishedStatuses.includes(status)) {
      setRun(false);
      localStorage.setItem(TOUR_KEY, 'true');
      onComplete?.();
    }
  };

  return (
    <Joyride
      steps={tourSteps}
      run={run}
      continuous
      showProgress
      showSkipButton
      callback={handleJoyrideCallback}
      styles={{
        options: {
          primaryColor: 'hsl(217 91% 60%)',
          textColor: 'hsl(215 25% 15%)',
          backgroundColor: 'hsl(0 0% 100%)',
          arrowColor: 'hsl(0 0% 100%)',
          overlayColor: 'rgba(0, 0, 0, 0.5)',
          zIndex: 10000
        },
        tooltip: {
          borderRadius: 12,
          padding: 20
        },
        buttonNext: {
          backgroundColor: 'hsl(217 91% 60%)',
          borderRadius: 8,
          padding: '8px 16px'
        },
        buttonBack: {
          color: 'hsl(215 25% 15%)',
          marginRight: 10
        },
        buttonSkip: {
          color: 'hsl(215 15% 45%)'
        }
      }}
      locale={{
        back: 'Back',
        close: 'Close',
        last: 'Finish',
        next: 'Next',
        skip: 'Skip Tour'
      }}
    />
  );
}

// Hook to restart tour
export function useRestartTour() {
  const restartTour = () => {
    localStorage.removeItem(TOUR_KEY);
    window.location.reload();
  };

  return { restartTour };
}
