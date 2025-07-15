export const fieldMetadata: Record<string, { label: string; description: string;options?: { label: string; value: string }}> = {
  sex: {
    label: "Sex",
    description: "Sex of Respondent",
    options: [
      { label: "Female", value: "0" },
      { label: "Male", value: "1" },
    ]
  },
  generalhealth: {
    label: "General Health",
    description: "Would you say that in general your health is:",
     options: [
      { label: "Excellent", value: "0" },
      { label: "Very Good", value: "4" },
      { label: "Good", value: "2" },
      { label: "Fair", value: "1" },
      { label: "Poor", value: "3" },
    ]
  },
  physicalhealthdays: {
    label: "Physical Health Days",
    description: "In the past 30 days, how many days was your physical health not good?",
     options: Array.from({ length: 31 }, (_, i) => ({
      value: i.toFixed(2),
      label: `${i} day${i === 1 ? "" : "s"}`,
    })),
},
  mentalhealthdays: {
    label: "Mental Health Days",
    description: "In the past 30 days, how many days was your mental health not good?",
    options: Array.from({ length: 31 }, (_, i) => ({
      value: i.toFixed(2),
      label: `${i} day${i === 1 ? "" : "s"}`,
    })),  
},
 
  lastcheckuptime:{
    label: "Last Check-up time",
    description: "About how long has it been since you last visited a doctor for a routine checkup?",
    options: [
      { value: "0", label: "Within past year" },
      { value: "1", label: "Within past 2 years" },
      { value: "2", label: "Within past 5 years" },
      { value: "3", label: "5 or more years ago" },
    ],
},
  
  physicalactivities:{
    label: "Physical Activities",
    description: "During the past month, other than your regular job, did you participate in any physical activities or exercises such as running, calisthenics, golf, gardening, or walking for exercise?",
    options: [
      { value: "0", label: "No" },
      { value: "1", label: "Yes" },
    ],
},

  sleephours:{
    label: "Sleep Hours",
    description: "On average, how many hours of sleep do you get in a 24-hour period?",
    options: Array.from({ length: 13 }, (_, i) => ({
      value: (i + 4).toFixed(1),
      label: `${i + 4} hours`,
    })),
},

  removedteeth:{
    label: "Removed Teeth",
    description: "Not including teeth lost for injury or orthodontics, how many of your permanent teeth have been removed because of tooth decay or gum disease?",
    options: [
      { value: "0", label: "1 to 5" },
      { value: "1", label: "6 or more, but not all" },
      { value: "2", label: "All" },
      { value: "3", label: "None of them" },
    ],
} ,
  
  hadstroke:{
    label: "Had Stroke",
    description: "(Ever told) (you had) a stroke.",
    options: [
      { value: "0", label: "No" },
      { value: "1", label: "Yes" },
    ],
  },
  
  hadasthma:{
    label: "Had asthma",
    description: "(Ever told) (you had) asthma?",
    options: [
      { value: "0", label: "No" },
      { value: "1", label: "Yes" },
    ],
},
  
  hadskincancer:{
    label: "Had Skin Cancer",
    description: "(Ever told) (you had) skin cancer that is not melanoma?",
    options: [
      { value: "0", label: "No" },
      { value: "1", label: "Yes" },
    ],
  },
  
  hadcopd:{
    label: "Had COPD",
    description: "(Ever told) (you had) C.O.P.D. (chronic obstructive pulmonary disease), emphysema or chronic bronchitis?",
    options: [
      { value: "0", label: "No" },
      { value: "1", label: "Yes" },
    ],
  },
  
  haddepressivedisorder:{
    label: "Had Depressive Disorder",
    description: "(Ever told) (you had) a depressive disorder (including depression, major depression, dysthymia, or minor depression)?",
    options: [
      { value: "0", label: "No" },
      { value: "1", label: "Yes" },
    ],
  },
  
  hadkidneydisease:{
    label: "Had Kidney Disease",
    description: "Not including kidney stones, bladder infection or incontinence, were you ever told you had kidney disease?",
    options: [
      { value: "0", label: "No" },
      { value: "1", label: "Yes" },
    ],
  },
  
  hadarthritis:{
    label: "Had Arthritis",
    description: "(Ever told) (you had) some form of arthritis, rheumatoid arthritis, gout, lupus, or fibromyalgia? (Arthritis diagnoses include: rheumatism, polymyalgia rheumatica; osteoarthritis (not osteporosis); tendonitis, bursitis, bunion, tennis elbow; carpal tunnel syndrome, tarsal tunnel syndrome; joint infection, etc.)",
    options: [
      { label: "No", value: "0" },
      { label: "Yes", value: "1" },
    ],
},
   
  haddiabetes:{
    label: "Had Diabetes",
    description: "(Ever told) (you had) diabetes?",
    options: [
      { value: "0", label: "No" },
      { value: "1", label: "Yes" },
    ],
},
  
  deaforhardofhearing:{
    label: "Deaf or hard of hearing",
    description: "Are you deaf or do you have serious difficulty hearing?",
    options: [
      { label: "No", value: "0" },
      { label: "Yes", value: "1" },
    ],
},
  
  blindorvisiondifficulty:{
    label: "Blind or vision dificulty",
    description: "Are you blind or do you have serious difficulty seeing, even when wearing glasses?",
    options: [
      { label: "No", value: "0" },
      { label: "Yes", value: "1" },
    ],
},
  
  difficultyconcentrating:{
    label: "Dificulty Concentrating",
    description: "Because of a physical, mental, or emotional condition, do you have serious difficulty concentrating, remembering, or making decisions?",
    options: [
      { label: "No", value: "0" },
      { label: "Yes", value: "1" },
    ],
},

  difficultywalking:{
    label: "Dificulty Walking",
    description: "Do you have serious difficulty walking or climbing stairs?",
    options: [
      { label: "No", value: "0" },
      { label: "Yes", value: "1" },
    ],
},
  
  difficultydressingbathing:{
    label: "Dificulty dressing/bathing",
    description: "Do you have difficulty dressing or bathing?",
    options: [
      { label: "No", value: "0" },
      { label: "Yes", value: "1" },
    ],
},
  
  difficultyerrands:{
    label: "Dificulty Errands",
    description: "Because of a physical, mental, or emotional condition, do you have difficulty doing errands alone such as visiting a doctor´s office or shopping?",
    options: [
      { label: "No", value: "0" },
      { label: "Yes", value: "1" },
    ],
},
  
  smokerstatus:{
    label: "Somker Status",
    description: "Four-level smoker status: Everyday smoker, Someday smoker, Former smoker, Non-smoker",
    options: [
      { label: "Current smoker - now smokes every day", value: "0" },
      { label: "Current smoker - now smokes some days", value: "1" },
      { label: "Former Smoker", value: "2" },
      { label: "Never smoked", value: "3" }
    ],
},
   
  ecigaretteusage:{
    label: "E-Cigarette Usage",
    description: "Would you say you have never used e-cigarettes or other electronic vaping products in your entire life or now use them every day, use them some days, or used them in the past but do not currently use them at all?",
    options: [
      { label: "Never used e-cigarettes in my entire life", value: "0" },
      { label: "Not at all (right now)", value: "1" },
      { label: "Use them some days", value: "3" },
      { label: "Use them every day", value: "2" }
    ],
},
  
  chestscan:{
    label: "Chest scan",
    description: "Have you ever had a CT or CAT scan of your chest area?",
    options: [
      { value: "0", label: "No" },
      { value: "1", label: "Yes" },
    ],
},
  
  raceethnicitycategory:{
    label: "Race ethnic",
    description: "Five-level race/ethnicity category",
    options: [
      { value: "4", label: "White only, Non-Hispanic" },
      { value: "0", label: "Black only, Non-Hispanic" },
      { value: "3", label: "Other race only, Non-Hispanic" },
      { value: "2", label: "Multiracial, Non-Hispanic" },
      { value: "1", label: "Hispanic" },
    ],
},
  
  agecategory:{
    label: "Age category",
    description: "Fourteen-level age category",
    options: [
    { value: "0", label: "18 to 24" },
    { value: "1", label: "25 to 29" },
    { value: "2", label: "30 to 34" },
    { value: "3", label: "35 to 39" },
    { value: "4", label: "40 to 44" },
    { value: "5", label: "45 to 49" },
    { value: "6", label: "50 to 54" },
    { value: "7", label: "55 to 59" },
    { value: "8", label: "60 to 64" },
    { value: "9", label: "65 to 69" },
    { value: "10", label: "70 to 74" },
    { value: "11", label: "75 to 79" },
    { value: "12", label: "80 or older" },
  ],
},
  
  heightinmeters:{
    label: "Height in Centimeter",
    description: "Reported height in centimeters",
  },
   
  bmi:{
    label: "Body mass index",
    description: "Body Mass Index (BMI) in kg",
  },
  
  alcoholdrinkers:{
    label: "Drinker",
    description: "Adults who reported having had at least one drink of alcohol in the past 30 days.",
    options: [
      { value: "0", label: "No" },
      { value: "1", label: "Yes" },
    ],
},
  
  hivtesting:{
    label: "HIV test",
    description: "Adults who have ever been tested for HIV",
    options: [
      { label: "No", value: "0" },
      { label: "Yes", value: "1" },
    ],
},
  
  fluvaxlast12:{
    label: "Flu vaccine",
    description: "During the past 12 months, have you had either flu vaccine that was sprayed in your nose or flu shot injected into your arm?",
    options: [
      { label: "No", value: "0" },
      { label: "Yes", value: "1" },
    ],
},
  
  pneumovaxever:{
    label: "Pneumonia",
    description: "Have you ever had a pneumonia shot also known as a pneumococcal vaccine?",
    options: [
      { label: "No", value: "0" },
      { label: "Yes", value: "1" },
    ],
},
   
  tetanuslast10tdap:{
    label: "Tetanus",
    description: "Have you received a tetanus shot in the past 10 years? Was this Tdap, the tetanus shot that also has pertussis or whooping cough vaccine?",
    options: [
      { label: "No", value: "0" },
      { label: "Yes", value: "1" },
    ],
},
  
  highrisklastyear:{
    label: "High Risk",
    description: "You have injected any drug other than those prescribed for you in the past year. You have been treated for a sexually transmitted disease or STD in the past year. You have given or received money or drugs in exchange for sex in the past year.",
    options: [
      { label: "No", value: "0" },
      { label: "Yes", value: "1" },
    ],
},
  
  covidpos:{
    label: "Covid-19 test",
    description: "Has a doctor, nurse, or other health professional ever told you that you tested positive for COVID 19?",
    options: [
      { label: "No", value: "0" },
      { label: "Yes", value: "1" },
    ],
},


};
