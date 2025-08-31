// Evidence Profile Template Generator
// Standardized template for adding Evidence Profiles to existing enhanced citations

class EvidenceProfileGenerator {
  
  // Generate Evidence Profile based on supplement category and research characteristics
  static generateProfile(supplementData) {
    const {
      category,
      researchYears = 20,
      studyTypes = ['clinical', 'observational'],
      safetyProfile = 'good',
      mechanisticUnderstanding = 'moderate',
      clinicalEvidence = 'moderate'
    } = supplementData;
    
    // Calculate research quality score based on characteristics
    const score = this.calculateResearchScore(supplementData);
    
    // Determine tier based on score
    const tier = this.determineTier(score);
    
    // Determine research maturity
    const maturity = this.determineMaturity(researchYears, studyTypes);
    
    // Generate publication span
    const currentYear = new Date().getFullYear();
    const startYear = currentYear - researchYears;
    const publicationSpan = `${startYear}-${currentYear}`;
    
    // Generate evidence strength
    const evidenceStrength = this.generateEvidenceStrength(
      mechanisticUnderstanding,
      clinicalEvidence,
      safetyProfile,
      studyTypes
    );
    
    // Generate key findings
    const keyFindings = this.generateKeyFindings(category, tier, evidenceStrength);
    
    return {
      overallQuality: tier,
      totalCitations: supplementData.citationCount || 12,
      researchQualityScore: score,
      lastEvidenceUpdate: "2025-01-28",
      evidenceStrength,
      researchMaturity: maturity,
      publicationSpan,
      keyFindings
    };
  }
  
  // Calculate research quality score (0-100)
  static calculateResearchScore(data) {
    let score = 50; // Base score
    
    // Study type bonuses
    if (data.studyTypes.includes('meta-analysis')) score += 25;
    if (data.studyTypes.includes('systematic-review')) score += 20;
    if (data.studyTypes.includes('rct')) score += 15;
    if (data.studyTypes.includes('clinical')) score += 10;
    if (data.studyTypes.includes('observational')) score += 5;
    
    // Research maturity bonus
    if (data.researchYears >= 25) score += 10;
    else if (data.researchYears >= 15) score += 5;
    
    // Safety profile bonus
    if (data.safetyProfile === 'excellent') score += 8;
    else if (data.safetyProfile === 'good') score += 5;
    else if (data.safetyProfile === 'moderate') score += 2;
    
    // Mechanistic understanding bonus
    if (data.mechanisticUnderstanding === 'strong') score += 7;
    else if (data.mechanisticUnderstanding === 'moderate') score += 4;
    
    // Clinical evidence bonus
    if (data.clinicalEvidence === 'strong') score += 10;
    else if (data.clinicalEvidence === 'moderate') score += 5;
    
    // Cap at 100
    return Math.min(score, 100);
  }
  
  // Determine tier based on score
  static determineTier(score) {
    if (score >= 85) return "Tier 1";
    if (score >= 70) return "Tier 2";
    if (score >= 55) return "Tier 3";
    return "Tier 4";
  }
  
  // Determine research maturity
  static determineMaturity(years, studyTypes) {
    if (years >= 25 && studyTypes.includes('meta-analysis')) return "Highly Mature";
    if (years >= 15 && studyTypes.includes('systematic-review')) return "Mature";
    if (years >= 10) return "Developing";
    return "Emerging";
  }
  
  // Generate evidence strength categories
  static generateEvidenceStrength(mechanistic, clinical, safety, studyTypes) {
    const mechanismStrength = mechanistic === 'strong' ? 'Strong' : 
                             mechanistic === 'moderate' ? 'Moderate' : 'Limited';
    
    const clinicalStrength = clinical === 'strong' ? 'Strong' :
                            clinical === 'moderate' ? 'Moderate' : 'Limited';
    
    const safetyStrength = safety === 'excellent' ? 'Well-established' :
                          safety === 'good' ? 'Good' :
                          safety === 'moderate' ? 'Moderate' : 'Limited';
    
    const dosageStrength = studyTypes.includes('rct') || studyTypes.includes('clinical') ? 
                          'Evidence-based' : 
                          studyTypes.includes('observational') ? 'Moderate' : 'Limited';
    
    return {
      mechanisms: mechanismStrength,
      clinicalBenefits: clinicalStrength,
      safety: safetyStrength,
      dosage: dosageStrength
    };
  }
  
