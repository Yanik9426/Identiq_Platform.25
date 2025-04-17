// src/components/profile-setup/Step3Banking.tsx - Removed unused useEffect import

import React, { useState } from 'react'; // <--- Removed useEffect here

// Define the expected props
interface StepProps {
    onUpdate: (stepData: Partial<any>) => void;
    formData: any;
    onNext: () => void;
    onBack: () => void;
}

const Step3Banking = ({ formData, onUpdate, onNext, onBack }: StepProps): JSX.Element => {
    // --- Local State for Step 3 Files --- (Added optional chaining for safety)
    // Note: We store the File object locally, but only send filename to parent via onUpdate usually
    const [proofOfBankFile, setProofOfBankFile] = useState<File | null>(null);
    const [sarsLetterFile, setSarsLetterFile] = useState<File | null>(null);

    // --- Update Parent State via Prop --- (COMMENTED OUT TO PREVENT LOOP)
    /*
    useEffect(() => {
        // If uncommented, consider if this needs to run every time a file changes,
        // or only on specific actions like 'Save' or 'Next'.
        // Passing file objects directly in formData across steps can be problematic.
        onUpdate({
            proofOfBankFileName: proofOfBankFile?.name || null,
            sarsLetterFileName: sarsLetterFile?.name || null,
        });
    }, [
        proofOfBankFile, sarsLetterFile,
        onUpdate // Keep onUpdate here if uncommenting later AND using ESLint exhaustive-deps rule
    ]);
    */
    // --- --- --- --- --- --- --- --- --- --- --- --- --- --- ---

    // --- File Input Handler --- (Remains the same)
    const handleFileChange = (setter: React.Dispatch<React.SetStateAction<File | null>>) => (e: React.ChangeEvent<HTMLInputElement>) => {
         if (e.target.files && e.target.files[0]) {
             setter(e.target.files[0]);
             // console.log("Selected file:", e.target.files[0].name); // Optional log
         } else {
             setter(null);
         }
    };

    // --- Render Component --- (JSX remains the same)
    return (
        <div>
            <h2 className="text-xl font-semibold mb-6 text-gray-700">Step 3: Banking & Tax Info</h2>
            <p className="text-sm text-gray-500 mb-6">
                Please upload the required documents below. For your security, we do not ask for your account number directly on this form.
            </p>
            <div className="space-y-6">

                {/* Proof of Bank Account Upload */}
                <div>
                    <label htmlFor="proofOfBankFile" className="block text-sm font-medium text-gray-700 mb-1">Proof of Bank Account *</label>
                    <input
                        type="file"
                        name="proofOfBankFile"
                        id="proofOfBankFile"
                        accept="application/pdf, image/png, image/jpeg"
                        onChange={handleFileChange(setProofOfBankFile)}
                        required
                        className="w-full file-input-class"
                    />
                     <small className="text-xs text-gray-500">Required. Bank statement or letter confirming account (PDF, PNG, JPG).</small>
                     {proofOfBankFile && <p className="text-xs text-green-600 mt-1">Selected: {proofOfBankFile.name}</p>}
                </div>

                {/* SARS Letter Upload */}
                 <div>
                    <label htmlFor="sarsLetterFile" className="block text-sm font-medium text-gray-700 mb-1">SARS Document (Proof of Tax Number) *</label> {/* Updated Label slightly */}
                    <input
                        type="file"
                        name="sarsLetterFile"
                        id="sarsLetterFile"
                        accept="application/pdf, image/png, image/jpeg"
                        onChange={handleFileChange(setSarsLetterFile)}
                        required
                        className="w-full file-input-class"
                    />
                     {/* Updated description slightly */}
                     <small className="text-xs text-gray-500">Required. Document showing your name and Income Tax number. PDF, PNG, JPG.</small>
                     {sarsLetterFile && <p className="text-xs text-green-600 mt-1">Selected: {sarsLetterFile.name}</p>}
                </div>

            </div>
             {/* Helper CSS */}
             <style>{` .input-class, .select-class, .textarea-class { padding: 0.5rem 0.75rem; border: 1px solid #D1D5DB; border-radius: 0.375rem; box-shadow: inset 0 1px 2px rgba(0,0,0,0.075); transition: border-color 0.15s ease-in-out, box-shadow 0.15s ease-in-out; } .input-class:focus, .select-class:focus, .textarea-class:focus { outline: none; border-color: #4f46e5; box-shadow: 0 0 0 1px #4f46e5; } .radio-class { color: #4f46e5; } .checkbox-class { border-radius: 0.25rem; border-color: #D1D5DB; } .file-input-class { text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100 cursor-pointer} `}</style>
        </div>
    );
};
export default Step3Banking;