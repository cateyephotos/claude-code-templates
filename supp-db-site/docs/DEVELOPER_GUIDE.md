# 🛠️ Developer Guide - Evidence-Based Supplement Database

*Updated: 2025-08-25 00:20:00*

## 🎯 Overview

This guide provides comprehensive information for developers working on the Evidence-Based Supplement Database project. The project has been recently reorganized for optimal development experience and maintainability.

## 🏗️ Project Architecture

### Core Application Structure
```
supp-db-site/
├── index.html              # Main application entry point
├── package.json            # Dependencies and scripts
├── js/                     # Production JavaScript modules
├── data/                   # Supplement and citation databases
├── tests/                  # Test suites
└── [organized development tools and documentation]
```

### Key Components

#### 1. **Frontend Application** (`js/`)
- **app.modernized.js**: Main application logic and UI management
- **CitationRenderer.js**: Smart citation rendering with format normalization
- **CitationLoader.js**: Citation data loading and management
- **TemplateSystem.js**: Dynamic template rendering system
- **PerformanceOptimizer.js**: Performance optimization utilities
- **ErrorBoundary.js**: Error handling and recovery

#### 2. **Data Layer** (`data/`)
- **supplements.js**: Main supplement database (155+ supplements)
- **citations.js**: Citation database (471+ research papers)
- **enhanced_citations/**: Enhanced citation data with detailed metadata

#### 3. **Development Tools** (`tools/`)
- **analysis/**: Data analysis and gap identification tools
- **validation/**: Comprehensive validation and verification utilities
- **debug/**: Testing, debugging, and development utilities

## 🚀 Getting Started

### Prerequisites
- Node.js (v14+ recommended)
- npm or yarn package manager
- Modern web browser for testing

### Setup Instructions

1. **Clone and Install**
   ```bash
   git clone [repository-url]
   cd supp-db-site
   npm install
   ```

2. **Start Development Server**
   ```bash
   npm run dev
   # Opens development server at http://localhost:3000
   ```

3. **Explore the Codebase**
   - Main application: `index.html` + `js/` directory
   - Data files: `data/` directory
   - Development tools: `tools/` directory
   - Documentation: `docs/` directory

## 🔧 Development Tools

### Analysis Tools (`tools/analysis/`)

| Tool | Purpose | Usage |
|------|---------|-------|
| `analyze-citation-formats.js` | Analyze citation data formats | `node tools/analysis/analyze-citation-formats.js` |
| `analyze-enhancement-gaps.js` | Identify enhancement opportunities | `node tools/analysis/analyze-enhancement-gaps.js` |
| `audit-undefined-citations.js` | Find undefined citation references | `node tools/analysis/audit-undefined-citations.js` |
| `check-all-supplements-systematic.js` | Systematic supplement validation | `node tools/analysis/check-all-supplements-systematic.js` |

### Validation Tools (`tools/validation/`)

| Tool | Purpose | Usage |
|------|---------|-------|
| `validate-enhanced-frontend-rendering.js` | Test frontend citation rendering | `node tools/validation/validate-enhanced-frontend-rendering.js` |
| `verify-enhancement-status.js` | Verify enhancement implementation | `node tools/validation/verify-enhancement-status.js` |
| `phase-2b-doi-verification.js` | Verify DOI links and metadata | `node tools/validation/phase-2b-doi-verification.js` |

### Debug Tools (`tools/debug/`)

| Tool | Purpose | Usage |
|------|---------|-------|
| `debug-frontend-data-loading.js` | Debug data loading issues | `node tools/debug/debug-frontend-data-loading.js` |
| `test-enhanced-citations.js` | Test enhanced citation functionality | `node tools/debug/test-enhanced-citations.js` |
| `comprehensive-test-all-supplements.js` | Comprehensive supplement testing | `node tools/debug/comprehensive-test-all-supplements.js` |

## 📊 Data Management

### Supplement Data Structure
```javascript
{
  name: "Supplement Name",
  tier: 1-4,                    // Evidence tier
  category: "Category",
  benefits: {
    cognitive: ["benefit1", "benefit2"],
    non_cognitive: ["benefit1", "benefit2"]
  },
  dosage: "dosage information",
  safety: "safety profile",
  citations: ["citation1", "citation2"],
  enhanced: true/false          // Enhanced citation status
}
```

### Citation Data Structure
```javascript
{
  id: "unique_citation_id",
  title: "Study Title",
  authors: "Author List",
  journal: "Journal Name",
  year: 2023,
  doi: "10.1000/journal.doi",
  type: "meta-analysis|rct|review",
  participants: 100,
  duration: "8 weeks"
}
```

## 🧪 Testing Strategy

### Automated Testing
- **Unit Tests**: Test individual components and functions
- **Integration Tests**: Test component interactions
- **End-to-End Tests**: Test complete user workflows
- **Performance Tests**: Validate loading times and responsiveness

### Manual Testing
- **Cross-browser Testing**: Chrome, Firefox, Safari, Edge
- **Responsive Testing**: Desktop, tablet, mobile viewports
- **Accessibility Testing**: Screen readers, keyboard navigation
- **Data Validation**: Citation accuracy, supplement information

### Testing Tools
```bash
# Run all tests
npm test

# Run specific test categories
node tools/debug/test-enhanced-citations.js
node tools/validation/validate-enhanced-frontend-rendering.js
```

## 🔍 Code Quality

### Standards
- **ES6+ JavaScript**: Modern JavaScript features
- **Modular Architecture**: Clean separation of concerns
- **Performance Optimization**: Lazy loading, caching, debouncing
- **Error Handling**: Comprehensive error boundaries
- **Documentation**: Inline comments and external docs

### Best Practices
- **Citation Management**: Use CitationRenderer for all citation display
- **Data Loading**: Use CitationLoader for data management
- **Performance**: Implement lazy loading for large datasets
- **Error Handling**: Always include error boundaries
- **Testing**: Write tests for new features and bug fixes

## 📈 Performance Optimization

### Key Optimizations
- **Lazy Loading**: Citations loaded on demand
- **Debounced Search**: 300ms delay for search input
- **Virtual Scrolling**: For large supplement lists
- **Caching**: Browser and application-level caching
- **Minification**: Production builds are minified

### Performance Monitoring
```javascript
// Use PerformanceOptimizer for monitoring
import { PerformanceOptimizer } from './js/PerformanceOptimizer.js';
PerformanceOptimizer.measureLoadTime('component-name');
```

## 🐛 Debugging

### Common Issues
1. **Citation Not Displaying**: Check citation ID and enhanced status
2. **Search Not Working**: Verify search index and debouncing
3. **Performance Issues**: Check for memory leaks and large datasets
4. **Data Loading Errors**: Validate JSON structure and file paths

### Debug Tools
```bash
# Debug citation rendering
node tools/debug/debug-frontend-data-loading.js

# Test specific supplements
node tools/debug/test-problematic-supplements.js

# Comprehensive system check
node tools/debug/comprehensive-test-all-supplements.js
```

## 📚 Documentation

### Available Documentation
- **README.md**: Project overview and features
- **DEVELOPER_GUIDE.md**: This comprehensive guide
- **docs/development/**: Detailed development documentation
- **docs/project-management/**: Project management and planning docs

### Documentation Standards
- **Code Comments**: Explain complex logic and algorithms
- **Function Documentation**: JSDoc format for all public functions
- **API Documentation**: Document all public interfaces
- **Change Logs**: Document significant changes and updates

## 🚀 Deployment

### Development Deployment
```bash
npm run dev
# Serves on http://localhost:3000
```

### Production Deployment
```bash
npm run build  # Currently static site - no build required
# Deploy static files to web server
```

### Environment Configuration
- **Development**: Full debugging and development tools enabled
- **Production**: Optimized builds with minification and compression

## 🤝 Contributing

### Development Workflow
1. **Create Feature Branch**: `git checkout -b feature/new-feature`
2. **Develop and Test**: Use development tools for validation
3. **Run Tests**: Ensure all tests pass
4. **Update Documentation**: Update relevant documentation
5. **Submit Pull Request**: Include description and test results

### Code Review Process
- **Functionality**: Verify feature works as intended
- **Performance**: Check for performance implications
- **Testing**: Ensure adequate test coverage
- **Documentation**: Verify documentation is updated

---

**This guide provides the foundation for effective development on the Evidence-Based Supplement Database. The organized structure and comprehensive tools ensure efficient development and high code quality.**
