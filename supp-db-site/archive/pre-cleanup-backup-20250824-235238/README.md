# Evidence-Based Supplement Database

A comprehensive interactive website featuring evidence-based supplements for cognitive and mental health, backed by 471+ research papers and systematic reviews.

## Features

### 🔍 Advanced Search & Filtering
- **Smart Search**: Search by supplement name, benefits, mechanisms, or categories
- **Multi-tier Filtering**: Filter by evidence strength, category, health domain, and safety rating
- **Real-time Results**: Instant filtering with debounced search for optimal performance

### 📊 Evidence-Based Classification
- **Tier 1**: Meta-analyses and systematic reviews (strongest evidence)
- **Tier 2**: Large RCTs with >100 participants (strong evidence)  
- **Tier 3**: Smaller RCTs with 30-100 participants (moderate evidence)
- **Tier 4**: Preliminary studies and animal research (preliminary evidence)

### 🧪 Comprehensive Supplement Profiles
Each supplement includes:
- **Evidence Tier** with rationale
- **Primary Benefits** (cognitive and non-cognitive)
- **Dosage Ranges** from successful studies
- **Study Populations** and durations
- **Mechanisms of Action** 
- **Safety Profiles** with side effects and contraindications
- **Commercial Availability** and cost estimates
- **Key Citations** with DOIs

### ⚖️ Interactive Comparison Tool
- Compare up to 3 supplements side-by-side
- Detailed comparison tables
- Visual radar charts for evidence strength
- Export comparison data

### 🧮 Personalized Dosage Calculator
- Input personal profile (age, weight, sex, activity level)
- Select health goals from 7 domains
- Get personalized supplement recommendations
- Dosage adjustments based on individual factors

### ❤️ User Features
- **Favorites System**: Save preferred supplements
- **Data Export**: Export filtered results or favorites
- **Responsive Design**: Optimized for desktop, tablet, and mobile
- **Professional Interface**: Clean, medical-grade design

## Health Domains Covered

1. **Memory Enhancement** - Working memory, long-term memory, episodic memory
2. **Focus & Attention** - Sustained attention, selective attention, cognitive control
3. **Sleep Quality** - Sleep onset, maintenance, architecture, daytime alertness
4. **Anxiety Reduction** - Generalized anxiety, performance anxiety, stress-induced anxiety
5. **Stress Resilience** - HPA axis regulation, cortisol management, adaptogenic effects
6. **Neuroprotection** - Oxidative stress, neuroinflammation, neuronal survival
7. **Mood Stabilization** - Depression symptoms, mood regulation, emotional well-being

## Supplement Categories

- **Nootropics**: Primary cognitive enhancement (Bacopa monnieri, Creatine, L-Theanine)
- **Adaptogens**: Stress adaptation herbs (Ashwagandha, Rhodiola rosea)
- **Anti-inflammatory**: Strong anti-inflammatory compounds (Turmeric, Omega-3)
- **Essential Nutrients**: Vitamins and minerals (Vitamin D3, Magnesium)
- **Sleep Support**: Sleep quality improvement (Melatonin, Magnesium)
- **Performance Enhancers**: Physical and mental performance (Creatine, Rhodiola)

## Technical Implementation

### Frontend Technologies
- **HTML5** with semantic markup and accessibility features
- **Tailwind CSS** for responsive, utility-first styling
- **Vanilla JavaScript** for optimal performance and compatibility
- **Chart.js** for interactive data visualizations
- **Font Awesome** for consistent iconography

### Key Features
- **Progressive Enhancement**: Works without JavaScript
- **Mobile-First Design**: Responsive across all devices
- **Fast Loading**: Optimized assets and minimal dependencies
- **SEO Optimized**: Proper meta tags and structured data
- **Accessibility**: ARIA labels and keyboard navigation

### Data Structure
- **JSON Database**: Structured supplement data with comprehensive metadata
- **Local Storage**: Persistent favorites and user preferences
- **Export Functionality**: JSON data export for external use

## Installation & Setup

1. **Clone or Download** the project files
2. **Install Dependencies** (optional, for development server):
   ```bash
   npm install
   ```
3. **Run Development Server**:
   ```bash
   npm run dev
   ```
4. **Open in Browser**: Navigate to `http://localhost:3000`

For production, simply serve the static files from any web server.

## Data Sources & Methodology

### Research Foundation
- **471+ Research Papers** from systematic searches
- **20-Year Evidence Window** (2005-2025)
- **Multiple Databases**: SciSpace, PubMed, Google Scholar, ArXiv
- **Quality Filters**: Peer-reviewed publications, validated outcome measures

### Evidence Evaluation Criteria
- **Study Design**: RCT > cohort > case-control > case series
- **Sample Size**: Larger samples provide more reliable results  
- **Duration**: Longer studies show sustained effects
- **Outcome Measures**: Validated cognitive and health assessment tools
- **Statistical Power**: Adequate power calculations required
- **Conflict of Interest**: Independent funding preferred

### Safety Assessment
- **Comprehensive Profiles**: Side effects, contraindications, drug interactions
- **Population-Specific**: Age, health status, and condition considerations
- **Clinical Guidelines**: Professional medical advice recommendations
- **Regular Updates**: Continuous monitoring of new safety data

## Target Audiences

### Healthcare Professionals
- Evidence-based recommendation tools
- Clinical application guidelines  
- Safety and interaction profiles
- Patient counseling resources

### Fitness Enthusiasts  
- Performance optimization focus
- Exercise-supplement synergies
- Timing and cycling protocols
- Cost-benefit analysis tools

### General Consumers
- Practical implementation guides
- Quality assessment criteria
- Realistic expectation setting
- Accessible science explanations

## Browser Support

- **Modern Browsers**: Chrome 70+, Firefox 65+, Safari 12+, Edge 79+
- **Mobile Browsers**: iOS Safari 12+, Chrome Mobile 70+
- **Fallbacks**: Graceful degradation for older browsers
- **Accessibility**: Screen reader compatible, keyboard navigation

## Contributing

This database is continuously updated with new research findings. For suggestions or corrections:

1. **Research Updates**: Submit new studies with DOIs
2. **Data Corrections**: Report any inaccuracies with sources
3. **Feature Requests**: Suggest new functionality
4. **Bug Reports**: Report technical issues with details

## License & Disclaimer

### Educational Use
This information is for educational purposes only and should not replace professional medical advice. Always consult with a healthcare provider before starting any supplement regimen.

### Data Accuracy
While every effort is made to ensure accuracy, supplement research is constantly evolving. Users should verify information with current literature and healthcare professionals.

### Commercial Use
The database structure and methodology may be used for educational and research purposes. Commercial use requires attribution and compliance with source material licenses.

## Contact & Support

- **Research Team**: research@supplementdb.com
- **Technical Support**: support@supplementdb.com  
- **Website**: www.supplementdb.com
- **Updates**: Follow for latest research additions and database updates

---

**Medical Disclaimer**: This database provides educational information only. Supplement use should be guided by qualified healthcare professionals who can assess individual needs, health status, and potential interactions with medications or medical conditions.