const fs = require('fs');

let css = fs.readFileSync('src/app/globals.css', 'utf8');

// Remove the greedy global reset
css = css.replace(/\*, \*::before, \*::after \{[^\}]+\}/g, '');

// Convert body to a wrapper class
css = css.replace(/body \s*\{/g, '.landing-page-wrapper { min-height: 100vh;');

// Convert global element selectors to specific classes
css = css.replace(/nav \s*\{/g, '.landing-nav {');
css = css.replace(/nav\.scrolled/g, '.landing-nav.scrolled');
css = css.replace(/section \s*\{/g, '.landing-section {');
css = css.replace(/footer \s*\{/g, '.landing-footer {');
css = css.replace(/footer \.nav-logo/g, '.landing-footer .nav-logo');
css = css.replace(/footer \.footer-links/g, '.landing-footer .footer-links');

// Handle media queries
css = css.replace(/@media \(max-width: 900px\) \{[\s\S]*?\}/, (match) => {
  let m = match;
  m = m.replace(/nav \s*\{/g, '.landing-nav {');
  m = m.replace(/section \s*\{/g, '.landing-section {');
  m = m.replace(/footer \s*\{/g, '.landing-footer {');
  return m;
});

fs.writeFileSync('src/app/globals.css', css);
