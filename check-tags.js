const fs = require('fs');
const path = require('path');

class TagChecker {
  constructor() {
    this.tagStack = [];
    this.errors = [];
    this.lineNumber = 0;
    this.verbose = true;
  }

  // Extract tag name from opening or closing tag
  extractTagName(tag) {
    // Remove < and > or />
    let tagContent = tag.replace(/^<\/?|\/?>$/g, '').trim();
    
    // Handle motion components and regular tags
    // Split by space to get just the tag name (before any attributes)
    const tagName = tagContent.split(/\s+/)[0];
    
    return tagName;
  }

  // Check if a tag is self-closing
  isSelfClosing(tag) {
    // Check for /> at the end
    if (tag.endsWith('/>')) return true;
    
    // Common self-closing tags in HTML/JSX
    const selfClosingTags = [
      'img', 'input', 'br', 'hr', 'meta', 'link', 'area', 'base', 
      'col', 'embed', 'source', 'track', 'wbr', 'Image', 'Input',
      'AnimatePresence' // Add AnimatePresence as it can be self-closing
    ];
    
    const tagName = this.extractTagName(tag);
    return selfClosingTags.some(sct => tagName.endsWith(sct));
  }

  // Check if it's a JSX fragment
  isFragment(tag) {
    return tag === '<>' || tag === '</>' || 
           tag.includes('<React.Fragment') || tag.includes('</React.Fragment');
  }

  // Process a single tag
  processTag(tag, lineNum, lineContent) {
    // Skip comments
    if (tag.startsWith('<!--') || tag.startsWith('{/*')) return;
    
    // Handle fragments
    if (this.isFragment(tag)) {
      if (tag === '<>' || tag.includes('<React.Fragment')) {
        this.tagStack.push({ tag: 'Fragment', line: lineNum, content: lineContent.trim() });
        if (this.verbose) console.log(`  Line ${lineNum}: Opening fragment`);
      } else if (tag === '</>' || tag.includes('</React.Fragment')) {
        if (this.tagStack.length === 0 || this.tagStack[this.tagStack.length - 1].tag !== 'Fragment') {
          this.errors.push(`Line ${lineNum}: Closing fragment without matching opening fragment`);
        } else {
          const removed = this.tagStack.pop();
          if (this.verbose) console.log(`  Line ${lineNum}: Closing fragment (opened at line ${removed.line})`);
        }
      }
      return;
    }
    
    // Skip self-closing tags
    if (this.isSelfClosing(tag)) {
      if (this.verbose) console.log(`  Line ${lineNum}: Self-closing tag ${tag}`);
      return;
    }
    
    const tagName = this.extractTagName(tag);
    
    // Check if it's a closing tag
    if (tag.startsWith('</')) {
      // Find matching opening tag
      let found = false;
      for (let i = this.tagStack.length - 1; i >= 0; i--) {
        if (this.tagStack[i].tag === tagName) {
          // Remove all tags from the found position to the end
          const removed = this.tagStack.splice(i);
          if (removed.length > 1) {
            // There were unclosed tags in between
            for (let j = 1; j < removed.length; j++) {
              this.errors.push(`Line ${removed[j].line}: Unclosed tag <${removed[j].tag}> (closed by </${tagName}> at line ${lineNum})`);
            }
          }
          if (this.verbose) console.log(`  Line ${lineNum}: Closing </${tagName}> (opened at line ${removed[0].line})`);
          found = true;
          break;
        }
      }
      
      if (!found) {
        this.errors.push(`Line ${lineNum}: Closing tag </${tagName}> without matching opening tag`);
        if (this.verbose) console.log(`  Line ${lineNum}: ERROR - Closing </${tagName}> without opening`);
      }
    } else {
      // It's an opening tag
      this.tagStack.push({ tag: tagName, line: lineNum, content: lineContent.trim() });
      if (this.verbose) console.log(`  Line ${lineNum}: Opening <${tagName}>`);
    }
  }

  // Check a file for balanced tags
  checkFile(filePath) {
    try {
      const content = fs.readFileSync(filePath, 'utf8');
      const lines = content.split('\n');
      
      // Improved regex to handle JSX better
      const tagRegex = /<\/?[A-Za-z][A-Za-z0-9._:-]*(?:\s+(?:(?:[^\s"'=<>`]+(?:\s*=\s*(?:"[^"]*"|'[^']*'|[^\s"'=<>`]+))?)|(?:\{[^}]*\})))*\s*\/?>|<>|<\/>/g;
      
      let inJSXExpression = false;
      let braceDepth = 0;
      
      lines.forEach((line, index) => {
        this.lineNumber = index + 1;
        
        // Skip pure comment lines
        if (line.trim().startsWith('//') || line.trim().startsWith('/*')) return;
        
        // Track brace depth for JSX expressions
        for (let char of line) {
          if (char === '{') braceDepth++;
          if (char === '}') braceDepth--;
        }
        
        // Find all tags in the line
        const matches = line.match(tagRegex);
        if (matches) {
          matches.forEach(tag => {
            // More sophisticated string literal detection
            const tagIndex = line.indexOf(tag);
            const beforeTag = line.substring(0, tagIndex);
            
            // Count quotes, accounting for escaped quotes
            const unescapedDoubleQuotes = (beforeTag.match(/(?<!\\)"/g) || []).length;
            const unescapedSingleQuotes = (beforeTag.match(/(?<!\\)'/g) || []).length;
            const backticks = (beforeTag.match(/`/g) || []).length;
            
            // If we're inside quotes or template literals, skip this tag
            if (unescapedDoubleQuotes % 2 === 1 || unescapedSingleQuotes % 2 === 1 || backticks % 2 === 1) {
              if (this.verbose) console.log(`  Line ${this.lineNumber}: Skipping tag inside string: ${tag}`);
              return;
            }
            
            this.processTag(tag, this.lineNumber, line);
          });
        }
      });
      
      // Report any remaining unclosed tags
      if (this.tagStack.length > 0) {
        console.log('\n❌ Unclosed tags found:');
        this.tagStack.forEach(({ tag, line, content }) => {
          this.errors.push(`Line ${line}: Unclosed tag <${tag}>`);
        });
      }
      
      // Report results
      console.log('\n═══════════════════════════════════════════');
      if (this.errors.length === 0) {
        console.log('✅ All tags are properly balanced!');
      } else {
        console.log('❌ Tag balance errors found:\n');
        this.errors.forEach(error => console.log(`  ${error}`));
        
        if (this.tagStack.length > 0) {
          console.log('\n📚 Tag stack at end of file:');
          this.tagStack.forEach(({ tag, line, content }) => {
            console.log(`  - <${tag}> opened at line ${line}`);
            console.log(`    Content: ${content.substring(0, 60)}...`);
          });
        }
      }
      console.log('═══════════════════════════════════════════\n');
      
      return this.errors.length === 0;
      
    } catch (error) {
      console.error(`Error reading file: ${error.message}`);
      return false;
    }
  }
}

// Main execution
const targetFile = path.join(__dirname, 'frontend', 'components', 'navigation', 'FloatingNav.tsx');

console.log(`🔍 Checking tags in: ${targetFile}\n`);
console.log('Processing tags (verbose mode):\n');

const checker = new TagChecker();
const isBalanced = checker.checkFile(targetFile);

process.exit(isBalanced ? 0 : 1);