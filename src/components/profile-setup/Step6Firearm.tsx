// src/components/profile-setup/Step6Firearms.tsx

import React, { useState, useEffect, ChangeEvent } from 'react';
import { FaEdit, FaTrash } from 'react-icons/fa';
// We might need useMemo later for sorting/grouping Section 5
import { useMemo } from 'react';

// --- Interfaces ---

// Interface for Section 2: Proficiency Certificate (Repeatable)
interface ProficiencyCertificate {
  id: string;
  category: string; // Handgun, Shotgun, Self-loading Rifle, Manually Operated Rifle
  institutionName: string;
  sapsAccreditationNo: string;
  assessorName: string;
  assessorNo: string;
  issueDate: string; // Date Issued
  saqaId: string; // SAQA Unit Standard ID
  pftcCertificateNo: string; // Required
  fileName?: string;
}

// Interface for Section 3: Competency Certificate (Repeatable)
interface CompetencyCertificate {
  id: string;
  category: string; // Handgun, Shotgun, Self-loading Rifle, Manually Operated Rifle
  issueDate: string; // Date Issued by SAPS
  expiryDate: string; // Expiry Date from SAPS Cert (Required)
  sapsCompetencyNo: string; // Required SAPS Competency Cert Number
  fileName?: string; // Required upload filename
}

// Interface for Section 5: Additional Training (Implemented)
interface AdditionalFirearmTraining {
  id: string;
  category: string; // Handgun, Shotgun, SLR, MOR - For grouping
  trainingName: string; // e.g., Tactical Handgun Course, Advanced Rifle Marksmanship
  provider: string;
  dateCompleted: string;
  expiryDate?: string; // Optional
  fileName?: string; // Required upload
}


// Base Props Interface for Step 6 Data
interface Step6FormData {
  firearmDisclaimerAccepted?: boolean;
  hasProficiencyCertificate?: 'yes' | 'no' | '';
  proficiencyCertificateList?: ProficiencyCertificate[];
  hasCompetencyCertificate?: 'yes' | 'no' | '';
  competencyCertificateList?: CompetencyCertificate[];
  regulation21Status?: string; // Placeholder (e.g., 'past6months', 'pastYear', 'over1Year', 'never')
  hasAdditionalTraining?: 'yes' | 'no' | ''; // Placeholder
  additionalFirearmTrainingList?: AdditionalFirearmTraining[]; // Placeholder
}

interface Step6FirearmsProps {
  formData: Step6FormData;
  onUpdate: (data: Partial<Step6FormData>) => void;
  onNext: () => void;
  onBack: () => void;
}

// --- Constants ---

const firearmCategories: string[] = [
    "Handgun",
    "Shotgun",
    "Self-loading Rifle or Carbine",
    "Manually Operated Rifle or Carbine"
];

// SAQA IDs for Business Purposes (based on search) - Map Category -> SAQA ID
// We might refine this if one cert can cover multiple, but starting simple.
const saqaUnitStandardsBusiness: { [key: string]: string } = {
    "Handgun": "123515",
    "Shotgun": "123514",
    "Self-loading Rifle or Carbine": "123511",
    "Manually Operated Rifle or Carbine": "123519",
    // Consider adding 117705 (Knowledge of Act) separately if needed
};

// Regulation 21 Options (Using Option 1 wording)
const regulation21Options = [
    { value: 'within_6_months', label: 'Within the last 6 months' },
    { value: 'within_12_months', label: 'Within the last 12 months' },
    { value: 'over_12_months', label: 'More than 12 months ago' },
    { value: 'never', label: 'No assessment completed / Not applicable' },
];


