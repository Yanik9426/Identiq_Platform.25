// src/components/profile-setup/Step4Employment.tsx - Attempting span wrap workaround for TS2786
import React, { useState, useEffect } from 'react';
import { FaTrash, FaTimes } from 'react-icons/fa';

// Define the expected props
interface StepProps {
  onUpdate: (stepData: Partial<any>) => void;
  formData: any;
  onNext: () => void;
  onBack: () => void;
}

// Define structure for a single job entry
interface JobEntry {
  id: number;
  companyName: string;
  startDate: string;
  endDate: string; // Can be 'Present'
  position: string;
  employmentType: 'short-term' | 'long-term' | 'contractual' | '';
  refName: string;
  refNumber: string;
}

// Finalized list of experience fields
const experienceFields = [
  "Anti-poaching", "Armed Reaction", "Aviation Security", "Cash In Transit",
  "Close Protection Officer", "Control Room Operator", "Guarding (Diplomatic)",
  "Guarding (Residential)", "Guarding (Retail)", "High Value Escorts",
  "Investigations / Surveillance", "Maritime Security", "Risk Assessment / Consulting",
  "Sales / Business Development", "Security Driver", "Security Management",
  "Security Supervisor", "Security Team Leader", "Security Technician",
  "Security Training / Instruction", "Special Events", "Strikes and Riot",
  "Tac-Medical", "Vehicle Tracking and Recovery"
].sort();

// Define work type options
const workTypeOptions = ['Permanent', 'Part-time', 'Contractual'];
// Define employment type options for job history
const employmentTypeOptions: JobEntry['employmentType'][] = ['short-term', 'long-term', 'contractual'];

