// src/components/profile-setup/Step7Assessments.tsx

import React from 'react';

// Base Props Interface for Step 7 Data (May not be needed for this specific page, but good practice)
interface Step7FormData {
  // Add any data relevant to Step 7 overall if needed in the future
}

interface Step7AssessmentsProps {
  formData: Step7FormData; // Keep for consistency, might use later
  onUpdate: (data: Partial<Step7FormData>) => void; // Keep for consistency
  onNext: () => void; // Function to proceed to the first assessment
  onBack: () => void; // Function to go back to Step 6
}

// --- Component ---
const Step7Assessments: React.FC<Step7AssessmentsProps> = ({
  formData, onUpdate, onBack, onNext,
}) => {

  // No specific state needed for this introductory page itself

  // --- Render Functions ---
  // No complex render functions needed, content is directly in the main return

  // --- Main Component Return ---
  return (
    <div>
      {/* Congratulations Message */}
      <div className="pb-6 text-center border-b border-gray-200 mb-6">
        <h2 className="text-2xl font-semibold text-green-600 mb-2">Congratulations!</h2>
        <p className="text-lg text-gray-700">
          You have successfully completed the main sections of your Identiq profile.
        </p>
      </div>

      {/* Assessment Overview Box */}
      <div className="p-6 border rounded-md shadow-sm bg-white mb-8">
        <h3 className="text-xl font-semibold leading-6 text-gray-900 mb-4">Next Step: Candidate Self-Assessments</h3>

        <div className="space-y-4 text-sm text-gray-700">
          <p>
            You are now ready to begin the Candidate Self-Assessments (CSA). These assessments are designed to help showcase your knowledge and skills relevant to the private security industry in South Africa.
          </p>
          <p>
            <span className="font-medium">How it works:</span> You will be presented with a series of assessments covering various topics. Many questions will be multiple-choice or True/False. Please read each question carefully. Some sections may be timed.
          </p>
          <p>
            <span className="font-medium">Why complete these assessments?</span> Successfully completing these assessments adds significant value and credibility to your profile. It demonstrates your understanding and competency to potential employers, helping you stand out in the recruitment process. Your results contribute to an overall profile score that companies can see.
          </p>
          <p>
            <span className="font-medium">Mandatory Requirement:</span> Completing the initial set of assessments is a required step to fully activate the visibility of your profile to potential employers on the Identiq platform.
          </p>
          <p>
            <span className="font-medium">Reviewing Results:</span> Upon completion, you will be able to review your assessment scores and a detailed breakdown directly within your Candidate Administration Portal.
          </p>
          <p>
            <span className="font-medium">Retake Option:</span> Should you wish to improve your scores, you will have the option to retake assessments after a 30-day cooldown period.
          </p>
        </div>
      </div>

      {/* Navigation / Start Button */}
      <div className="flex justify-between pt-6 mt-8 border-t border-gray-200">
        <button
          type="button"
          onClick={onBack}
          className="px-6 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
          Back
        </button>
        <button
          type="button"
          onClick={onNext} // This triggers the function to move to the actual first assessment
          className="px-6 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
        >
          Start Assessments
        </button>
      </div>
    </div>
  );
};

export default Step7Assessments;