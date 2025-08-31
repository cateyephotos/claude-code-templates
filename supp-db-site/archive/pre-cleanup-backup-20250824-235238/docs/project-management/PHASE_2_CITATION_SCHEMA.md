# Phase 2 Enhanced Citation Schema Design

## 🎯 **Schema Overview**

The Phase 2 citation system provides granular mapping between every claim in a supplement profile and its supporting research evidence. This creates full traceability from assertions to peer-reviewed sources.

## 🏗️ **Core Architecture**

### **1. Citation Categories**
- **Mechanisms**: Research supporting mechanisms of action
- **Benefits**: Clinical trials proving health domain benefits  
- **Safety**: Studies documenting safety profiles and interactions
- **Dosage**: Research establishing optimal dosage ranges
- **Populations**: Studies defining effective target populations
- **Interactions**: Research on drug/supplement interactions

### **2. Evidence Quality Levels**
- **Level 1**: Meta-analyses and systematic reviews
- **Level 2**: Large RCTs (n>100) with strong methodology
- **Level 3**: Moderate RCTs (n=30-100) or well-designed studies
- **Level 4**: Small studies (n<30) or preliminary research
- **Level 5**: In vitro, animal studies, or theoretical mechanisms

### **3. Claim Mapping System**
Each claim type has specific citation requirements:
- **Primary Benefits**: Minimum 2 Level 1-2 citations
- **Mechanisms**: Minimum 1 mechanistic study per claimed pathway
- **Safety**: Comprehensive safety studies and adverse event reporting
- **Dosage**: Dose-response studies or established clinical protocols

## 📋 **Complete Schema Structure**

