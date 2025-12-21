
import { useState } from 'react';
import { X, Wallet, Image, ShoppingCart, ChevronRight, SkipForward } from 'lucide-react';

// Onboarding component
export default function OnboardingFlow({ onComplete }: { onComplete: () => void }) {
  const [currentStep, setCurrentStep] = useState(0);
  const [isVisible, setIsVisible] = useState(true);

  const steps = [
    {
      imageUrl: '/rare24.png',
      title: "Welcome",
      description: <div className='text-gray-700 dark:text-gray-300'>
        <p className='text-center text-xl font-semibold'>Own Your Favorite Creators' Rare Moments</p>
        <ol className='text-lg text-gray-600 dark:text-gray-200 mt-4 space-y-1 list-decimal pl-5'>
            <li className='text-start'>Share a moment with a caption, set the max supply and price</li>
            <li className='text-start'>On the feed and marketplace, like a moment to buy it</li>
            <li className='text-start'>Make an offer for a moment or resell a moment you own</li>
        </ol>
    </div>
    }
  ];

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      handleComplete();
    }
  };

  const handleComplete = () => {
    setIsVisible(false);
    setTimeout(() => {
      onComplete();
    }, 300);
  };

  const handleSkip = () => {
    handleComplete();
  };

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 bg-black/70 bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className={`bg-background rounded-2xl max-w-md w-full p-8 relative transform transition-all duration-300 ${isVisible ? 'scale-100 opacity-100' : 'scale-95 opacity-0'}`}>
        {/* Skip button */}
        <button
          onClick={handleSkip}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
        >
          <X className="w-6 h-6" />
        </button>

        {/* Progress indicators */}
        <div className="flex justify-center gap-2 mb-8">
          {steps.map((_, index) => (
            <div
              key={index}
              className={`h-2 rounded-full transition-all duration-300 ${
                index === currentStep 
                  ? 'w-8 bg-teal-500' 
                  : index < currentStep 
                  ? 'w-2 bg-teal-300' 
                  : 'w-2 bg-gray-300'
              }`}
            />
          ))}
        </div>

        {/* Content */}
        <div className="">
            <div className='text-center'>
                <div className="flex justify-center mb-5">
                    <img 
                        src={steps[currentStep].imageUrl} 
                        alt={steps[currentStep].imageUrl}
                        className="max-h-[50vh] w-auto h-auto object-contain relative z-10"
                    />
                </div>
                
                <h2 className="text-2xl font-bold text-gray-700 dark:text-gray-300 mb-4">
                    {steps[currentStep].title}
                </h2>
                
                <p className="text-gray-600 dark:text-gray-200 mb-8 leading-relaxed">
                    {steps[currentStep].description}
                </p>
            </div>
            {/* Actions */}
            <div className='flex flex-center justify-center'>
                {/* Skip button */}
                {/* <button
                    onClick={handleSkip}
                    className="px-4 py-3 rounded-full font-medium flex items-center justify-center border border-teal-500 dark:border-teal-800 gap-2"
                >
                    <SkipForward className="w-5 h-5" />
                    <span>Skip</span>
                </button> */}
                {/* Next/Complete button */}
                <button
                    onClick={handleNext}
                    className="px-4 py-3 bg-gradient-to-br from-blue-500/15 to-teal-500/15 dark:from-blue-500/35 dark:to-teal-500/35 rounded-full font-medium items-center justify-center border border-teal-500 dark:border-teal-800 flex gap-2"
                >
                    {
                        (currentStep === steps.length - 1) 
                        ? 'Let\'s Go!'
                        : (<>
                            <span>Next</span>
                            <ChevronRight className="w-5 h-5" />
                        </>)
                    }
                </button>
            </div>
        </div>
      </div>
    </div>
  );
}