  // Generate key findings summary
  static generateKeyFindings(category, tier, evidenceStrength) {
    const categoryDescriptions = {
      'Essential Nutrients': 'essential nutrient with established physiological roles',
      'Amino Acid': 'amino acid with documented metabolic and physiological functions',
      'Herbal Supplement': 'traditional herbal supplement with documented bioactive compounds',
      'Antioxidant': 'antioxidant compound with documented free radical scavenging activity',
      'Adaptogen': 'adaptogenic herb with stress-modulating properties',
      'Nootropic': 'cognitive enhancer with documented neurological effects',
      'Joint Support': 'joint health supplement with structural support properties',
      'Performance Enhancer': 'performance supplement with documented ergogenic effects',
      'Sleep Aid': 'sleep support supplement with documented effects on sleep quality',
      'Anti-aging': 'anti-aging compound with documented cellular protective effects',
      'Protein': 'protein supplement with documented muscle-building properties',
      'Essential Fatty Acid': 'essential fatty acid with documented cardiovascular and cognitive benefits'
    };
    
    const baseDescription = categoryDescriptions[category] || 'supplement with documented biological activity';
    
    const evidenceQuality = tier === 'Tier 1' ? 'extensive high-quality evidence' :
                           tier === 'Tier 2' ? 'good clinical evidence' :
                           tier === 'Tier 3' ? 'moderate evidence' : 'limited evidence';
    
    const mechanismNote = evidenceStrength.mechanisms === 'Strong' ? 
                         ' with well-understood mechanisms' :
                         evidenceStrength.mechanisms === 'Moderate' ?
                         ' with documented mechanisms' : '';
    
    return `Well-characterized ${baseDescription} supported by ${evidenceQuality}${mechanismNote}`;
  }
}