// --- Component ---
const Step6Firearms = ({
  formData, onUpdate, onBack, onNext,
}: Step6FirearmsProps): JSX.Element => {

  // --- State ---
  const [disclaimerAccepted, setDisclaimerAccepted] = useState<boolean>(formData?.firearmDisclaimerAccepted || false);
  const [error, setError] = useState<string | null>(null);

  // Section 2: Proficiency Certificate State
  const [hasProficiencyCertificate, setHasProficiencyCertificate] = useState<'yes' | 'no' | ''>(formData?.hasProficiencyCertificate || '');
  const [proficiencyCertificateList, setProficiencyCertificateList] = useState<ProficiencyCertificate[]>(formData?.proficiencyCertificateList || []);
  const [isProficiencyEditorOpen, setIsProficiencyEditorOpen] = useState<boolean>(false);
  const [editingProficiencyId, setEditingProficiencyId] = useState<string | null>(null);
  const [editorProficiencyData, setEditorProficiencyData] = useState<Partial<ProficiencyCertificate>>({});
  const [editorProficiencyFile, setEditorProficiencyFile] = useState<File | null>(null);

  // Section 3: Competency Certificate State (Implemented)
  const [hasCompetencyCertificate, setHasCompetencyCertificate] = useState<'yes' | 'no' | ''>(formData?.hasCompetencyCertificate || '');
  const [competencyCertificateList, setCompetencyCertificateList] = useState<CompetencyCertificate[]>(formData?.competencyCertificateList || []);
  const [isCompetencyEditorOpen, setIsCompetencyEditorOpen] = useState<boolean>(false);
  const [editingCompetencyId, setEditingCompetencyId] = useState<string | null>(null);
  const [editorCompetencyData, setEditorCompetencyData] = useState<Partial<CompetencyCertificate>>({});
  const [editorCompetencyFile, setEditorCompetencyFile] = useState<File | null>(null);

  // Section 4: Regulation 21 State (Placeholder)
  const [regulation21Status, setRegulation21Status] = useState<string>(formData?.regulation21Status || '');

  // Section 5: Additional Training State (Implemented)
  const [hasAdditionalTraining, setHasAdditionalTraining] = useState<'yes' | 'no' | ''>(formData?.hasAdditionalTraining || '');
  const [additionalFirearmTrainingList, setAdditionalFirearmTrainingList] = useState<AdditionalFirearmTraining[]>(formData?.additionalFirearmTrainingList || []);
  const [isAdditionalTrainingEditorOpen, setIsAdditionalTrainingEditorOpen] = useState<boolean>(false);
  const [editingAdditionalTrainingId, setEditingAdditionalTrainingId] = useState<string | null>(null);
  const [editorAdditionalTrainingData, setEditorAdditionalTrainingData] = useState<Partial<AdditionalFirearmTraining>>({});
  const [editorAdditionalTrainingFile, setEditorAdditionalTrainingFile] = useState<File | null>(null);


  // --- Effects ---
  useEffect(() => {
    // Skip updates if disclaimer isn't accepted yet (unless it's the disclaimer itself changing)
    if (!disclaimerAccepted && !formData?.firearmDisclaimerAccepted) return;

    const dataToUpdate: Partial<Step6FormData> = {};
    let changed = false;

    // Helper to check and stage updates
    const updateField = (key: keyof Step6FormData, localState: any) => {
        const defaultValue = Array.isArray(localState) ? [] : (typeof localState === 'string' ? '' : undefined);
        if (JSON.stringify(localState ?? defaultValue) !== JSON.stringify(formData?.[key] ?? defaultValue)) {
            if (localState === undefined && formData?.[key] !== undefined) {
                (dataToUpdate as any)[key] = undefined; changed = true;
            } else if (localState !== undefined) {
                 (dataToUpdate as any)[key] = localState; changed = true;
            }
        }
    };

    // Check disclaimer acceptance
     if (disclaimerAccepted !== (formData?.firearmDisclaimerAccepted || false)) {
         dataToUpdate.firearmDisclaimerAccepted = disclaimerAccepted;
         changed = true;
     }

    // Check flags and lists
    updateField('hasProficiencyCertificate', hasProficiencyCertificate);
    updateField('proficiencyCertificateList', proficiencyCertificateList);
    updateField('hasCompetencyCertificate', hasCompetencyCertificate);
    updateField('competencyCertificateList', competencyCertificateList);
    updateField('regulation21Status', regulation21Status); // Placeholder
    updateField('hasAdditionalTraining', hasAdditionalTraining); // <-- UPDATED (Was Placeholder)
    updateField('additionalFirearmTrainingList', additionalFirearmTrainingList); // <-- UPDATED (Was Placeholder)


    // Clearing Logic based on Skip Rules
    if (changed) {
        // If Proficiency = No, clear everything else in this step
        if (dataToUpdate.hasProficiencyCertificate === 'no') {
            dataToUpdate.proficiencyCertificateList = [];
            dataToUpdate.hasCompetencyCertificate = ''; // Reset dependent questions
            dataToUpdate.competencyCertificateList = []; // Ensure cleared
            dataToUpdate.regulation21Status = ''; // Placeholder
            dataToUpdate.hasAdditionalTraining = ''; // Placeholder
            dataToUpdate.additionalFirearmTrainingList = []; // Placeholder

             // Also reset local state for dependent sections immediately
             setProficiencyCertificateList([]);
             setHasCompetencyCertificate('');
             setCompetencyCertificateList([]); // Ensure cleared
             setRegulation21Status('');
             setHasAdditionalTraining('');
             setAdditionalFirearmTrainingList([]);

        } else if (dataToUpdate.hasProficiencyCertificate === 'yes') {
             // If Competency = No (and Proficiency is Yes), clear S3 list and S4, S5 state
             if (dataToUpdate.hasCompetencyCertificate === 'no') {
                dataToUpdate.competencyCertificateList = []; // Ensure cleared
                dataToUpdate.regulation21Status = ''; // Placeholder
                dataToUpdate.hasAdditionalTraining = ''; // Placeholder
                dataToUpdate.additionalFirearmTrainingList = []; // Placeholder

                 // Reset local state immediately
                 setCompetencyCertificateList([]); // Ensure cleared
                 setRegulation21Status('');
                 setHasAdditionalTraining('');
                 setAdditionalFirearmTrainingList([]);
             }
        }

        // Add clearing for S5 if hasAdditionalTraining is 'no'
        if (dataToUpdate.hasAdditionalTraining === 'no') {
            dataToUpdate.additionalFirearmTrainingList = [];
            // Reset local state immediately
            setAdditionalFirearmTrainingList([]);
            setIsAdditionalTrainingEditorOpen(false); // Close editor if open
            setEditingAdditionalTrainingId(null);
        }

        // If any relevant changes occurred, call onUpdate
        if (Object.keys(dataToUpdate).length > 0) {
            console.log("Step 6: Relevant state changed, calling onUpdate", dataToUpdate);
            onUpdate(dataToUpdate);
        }
    }
  }, [
    // Dependencies
    disclaimerAccepted, formData?.firearmDisclaimerAccepted,
    hasProficiencyCertificate, proficiencyCertificateList,
    hasCompetencyCertificate, competencyCertificateList,
    regulation21Status, // Placeholder
    hasAdditionalTraining, // <-- UPDATED (Was Placeholder)
    additionalFirearmTrainingList, // <-- UPDATED (Was Placeholder)
    formData, onUpdate // Core dependencies
  ]);


  // --- Memoized Calculation for Section 5 Summary ---
  const getGroupedAndSortedAdditionalTraining = (list: AdditionalFirearmTraining[]) => {
      const grouped: { [key: string]: AdditionalFirearmTraining[] } = {};
      list.forEach(item => {
          const category = item.category || 'Uncategorized'; // Handle items without category if needed
          if (!grouped[category]) {
              grouped[category] = [];
          }
          grouped[category].push(item);
      });
      // Sort items within each group by dateCompleted descending (newest first)
      Object.keys(grouped).forEach(category => {
          grouped[category].sort((a, b) => new Date(b.dateCompleted).getTime() - new Date(a.dateCompleted).getTime());
      });
      // Get sorted category names (optional, depends on desired display order)
      const sortedCategories = Object.keys(grouped).sort((a, b) => firearmCategories.indexOf(a) - firearmCategories.indexOf(b)); // Sort by predefined category order
      return { sortedCategories, grouped };
  };

  // useMemo hook called at the top level of the component
  const { sortedCategories: sortedAdditionalTrainingCategories, grouped: groupedAdditionalTraining } = useMemo(
      () => getGroupedAndSortedAdditionalTraining(additionalFirearmTrainingList),
      [additionalFirearmTrainingList] // Recompute when the list changes
  );

  // --- Handlers ---

  // Section 1: Disclaimer
  const handleAcceptDisclaimer = () => {
    setDisclaimerAccepted(true);
    // Immediately update parent state for disclaimer acceptance
    onUpdate({ firearmDisclaimerAccepted: true });
  };

  // Section 2: Proficiency Certificate Handlers
  const handleHasProficiencyChange = (e: ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value as 'yes' | 'no';
    setHasProficiencyCertificate(value);
    setError(null); // Clear errors when changing this core question

    // If 'No', clear the list and potentially reset downstream state (handled in useEffect)
    if (value === 'no') {
      setProficiencyCertificateList([]);
      setIsProficiencyEditorOpen(false);
      setEditingProficiencyId(null);
      // The useEffect will handle clearing dependent sections (S3, S4, S5)
    }
  };

   // --- Section 2: Proficiency Certificate Handlers (Implemented) ---

    /** Opens the editor modal/view for adding or editing proficiency certificates. */
    const openProficiencyEditor = (id: string | null = null) => {
        setError(null); // Clear any previous errors
        setEditingProficiencyId(id);
        if (id) {
            // Editing existing item
            const itemToEdit = proficiencyCertificateList.find(item => item.id === id);
            if (itemToEdit) {
                setEditorProficiencyData({ ...itemToEdit }); // Pre-fill with existing data
                setEditorProficiencyFile(null); // Reset file input
                setIsProficiencyEditorOpen(true);
            } else {
                console.error("Could not find Proficiency Certificate item to edit with ID:", id);
                cancelProficiencyEditor();
            }
        } else {
            // Adding new item
            setEditorProficiencyData({}); // Start with empty data
            setEditorProficiencyFile(null);
            setIsProficiencyEditorOpen(true);
        }
    };

    /** Handles changes in the proficiency editor text inputs and select dropdown. */
    const handleProficiencyInputChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setEditorProficiencyData(prev => ({ ...prev, [name]: value }));
        setError(null); // Clear error on input change
    };

    /** Handles the file selection for the proficiency certificate upload. */
    const handleProficiencyFileChange = (e: ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setEditorProficiencyFile(e.target.files[0]);
        } else {
            setEditorProficiencyFile(null);
        }
        setError(null); // Clear error on file change
    };

    /** Saves the new or edited proficiency certificate item after validation. */
    const saveProficiencyCertificate = () => {
        // --- Validation ---
        if (!editorProficiencyData.category) { setError("Please select the Firearm Category."); return; }
        if (!editorProficiencyData.institutionName?.trim()) { setError("Institution Name is required."); return; }
        if (!editorProficiencyData.sapsAccreditationNo?.trim()) { setError("SAPS Accreditation Number is required."); return; }
        if (!editorProficiencyData.assessorName?.trim()) { setError("Assessor Name is required."); return; }
        if (!editorProficiencyData.assessorNo?.trim()) { setError("Assessor Number is required."); return; }
        if (!editorProficiencyData.issueDate) { setError("Issuing Date is required."); return; }
        if (!editorProficiencyData.saqaId?.trim()) { setError("SAQA ID is required."); return; } // Assuming text input for flexibility
        if (!editorProficiencyData.pftcCertificateNo?.trim()) { setError("PFTC Certificate Number is required."); return; }

        // File validation
        const existingFileName = editingProficiencyId
            ? proficiencyCertificateList.find(i => i.id === editingProficiencyId)?.fileName
            : undefined;
        if (!editorProficiencyFile && !existingFileName) {
             setError("Proficiency Certificate Upload is required.");
             return;
        }
        setError(null); // Validation passed

        // --- Prepare Data Payload ---
        const certificateDataPayload: Omit<ProficiencyCertificate, 'id'> = {
            category: editorProficiencyData.category,
            institutionName: editorProficiencyData.institutionName.trim(),
            sapsAccreditationNo: editorProficiencyData.sapsAccreditationNo.trim(),
            assessorName: editorProficiencyData.assessorName.trim(),
            assessorNo: editorProficiencyData.assessorNo.trim(),
            issueDate: editorProficiencyData.issueDate,
            saqaId: editorProficiencyData.saqaId.trim(),
            pftcCertificateNo: editorProficiencyData.pftcCertificateNo.trim(),
            fileName: editorProficiencyFile?.name || existingFileName,
        };

        // --- Update State ---
        if (editingProficiencyId) {
            // Update existing item
            setProficiencyCertificateList(prev =>
                prev.map(item =>
                    item.id === editingProficiencyId
                        ? { ...item, ...certificateDataPayload }
                        : item
                )
            );
        } else {
            // Add new item
            const newItem: ProficiencyCertificate = {
                ...certificateDataPayload,
                id: Date.now().toString(),
            };
            setProficiencyCertificateList(prev => [...prev, newItem]);
        }

        // TODO: Handle actual file upload
        cancelProficiencyEditor(); // Close and reset the editor
    };

    /** Closes the proficiency editor and resets its state variables. */
    const cancelProficiencyEditor = () => {
        setIsProficiencyEditorOpen(false);
        setEditingProficiencyId(null);
        setEditorProficiencyData({}); // Reset editor form data
        setEditorProficiencyFile(null); // Reset file input state
        setError(null); // Clear any errors
    };

    /** Removes a proficiency certificate item from the list. */
    const removeProficiencyCertificate = (idToRemove: string) => {
        setProficiencyCertificateList(prev => prev.filter(item => item.id !== idToRemove));
        // If the item being edited is removed, close the editor
        if (editingProficiencyId === idToRemove) {
            cancelProficiencyEditor();
        }
    };

  // --- Section 3: Competency Certificate Handlers ---

  /** Handles Yes/No change for SAPS Competency Certificate question. */
   const handleHasCompetencyChange = (e: ChangeEvent<HTMLInputElement>) => {
      const value = e.target.value as 'yes' | 'no';
      setHasCompetencyCertificate(value);
      setError(null); // Clear general errors

      // If 'No', clear the list and reset downstream state (handled in useEffect)
      if (value === 'no') {
          setCompetencyCertificateList([]);
          setIsCompetencyEditorOpen(false);
          setEditingCompetencyId(null);
          // The useEffect will handle clearing dependent sections (S4, S5)
      }
   };

  /** Opens the editor modal/view for adding or editing competency certificates. */
  const openCompetencyEditor = (id: string | null = null) => {
      setError(null);
      // NOTE: Different editingId state variable for this section's editor
      setEditingCompetencyId(id); // Should use a specific state like setEditingCompetencyId
      if (id) {
          // Editing existing item
          const itemToEdit = competencyCertificateList.find(item => item.id === id);
          if (itemToEdit) {
              // NOTE: Different editor data state variable
              setEditorCompetencyData({ ...itemToEdit }); // Pre-fill using setEditorCompetencyData
              // NOTE: Different file state variable
              setEditorCompetencyFile(null); // Use setEditorCompetencyFile
              // NOTE: Different editor open state variable
              setIsCompetencyEditorOpen(true); // Use setIsCompetencyEditorOpen
          } else {
              console.error("Could not find Competency Certificate item to edit with ID:", id);
              cancelCompetencyEditor();
          }
      } else {
          // Adding new item
           // NOTE: Different editor data state variable
          setEditorCompetencyData({}); // Reset using setEditorCompetencyData
           // NOTE: Different file state variable
          setEditorCompetencyFile(null); // Use setEditorCompetencyFile
           // NOTE: Different editor open state variable
          setIsCompetencyEditorOpen(true); // Use setIsCompetencyEditorOpen
      }
  };

  /** Handles changes in the competency editor text inputs and select dropdown. */
  const handleCompetencyInputChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
      const { name, value } = e.target;
       // NOTE: Different editor data state variable
      setEditorCompetencyData(prev => ({ ...prev, [name]: value }));
      setError(null);
  };

  /** Handles the file selection for the competency certificate upload. */
  const handleCompetencyFileChange = (e: ChangeEvent<HTMLInputElement>) => {
      if (e.target.files && e.target.files[0]) {
          // NOTE: Different file state variable
          setEditorCompetencyFile(e.target.files[0]);
      } else {
           // NOTE: Different file state variable
          setEditorCompetencyFile(null);
      }
      setError(null);
  };

  /** Saves the new or edited competency certificate item after validation. */
  const saveCompetencyCertificate = () => {
      // --- Validation ---
      // NOTE: Use specific editor data state
      if (!editorCompetencyData.category) { setError("Please select the Firearm Category."); return; }
      if (!editorCompetencyData.issueDate) { setError("Issuing Date is required."); return; }
      if (!editorCompetencyData.expiryDate) { setError("Expiry Date is required."); return; }
      if (!editorCompetencyData.sapsCompetencyNo?.trim()) { setError("SAPS Competency Certificate Number is required."); return; }

      // File validation
      // NOTE: Use specific editing ID and list state
      const existingFileName = editingCompetencyId // Should be editingCompetencyId
          ? competencyCertificateList.find(i => i.id === editingCompetencyId)?.fileName
          : undefined;
      // NOTE: Use specific file state
      if (!editorCompetencyFile && !existingFileName) {
           setError("Competency Certificate Upload is required.");
           return;
      }
      // Expiry Date validation
      // NOTE: Use specific editor data state
      if (new Date(editorCompetencyData.expiryDate) <= new Date(editorCompetencyData.issueDate)) {
          setError("Expiry Date must be after the Issue Date.");
          return;
      }
      setError(null); // Validation passed

      // --- Prepare Data Payload ---
       // NOTE: Use specific editor data and file state
      const certificateDataPayload: Omit<CompetencyCertificate, 'id'> = {
          category: editorCompetencyData.category,
          issueDate: editorCompetencyData.issueDate,
          expiryDate: editorCompetencyData.expiryDate,
          sapsCompetencyNo: editorCompetencyData.sapsCompetencyNo.trim(),
          fileName: editorCompetencyFile?.name || existingFileName,
      };

      // --- Update State ---
      // NOTE: Use specific editing ID and list setter
      if (editingCompetencyId) { // Should be editingCompetencyId
          // Update existing item
          setCompetencyCertificateList(prev =>
              prev.map(item =>
                  item.id === editingCompetencyId // Should be editingCompetencyId
                      ? { ...item, ...certificateDataPayload }
                      : item
              )
          );
      } else {
          // Add new item
          const newItem: CompetencyCertificate = {
              ...certificateDataPayload,
              id: Date.now().toString(),
          };
           // NOTE: Use specific list setter
          setCompetencyCertificateList(prev => [...prev, newItem]);
      }

      // TODO: Handle actual file upload
      cancelCompetencyEditor(); // Close and reset the editor
  };

  /** Closes the competency editor and resets its state variables. */
  const cancelCompetencyEditor = () => {
       // NOTE: Use specific state setters
      setIsCompetencyEditorOpen(false);
      setEditingCompetencyId(null); // Should be setEditingCompetencyId
      setEditorCompetencyData({});
      setEditorCompetencyFile(null);
      setError(null);
  };

  /** Removes a competency certificate item from the list. */
  const removeCompetencyCertificate = (idToRemove: string) => {
       // NOTE: Use specific list setter and editing ID
      setCompetencyCertificateList(prev => prev.filter(item => item.id !== idToRemove));
      if (editingCompetencyId === idToRemove) { // Should be editingCompetencyId
          cancelCompetencyEditor();
      }
  };

  // --- Section 4: Regulation 21 Handlers ---
  const handleRegulation21Change = (e: ChangeEvent<HTMLInputElement>) => {
      setRegulation21Status(e.target.value);
      setError(null); // Clear potential general errors if any
  };

  // --- Section 5: Additional Firearm Training Handlers ---

  /** Handles Yes/No change for the Additional Training question. */
  const handleHasAdditionalTrainingChange = (e: ChangeEvent<HTMLInputElement>) => {
      const value = e.target.value as 'yes' | 'no';
      setHasAdditionalTraining(value);
      setError(null);
      if (value === 'no') {
          setAdditionalFirearmTrainingList([]); // Clear list immediately
          setIsAdditionalTrainingEditorOpen(false);
          setEditingAdditionalTrainingId(null);
          // useEffect handles updating parent state
      }
  };

  /** Opens the editor for adding/editing Additional Firearm Training. */
  const openAdditionalTrainingEditor = (id: string | null = null) => {
      setError(null);
      setEditingAdditionalTrainingId(id);
      if (id) {
          const itemToEdit = additionalFirearmTrainingList.find(item => item.id === id);
          if (itemToEdit) {
              setEditorAdditionalTrainingData({ ...itemToEdit });
              setEditorAdditionalTrainingFile(null);
              setIsAdditionalTrainingEditorOpen(true);
          } else {
              console.error("Could not find Additional Training item to edit with ID:", id);
              cancelAdditionalTrainingEditor();
          }
      } else {
          setEditorAdditionalTrainingData({}); // Reset
          setEditorAdditionalTrainingFile(null);
          setIsAdditionalTrainingEditorOpen(true);
      }
  };

   /** Handles changes in the additional training editor inputs/select. */
  const handleAdditionalTrainingInputChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
      const { name, value } = e.target;
      setEditorAdditionalTrainingData(prev => ({ ...prev, [name]: value }));
      setError(null);
  };

   /** Handles file selection for additional training certificate. */
  const handleAdditionalTrainingFileChange = (e: ChangeEvent<HTMLInputElement>) => {
      if (e.target.files && e.target.files[0]) {
          setEditorAdditionalTrainingFile(e.target.files[0]);
      } else {
          setEditorAdditionalTrainingFile(null);
      }
      setError(null);
  };

  /** Saves new/edited additional firearm training item. */
  const saveAdditionalTraining = () => {
      // --- Validation ---
      if (!editorAdditionalTrainingData.category) { setError("Please select the Firearm Category."); return; }
      if (!editorAdditionalTrainingData.trainingName?.trim()) { setError("Training Name is required."); return; }
      if (!editorAdditionalTrainingData.provider?.trim()) { setError("Training Provider is required."); return; }
      if (!editorAdditionalTrainingData.dateCompleted) { setError("Date Completed is required."); return; }

      // File validation
      const existingFileName = editingAdditionalTrainingId
          ? additionalFirearmTrainingList.find(i => i.id === editingAdditionalTrainingId)?.fileName
          : undefined;
      if (!editorAdditionalTrainingFile && !existingFileName) {
           setError("Certificate Upload is required.");
           return;
      }
      // Optional Expiry Date validation
      if (editorAdditionalTrainingData.expiryDate && editorAdditionalTrainingData.dateCompleted && new Date(editorAdditionalTrainingData.expiryDate) <= new Date(editorAdditionalTrainingData.dateCompleted)) {
          setError("Expiry Date must be after the Date Completed.");
          return;
      }
      setError(null);

      // --- Prepare Data Payload ---
      const trainingDataPayload: Omit<AdditionalFirearmTraining, 'id'> = {
          category: editorAdditionalTrainingData.category,
          trainingName: editorAdditionalTrainingData.trainingName.trim(),
          provider: editorAdditionalTrainingData.provider.trim(),
          dateCompleted: editorAdditionalTrainingData.dateCompleted,
          expiryDate: editorAdditionalTrainingData.expiryDate || undefined,
          fileName: editorAdditionalTrainingFile?.name || existingFileName,
      };

      // --- Update State ---
      if (editingAdditionalTrainingId) {
          setAdditionalFirearmTrainingList(prev =>
              prev.map(item =>
                  item.id === editingAdditionalTrainingId
                      ? { ...item, ...trainingDataPayload }
                      : item
              )
          );
      } else {
          const newItem: AdditionalFirearmTraining = {
              ...trainingDataPayload,
              id: Date.now().toString(),
          };
          setAdditionalFirearmTrainingList(prev => [...prev, newItem]);
      }

      // TODO: Handle actual file upload
      cancelAdditionalTrainingEditor();
  };

  /** Closes the additional training editor and resets state. */
  const cancelAdditionalTrainingEditor = () => {
      setIsAdditionalTrainingEditorOpen(false);
      setEditingAdditionalTrainingId(null);
      setEditorAdditionalTrainingData({});
      setEditorAdditionalTrainingFile(null);
      setError(null);
  };

  /** Removes an additional training item. */
  const removeAdditionalTraining = (idToRemove: string) => {
      setAdditionalFirearmTrainingList(prev => prev.filter(item => item.id !== idToRemove));
      if (editingAdditionalTrainingId === idToRemove) {
          cancelAdditionalTrainingEditor();
      }
  };

  // Placeholders for Section 4, 5 Handlers


  // --- Render Functions ---

  // Section 1: Disclaimer
  const renderDisclaimer = (): JSX.Element => (
    <div className="border rounded-md p-4 bg-gray-50 shadow-sm">
      <h3 className="text-lg font-medium text-gray-900 mb-2">Firearm Information Disclaimer</h3>
      <p className="text-sm text-gray-700 mb-1">
        Providing information about firearm proficiency, competency, licenses, and training is critical and carries legal weight.
      </p>
      <ul className="list-disc list-inside text-sm text-gray-700 mb-4 space-y-1">
         <li>Ensure all details (certificate numbers, dates, firearm categories, training provider details, SAQA IDs, PFTC numbers, SAPS details) are **accurate and truthful**.</li>
         <li>You must possess the original documentation for any information you provide.</li>
         <li>This information may be subject to verification with relevant authorities (SAPS, PFTC, Training Providers).</li>
         <li>Providing false or misleading firearm-related information is a serious offense and may lead to legal consequences, disqualification from employment opportunities, and reporting to authorities.</li>
      </ul>
      <button
        type="button"
        onClick={handleAcceptDisclaimer}
        className="mt-2 px-4 py-2 bg-green-600 text-white rounded-md shadow-sm hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
      >
        I Understand and Accept
      </button>
    </div>
  );

  // --- Section 2: Proficiency Certificate Render Functions (Implemented) ---

    /** Renders the editor form for adding/editing Proficiency Certificates. */
    const renderProficiencyEditor = (): JSX.Element => (
        <div className="mt-4 p-4 border border-gray-200 rounded-md bg-gray-50 shadow-sm animate-fade-in mb-4">
            <h4 className="text-md font-medium text-gray-900 mb-3">
                {editingProficiencyId ? 'Edit Proficiency Certificate' : 'Add Proficiency Certificate'}
            </h4>
            <div className="space-y-4">
                {/* Category Dropdown */}
                <div>
                    <label htmlFor="profCategory" className="block text-sm font-medium text-gray-700 mb-1">Firearm Category *</label>
                    <select
                        id="profCategory"
                        name="category"
                        value={editorProficiencyData.category || ''}
                        onChange={handleProficiencyInputChange}
                        className="select-class"
                        required
                    >
                        <option value="" disabled>Select category...</option>
                        {firearmCategories.map(cat => (
                            <option key={cat} value={cat}>{cat}</option>
                        ))}
                    </select>
                </div>

                {/* Institution Name Input */}
                <div>
                    <label htmlFor="profInstitution" className="block text-sm font-medium text-gray-700 mb-1">Institution Name *</label>
                    <input id="profInstitution" name="institutionName" type="text" value={editorProficiencyData.institutionName || ''} onChange={handleProficiencyInputChange} className="input-class" required />
                </div>

                {/* SAPS Accreditation Number Input */}
                <div>
                    <label htmlFor="profSapsAccredNo" className="block text-sm font-medium text-gray-700 mb-1">SAPS Accreditation Number *</label>
                    <input id="profSapsAccredNo" name="sapsAccreditationNo" type="text" value={editorProficiencyData.sapsAccreditationNo || ''} onChange={handleProficiencyInputChange} className="input-class" required />
                </div>

                {/* Assessor Name Input */}
                <div>
                    <label htmlFor="profAssessorName" className="block text-sm font-medium text-gray-700 mb-1">Assessor Name *</label>
                    <input id="profAssessorName" name="assessorName" type="text" value={editorProficiencyData.assessorName || ''} onChange={handleProficiencyInputChange} className="input-class" required />
                </div>

                {/* Assessor Number Input */}
                <div>
                    <label htmlFor="profAssessorNo" className="block text-sm font-medium text-gray-700 mb-1">Assessor Number *</label>
                    <input id="profAssessorNo" name="assessorNo" type="text" value={editorProficiencyData.assessorNo || ''} onChange={handleProficiencyInputChange} className="input-class" required />
                </div>

                {/* Issuing Date Input */}
                <div>
                    <label htmlFor="profIssueDate" className="block text-sm font-medium text-gray-700 mb-1">Issuing Date *</label>
                    <input id="profIssueDate" name="issueDate" type="date" value={editorProficiencyData.issueDate || ''} onChange={handleProficiencyInputChange} className="input-class" required />
                </div>

                {/* SAQA ID Input */}
                 <div>
                    <label htmlFor="profSaqaId" className="block text-sm font-medium text-gray-700 mb-1">SAQA ID *</label>
                    <input
                        id="profSaqaId"
                        name="saqaId"
                        type="text"
                        value={editorProficiencyData.saqaId || ''}
                        onChange={handleProficiencyInputChange}
                        className="input-class"
                        placeholder={`e.g., ${saqaUnitStandardsBusiness[editorProficiencyData.category || ''] || 'Enter SAQA ID'}`}
                        required />
                     <p className="mt-1 text-xs text-gray-500">Enter the SAQA Unit Standard ID listed on your certificate (e.g., 123515 for Handgun Business).</p>
                </div>

                {/* PFTC Certificate Number Input */}
                <div>
                    <label htmlFor="profPftcCertNo" className="block text-sm font-medium text-gray-700 mb-1">PFTC Certificate Number *</label>
                    <input id="profPftcCertNo" name="pftcCertificateNo" type="text" value={editorProficiencyData.pftcCertificateNo || ''} onChange={handleProficiencyInputChange} className="input-class" required />
                </div>

                {/* File Upload Input */}
                <div>
                    <label htmlFor="profFile" className="block text-sm font-medium text-gray-700 mb-1">
                        Upload Certificate *
                        {(editingProficiencyId && editorProficiencyData.fileName && !editorProficiencyFile) &&
                         ` (Current: ${editorProficiencyData.fileName})`
                        }
                    </label>
                    <input id="profFile" type="file" onChange={handleProficiencyFileChange} className="file-input-class" accept=".pdf,.jpg,.jpeg,.png"/>
                    {editorProficiencyFile && <p className="mt-1 text-xs text-gray-500">Selected: {editorProficiencyFile.name}</p>}
                    <p className="mt-1 text-xs text-gray-500">Required. PDF, JPG, PNG (Max 5MB).</p>
                    {!(editingProficiencyId && editorProficiencyData.fileName) && !editorProficiencyFile &&
                        <p className="mt-1 text-xs text-red-500">File upload is required.</p>
                    }
                </div>

                {/* Error Display */}
                {error && <p className="text-sm text-red-600 mt-2">{error}</p>}

                {/* Action Buttons */}
                <div className="flex justify-end space-x-3 mt-4">
                    <button type="button" onClick={cancelProficiencyEditor} className="px-3 py-1.5 border border-gray-300 rounded-md text-sm text-gray-700 hover:bg-gray-50">Cancel</button>
                    <button type="button" onClick={saveProficiencyCertificate} className="px-3 py-1.5 bg-indigo-600 text-white rounded-md text-sm hover:bg-indigo-700">
                        {editingProficiencyId ? 'Save Changes' : 'Save Certificate'}
                    </button>
                </div>
            </div>
        </div>
    );

    /** Renders the summary list of added proficiency certificates. */
    const renderProficiencySummaryList = (): JSX.Element => (
        <div className="mt-4 space-y-4">
            {proficiencyCertificateList.length > 0 && <h4 className="text-sm font-medium text-gray-600">Added Proficiency Certificates:</h4>}
            {proficiencyCertificateList.length > 0 ? (
                <div className="space-y-3">
                    {proficiencyCertificateList.map((item: ProficiencyCertificate) => (
                        <div key={item.id} className="p-3 border border-gray-200 rounded-md bg-white shadow-sm">
                            <div className="flex justify-between items-start gap-4">
                                {/* Details */}
                                <div className="text-sm flex-grow">
                                    <p className="font-medium text-gray-900">{item.category}</p>
                                    <p className="text-gray-600">Institution: {item.institutionName}</p>
                                    <p className="text-gray-600">Issue Date: {item.issueDate}</p>
                                    <p className="text-xs text-gray-500">SAPS Accred No: {item.sapsAccreditationNo}</p>
                                    <p className="text-xs text-gray-500">Assessor: {item.assessorName} ({item.assessorNo})</p>
                                    <p className="text-xs text-gray-500">SAQA ID: {item.saqaId}</p>
                                    <p className="text-xs text-gray-500">PFTC Cert No: {item.pftcCertificateNo}</p>
                                    <p className="text-xs text-gray-500 mt-1">
                                        File: {item.fileName ? item.fileName : <span className="text-red-500 italic">Missing</span>}
                                    </p>
                                </div>
                                {/* Actions */}
                                <div className="flex space-x-2 flex-shrink-0">
                                    <button type="button" onClick={() => openProficiencyEditor(item.id)} className="p-1 text-indigo-600 hover:text-indigo-800" aria-label={`Edit ${item.category} Proficiency`}> <span>{FaEdit({ size: 16 })}</span> </button>
                                    <button type="button" onClick={() => removeProficiencyCertificate(item.id)} className="p-1 text-red-600 hover:text-red-800" aria-label={`Remove ${item.category} Proficiency`}> <span>{FaTrash({ size: 16 })}</span> </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <p className="text-sm text-gray-500 italic mb-4">No proficiency certificates added yet.</p>
            )}
            <div className="flex justify-start pt-2">
                <button
                    type="button"
                    onClick={() => openProficiencyEditor()}
                    className="px-3 py-1.5 bg-gray-200 text-gray-700 rounded-md shadow-sm hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 text-sm"
                >
                    + Add Proficiency Certificate
                </button>
            </div>
        </div>
    );

  // --- Section 3: Competency Certificate Render Functions ---

/** Renders the editor form for adding/editing SAPS Competency Certificates. */
const renderCompetencyEditor = (): JSX.Element => (
    <div className="mt-4 p-4 border border-gray-200 rounded-md bg-gray-50 shadow-sm animate-fade-in mb-4">
        <h4 className="text-md font-medium text-gray-900 mb-3">
            {editingCompetencyId ? 'Edit Competency Certificate' : 'Add Competency Certificate'}
        </h4>
        <div className="space-y-4">
            {/* Category Dropdown */}
            <div>
                <label htmlFor="compCategory" className="block text-sm font-medium text-gray-700 mb-1">Firearm Category *</label>
                <select
                    id="compCategory"
                    name="category"
                    value={editorCompetencyData.category || ''}
                    onChange={handleCompetencyInputChange}
                    className="select-class"
                    required
                >
                    <option value="" disabled>Select category...</option>
                    {firearmCategories.map(cat => (
                        <option key={cat} value={cat}>{cat}</option>
                    ))}
                </select>
            </div>

            {/* Issue Date Input */}
            <div>
                <label htmlFor="compIssueDate" className="block text-sm font-medium text-gray-700 mb-1">Issuing Date *</label>
                <input id="compIssueDate" name="issueDate" type="date" value={editorCompetencyData.issueDate || ''} onChange={handleCompetencyInputChange} className="input-class" required />
            </div>

             {/* Expiry Date Input */}
            <div>
                <label htmlFor="compExpiryDate" className="block text-sm font-medium text-gray-700 mb-1">Expiry Date *</label>
                <input id="compExpiryDate" name="expiryDate" type="date" value={editorCompetencyData.expiryDate || ''} onChange={handleCompetencyInputChange} className="input-class" required />
            </div>

            {/* SAPS Competency Certificate Number Input */}
            <div>
                <label htmlFor="compSapsNo" className="block text-sm font-medium text-gray-700 mb-1">SAPS Competency Certificate Number *</label>
                <input id="compSapsNo" name="sapsCompetencyNo" type="text" value={editorCompetencyData.sapsCompetencyNo || ''} onChange={handleCompetencyInputChange} className="input-class" required />
            </div>

            {/* File Upload Input */}
            <div>
                <label htmlFor="compFile" className="block text-sm font-medium text-gray-700 mb-1">
                    Upload Competency Certificate *
                    {(editingCompetencyId && editorCompetencyData.fileName && !editorCompetencyFile) &&
                     ` (Current: ${editorCompetencyData.fileName})`
                    }
                </label>
                <input id="compFile" type="file" onChange={handleCompetencyFileChange} className="file-input-class" accept=".pdf,.jpg,.jpeg,.png"/>
                {editorCompetencyFile && <p className="mt-1 text-xs text-gray-500">Selected: {editorCompetencyFile.name}</p>}
                <p className="mt-1 text-xs text-gray-500">Required. PDF, JPG, PNG (Max 5MB).</p>
                {!(editingCompetencyId && editorCompetencyData.fileName) && !editorCompetencyFile &&
                    <p className="mt-1 text-xs text-red-500">File upload is required.</p>
                }
            </div>

            {/* Error Display */}
            {error && <p className="text-sm text-red-600 mt-2">{error}</p>}

            {/* Action Buttons */}
            <div className="flex justify-end space-x-3 mt-4">
                <button type="button" onClick={cancelCompetencyEditor} className="px-3 py-1.5 border border-gray-300 rounded-md text-sm text-gray-700 hover:bg-gray-50">Cancel</button>
                <button type="button" onClick={saveCompetencyCertificate} className="px-3 py-1.5 bg-indigo-600 text-white rounded-md text-sm hover:bg-indigo-700">
                    {editingCompetencyId ? 'Save Changes' : 'Save Certificate'}
                </button>
            </div>
        </div>
    </div>
);

/** Renders the summary list of added SAPS Competency certificates. */
const renderCompetencySummaryList = (): JSX.Element => (
    <div className="mt-4 space-y-4">
        {competencyCertificateList.length > 0 && <h4 className="text-sm font-medium text-gray-600">Added Competency Certificates:</h4>}
        {competencyCertificateList.length > 0 ? (
            <div className="space-y-3">
                {competencyCertificateList.map((item: CompetencyCertificate) => (
                    <div key={item.id} className="p-3 border border-gray-200 rounded-md bg-white shadow-sm">
                        <div className="flex justify-between items-start gap-4">
                            {/* Details */}
                            <div className="text-sm flex-grow">
                                <p className="font-medium text-gray-900">{item.category}</p>
                                <p className="text-gray-600">Issued: {item.issueDate} | Expires: {item.expiryDate}</p>
                                <p className="text-xs text-gray-500">SAPS Cert No: {item.sapsCompetencyNo}</p>
                                <p className="text-xs text-gray-500 mt-1">
                                    File: {item.fileName ? item.fileName : <span className="text-red-500 italic">Missing</span>}
                                </p>
                            </div>
                            {/* Actions */}
                            <div className="flex space-x-2 flex-shrink-0">
                                <button type="button" onClick={() => openCompetencyEditor(item.id)} className="p-1 text-indigo-600 hover:text-indigo-800" aria-label={`Edit ${item.category} Competency`}> <span>{FaEdit({ size: 16 })}</span> </button>
                                <button type="button" onClick={() => removeCompetencyCertificate(item.id)} className="p-1 text-red-600 hover:text-red-800" aria-label={`Remove ${item.category} Competency`}> <span>{FaTrash({ size: 16 })}</span> </button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        ) : (
            <p className="text-sm text-gray-500 italic mb-4">No competency certificates added yet.</p>
        )}
        <div className="flex justify-start pt-2">
            <button
                type="button"
                onClick={() => openCompetencyEditor()}
                className="px-3 py-1.5 bg-gray-200 text-gray-700 rounded-md shadow-sm hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 text-sm"
            >
                + Add Competency Certificate
            </button>
        </div>
    </div>
);

// --- Section 5: Additional Firearm Training Render Functions ---

/** Renders the editor for adding/editing additional firearm training. */
const renderAdditionalTrainingEditor = (): JSX.Element => (
    <div className="mt-4 p-4 border border-gray-200 rounded-md bg-gray-50 shadow-sm animate-fade-in mb-4">
        <h4 className="text-md font-medium text-gray-900 mb-3">
            {editingAdditionalTrainingId ? 'Edit Additional Training' : 'Add Additional Training'}
        </h4>
        <div className="space-y-4">
            {/* Category Dropdown */}
             <div>
                <label htmlFor="addTrainCategory" className="block text-sm font-medium text-gray-700 mb-1">Firearm Category *</label>
                <select
                    id="addTrainCategory"
                    name="category"
                    value={editorAdditionalTrainingData.category || ''}
                    onChange={handleAdditionalTrainingInputChange}
                    className="select-class"
                    required
                >
                    <option value="" disabled>Select category...</option>
                    {firearmCategories.map(cat => ( // Use the main firearmCategories constant
                        <option key={cat} value={cat}>{cat}</option>
                    ))}
                     {/* Option for non-specific training? */}
                     {/* <option value="General">General / Non-Specific</option> */}
                </select>
            </div>

             {/* Training Name Input */}
             <div>
                <label htmlFor="addTrainName" className="block text-sm font-medium text-gray-700 mb-1">Training Name/Type *</label>
                <input id="addTrainName" name="trainingName" type="text" value={editorAdditionalTrainingData.trainingName || ''} onChange={handleAdditionalTrainingInputChange} className="input-class" placeholder="e.g., Tactical Handgun Course, Advanced Rifle" required />
            </div>

             {/* Provider Input */}
             <div>
                <label htmlFor="addTrainProvider" className="block text-sm font-medium text-gray-700 mb-1">Training Provider *</label>
                <input id="addTrainProvider" name="provider" type="text" value={editorAdditionalTrainingData.provider || ''} onChange={handleAdditionalTrainingInputChange} className="input-class" required />
            </div>

             {/* Date Completed Input */}
             <div>
                <label htmlFor="addTrainDateCompleted" className="block text-sm font-medium text-gray-700 mb-1">Date Completed *</label>
                <input id="addTrainDateCompleted" name="dateCompleted" type="date" value={editorAdditionalTrainingData.dateCompleted || ''} onChange={handleAdditionalTrainingInputChange} className="input-class" required />
            </div>

             {/* Expiry Date Input (Optional) */}
             <div>
                <label htmlFor="addTrainExpiryDate" className="block text-sm font-medium text-gray-700 mb-1">Expiry Date (Optional)</label>
                <input id="addTrainExpiryDate" name="expiryDate" type="date" value={editorAdditionalTrainingData.expiryDate || ''} onChange={handleAdditionalTrainingInputChange} className="input-class" />
            </div>

             {/* File Upload Input */}
             <div>
                <label htmlFor="addTrainFile" className="block text-sm font-medium text-gray-700 mb-1">
                    Upload Certificate *
                    {(editingAdditionalTrainingId && editorAdditionalTrainingData.fileName && !editorAdditionalTrainingFile) &&
                     ` (Current: ${editorAdditionalTrainingData.fileName})`
                    }
                </label>
                <input id="addTrainFile" type="file" onChange={handleAdditionalTrainingFileChange} className="file-input-class" accept=".pdf,.jpg,.jpeg,.png"/>
                {editorAdditionalTrainingFile && <p className="mt-1 text-xs text-gray-500">Selected: {editorAdditionalTrainingFile.name}</p>}
                <p className="mt-1 text-xs text-gray-500">Required. PDF, JPG, PNG (Max 5MB).</p>
                {!(editingAdditionalTrainingId && editorAdditionalTrainingData.fileName) && !editorAdditionalTrainingFile &&
                    <p className="mt-1 text-xs text-red-500">File upload is required.</p>
                }
            </div>

             {/* Error Display */}
             {error && <p className="text-sm text-red-600 mt-2">{error}</p>}

             {/* Action Buttons */}
             <div className="flex justify-end space-x-3 mt-4">
                <button type="button" onClick={cancelAdditionalTrainingEditor} className="px-3 py-1.5 border border-gray-300 rounded-md text-sm text-gray-700 hover:bg-gray-50">Cancel</button>
                <button type="button" onClick={saveAdditionalTraining} className="px-3 py-1.5 bg-indigo-600 text-white rounded-md text-sm hover:bg-indigo-700">
                    {editingAdditionalTrainingId ? 'Save Changes' : 'Save Training'}
                </button>
             </div>
        </div>
    </div>
);

/** Renders the grouped and sorted summary list for additional training. */
const renderAdditionalTrainingSummaryList = (): JSX.Element => {
    // Use the memoized grouped and sorted data
    const { sortedCategories: localSortedCategories, grouped: localGroupedTraining } = {
         sortedCategories: sortedAdditionalTrainingCategories, grouped: groupedAdditionalTraining
    };

    return (
        <div className="mt-4 space-y-4">
            {additionalFirearmTrainingList.length > 0 ? (
                <div className="space-y-6 mb-4"> {/* Space between categories */}
                    {localSortedCategories.map((category: string) => (
                        <div key={category}>
                            <h4 className="text-md font-semibold text-gray-700 mb-2 border-b pb-1">{category}</h4>
                            <div className="space-y-3">
                                {localGroupedTraining[category].map((item: AdditionalFirearmTraining) => (
                                    <div key={item.id} className="p-3 border border-gray-200 rounded-md bg-white shadow-sm">
                                        <div className="flex justify-between items-start gap-4">
                                            {/* Details */}
                                            <div className="text-sm flex-grow">
                                                <p className="font-medium text-gray-900">{item.trainingName}</p>
                                                <p className="text-gray-600">Provider: {item.provider}</p>
                                                <p className="text-gray-600">
                                                    Completed: {item.dateCompleted}
                                                    {item.expiryDate && ` | Expires: ${item.expiryDate}`}
                                                </p>
                                                <p className="text-xs text-gray-500 mt-1">
                                                    File: {item.fileName ? item.fileName : <span className="text-red-500 italic">Missing</span>}
                                                </p>
                                            </div>
                                            {/* Actions */}
                                            <div className="flex space-x-2 flex-shrink-0">
                                                <button type="button" onClick={() => openAdditionalTrainingEditor(item.id)} className="p-1 text-indigo-600 hover:text-indigo-800" aria-label={`Edit ${item.trainingName}`}> <span>{FaEdit({ size: 16 })}</span> </button>
                                                <button type="button" onClick={() => removeAdditionalTraining(item.id)} className="p-1 text-red-600 hover:text-red-800" aria-label={`Remove ${item.trainingName}`}> <span>{FaTrash({ size: 16 })}</span> </button>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <p className="text-sm text-gray-500 italic mb-4">No additional firearm training added yet.</p>
            )}

            {/* Add Button */}
            <div className="flex justify-start pt-2">
                <button
                    type="button"
                    onClick={() => openAdditionalTrainingEditor()}
                    className="px-3 py-1.5 bg-gray-200 text-gray-700 rounded-md shadow-sm hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 text-sm"
                >
                    + Add Additional Training
                </button>
            </div>
        </div>
    );
}

  // --- Main Content Render ---
  const renderMainContent = (): JSX.Element => (
    <div className="space-y-8">

      {/* --- Section 2: Firearm Proficiency Certificate --- */}
      <div className="p-4 border rounded-md shadow-sm bg-white">
        <h3 className="text-lg font-medium leading-6 text-gray-900 mb-1">Firearm Proficiency Certificate</h3>
        <p className="text-sm text-gray-500 mb-4">
          Do you hold a valid proficiency certificate issued by a SAPS-accredited training provider (PFTC)? This is required before applying for SAPS Competency. *
        </p>
        <div className="flex items-center space-x-6 mb-4">
          <label className="inline-flex items-center cursor-pointer">
            <input
              type="radio"
              name="hasProficiencyCertificate"
              value="yes"
              checked={hasProficiencyCertificate === 'yes'}
              onChange={handleHasProficiencyChange}
              className="form-radio h-4 w-4 text-indigo-600 radio-class"
            />
            <span className="ml-2 text-sm text-gray-700">Yes</span>
          </label>
          <label className="inline-flex items-center cursor-pointer">
            <input
              type="radio"
              name="hasProficiencyCertificate"
              value="no"
              checked={hasProficiencyCertificate === 'no'}
              onChange={handleHasProficiencyChange}
              className="form-radio h-4 w-4 text-indigo-600 radio-class"
            />
            <span className="ml-2 text-sm text-gray-700">No</span>
          </label>
        </div>

        {/* Verification Message if 'No' */}
        {hasProficiencyCertificate === 'no' && (
            <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-md">
                <p className="text-sm text-yellow-800">
                    A valid Proficiency Certificate is the first step required by law to apply for SAPS Competency and subsequently a firearm license. Without it, you cannot proceed with firearm competency details in this application.
                </p>
            </div>
        )}

        {/* Render List/Editor if 'Yes' */}
        {hasProficiencyCertificate === 'yes' && (
            isProficiencyEditorOpen
                ? renderProficiencyEditor() // Show editor form
                : renderProficiencySummaryList() // Show summary list + Add button
        )}
      </div>
      <hr className="my-6 border-gray-200"/>

      {/* Render Section 3 only if Proficiency Cert = Yes */}
      {hasProficiencyCertificate === 'yes' && (
          <>
              {/* --- Section 3: SAPS Competency Certificate --- */}
              <div className="p-4 border rounded-md shadow-sm bg-white">
                  <h3 className="text-lg font-medium leading-6 text-gray-900 mb-1">SAPS Competency Certificate</h3>
                  <p className="text-sm text-gray-500 mb-4">
                     Do you hold a valid Competency Certificate issued by SAPS for specific firearm categories? This is required to apply for a firearm license. *
                  </p>
                  <div className="flex items-center space-x-6 mb-4">
                      <label className="inline-flex items-center cursor-pointer">
                          <input
                              type="radio"
                              name="hasCompetencyCertificate"
                              value="yes"
                              checked={hasCompetencyCertificate === 'yes'}
                              onChange={handleHasCompetencyChange} // Use the new handler
                              className="form-radio h-4 w-4 text-indigo-600 radio-class"
                          />
                          <span className="ml-2 text-sm text-gray-700">Yes</span>
                      </label>
                      <label className="inline-flex items-center cursor-pointer">
                          <input
                              type="radio"
                              name="hasCompetencyCertificate"
                              value="no"
                              checked={hasCompetencyCertificate === 'no'}
                              onChange={handleHasCompetencyChange} // Use the new handler
                              className="form-radio h-4 w-4 text-indigo-600 radio-class"
                          />
                          <span className="ml-2 text-sm text-gray-700">No</span>
                      </label>
                  </div>

                  {/* Verification Message if 'No' */}
                  {hasCompetencyCertificate === 'no' && (
                      <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-md">
                          <p className="text-sm text-yellow-800">
                              SAPS Competency is legally required to possess a firearm license and undertake certain duties (like Regulation 21 assessments). Without it, you cannot proceed with the remaining firearm sections.
                          </p>
                      </div>
                  )}

                  {/* Render List/Editor if 'Yes' */}
                  {hasCompetencyCertificate === 'yes' && (
                      isCompetencyEditorOpen
                          ? renderCompetencyEditor() // Show editor form
                          : renderCompetencySummaryList() // Show summary list + Add button
                  )}
              </div>
              <hr className="my-6 border-gray-200"/>

              {/* --- Section 4: Regulation 21 Assessment --- */}
              {/* Only render contents enabled if S2=Yes AND S3=Yes */}
              <div className={`p-4 border rounded-md shadow-sm bg-white ${hasCompetencyCertificate !== 'yes' ? 'opacity-50 bg-gray-100 pointer-events-none' : ''}`}>
                  <h3 className="text-lg font-medium leading-6 text-gray-900 mb-1">Regulation 21 Assessment</h3>
                  <p className="text-sm text-gray-500 mb-4">
                      When was your last / most recent regulation 21 assessment completed? *
                  </p>
                  <fieldset className="mt-4">
                      <legend className="sr-only">Regulation 21 Assessment Status</legend>
                      <div className="space-y-3">
                          {regulation21Options.map((option) => (
                              <label key={option.value} className="flex items-center cursor-pointer">
                                  <input
                                      type="radio"
                                      name="regulation21Status"
                                      value={option.value}
                                      checked={regulation21Status === option.value}
                                      onChange={handleRegulation21Change}
                                      disabled={hasCompetencyCertificate !== 'yes'} // Explicitly disable if S3 is not 'yes'
                                      className="form-radio h-4 w-4 text-indigo-600 radio-class"
                                  />
                                  <span className="ml-3 block text-sm font-medium text-gray-700">{option.label}</span>
                              </label>
                          ))}
                      </div>
                  </fieldset>
              </div>
              <hr className="my-6 border-gray-200"/>

              {/* --- Section 5: Additional Firearm Training --- */}
              {/* Only render contents enabled if S2=Yes AND S3=Yes */}
              <div className={`p-4 border rounded-md shadow-sm bg-white ${hasCompetencyCertificate !== 'yes' ? 'opacity-50 bg-gray-100 pointer-events-none' : ''}`}>
                  <h3 className="text-lg font-medium leading-6 text-gray-900 mb-1">Additional Firearm Training</h3>
                  <p className="text-sm text-gray-500 mb-4">
                      Do you have any additional firearm training beyond basic proficiency and competency (e.g., tactical courses, advanced marksmanship, sport shooting qualifications)? *
                  </p>
                  <div className="flex items-center space-x-6 mb-4">
                      <label className="inline-flex items-center cursor-pointer">
                          <input
                              type="radio"
                              name="hasAdditionalTraining"
                              value="yes"
                              checked={hasAdditionalTraining === 'yes'}
                              onChange={handleHasAdditionalTrainingChange}
                              disabled={hasCompetencyCertificate !== 'yes'}
                              className="form-radio h-4 w-4 text-indigo-600 radio-class"
                          />
                          <span className="ml-2 text-sm text-gray-700">Yes</span>
                      </label>
                      <label className="inline-flex items-center cursor-pointer">
                          <input
                              type="radio"
                              name="hasAdditionalTraining"
                              value="no"
                              checked={hasAdditionalTraining === 'no'}
                              onChange={handleHasAdditionalTrainingChange}
                              disabled={hasCompetencyCertificate !== 'yes'}
                              className="form-radio h-4 w-4 text-indigo-600 radio-class"
                          />
                          <span className="ml-2 text-sm text-gray-700">No</span>
                      </label>
                  </div>

                  {/* Render List/Editor if 'Yes' */}
                  {hasAdditionalTraining === 'yes' && (
                      isAdditionalTrainingEditorOpen
                          ? renderAdditionalTrainingEditor()
                          : renderAdditionalTrainingSummaryList()
                  )}
              </div>
          </>
      )}
      {/* End of conditional block for S3, S4, S5 */}


    </div> // End Main Content div
  );

  // --- Component Return ---
  return (
    <div>
      {/* Render Disclaimer or Main Content */}
      {!disclaimerAccepted ? renderDisclaimer() : renderMainContent()}

      {/* Navigation Buttons */}
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
          onClick={onNext}
          // Disable Next if disclaimer not accepted OR if user said No to proficiency (as they skip the rest)
          disabled={!disclaimerAccepted || hasProficiencyCertificate === 'no'}
          className={`px-6 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 ${(!disclaimerAccepted || hasProficiencyCertificate === 'no') ? 'opacity-50 cursor-not-allowed' : ''}`}
        >
          Next
        </button>
      </div>
    </div>
  );
};

export default Step6Firearms;