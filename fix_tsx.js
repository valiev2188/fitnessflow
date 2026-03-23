const fs = require('fs');

let tsx = fs.readFileSync('src/app/page.tsx', 'utf8');

// Replace fragment with wrapper div
tsx = tsx.replace(/<>\s*\{\/\* NAV \*\/\}/, '<div className="landing-page-wrapper">\n      {/* NAV */}');
// Also need to replace the bottom fragment closure
tsx = tsx.replace(/<\/footer>\s*<\/>/, '</footer>\n    </div>');

// Add landing-nav class (Wait: <nav id="navbar">)
tsx = tsx.replace(/<nav id="navbar">/g, '<nav id="navbar" className="landing-nav">');

// Add landing-section to all sections
// Find <section... and if it has className="", inject landing-section
tsx = tsx.replace(/<section([^>]*)className="([^"]+)"([^>]*)>/g, '<section$1className="landing-section $2"$3>');
// Hande <section ... > without className
tsx = tsx.replace(/<section(?!.*className=)/g, '<section className="landing-section"');

// footer
tsx = tsx.replace(/<footer>/, '<footer className="landing-footer">');

fs.writeFileSync('src/app/page.tsx', tsx);