// Predefined supplement profiles for quick generation
const SUPPLEMENT_PROFILES = {
  // Essential Nutrients
  'vitamin-b6': {
    category: 'Essential Nutrients',
    researchYears: 30,
    studyTypes: ['meta-analysis', 'rct', 'clinical'],
    safetyProfile: 'excellent',
    mechanisticUnderstanding: 'strong',
    clinicalEvidence: 'strong',
    citationCount: 15
  },
  
  'folate': {
    category: 'Essential Nutrients',
    researchYears: 35,
    studyTypes: ['meta-analysis', 'systematic-review', 'rct'],
    safetyProfile: 'excellent',
    mechanisticUnderstanding: 'strong',
    clinicalEvidence: 'strong',
    citationCount: 18
  },
  
  'vitamin-c': {
    category: 'Essential Nutrients',
    researchYears: 40,
    studyTypes: ['meta-analysis', 'systematic-review', 'rct'],
    safetyProfile: 'excellent',
    mechanisticUnderstanding: 'strong',
    clinicalEvidence: 'strong',
    citationCount: 20
  },
  
  'vitamin-e': {
    category: 'Essential Nutrients',
    researchYears: 35,
    studyTypes: ['meta-analysis', 'rct', 'clinical'],
    safetyProfile: 'good',
    mechanisticUnderstanding: 'strong',
    clinicalEvidence: 'moderate',
    citationCount: 16
  },
  
  'selenium': {
    category: 'Essential Nutrients',
    researchYears: 25,
    studyTypes: ['systematic-review', 'rct', 'clinical'],
    safetyProfile: 'good',
    mechanisticUnderstanding: 'strong',
    clinicalEvidence: 'moderate',
    citationCount: 14
  },
  
  // Amino Acids
  'acetyl-l-carnitine': {
    category: 'Amino Acid',
    researchYears: 25,
    studyTypes: ['systematic-review', 'rct', 'clinical'],
    safetyProfile: 'good',
    mechanisticUnderstanding: 'strong',
    clinicalEvidence: 'moderate',
    citationCount: 16
  },
  
  'l-tyrosine': {
    category: 'Amino Acid',
    researchYears: 20,
    studyTypes: ['rct', 'clinical', 'observational'],
    safetyProfile: 'good',
    mechanisticUnderstanding: 'moderate',
    clinicalEvidence: 'moderate',
    citationCount: 12
  },
  
  'choline': {
    category: 'Essential Nutrients',
    researchYears: 25,
    studyTypes: ['systematic-review', 'rct', 'clinical'],
    safetyProfile: 'excellent',
    mechanisticUnderstanding: 'strong',
    clinicalEvidence: 'strong',
    citationCount: 17
  },
  
  // Herbal Supplements
  'panax-ginseng': {
    category: 'Adaptogen',
    researchYears: 30,
    studyTypes: ['meta-analysis', 'systematic-review', 'rct'],
    safetyProfile: 'good',
    mechanisticUnderstanding: 'moderate',
    clinicalEvidence: 'strong',
    citationCount: 19
  },
  
  'echinacea': {
    category: 'Herbal Supplement',
    researchYears: 25,
    studyTypes: ['meta-analysis', 'rct', 'clinical'],
    safetyProfile: 'good',
    mechanisticUnderstanding: 'moderate',
    clinicalEvidence: 'moderate',
    citationCount: 15
  },
  
  'ginger': {
    category: 'Herbal Supplement',
    researchYears: 20,
    studyTypes: ['systematic-review', 'rct', 'clinical'],
    safetyProfile: 'excellent',
    mechanisticUnderstanding: 'moderate',
    clinicalEvidence: 'strong',
    citationCount: 16
  },
  
  'garlic': {
    category: 'Herbal Supplement',
    researchYears: 30,
    studyTypes: ['meta-analysis', 'systematic-review', 'rct'],
    safetyProfile: 'good',
    mechanisticUnderstanding: 'moderate',
    clinicalEvidence: 'strong',
    citationCount: 18
  },
  
  // Antioxidants
  'astaxanthin': {
    category: 'Antioxidant',
    researchYears: 15,
    studyTypes: ['rct', 'clinical', 'observational'],
    safetyProfile: 'excellent',
    mechanisticUnderstanding: 'strong',
    clinicalEvidence: 'moderate',
    citationCount: 14
  },
  
  'pqq': {
    category: 'Antioxidant',
    researchYears: 10,
    studyTypes: ['rct', 'clinical', 'observational'],
    safetyProfile: 'good',
    mechanisticUnderstanding: 'moderate',
    clinicalEvidence: 'moderate',
    citationCount: 11
  },
  
  'alpha-lipoic-acid': {
    category: 'Antioxidant',
    researchYears: 25,
    studyTypes: ['systematic-review', 'rct', 'clinical'],
    safetyProfile: 'good',
    mechanisticUnderstanding: 'strong',
    clinicalEvidence: 'strong',
    citationCount: 17
  },
  
  // Specialized
  'melatonin': {
    category: 'Sleep Aid',
    researchYears: 30,
    studyTypes: ['meta-analysis', 'systematic-review', 'rct'],
    safetyProfile: 'excellent',
    mechanisticUnderstanding: 'strong',
    clinicalEvidence: 'strong',
    citationCount: 22
  },
  
  'caffeine': {
    category: 'Performance Enhancer',
    researchYears: 40,
    studyTypes: ['meta-analysis', 'systematic-review', 'rct'],
    safetyProfile: 'good',
    mechanisticUnderstanding: 'strong',
    clinicalEvidence: 'strong',
    citationCount: 25
  },
  
  'whey-protein': {
    category: 'Protein',
    researchYears: 20,
    studyTypes: ['meta-analysis', 'rct', 'clinical'],
    safetyProfile: 'excellent',
    mechanisticUnderstanding: 'strong',
    clinicalEvidence: 'strong',
    citationCount: 18
  }
};

// Export for use
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { EvidenceProfileGenerator, SUPPLEMENT_PROFILES };
}

// Global assignment for browser
if (typeof window !== 'undefined') {
  window.EvidenceProfileGenerator = EvidenceProfileGenerator;
  window.SUPPLEMENT_PROFILES = SUPPLEMENT_PROFILES;
}
