// src/pages/CandidateProfileSetup.tsx - Added useCallback for updateFormData (April 9, 2025)

// Import useCallback from React
import React, { useState, useCallback } from 'react';
// import { useNavigate } from 'react-router-dom'; // Commented out - unused for now

// --- Original Import Paths ---
import Step1Personal from '../components/profile-setup/Step1Personal';
import Step2Residential from '../components/profile-setup/Step2Residential';
import Step3Banking from '../components/profile-setup/Step3Banking';
import Step4Employment from '../components/profile-setup/Step4Employment';
import Step5Qualifications from '../components/profile-setup/Step5Qualifications'; // Ensure this path is correct
import Step6Firearm from '../components/profile-setup/Step6Firearm';
import Step7Assessments from '../components/profile-setup/Step7Assessments';

// Define type for form data
type FormData = any;

function CandidateProfileSetup() {
    const [currentStep, setCurrentStep] = useState<number>(5); // Keep at step 5 for testing
    const [formData, setFormData] = useState<FormData>({});
    // const navigate = useNavigate();
    const totalSteps = 7;

    // --- Wrap updateFormData in useCallback ---
    const updateFormData = useCallback((stepData: Partial<FormData>) => {
        setFormData((prevData: FormData) => {
            const newData = { ...prevData, ...stepData };
            console.log("Updating Form Data:", newData); // Keep log for verification
            return newData;
        });
    }, []); // Empty dependency array means this function reference is stable
    // --- --- --- --- --- --- --- --- --- ---

    // --- Navigation ---
    // NOTE: It's also good practice to wrap nextStep and prevStep in useCallback
    // if they were ever used as dependencies in child useEffects, but it's less
    // critical for solving the current infinite loop issue caused by updateFormData.
    const nextStep = () => {
        console.log(`Proceeding from step ${currentStep}`);
        if (currentStep < totalSteps) {
            setCurrentStep(prevStep => prevStep + 1);
        } else {
            handleFinish();
        }
    };

    const prevStep = () => {
        if (currentStep > 1) {
            setCurrentStep(prevStep => prevStep - 1);
        }
    };

    const handleFinish = () => {
        console.log("Attempting to finish setup with data:", formData);
        alert("Profile Setup Complete! (Implement save & redirect)");
        // navigate('/dashboard');
    };

    // --- Render the current step component ---
    const renderStepComponent = () => {
        // stepProps definition remains the same, but updateFormData passed to onUpdate is now memoized
        const stepProps = {
            formData: formData,
            onUpdate: updateFormData, // Pass the memoized function reference
            onNext: nextStep,
            onBack: prevStep
        };

        switch (currentStep) {
            case 1: return <Step1Personal {...stepProps} />;
            case 2: return <Step2Residential {...stepProps} />;
            case 3: return <Step3Banking {...stepProps} />;
            case 4: return <Step4Employment {...stepProps} />;
            case 5: return <Step5Qualifications {...stepProps} />;
            case 6: return <Step6Firearm {...stepProps} />;
            case 7: return <Step7Assessments {...stepProps} />;
            default: return <p>Error: Unknown step.</p>;
        }
    };

    // --- JSX --- (Remains the same)
    return (
        <div className="container mx-auto p-4 sm:p-6 lg:p-8 max-w-3xl">
            <h1 className="text-2xl font-bold mb-4 text-center">Complete Your Candidate Profile</h1>
            <p className="text-center text-gray-600 mb-6">Please complete all steps to activate your profile.</p>
            <div className="mb-6 text-center text-sm font-medium text-gray-700">
                Step {currentStep} of {totalSteps}
            </div>
            <div className="p-6 border rounded-lg shadow-md bg-white mb-6 min-h-[250px] flex flex-col justify-center">
                {renderStepComponent()}
            </div>
            <div className="flex justify-between items-center mt-6">
                <button onClick={prevStep} disabled={currentStep === 1} className="bg-gray-500 hover:bg-gray-600 text-white font-bold py-2 px-5 rounded disabled:opacity-50 disabled:cursor-not-allowed transition duration-150 ease-in-out">
                    Previous
                </button>
                <button onClick={nextStep} className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-5 rounded transition duration-150 ease-in-out">
                    {currentStep === totalSteps ? 'Finish Setup' : 'Next Step'}
                </button>
            </div>
        </div>
    );
}

export default CandidateProfileSetup;