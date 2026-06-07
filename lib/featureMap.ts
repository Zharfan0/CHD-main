export const featureMap = {
  // ============================================
  // MODEL CNN-LSTM FULL (39 FITUR)
  // ============================================
  "cnn-lstm": [
    // Demografi
    "sex", "agecategory", "raceethnicitycategory",
    
    // Kesehatan umum
    "generalhealth", "physicalhealthdays", "mentalhealthdays", "sleephours",
    "bmi", "heightinmeters", "weightinkilograms",
    
    // Riwayat penyakit
    "hadangina", "hadstroke", "hadasthma", "hadcopd", 
    "hadarthritis", "haddiabetes", "hadkidneydisease", 
    "hadskincancer", "haddepressivedisorder",
    
    // Gaya hidup
    "physicalactivities", "removedteeth", "alcoholdrinkers", 
    "smokerstatus", "ecigaretteusage",
    
    // Pemeriksaan & vaksinasi
    "chestscan", "lastcheckuptime", "fluvaxlast12", "pneumovaxever", 
    "tetanuslast10tdap", "hivtesting",
    
    // Disabilitas
    "deaforhardofhearing", "blindorvisiondifficulty", 
    "difficultyconcentrating", "difficultywalking", 
    "difficultydressingbathing", "difficultyerrands",
    
    // Lainnya
    "highrisklastyear", "covidpos"
  ],

  // ============================================
  // MODEL RANDOM FOREST (10 FITUR)
  // ============================================
  "random-forest": [
    "sex", "generalhealth", "physicalhealthdays", "mentalhealthdays", "sleephours",
    "hadasthma", "haddiabetes", "raceethnicitycategory", "agecategory", "bmi"
  ],

  // ============================================
  // MODEL MUTUAL INFORMATION (10 FITUR)
  // ============================================
  "mi": [
    "physicalactivities", "hadasthma", "removedteeth", "alcoholdrinkers",
    "fluvaxlast12", "chestscan", "sex", "generalhealth",
    "raceethnicitycategory", "lastcheckuptime"
  ]
};