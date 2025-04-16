// src/components/profile-setup/Step1Personal.tsx - Temporarily disabled useEffect calling onUpdate (April 9, 2025)

import React, { useState, useEffect } from 'react';

// Define the expected props (passed from parent) - UPDATED
interface StepProps {
    onUpdate: (stepData: Partial<any>) => void;
    formData: any; // Full form data from parent (used for initial values)
    onNext: () => void;
    onBack: () => void;
}

// UPDATED: Destructure onUpdate, onNext, onBack from props
const Step1Personal: React.FC<StepProps> = ({ formData, onUpdate, onNext, onBack }) => {
    // --- Local State for Step 1 Fields --- (Remains the same)
    const [firstName, setFirstName] = useState(formData?.firstName || ''); // Added optional chaining for safety
    const [lastName, setLastName] = useState(formData?.lastName || '');
    const [cellphoneNumber, setCellphoneNumber] = useState(formData?.cellphoneNumber || '');
    const [isWhatsappSameAsCell, setIsWhatsappSameAsCell] = useState(formData?.isWhatsappSameAsCell ?? false);
    const [whatsappNumber, setWhatsappNumber] = useState(formData?.whatsappNumber || '');
    const [email, setEmail] = useState(formData?.email || '');
    const [idNumber, setIdNumber] = useState(formData?.idNumber || '');
    const [dateOfBirth, setDateOfBirth] = useState(formData?.dateOfBirth || '');
    const [homeLanguage, setHomeLanguage] = useState(formData?.homeLanguage || '');
    const [additionalLanguages, setAdditionalLanguages] = useState(formData?.additionalLanguages || '');
    const [gender, setGender] = useState(formData?.gender || '');
    const [visibleTattoos, setVisibleTattoos] = useState<'yes' | 'no' | ''>(formData?.visibleTattoos || '');
    const [ownTransport, setOwnTransport] = useState<'yes' | 'no' | ''>(formData?.ownTransport || '');
    const [disabilityStatus, setDisabilityStatus] = useState(formData?.disabilityStatus || 'prefer_not_to_say');
    const [personalBio, setPersonalBio] = useState(formData?.personalBio || '');
    const [profilePicFile, setProfilePicFile] = useState<File | null>(null);
    const [idDocFile, setIdDocFile] = useState<File | null>(null);

    // --- Logic --- (Remains the same)
    useEffect(() => {
        if (isWhatsappSameAsCell) {
            setWhatsappNumber(cellphoneNumber);
        }
    }, [isWhatsappSameAsCell, cellphoneNumber]);

    // --- Update Parent State --- (COMMENTED OUT TO PREVENT LOOP)
    /*
    useEffect(() => {
        onUpdate({
            firstName, lastName, cellphoneNumber, isWhatsappSameAsCell,
            whatsappNumber: isWhatsappSameAsCell ? cellphoneNumber : whatsappNumber,
            email, idNumber, dateOfBirth, homeLanguage, additionalLanguages,
            gender, visibleTattoos, ownTransport, disabilityStatus, personalBio,
            profilePicFileName: profilePicFile?.name || null,
            idDocFileName: idDocFile?.name || null,
        });
    }, [
        firstName, lastName, cellphoneNumber, isWhatsappSameAsCell, whatsappNumber, email,
        idNumber, dateOfBirth, homeLanguage, additionalLanguages, gender, visibleTattoos,
        ownTransport, disabilityStatus, personalBio, profilePicFile, idDocFile,
        onUpdate // Keep onUpdate here if uncommenting later AND using ESLint exhaustive-deps rule
    ]);
    */
    // --- --- --- --- --- --- --- --- --- --- --- --- --- --- ---

    // --- File Input Handler (Basic) --- (Remains the same)
    const handleFileChange = (setter: React.Dispatch<React.SetStateAction<File | null>>) => (e: React.ChangeEvent<HTMLInputElement>) => {
         if (e.target.files && e.target.files[0]) {
              setter(e.target.files[0]);
         } else {
              setter(null);
         }
    };

    // --- Render Component --- (JSX remains the same)
    return (
        <div>
            <h2 className="text-xl font-semibold mb-6 text-gray-700">Step 1: Personal Info</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
                {/* ... All input fields ... */}
                <div> <label htmlFor="firstName" className="block text-sm font-medium text-gray-700 mb-1">First Name(s) *</label> <input type="text" name="firstName" id="firstName" value={firstName} onChange={(e) => setFirstName(e.target.value)} required className="w-full input-class" /> </div>
                 <div> <label htmlFor="lastName" className="block text-sm font-medium text-gray-700 mb-1">Last Name *</label> <input type="text" name="lastName" id="lastName" value={lastName} onChange={(e) => setLastName(e.target.value)} required className="w-full input-class" /> </div>
                 <div> <label htmlFor="cellphoneNumber" className="block text-sm font-medium text-gray-700 mb-1">Cellphone Number *</label> <input type="tel" name="cellphoneNumber" id="cellphoneNumber" value={cellphoneNumber} onChange={(e) => setCellphoneNumber(e.target.value)} required placeholder="+27821234567" className="w-full input-class" /> </div>
                 <div> <label htmlFor="whatsappNumber" className="block text-sm font-medium text-gray-700 mb-1">WhatsApp Number *</label> <input type="tel" name="whatsappNumber" id="whatsappNumber" value={whatsappNumber} onChange={(e) => setWhatsappNumber(e.target.value)} required disabled={isWhatsappSameAsCell} placeholder="+27821234567" className={`w-full input-class ${isWhatsappSameAsCell ? 'bg-gray-100 cursor-not-allowed' : ''}`}/> <div className="mt-1"> <input type="checkbox" id="sameAsCell" name="isWhatsappSameAsCell" checked={isWhatsappSameAsCell} onChange={(e) => setIsWhatsappSameAsCell(e.target.checked)} className="mr-2 checkbox-class"/> <label htmlFor="sameAsCell" className="text-sm text-gray-600">Same as Cellphone Number</label> </div> </div>
                 <div className="md:col-span-2"> <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">Email Address *</label> <input type="email" name="email" id="email" value={email} onChange={(e) => setEmail(e.target.value)} required placeholder="your.email@example.com" className="w-full input-class" /> </div>
                 <div> <label htmlFor="idNumber" className="block text-sm font-medium text-gray-700 mb-1">SA ID Number *</label> <input type="text" name="idNumber" id="idNumber" value={idNumber} onChange={(e) => setIdNumber(e.target.value)} required maxLength={13} pattern="\d{13}" title="Enter a 13-digit SA ID number" className="w-full input-class" /> </div>
                 <div> <label htmlFor="dateOfBirth" className="block text-sm font-medium text-gray-700 mb-1">Date of Birth *</label> <input type="date" name="dateOfBirth" id="dateOfBirth" value={dateOfBirth} onChange={(e) => setDateOfBirth(e.target.value)} required className="w-full input-class" /> </div>
                 <div> <label htmlFor="homeLanguage" className="block text-sm font-medium text-gray-700 mb-1">Home Language *</label> <input type="text" name="homeLanguage" id="homeLanguage" value={homeLanguage} onChange={(e) => setHomeLanguage(e.target.value)} required className="w-full input-class" /> </div>
                 <div> <label htmlFor="additionalLanguages" className="block text-sm font-medium text-gray-700 mb-1">Other Languages</label> <input type="text" name="additionalLanguages" id="additionalLanguages" value={additionalLanguages} onChange={(e) => setAdditionalLanguages(e.target.value)} placeholder="e.g., Zulu, Sotho" className="w-full input-class" /> </div>
                 <div> <label htmlFor="gender" className="block text-sm font-medium text-gray-700 mb-1">Gender *</label> <select name="gender" id="gender" value={gender} onChange={(e) => setGender(e.target.value)} required className="w-full select-class"> <option value="" disabled>Select...</option> <option value="male">Male</option> <option value="female">Female</option> <option value="other">Other</option> <option value="prefer_not_to_say">Prefer not to say</option> </select> </div>
                 <div> <label htmlFor="disabilityStatus" className="block text-sm font-medium text-gray-700 mb-1">Disability Status (Voluntary)</label> <select name="disabilityStatus" id="disabilityStatus" value={disabilityStatus} onChange={(e) => setDisabilityStatus(e.target.value)} className="w-full select-class"> <option value="prefer_not_to_say">Prefer not to say</option> <option value="yes">Yes</option> <option value="no">No</option> </select> <small className="text-xs text-gray-500">Disclosure is voluntary.</small> </div>
                 <div className="md:col-span-1 flex flex-col justify-center"> <label className="block text-sm font-medium text-gray-700 mb-1">Visible Tattoos? *</label> <div className="flex items-center space-x-4 mt-1"> <label htmlFor="tattoos-yes" className="inline-flex items-center"><input type="radio" id="tattoos-yes" name="visibleTattoos" value="yes" checked={visibleTattoos === 'yes'} onChange={(e) => setVisibleTattoos(e.target.value as 'yes')} required className="radio-class"/> <span className="ml-2 text-sm">Yes</span></label> <label htmlFor="tattoos-no" className="inline-flex items-center"><input type="radio" id="tattoos-no" name="visibleTattoos" value="no" checked={visibleTattoos === 'no'} onChange={(e) => setVisibleTattoos(e.target.value as 'no')} required className="radio-class"/> <span className="ml-2 text-sm">No</span></label> </div> </div>
                 <div className="md:col-span-1 flex flex-col justify-center"> <label className="block text-sm font-medium text-gray-700 mb-1">Reliable Own Transport? *</label> <div className="flex items-center space-x-4 mt-1"> <label htmlFor="transport-yes" className="inline-flex items-center"><input type="radio" id="transport-yes" name="ownTransport" value="yes" checked={ownTransport === 'yes'} onChange={(e) => setOwnTransport(e.target.value as 'yes')} required className="radio-class"/> <span className="ml-2 text-sm">Yes</span></label> <label htmlFor="transport-no" className="inline-flex items-center"><input type="radio" id="transport-no" name="ownTransport" value="no" checked={ownTransport === 'no'} onChange={(e) => setOwnTransport(e.target.value as 'no')} required className="radio-class"/> <span className="ml-2 text-sm">No</span></label> </div> </div>
                 <div className="md:col-span-2"> <label htmlFor="personalBio" className="block text-sm font-medium text-gray-700 mb-1">Personal Biography (Optional)</label> <textarea name="personalBio" id="personalBio" value={personalBio} onChange={(e) => setPersonalBio(e.target.value)} rows={4} className="w-full textarea-class" placeholder="Tell us briefly about your experience..."></textarea> </div>
                 <div className="md:col-span-2"> <label htmlFor="profilePic" className="block text-sm font-medium text-gray-700 mb-1">Profile Picture *</label> <input type="file" name="profilePic" id="profilePic" accept="image/png, image/jpeg" onChange={handleFileChange(setProfilePicFile)} required className="w-full file-input-class"/> <small className="text-xs text-gray-500">Required. Clear headshot. PNG or JPG.</small> {profilePicFile && <p className="text-xs text-green-600 mt-1">Selected: {profilePicFile.name}</p>} </div>
                 <div className="md:col-span-2"> <label htmlFor="idDoc" className="block text-sm font-medium text-gray-700 mb-1">SA ID Document Upload *</label> <input type="file" name="idDoc" id="idDoc" accept="application/pdf, image/png, image/jpeg" onChange={handleFileChange(setIdDocFile)} required className="w-full file-input-class"/> <small className="text-xs text-gray-500">Required. Clear copy. PDF, PNG, or JPG.</small> {idDocFile && <p className="text-xs text-green-600 mt-1">Selected: {idDocFile.name}</p>} </div>
            </div>
            {/* Helper CSS */}
            <style>{` .input-class, .select-class, .textarea-class { padding: 0.5rem 0.75rem; border: 1px solid #D1D5DB; border-radius: 0.375rem; box-shadow: inset 0 1px 2px rgba(0,0,0,0.075); transition: border-color 0.15s ease-in-out, box-shadow 0.15s ease-in-out; } .input-class:focus, .select-class:focus, .textarea-class:focus { outline: none; border-color: #4f46e5; /* indigo-600 */ box-shadow: 0 0 0 1px #4f46e5; } .radio-class { color: #4f46e5; /* indigo-600 */ } .checkbox-class { border-radius: 0.25rem; border-color: #D1D5DB; } .file-input-class { text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100 cursor-pointer} `}</style>
        </div>
    );
};
export default Step1Personal;