const Step4Employment = ({ formData, onUpdate, onNext, onBack }: StepProps): JSX.Element => {
  // --- State ---
  const [hasExperience, setHasExperience] = useState<'yes' | 'no' | ''>(formData?.hasExperience || '');
  const [warningAccepted, setWarningAccepted] = useState<boolean>(formData?.employmentWarningAccepted || false);
  const [yearsExperience, setYearsExperience] = useState<string>(formData?.yearsExperience || '');
  const [selectedFields, setSelectedFields] = useState<string[]>(formData?.fieldsOfExperience || []);
  const [interestedFields, setInterestedFields] = useState<string[]>(formData?.interestedFields || []);
  const [workTypePreference, setWorkTypePreference] = useState<string[]>(formData?.workTypePreference || []);

  // State for current job entry form
  const [currentCompanyName, setCurrentCompanyName] = useState('');
  const [currentStartDate, setCurrentStartDate] = useState('');
  const [currentEndDate, setCurrentEndDate] = useState('');
  const [isCurrentJob, setIsCurrentJob] = useState(false);
  const [currentPosition, setCurrentPosition] = useState('');
  const [currentEmploymentType, setCurrentEmploymentType] = useState<JobEntry['employmentType']>('');
  const [currentRefName, setCurrentRefName] = useState('');
  const [currentRefNumber, setCurrentRefNumber] = useState('');
  const [employmentHistory, setEmploymentHistory] = useState<JobEntry[]>(formData?.employmentHistory || []);
  const [jobEntryError, setJobEntryError] = useState('');

  const [showWarningModal, setShowWarningModal] = useState<boolean>(false);

  // --- Effects ---
  // Show warning modal if needed
  useEffect(() => {
    if (hasExperience === 'yes' && !warningAccepted) {
      setShowWarningModal(true);
    } else {
      setShowWarningModal(false);
    }
  }, [hasExperience, warningAccepted]);

  // Handle 'Present' end date toggle - FIXED DEPENDENCIES
  useEffect(() => {
    if (isCurrentJob) {
      if (currentEndDate !== 'Present') {
         setCurrentEndDate('Present');
      }
    } else {
      if (currentEndDate === 'Present') {
        setCurrentEndDate('');
      }
    }
  }, [isCurrentJob, currentEndDate]);

  // --- Update Parent State ---
  useEffect(() => {
    console.log("Step 4: Updating parent state");
    onUpdate({
      hasExperience,
      employmentWarningAccepted: warningAccepted,
      yearsExperience: hasExperience === 'yes' ? yearsExperience : undefined,
      fieldsOfExperience: hasExperience === 'yes' ? selectedFields : undefined,
      employmentHistory: hasExperience === 'yes' ? employmentHistory : undefined,
      interestedFields: hasExperience === 'yes' ? interestedFields : undefined,
      workTypePreference: hasExperience === 'yes' ? workTypePreference : undefined,
    });
  }, [
      hasExperience, warningAccepted, yearsExperience, selectedFields,
      employmentHistory, interestedFields, workTypePreference, onUpdate
  ]);
  // --- --- --- --- --- --- --- --- --- --- --- --- --- ---

  // --- Handlers ---
  const handleAcceptWarning = () => {
    setWarningAccepted(true);
    setShowWarningModal(false);
  };

  const handleHasExperienceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value as 'yes' | 'no';
    setHasExperience(value);
    if (value === 'no') {
        setWarningAccepted(false);
        setYearsExperience('');
        setSelectedFields([]);
        setEmploymentHistory([]);
        setInterestedFields([]);
        setWorkTypePreference([]);
    }
  };

  const handleFieldCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { value, checked } = e.target;
    setSelectedFields(prev =>
      checked ? [...prev, value] : prev.filter(f => f !== value)
    );
  };

  const handleRemoveTag = (fieldToRemove: string, stateSetter: React.Dispatch<React.SetStateAction<string[]>>) => {
    stateSetter(prev => prev.filter(field => field !== fieldToRemove));
  };

  const handleAddExperience = () => {
    console.log("--- handleAddExperience triggered ---");
    setJobEntryError('');
    const trimmedCompany = currentCompanyName.trim();
    const trimmedPosition = currentPosition.trim();
    const trimmedRefName = currentRefName.trim();
    const trimmedRefNumber = currentRefNumber.trim();
    const effectiveEndDate = isCurrentJob ? 'Present' : currentEndDate.trim();

    if (!trimmedCompany || !currentStartDate || !effectiveEndDate || !trimmedPosition || !currentEmploymentType || !trimmedRefName || !trimmedRefNumber) {
        setJobEntryError('Please complete all required fields (*) for this job entry before adding.');
        return;
    }
    try {
        const newJobEntry: JobEntry = {
            id: Date.now(), companyName: trimmedCompany, startDate: currentStartDate,
            endDate: effectiveEndDate, position: trimmedPosition, employmentType: currentEmploymentType,
            refName: trimmedRefName, refNumber: trimmedRefNumber,
        };
        setEmploymentHistory(prev => [...prev, newJobEntry]);
        setCurrentCompanyName(''); setCurrentStartDate(''); setCurrentEndDate('');
        setIsCurrentJob(false); setCurrentPosition(''); setCurrentEmploymentType('');
        setCurrentRefName(''); setCurrentRefNumber('');
    } catch (error) {
        console.error("Error adding job entry:", error);
        setJobEntryError("An error occurred adding the job entry.");
    }
  };

  const handleRemoveExperience = (idToRemove: number) => {
    setEmploymentHistory(prev => prev.filter(job => job.id !== idToRemove));
  };

  const handleInterestClick = (field: string) => {
    setInterestedFields(prev =>
      prev.includes(field) ? prev.filter(f => f !== field) : [...prev, field]
    );
  };

  const handleWorkTypeChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { value, checked } = event.target;
    setWorkTypePreference(prev =>
      checked ? [...prev, value] : prev.filter(type => type !== value)
    );
  };

  // --- Render Sub-Components ---
  const renderWarningModal = () => (
    <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '1rem' }}>
      <div style={{ background: 'white', padding: '2rem', borderRadius: '8px', maxWidth: '500px', textAlign: 'center', margin: '1rem', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}>
        <h3 style={{ fontSize: '1.25rem', fontWeight: 'bold', marginBottom: '1rem', color: '#DC2626' }}>Important: Employment History Accuracy</h3>
        <p style={{ marginBottom: '1.5rem', color: '#374151', lineHeight: 1.6 }}>
          Please ensure all employment history details provided are truthful and verifiable. Identiq performs routine verification checks. Submission of inaccurate or misleading information may lead to the permanent suspension of your account and restriction from future use of the Identiq platform.
        </p>
        <button onClick={handleAcceptWarning} style={{ padding: '0.6rem 1.5rem', backgroundColor: '#007bff', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '1rem' }}>
          Acknowledge & Continue
        </button>
      </div>
    </div>
  );

  // Helper to render tag lists
  const renderTagList = (tags: string[], onRemove: (tag: string, setter: React.Dispatch<React.SetStateAction<string[]>>) => void, setter: React.Dispatch<React.SetStateAction<string[]>>) => (
    <div className="flex flex-wrap gap-2 mt-2">
      {tags.map(tag => (
        <span key={tag} className="bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-0.5 rounded-full inline-flex items-center">
          {tag}
          <button onClick={() => onRemove(tag, setter)} className="ml-1.5 text-blue-500 hover:text-blue-700">
            <span>{FaTimes({ size: "0.8em" })}</span>
          </button>
        </span>
      ))}
    </div>
  );

  // --- Render Component ---
  return (
    <div className="space-y-8">
      {showWarningModal && renderWarningModal()}

      <h2 className="text-xl font-semibold text-gray-700">Step 4: Employment History & Preferences</h2>

      {/* Has Experience Radio Buttons */}
      <div className="border-b border-gray-200 pb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">Do you have previous experience in the Security Industry or related fields? *</label>
        <div className="flex items-center space-x-6">
          {/* ... Radio button Yes ... */}
          <label htmlFor="exp-yes" className="inline-flex items-center cursor-pointer">
            <input type="radio" id="exp-yes" name="hasExperience" value="yes" checked={hasExperience === 'yes'} onChange={handleHasExperienceChange} required className="form-radio h-4 w-4 text-indigo-600 border-gray-300 focus:ring-indigo-500" />
            <span className="ml-2 text-sm text-gray-700">Yes</span>
          </label>
          {/* ... Radio button No ... */}
          <label htmlFor="exp-no" className="inline-flex items-center cursor-pointer">
            <input type="radio" id="exp-no" name="hasExperience" value="no" checked={hasExperience === 'no'} onChange={handleHasExperienceChange} required className="form-radio h-4 w-4 text-indigo-600 border-gray-300 focus:ring-indigo-500" />
            <span className="ml-2 text-sm text-gray-700">No</span>
          </label>
        </div>
      </div>

      {/* === CONDITIONAL BLOCK FOR 'YES' === */}
      {hasExperience === 'yes' && warningAccepted && (
        <div className="space-y-8 animate-fade-in pt-4 border-t border-gray-200">

          {/* Years of Experience */}
          <div className="col-span-6 sm:col-span-3">
            <label htmlFor="yearsExperience" className="block text-sm font-medium text-gray-700">Total Years of Experience *</label>
            <select id="yearsExperience" name="yearsExperience" value={yearsExperience} onChange={(e) => setYearsExperience(e.target.value)} className="mt-1 block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" required>
              <option value="">Select years...</option>
              <option value="0-1">0 - 1 Year</option>
              <option value="1-2">1 - 2 Years</option>
              <option value="2-3">2 - 3 Years</option>
              <option value="3-4">3 - 4 Years</option>
              <option value="4-5">4 - 5 Years</option>
              <option value="5+">5+ Years</option>
            </select>
          </div>

          {/* Fields of Experience (Checkboxes) */}
          <div>
            <label className="block text-sm font-medium text-gray-700">Fields of Experience * (Select all that apply)</label>
            <div className="mt-2 space-y-2 max-h-60 overflow-y-auto border border-gray-200 rounded-md p-4">
              {experienceFields.map((field) => (
                <label key={field} className="flex items-center">
                  <input type="checkbox" value={field} checked={selectedFields.includes(field)} onChange={handleFieldCheckboxChange} className="form-checkbox h-4 w-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500" />
                  <span className="ml-3 text-sm text-gray-700">{field}</span>
                </label>
              ))}
            </div>
             {selectedFields.length > 0 && (
                 <div className="mt-3">
                    <h4 className="text-xs font-medium text-gray-500 mb-1">Selected:</h4>
                    {renderTagList(selectedFields, handleRemoveTag, setSelectedFields)}
                 </div>
             )}
          </div>

          {/* Employment History Section */}
          <div className="space-y-6">
            <h3 className="text-lg font-medium leading-6 text-gray-900">Employment History *</h3>
            {/* Display Existing Job Entries */}
            <div className="space-y-4">
              {employmentHistory.length === 0 && ( <p className="text-sm text-gray-500">No employment history added yet.</p> )}
              {employmentHistory.map((job) => (
                <div key={job.id} className="p-4 border rounded-md bg-gray-50 relative">
                  <button type="button" onClick={() => handleRemoveExperience(job.id)} className="absolute top-2 right-2 text-red-500 hover:text-red-700" aria-label={`Remove job at ${job.companyName}`} >
                    <span>{FaTrash({ size: "1em" })}</span>
                  </button>
                  <p className="font-medium text-gray-800">{job.position} at {job.companyName}</p>
                  <p className="text-sm text-gray-600">Dates: {job.startDate} to {job.endDate}</p>
                  <p className="text-sm text-gray-600">Type: {job.employmentType}</p>
                  <p className="text-sm text-gray-600">Reference: {job.refName} ({job.refNumber})</p>
                </div>
              ))}
            </div>

            {/* Form to Add New Job Entry */}
            <div className="p-4 border border-gray-300 rounded-md space-y-4 bg-white">
               <h4 className="font-medium text-gray-800">Add Job Entry</h4>
                {jobEntryError && <p className="text-sm text-red-600 bg-red-100 p-2 rounded">{jobEntryError}</p>}
               <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                 {/* ... Input fields for Job Entry ... */}
                 <div>
                   <label htmlFor="currentCompanyName" className="block text-sm font-medium text-gray-700">Company Name*</label>
                   <input type="text" id="currentCompanyName" value={currentCompanyName} onChange={(e) => setCurrentCompanyName(e.target.value)} className="mt-1 block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" required />
                 </div>
                 <div>
                   <label htmlFor="currentPosition" className="block text-sm font-medium text-gray-700">Position Held*</label>
                   <input type="text" id="currentPosition" value={currentPosition} onChange={(e) => setCurrentPosition(e.target.value)} className="mt-1 block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" required />
                 </div>
                 <div>
                   <label htmlFor="currentStartDate" className="block text-sm font-medium text-gray-700">Start Date*</label>
                   <input type="date" id="currentStartDate" value={currentStartDate} onChange={(e) => setCurrentStartDate(e.target.value)} className="mt-1 block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" required />
                 </div>
                 <div className="relative">
                    <label htmlFor="currentEndDate" className="block text-sm font-medium text-gray-700">End Date*</label>
                    <input type="date" id="currentEndDate" value={isCurrentJob ? '' : currentEndDate} onChange={(e) => setCurrentEndDate(e.target.value)} className={`mt-1 block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm ${isCurrentJob ? 'bg-gray-200' : ''}`} disabled={isCurrentJob} required={!isCurrentJob} />
                    <div className="absolute inset-y-0 right-0 top-5 pr-3 flex items-center">
                      <input id="isCurrentJob" type="checkbox" checked={isCurrentJob} onChange={(e) => setIsCurrentJob(e.target.checked)} className="h-4 w-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500" />
                      <label htmlFor="isCurrentJob" className="ml-2 block text-sm text-gray-900"> Present </label>
                    </div>
                 </div>
                 <div>
                   <label htmlFor="currentEmploymentType" className="block text-sm font-medium text-gray-700">Employment Type*</label>
                   <select id="currentEmploymentType" value={currentEmploymentType} onChange={(e) => setCurrentEmploymentType(e.target.value as JobEntry['employmentType'])} className="mt-1 block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" required>
                     <option value="">Select type...</option>
                     {employmentTypeOptions.map(type => <option key={type} value={type}>{type.charAt(0).toUpperCase() + type.slice(1)}</option>)}
                   </select>
                 </div>
                 <div>
                   <label htmlFor="currentRefName" className="block text-sm font-medium text-gray-700">Reference Name*</label>
                   <input type="text" id="currentRefName" value={currentRefName} onChange={(e) => setCurrentRefName(e.target.value)} className="mt-1 block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" required />
                 </div>
                 <div>
                   <label htmlFor="currentRefNumber" className="block text-sm font-medium text-gray-700">Reference Contact Number*</label>
                   <input type="tel" id="currentRefNumber" value={currentRefNumber} onChange={(e) => setCurrentRefNumber(e.target.value)} className="mt-1 block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" required />
                 </div>
               </div>
               <div className="flex justify-end">
                 <button type="button" onClick={handleAddExperience} className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 text-sm"> Add This Job Entry </button>
               </div>
            </div>
          </div>

           {/* Interested Fields (Checkboxes) */}
           <div>
            <label className="block text-sm font-medium text-gray-700">Fields You Are Interested In Working In * (Select all that apply)</label>
            <div className="mt-2 space-y-2 max-h-60 overflow-y-auto border border-gray-200 rounded-md p-4">
              {experienceFields.map((field) => (
                <label key={`interest-${field}`} className="flex items-center">
                  <input type="checkbox" value={field} checked={interestedFields.includes(field)} onChange={() => handleInterestClick(field)} className="form-checkbox h-4 w-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500" />
                  <span className="ml-3 text-sm text-gray-700">{field}</span>
                </label>
              ))}
            </div>
             {interestedFields.length > 0 && (
                 <div className="mt-3">
                    <h4 className="text-xs font-medium text-gray-500 mb-1">Selected Interests:</h4>
                    {renderTagList(interestedFields, handleRemoveTag, setInterestedFields)}
                 </div>
             )}
          </div>

          {/* Work Type Preference (Checkboxes) */}
          <div>
            <label className="block text-sm font-medium text-gray-700">Preferred Work Type * (Select all that apply)</label>
            <div className="mt-2 space-x-4 flex flex-wrap">
              {workTypeOptions.map((type) => (
                <label key={type} className="inline-flex items-center">
                  <input type="checkbox" value={type} checked={workTypePreference.includes(type)} onChange={handleWorkTypeChange} className="form-checkbox h-4 w-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500" />
                  <span className="ml-2 text-sm text-gray-700">{type}</span>
                </label>
              ))}
            </div>
          </div>

        </div> // End of conditional 'yes' block
      )}
      {/* === END CONDITIONAL BLOCK FOR 'YES' === */}


      {/* === CONDITIONAL BLOCK FOR 'NO' === */}
      {hasExperience === 'no' && (
        <div className="p-4 bg-blue-100 border border-blue-200 rounded-md text-blue-800 mt-6 text-sm">
          <p>You have indicated no previous experience in Security or related fields. Please click "Next" to proceed.</p>
        </div>
      )}
      {/* === END CONDITIONAL BLOCK FOR 'NO' === */}


      {/* Navigation Buttons (Common to all states) */}
       <div className="flex justify-between pt-6 mt-8 border-t border-gray-200">
         <button type="button" onClick={onBack} className="px-6 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"> Back </button>
         <button type="button" onClick={onNext} disabled={hasExperience === 'yes' && !warningAccepted} className={`px-6 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 ${hasExperience === 'yes' && !warningAccepted ? 'opacity-50 cursor-not-allowed' : ''}`} > Next </button>
       </div>

    </div>
  );
};

export default Step4Employment;