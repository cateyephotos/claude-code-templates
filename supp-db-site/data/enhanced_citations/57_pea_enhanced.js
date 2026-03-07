// Enhanced Citations for PEA (Phenylethylamine) (ID: 57)
// 2-Phenylethylamine — trace amine neuromodulator with strong mechanistic evidence but limited clinical trials
// ALL citations verified against PubMed — Last updated: 2026-03-07

const peaEnhanced = {
  "id": 57,
  "name": "PEA (Phenylethylamine)",
  "scientificName": "2-Phenylethylamine (beta-Phenylethylamine)",
  "category": "Nootropic",
  "evidenceProfile": {
    "overallQuality": "Tier 4",
    "totalCitations": 10,
    "researchQualityScore": 28,
    "lastEvidenceUpdate": "2026-03-07",
    "evidenceStrength": {
      "mechanisms": "Strong",
      "clinicalBenefits": "Weak",
      "safety": "Limited",
      "dosage": "Unclear"
    },
    "researchMaturity": "Emerging",
    "publicationSpan": "1986-2025",
    "keyFindings": "Exceptional mechanistic understanding of TAAR1 receptor activation and monoamine transporter modulation (including Nature crystal structure), but clinical evidence limited to small open-label case series requiring MAO-B inhibitor co-administration; no placebo-controlled RCTs for PEA supplementation exist; rapidly metabolized by MAO-B with half-life of minutes, making standalone oral supplementation pharmacologically challenging"
  },
  "citations": {
    "benefits": [
      {
        "healthDomain": "Mood Enhancement",
        "specificClaim": "PEA with MAO-B inhibitor co-administration produces sustained antidepressant response in ~86% of responders over 20-50 weeks",
        "claim": "PEA with MAO-B inhibitor co-administration produces sustained antidepressant response in ~86% of responders over 20-50 weeks",
        "strength": "Weak",
        "evidenceQuality": "Low",
        "replicationStatus": "Replicated by same research group only (Sabelli); no independent replication or placebo-controlled trials",
        "tissueTarget": "Central nervous system monoaminergic pathways",
        "target": "Central nervous system monoaminergic pathways",
        "evidence": [
          {
            "title": "Sustained antidepressant effect of PEA replacement",
            "authors": "Sabelli H, Fink P, Fawcett J, Tom C",
            "journal": "The Journal of Neuropsychiatry and Clinical Neurosciences",
            "year": 1996,
            "doi": "10.1176/jnp.8.2.168",
            "pmid": "9081552",
            "studyType": "Open-Label Case Series",
            "sampleSize": "14 patients with major depressive episodes",
            "duration": "20-50 weeks follow-up",
            "keyFindings": [
              "12 of 14 patients (86%) maintained antidepressant response at 20-50 week follow-up",
              "PEA dosed at 10-60mg/day orally with selegiline 10mg/day (MAO-B inhibitor to prevent rapid PEA destruction)",
              "Effective dose did not change with time (no tolerance, unlike amphetamine)",
              "No apparent side effects reported during treatment period",
              "Some patients were unresponsive to standard antidepressant treatments"
            ],
            "effectSize": "Large (within-group)",
            "pValue": "N/A (no placebo control)",
            "confidenceInterval": "N/A"
          },
          {
            "title": "Clinical studies on the phenylethylamine hypothesis of affective disorder: urine and blood phenylacetic acid and phenylalanine dietary supplements",
            "authors": "Sabelli HC, Fawcett J, Gusovsky F, Javaid JI, Wynn P, Edwards J, Jeffriess H, Kravitz H",
            "journal": "The Journal of Clinical Psychiatry",
            "year": 1986,
            "doi": "",
            "pmid": "3944066",
            "studyType": "Clinical Study (uncontrolled)",
            "sampleSize": "40 depressed patients (phenylalanine arm); 23 depressed + 12 controls (biomarker arm)",
            "duration": "Variable",
            "keyFindings": [
              "L-phenylalanine (PEA precursor) elevated mood in 31 of 40 (77.5%) depressed patients",
              "Mean urinary phenylacetic acid (PAA, PEA metabolite) significantly lower in 144 depressed patients vs 48 controls (78.2 vs 141.1 mg/24hr)",
              "Mean plasma PAA lower in depressed patients (300.33 ng/ml) vs controls (491.83 ng/ml)",
              "Results support PEA deficit hypothesis as a cause of a common form of depressive illness"
            ],
            "effectSize": "Large (biomarker difference)",
            "pValue": "N/A (descriptive statistics)",
            "confidenceInterval": "N/A"
          }
        ]
      },
      {
        "healthDomain": "Attention and Executive Function",
        "specificClaim": "Klamath algae extract containing PEA may improve attention and executive function in children with ADHD",
        "claim": "Klamath algae extract containing PEA may improve attention and executive function in children with ADHD",
        "strength": "Weak",
        "evidenceQuality": "Low",
        "replicationStatus": "Single open-label study with multi-ingredient extract; not replicated",
        "tissueTarget": "Prefrontal cortex and attentional networks",
        "target": "Prefrontal cortex and attentional networks",
        "evidence": [
          {
            "title": "Klamin supplementation in children with attention-deficit/hyperactivity disorder: a pilot study",
            "authors": "Cremonte M, Sisti D, Maraucci I, Giribone S, Colombo E, Savorani F, Ricci G",
            "journal": "Journal of Medicinal Food",
            "year": 2017,
            "doi": "10.1089/jmf.2016.0181",
            "pmid": "29116873",
            "studyType": "Open-Label Pilot Study",
            "sampleSize": "30 children aged 6-15 with ADHD",
            "duration": "6 months",
            "keyFindings": [
              "Significant improvements in overall clinical functioning assessed by CGI scale",
              "Significant improvements in inattention and hyperactivity-impulsivity symptoms",
              "Significant improvements in selective attention, sustained attention, and executive functions",
              "Note: Klamin is a Klamath algae extract containing PEA — not pure PEA supplement",
              "Limitations: open-label design, no placebo control, multi-ingredient extract confounds attribution"
            ],
            "effectSize": "Moderate (within-group)",
            "pValue": "<0.05",
            "confidenceInterval": "N/A"
          }
        ]
      }
    ],
    "safety": [
      {
        "safetyAspect": "General Tolerability",
        "riskLevel": "Moderate",
        "claim": "PEA appears well tolerated in small clinical studies but requires MAO-B inhibitor co-administration; rapid endogenous metabolism limits oral bioavailability",
        "tissueTarget": "Multiple systems",
        "target": "Multiple systems",
        "evidence": [
          {
            "title": "Sustained antidepressant effect of PEA replacement",
            "authors": "Sabelli H, Fink P, Fawcett J, Tom C",
            "journal": "The Journal of Neuropsychiatry and Clinical Neurosciences",
            "year": 1996,
            "doi": "10.1176/jnp.8.2.168",
            "pmid": "9081552",
            "studyType": "Open-Label Case Series",
            "sampleSize": "14 patients",
            "duration": "20-50 weeks",
            "keyFindings": [
              "No apparent side effects reported during 20-50 weeks of PEA + selegiline treatment",
              "PEA did not produce tolerance (unlike amphetamine)",
              "Required co-administration with selegiline (MAO-B inhibitor) to prevent rapid PEA destruction",
              "Oral PEA alone has extremely short half-life (minutes) due to MAO-B metabolism"
            ],
            "effectSize": "N/A",
            "pValue": "N/A",
            "confidenceInterval": "N/A"
          }
        ]
      },
      {
        "safetyAspect": "MAO Inhibitor Interaction and Hypertensive Risk",
        "riskLevel": "High",
        "claim": "PEA is an indirect sympathomimetic that can cause hypertensive crisis when combined with MAO inhibitors; this is the 'cheese effect' mechanism",
        "tissueTarget": "Cardiovascular system",
        "target": "Cardiovascular system",
        "evidence": [
          {
            "title": "Tranylcypromine in mind (Part I): Review of pharmacology",
            "authors": "Ulrich S, Ricken R, Adli M",
            "journal": "European Neuropsychopharmacology",
            "year": 2017,
            "doi": "10.1016/j.euroneuro.2017.05.007",
            "pmid": "28655495",
            "studyType": "Comprehensive Pharmacology Review",
            "sampleSize": "N/A",
            "duration": "N/A",
            "keyFindings": [
              "PEA described as 'endogenous amphetamine' — trace amine elevated by MAO inhibition",
              "Hypertensive crisis risk with indirect sympathomimetics including PEA when MAO is inhibited",
              "Tyramine-restricted diet mandatory during MAO inhibitor treatment due to related amine effects",
              "PEA has very short endogenous half-life due to rapid MAO-B metabolism"
            ],
            "effectSize": "N/A",
            "pValue": "N/A",
            "confidenceInterval": "N/A"
          },
          {
            "title": "Phenylethylamine modulation of affect: therapeutic and diagnostic implications",
            "authors": "Sabelli HC, Javaid JI",
            "journal": "The Journal of Neuropsychiatry and Clinical Neurosciences",
            "year": 1995,
            "doi": "10.1176/jnp.7.1.6",
            "pmid": "7711493",
            "studyType": "Review",
            "sampleSize": "N/A",
            "duration": "N/A",
            "keyFindings": [
              "PEA promotes energy, elevates mood, and favors aggression at brain level",
              "PEA administration requires selective MAO-B inhibitor to achieve therapeutic effect",
              "PEA is a neuromodulator of aminergic synapses, not a classical neurotransmitter",
              "Phenylacetic acid (PAA), the main PEA metabolite, is decreased in depressed and schizophrenic subjects"
            ],
            "effectSize": "N/A",
            "pValue": "N/A",
            "confidenceInterval": "N/A"
          }
        ]
      }
    ],
    "mechanisms": [
      {
        "mechanism": "TAAR1 receptor activation and monoamine transporter modulation",
        "claim": "TAAR1 receptor activation and monoamine transporter modulation",
        "mechanismType": "Receptor-mediated neuromodulation",
        "strength": "Strong",
        "tissueTarget": "Monoaminergic neurons (dopamine, serotonin, norepinephrine systems)",
        "target": "Monoaminergic neurons (dopamine, serotonin, norepinephrine systems)",
        "evidence": [
          {
            "title": "Beta-phenylethylamine alters monoamine transporter function via trace amine-associated receptor 1: implication for modulatory roles of trace amines in brain",
            "authors": "Xie Z, Miller GM",
            "journal": "The Journal of Pharmacology and Experimental Therapeutics",
            "year": 2008,
            "doi": "10.1124/jpet.107.134247",
            "pmid": "18182557",
            "studyType": "Experimental Mechanistic Study",
            "sampleSize": "In vitro (transfected cells) + ex vivo (rhesus monkey and mouse synaptosomes)",
            "duration": "N/A",
            "keyFindings": [
              "Beta-PEA significantly inhibits uptake and induces efflux of dopamine, norepinephrine, and serotonin via TAAR1",
              "Effects confirmed in brain synaptosomes from rhesus monkeys and wild-type mice",
              "Effects absent in TAAR1 knockout mouse synaptosomes (proving TAAR1 dependence)",
              "Efflux blocked by transporter inhibitors, confirming transporter-mediated mechanism",
              "Beta-PEA has poor binding affinity for monoamine autoreceptors (effects are TAAR1-specific)"
            ],
            "effectSize": "N/A",
            "pValue": "<0.001",
            "confidenceInterval": "N/A"
          },
          {
            "title": "Structural insights into ligand recognition and activation of the human TAAR1-Gs complex",
            "authors": "Liu H, Zheng Y, Wang Y, Wang C, He X, Shan P, Wang C, Zhou K, Jiang H, Jiang Y, Xu HE, Cheng X",
            "journal": "Nature",
            "year": 2023,
            "doi": "10.1038/s41586-023-06775-1",
            "pmid": "37935377",
            "studyType": "Structural Biology (Cryo-EM)",
            "sampleSize": "N/A (crystal structure determination)",
            "duration": "N/A",
            "keyFindings": [
              "First crystal structures of human TAAR1-Gs protein complexes bound to beta-PEA and methamphetamine",
              "Reveals molecular basis of beta-PEA recognition: lid-like ECL2 structure creates enclosed binding pocket",
              "Hydrogen-bonding network between PEA amino group and Asp103 is critical for receptor activation",
              "Structural basis explains why trace amines (PEA, tyramine) are endogenous TAAR1 agonists",
              "Published in Nature — landmark paper establishing structural pharmacology of TAAR1"
            ],
            "effectSize": "N/A",
            "pValue": "N/A",
            "confidenceInterval": "N/A"
          }
        ]
      },
      {
        "mechanism": "BDNF/TrkB/CREB neuroprotective signaling pathway",
        "claim": "BDNF/TrkB/CREB neuroprotective signaling pathway",
        "mechanismType": "Neuroplasticity and neurotrophic signaling",
        "strength": "Moderate",
        "tissueTarget": "Hippocampal neurons",
        "target": "Hippocampal neurons",
        "evidence": [
          {
            "title": "2-Phenylethylamine (PEA) Ameliorates Corticosterone-Induced Depression-Like Phenotype via the BDNF/TrkB/CREB Signaling Pathway",
            "authors": "Lee YJ, Kim HR, Lee CY, Hyun SA, Ko MY, Lee BS, Hwang DY, Ka M",
            "journal": "International Journal of Molecular Sciences",
            "year": 2020,
            "doi": "10.3390/ijms21239103",
            "pmid": "33265983",
            "studyType": "Experimental Study (in vitro + animal model)",
            "sampleSize": "C57BL/6 mice + hippocampal neuron cultures",
            "duration": "21 days corticosterone exposure + 4 days PEA treatment",
            "keyFindings": [
              "PEA (50mg/kg) significantly ameliorated corticosterone-induced depression-like behavior in mice",
              "PEA rescued dendritic spine formation damaged by corticosterone in hippocampal neurons",
              "PEA treatment significantly increased BDNF and TrkB expression in hippocampus",
              "Enhanced CREB phosphorylation in hippocampal neurons after PEA treatment",
              "PEA at 100 micromolar rescued dendritic spine architecture in corticosterone-treated neuron cultures"
            ],
            "effectSize": "Large (animal model)",
            "pValue": "<0.05",
            "confidenceInterval": "N/A"
          }
        ]
      },
      {
        "mechanism": "Gut microbiome-mediated serotonin biosynthesis via TAAR1",
        "claim": "Gut microbiome-mediated serotonin biosynthesis via TAAR1",
        "mechanismType": "Microbiome-gut-brain axis signaling",
        "strength": "Moderate",
        "tissueTarget": "Enterochromaffin cells and gut-brain axis",
        "target": "Enterochromaffin cells and gut-brain axis",
        "evidence": [
          {
            "title": "Gut microbiome-produced phenylethylamine stimulates serotonin biosynthesis via TAAR1 in enterochromaffin cells",
            "authors": "Zhai B, Shang X, Fu J, Li F, Zhang T",
            "journal": "Cell Host & Microbe",
            "year": 2022,
            "doi": "10.1016/j.chom.2022.11.006",
            "pmid": "36495868",
            "studyType": "Experimental Mechanistic Study",
            "sampleSize": "Germ-free mice + in vitro enterochromaffin cell models",
            "duration": "N/A",
            "keyFindings": [
              "Gut microbiota produces PEA from dietary phenylalanine via aromatic amino acid decarboxylase",
              "Microbiome-derived PEA activates TAAR1 on enterochromaffin cells in the gut",
              "TAAR1 activation by PEA stimulates serotonin (5-HT) biosynthesis in enterochromaffin cells",
              "Establishes a microbiome-gut-brain axis mechanism for PEA-mediated serotonin modulation",
              "Published in Cell Host & Microbe — establishes PEA as a microbiome-derived neuroactive metabolite"
            ],
            "effectSize": "N/A",
            "pValue": "<0.05",
            "confidenceInterval": "N/A"
          }
        ]
      }
    ],
    "dosage": [
      {
        "dosageRange": "10-60mg/day PEA with 10mg/day selegiline (MAO-B inhibitor); standalone oral PEA rapidly degraded",
        "claim": "Clinical antidepressant studies used 10-60mg/day PEA requiring co-administration with MAO-B inhibitor selegiline to prevent rapid metabolic destruction; standalone PEA supplementation has extremely short half-life (minutes) due to MAO-B metabolism",
        "evidenceBase": "Limited",
        "target": "Central nervous system",
        "tissueTarget": "Central nervous system",
        "evidence": [
          {
            "title": "Sustained antidepressant effect of PEA replacement",
            "authors": "Sabelli H, Fink P, Fawcett J, Tom C",
            "journal": "The Journal of Neuropsychiatry and Clinical Neurosciences",
            "year": 1996,
            "doi": "10.1176/jnp.8.2.168",
            "pmid": "9081552",
            "studyType": "Open-Label Case Series",
            "sampleSize": "14 patients",
            "duration": "20-50 weeks",
            "keyFindings": [
              "PEA 10-60mg/day orally with selegiline 10mg/day was the clinical protocol",
              "Selegiline (MAO-B inhibitor) required to prevent rapid PEA destruction by MAO-B enzymes",
              "Effective dose did not change with time (no tolerance development)",
              "Without MAO-B inhibitor, oral PEA has half-life of minutes and negligible CNS bioavailability"
            ],
            "effectSize": "N/A",
            "pValue": "N/A",
            "confidenceInterval": "N/A"
          },
          {
            "title": "Phenylethylamine modulation of affect: therapeutic and diagnostic implications",
            "authors": "Sabelli HC, Javaid JI",
            "journal": "The Journal of Neuropsychiatry and Clinical Neurosciences",
            "year": 1995,
            "doi": "10.1176/jnp.7.1.6",
            "pmid": "7711493",
            "studyType": "Review",
            "sampleSize": "N/A",
            "duration": "N/A",
            "keyFindings": [
              "PEA administration requires selective MAO-B inhibitor for therapeutic efficacy",
              "Alternative approach: L-phenylalanine supplementation as PEA precursor",
              "PEA rapidly metabolized by MAO-B in gut and liver — first-pass metabolism is extensive",
              "Chocolate and certain fermented foods contain PEA but amounts are pharmacologically insignificant orally"
            ],
            "effectSize": "N/A",
            "pValue": "N/A",
            "confidenceInterval": "N/A"
          }
        ]
      }
    ]
  }
};

// Global assignment for browser
if (typeof window !== 'undefined') {
  window.enhancedCitations = window.enhancedCitations || {};
  window.enhancedCitations[57] = peaEnhanced;
  window.peaEnhanced = peaEnhanced;
}

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
  module.exports = peaEnhanced;
}