```javascript
{
  "id": 1,
  "name": "Supplement Name",
  "scientificName": "Scientific name",
  
  // Enhanced Evidence System
  "evidenceProfile": {
    "overallQuality": "Tier 1", // Existing tier system
    "totalCitations": 12,
    "researchQualityScore": 85, // 0-100 calculated score
    "lastEvidenceUpdate": "2025-08-17",
    "evidenceStrength": {
      "mechanisms": "Strong", // Strong/Moderate/Limited/Theoretical
      "clinicalBenefits": "Strong",
      "safety": "Well-established",
      "dosage": "Evidence-based"
    }
  },

  // Detailed Citation Mapping
  "citations": {
    
    // Mechanism Citations - Links each mechanism to research
    "mechanisms": [
      {
        "mechanism": "Acetylcholinesterase inhibition",
        "strength": "Strong",
        "evidence": [
          {
            "citationId": "das_2002",
            "title": "Cholinesterase inhibitory activity of Bacopa monniera",
            "authors": ["Das A", "Shanker G", "Nath C", "Pal R", "Singh S", "Singh HK"],
            "year": 2002,
            "journal": "Life Sciences",
            "volume": "71",
            "issue": "10", 
            "pages": "1085-1094",
            "doi": "10.1016/s0024-3205(02)01813-x",
            "pmid": "12204071",
            "studyType": "In vitro",
            "evidenceLevel": "Level 4",
            "findings": "Bacopa extract showed 23% inhibition of acetylcholinesterase activity",
            "relevantDose": "50-200 μg/ml extract concentration",
            "methodology": "Enzyme assay with electric eel AChE",
            "limitations": "In vitro only, needs human validation"
          }
        ]
      },
      {
        "mechanism": "Enhanced synaptic transmission", 
        "strength": "Moderate",
        "evidence": [
          {
            "citationId": "singh_1997",
            "title": "Effect of Bacopa monniera Linn. on cognitive function in Alzheimer's disease patients",
            "authors": ["Singh HK", "Dhawan BN"],
            "year": 1997,
            "journal": "Phytotherapy Research", 
            "doi": "10.1002/(SICI)1099-1573(199708)11:5<391::AID-PTR82>3.0.CO;2-6",
            "studyType": "Clinical trial",
            "evidenceLevel": "Level 3",
            "findings": "Improved cognitive function via enhanced neurotransmission",
            "sampleSize": "n=35",
            "duration": "12 weeks"
          }
        ]
      }
    ],

    // Benefit Citations - Clinical evidence for health domain claims
    "benefits": [
      {
        "healthDomain": "Memory Enhancement",
        "specificClaim": "Improves episodic memory in healthy adults",
        "strength": "Strong",
        "evidence": [
          {
            "citationId": "roodenrys_2002",
            "title": "Chronic effects of Brahmi (Bacopa monnieri) on human memory",
            "authors": ["Roodenrys S", "Booth D", "Bulzomi S", "Phipps A", "Micallef C", "Smoker J"],
            "year": 2002,
            "journal": "Neuropsychopharmacology", 
            "volume": "27",
            "issue": "2",
            "pages": "279-281",
            "doi": "10.1016/S0893-133X(02)00280-1",
            "pmid": "12093601",
            "studyType": "Randomized controlled trial",
            "evidenceLevel": "Level 2",
            "studyDesign": "Double-blind, placebo-controlled",
            "sampleSize": "n=76",
            "population": "Healthy adults aged 18-60",
            "duration": "12 weeks",
            "dosage": "300mg daily standardized extract",
            "primaryOutcome": "Auditory Verbal Learning Test",
            "results": {
              "effectSize": "Cohen's d = 0.95",
              "pValue": "p < 0.01",
              "clinicalSignificance": "Significant improvement in word recall",
              "baselineToEndpoint": "23% improvement in delayed recall"
            },
            "methodologyQuality": "High",
            "limitations": ["Single-center study", "Relatively short duration"],
            "clinicalRelevance": "Demonstrates practical memory enhancement in healthy adults"
          },
          {
            "citationId": "stough_2001",
            "title": "The chronic effects of an extract of Bacopa monniera (Brahmi) on cognitive function in healthy human subjects",
            "authors": ["Stough C", "Lloyd J", "Clarke J", "Downey LA", "Hutchison CW", "Rodgers T", "Nathan PJ"],
            "year": 2001,
            "journal": "Psychopharmacology",
            "volume": "156",
            "issue": "4", 
            "pages": "481-484",
            "doi": "10.1007/s002130100815",
            "pmid": "11498727",
            "studyType": "Randomized controlled trial",
            "evidenceLevel": "Level 2",
            "studyDesign": "Double-blind, placebo-controlled",
            "sampleSize": "n=46", 
            "population": "Healthy adults aged 18-60",
            "duration": "12 weeks",
            "dosage": "300mg daily standardized extract",
            "primaryOutcome": "Cognitive Drug Research battery",
            "results": {
              "effectSize": "Medium effect (d = 0.52)",
              "pValue": "p < 0.05", 
              "clinicalSignificance": "Improved information processing and working memory",
              "specificFindings": "Faster information processing speed, improved working memory"
            },
            "replication": "Confirms Roodenrys et al. findings",
            "methodologyQuality": "High"
          }
        ],
        "metaAnalysisSupport": {
          "citationId": "pase_2012",
          "title": "The cognitive-enhancing effects of Bacopa monnieri: a systematic review of randomized, controlled human clinical trials",
          "effectSize": "Small to moderate effect across studies",
          "confidence": "High confidence in memory benefits"
        }
      },
      {
        "healthDomain": "Attention Improvement",
        "specificClaim": "Enhances sustained attention and processing speed", 
        "strength": "Moderate",
        "evidence": [
          {
            "citationId": "downey_2013",
            "title": "An examination of the effects of the herb Bacopa monnieri on cerebral blood flow in healthy humans",
            "authors": ["Downey LA", "Kean J", "Nemeh F", "Lau A", "Poll A", "Gregory R", "Murray M", "Rourke J", "Patak B", "Pase MP", "Zangara A", "Lomas J", "Scholey A", "Stough C"],
            "year": 2013,
            "journal": "Journal of Alternative and Complementary Medicine",
            "doi": "10.1089/acm.2012.0367",
            "studyType": "Randomized controlled trial",
            "evidenceLevel": "Level 2",
            "findings": "Improved processing speed and reduced choice reaction time",
            "mechanism": "Enhanced cerebral blood flow in frontal cortex"
          }
        ]
      }
    ],

    // Safety Citations - Comprehensive safety documentation
    "safety": [
      {
        "safetyAspect": "General tolerability",
        "claim": "Well tolerated with minimal side effects in clinical trials",
        "evidence": [
          {
            "citationId": "calabrese_2008",
            "title": "Effects of a standardized Bacopa monnieri extract on cognitive performance, anxiety, and depression in the elderly",
            "safetyFindings": "No serious adverse events reported",
            "adverseEvents": ["Mild GI upset in 3% of participants", "Transient nausea in 2%"],
            "dropoutRate": "5% (similar to placebo)",
            "longTermSafety": "No safety concerns over 12 weeks"
          }
        ]
      },
      {
        "safetyAspect": "Drug interactions",
        "claim": "May enhance effects of cholinesterase inhibitors",
        "evidence": [
          {
            "citationId": "russo_2005",
            "title": "Pharmacokinetic profile of Bacopa monnieri standardized extract",
            "interactionType": "Theoretical synergistic effect",
            "recommendation": "Monitor when used with dementia medications"
          }
        ]
      }
    ],

    // Dosage Citations - Evidence for optimal dosing
    "dosage": [
      {
        "dosageRange": "300mg daily",
        "claim": "Optimal dose for cognitive enhancement based on clinical trials",
        "evidence": [
          {
            "citationId": "stough_2008",
            "title": "Examining the nootropic effects of a special extract of Bacopa monniera on human cognitive functioning",
            "doseResponse": "300mg showed optimal benefit-to-risk ratio",
            "comparison": "300mg vs 600mg showed similar benefits with better tolerability"
          }
        ]
      }
    ],

    // Population Citations - Target population evidence  
    "populations": [
      {
        "population": "Healthy adults 18-65",
        "claim": "Effective for cognitive enhancement in healthy populations",
        "evidence": [
          {
            "citationId": "stough_2001",
            "populationDetails": "Healthy adults without cognitive impairment",
            "exclusionCriteria": ["Psychiatric conditions", "Cognitive impairment", "Medication use"],
            "effectiveness": "Significant cognitive improvements demonstrated"
          }
        ]
      },
      {
        "population": "Elderly with cognitive complaints", 
        "claim": "May benefit age-related cognitive decline",
        "evidence": [
          {
            "citationId": "calabrese_2008",
            "populationDetails": "Adults 65+ with subjective cognitive complaints",
            "findings": "Improved cognitive function and reduced anxiety",
            "clinicalSignificance": "Relevant for healthy aging"
          }
        ]
      }
    ]
  },

  // Citation Quality Metrics
  "citationMetrics": {
    "totalStudies": 12,
    "rctCount": 8,
    "systematicReviews": 2,
    "metaAnalyses": 1,
    "totalParticipants": 847,
    "averageStudyQuality": 7.8, // 0-10 scale
    "replicationStatus": "Well-replicated",
    "publicationBias": "Low risk",
    "industryFunding": "Mixed (60% independent, 40% industry)",
    "conflictsOfInterest": "Disclosed and minimal"
  }
}
```

## 🎯 **Implementation Strategy**

### **Phase 2A: Schema Implementation** 
1. Create enhanced citation structure for top 20 supplements
2. Implement claim-to-citation mapping system
3. Add research quality scoring algorithms

### **Phase 2B: Research Enhancement**
1. Systematic literature review for mechanism citations
2. Clinical trial compilation for benefit claims  
3. Safety study integration for risk assessment

### **Phase 2C: Validation & Testing**
1. Expert review of citation mappings
2. Cross-verification of claims against evidence
3. User testing of enhanced citation system

## 📊 **Quality Standards**

- **Minimum Citations per Supplement**: 8-12 studies
- **Evidence Level Distribution**: 60% Level 1-2, 30% Level 3, 10% Level 4-5
- **Claim Coverage**: 100% of mechanisms and benefits must have citations
- **Methodology Verification**: All studies reviewed for quality and relevance
- **Update Frequency**: Quarterly review and annual comprehensive update

This schema transforms our database from basic citation lists to a comprehensive evidence mapping system that provides full traceability for every claim made about each supplement.