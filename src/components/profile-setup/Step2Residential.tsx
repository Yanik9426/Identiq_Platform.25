// src/components/profile-setup/Step2Residential.tsx - Removed unused useEffect import

import React, { useState } from 'react'; // <--- Removed useEffect here

// Define the expected props - UPDATED
interface StepProps {
    onUpdate: (stepData: Partial<any>) => void;
    formData: any;
    onNext: () => void;
    onBack: () => void;
}

// UPDATED: Destructure onUpdate, onNext, onBack from props
const Step2Residential = ({ formData, onUpdate, onNext, onBack }: StepProps): JSX.Element => {
    // --- Local State --- (Added optional chaining for safety)
    const [addressLine1, setAddressLine1] = useState(formData?.addressLine1 || '');
    const [addressLine2, setAddressLine2] = useState(formData?.addressLine2 || '');
    const [suburb, setSuburb] = useState(formData?.suburb || '');
    const [city, setCity] = useState(formData?.city || '');
    const [province, setProvince] = useState(formData?.province || '');
    const [postalCode, setPostalCode] = useState(formData?.postalCode || '');

    // --- Update Parent State via Prop --- (COMMENTED OUT TO PREVENT LOOP)
    /*
    useEffect(() => {
        onUpdate({
            addressLine1,
            addressLine2,
            suburb,
            city,
            province,
            postalCode,
        });
    }, [
        addressLine1, addressLine2, suburb, city, province, postalCode,
        onUpdate // Keep onUpdate here if uncommenting later AND using ESLint exhaustive-deps rule
    ]);
    */
    // --- --- --- --- --- --- --- --- --- --- --- --- --- --- ---

    // --- Render Component --- (JSX remains the same)
    return (
        <div>
            <h2 className="text-xl font-semibold mb-6 text-gray-700">Step 2: Residential Address</h2>
            <p className="text-sm text-gray-500 mb-4">
                Please provide your current physical residential address. Mapbox integration will be added later.
            </p>
            <div className="space-y-4">
                {/* Address Line 1 */}
                <div> <label htmlFor="addressLine1" className="block text-sm font-medium text-gray-700 mb-1">Street Address *</label> <input type="text" name="addressLine1" id="addressLine1" value={addressLine1} onChange={(e) => setAddressLine1(e.target.value)} required placeholder="e.g., 123 Main Street" className="w-full input-class" /> </div>
                {/* Address Line 2 */}
                <div> <label htmlFor="addressLine2" className="block text-sm font-medium text-gray-700 mb-1">Apartment, Suite, etc. (Optional)</label> <input type="text" name="addressLine2" id="addressLine2" value={addressLine2} onChange={(e) => setAddressLine2(e.target.value)} placeholder="e.g., Apartment 4B" className="w-full input-class" /> </div>
                {/* Suburb */}
                <div> <label htmlFor="suburb" className="block text-sm font-medium text-gray-700 mb-1">Suburb *</label> <input type="text" name="suburb" id="suburb" value={suburb} onChange={(e) => setSuburb(e.target.value)} required className="w-full input-class" /> </div>
                {/* City */}
                <div> <label htmlFor="city" className="block text-sm font-medium text-gray-700 mb-1">City *</label> <input type="text" name="city" id="city" value={city} onChange={(e) => setCity(e.target.value)} required className="w-full input-class" /> </div>
                {/* Province */}
                <div> <label htmlFor="province" className="block text-sm font-medium text-gray-700 mb-1">Province *</label> <input type="text" name="province" id="province" value={province} onChange={(e) => setProvince(e.target.value)} required placeholder="e.g., Gauteng" className="w-full input-class" /> </div>
                {/* Postal Code */}
                <div> <label htmlFor="postalCode" className="block text-sm font-medium text-gray-700 mb-1">Postal Code *</label> <input type="text" name="postalCode" id="postalCode" value={postalCode} onChange={(e) => setPostalCode(e.target.value)} required maxLength={4} pattern="\d{4}" title="Enter a 4-digit postal code" className="w-full input-class" /> </div>
            </div>
            {/* Helper CSS */}
            <style>{` .input-class, .select-class, .textarea-class { padding: 0.5rem 0.75rem; border: 1px solid #D1D5DB; border-radius: 0.375rem; box-shadow: inset 0 1px 2px rgba(0,0,0,0.075); transition: border-color 0.15s ease-in-out, box-shadow 0.15s ease-in-out; } .input-class:focus, .select-class:focus, .textarea-class:focus { outline: none; border-color: #4f46e5; box-shadow: 0 0 0 1px #4f46e5; } .radio-class { color: #4f46e5; } .checkbox-class { border-radius: 0.25rem; border-color: #D1D5DB; } .file-input-class { text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100 cursor-pointer} `}</style>
        </div>
    );
};
export default Step2Residential;