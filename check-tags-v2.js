const fs = require('fs');
const path = require('path');

class ImprovedTagChecker {
  constructor() {
    this.tagStack = [];
    this.errors = [];
    this.warnings = [];
  }

  // Parse the entire file content to extract tags with their positions
  extractTags(content) {
    const tags = [];
    const lines = content.split('\n');
    
    // State tracking for multiline tags
    let currentTag = '';
    let tagStartLine = -1;
    let inTag = false;
    let inString = false;
    let stringChar = '';
    let inComment = false;
    let commentType = '';
    
    for (let lineNum = 0; lineNum < lines.length; lineNum++) {
      const line = lines[lineNum];
      
      for (let i = 0; i < line.length; i++) {
        const char = line[i];
        const nextChar = line[i + 1] || '';
        const prevChar = line[i - 1] || '';
        
        // Handle comments
        if (!inString && !inComment) {
          if (char === '/' && nextChar === '/') {
            // Skip rest of line for // comments
            break;
          }
          if (char === '/' && nextChar === '*') {
            inComment = true;
            commentType = '/*';
            i++; // Skip next char
            continue;
          }
          if (char === '{' && nextChar === '/' && line[i + 2] === '*') {
            inComment = true;
            commentType = '{/*';
            i += 2; // Skip next chars
            continue;
          }
        }
        
        // Handle end of comments
        if (inComment) {
          if (commentType === '/*' && char === '*' && nextChar === '/') {
            inComment = false;
            i++; // Skip next char
            continue;
          }
          if (commentType === '{/*' && char === '*' && nextChar === '/' && line[i + 2] === '}') {
            inComment = false;
            i += 2; // Skip next chars
            continue;
          }
          continue; // Skip everything in comments
        }
        
        // Handle strings
        if (!inTag && !inString && (char === '"' || char === "'" || char === '`')) {
          if (prevChar !== '\\') {
            inString = true;
            stringChar = char;
          }
        } else if (inString && char === stringChar && prevChar !== '\\') {
          inString = false;
        }
        
        if (inString) continue;
        
        // Handle tag detection
        if (!inTag && char === '<') {
          // Check if this might be a tag
          const restOfLine = line.substring(i);
          if (restOfLine.match(/^<\/?[A-Za-z]/)) {
            inTag = true;
            currentTag = char;
            tagStartLine = lineNum + 1;
          }
        } else if (inTag) {
          currentTag += char;
          
          // Check for tag end
          if (char === '>') {
            // Check if it's inside a JSX expression
            const openBraces = (currentTag.match(/\{/g) || []).length;
            const closeBraces = (currentTag.match(/\}/g) || []).length;
            
            if (openBraces === closeBraces) {
              inTag = false;
              tags.push({
                tag: currentTag,
                line: tagStartLine,
                endLine: lineNum + 1
              });
              currentTag = '';
            }
          }
        }
      }
      
      // Add newline to current tag if we're still in a tag
      if (inTag && lineNum < lines.length - 1) {
        currentTag += '\n';
      }
    }
    
    return tags;
  }

  // Extract tag name and type
  parseTag(tagStr) {
    const tag = tagStr.trim();
    
    // Check if it's a fragment
    if (tag === '<>' || tag === '</>') {
      return { name: 'Fragment', type: tag === '<>' ? 'open' : 'close', selfClosing: false };
    }
    
    // Check if it's React.Fragment
    if (tag.includes('React.Fragment')) {
      const isClosing = tag.includes('</');
      return { name: 'React.Fragment', type: isClosing ? 'close' : 'open', selfClosing: tag.endsWith('/>') };
    }
    
    // Check if it's a closing tag
    const isClosing = tag.startsWith('</');
    
    // Extract tag name
    let tagContent = tag.replace(/^<\/?|\/?>$/g, '').trim();
    const tagName = tagContent.split(/[\s\n>]/)[0];
    
    // Check if self-closing
    const selfClosing = tag.endsWith('/>');
    
    return {
      name: tagName,
      type: isClosing ? 'close' : 'open',
      selfClosing: selfClosing
    };
  }

  // Check tags for balance
  checkTags(tags) {
    for (const tagInfo of tags) {
      const parsed = this.parseTag(tagInfo.tag);
      
      if (parsed.selfClosing) {
        // Self-closing tags don't need balance checking
        continue;
      }
      
      if (parsed.type === 'open') {
        this.tagStack.push({
          name: parsed.name,
          line: tagInfo.line,
          fullTag: tagInfo.tag.split('\n')[0] + (tagInfo.tag.includes('\n') ? '...' : '')
        });
      } else if (parsed.type === 'close') {
        // Find matching opening tag
        let found = false;
        
        for (let i = this.tagStack.length - 1; i >= 0; i--) {
          if (this.tagStack[i].name === parsed.name) {
            // Found matching tag
            const removed = this.tagStack.splice(i);
            
            // Check if there were unclosed tags in between
            if (removed.length > 1) {
              for (let j = 1; j < removed.length; j++) {
                this.warnings.push({
                  type: 'unclosed',
                  line: removed[j].line,
                  tag: removed[j].name,
                  message: `Tag <${removed[j].name}> was implicitly closed by </${parsed.name}> at line ${tagInfo.line}`
                });
              }
            }
            
            found = true;
            break;
          }
        }
        
        if (!found) {
          this.errors.push({
            type: 'unmatched-close',
            line: tagInfo.line,
            tag: parsed.name,
            message: `Closing tag </${parsed.name}> has no matching opening tag`
          });
        }
      }
    }
    
    // Check for remaining unclosed tags
    for (const unclosed of this.tagStack) {
      this.errors.push({
        type: 'unclosed',
        line: unclosed.line,
        tag: unclosed.name,
        message: `Tag <${unclosed.name}> is never closed`
      });
    }
  }

  // Main check function
  checkFile(filePath) {
    try {
      const content = fs.readFileSync(filePath, 'utf8');
      const tags = this.extractTags(content);
      
      console.log(`Found ${tags.length} tags in the file\n`);
      
      // Check tag balance
      this.checkTags(tags);
      
      // Report results
      console.log('═══════════════════════════════════════════');
      
      if (this.errors.length === 0 && this.warnings.length === 0) {
        console.log('✅ All tags are properly balanced!\n');
        return true;
      }
      
      if (this.errors.length > 0) {
        console.log(`❌ Found ${this.errors.length} tag balance errors:\n`);
        for (const error of this.errors) {
          console.log(`  Line ${error.line}: ${error.message}`);
        }
        console.log('');
      }
      
      if (this.warnings.length > 0) {
        console.log(`⚠️  Found ${this.warnings.length} warnings:\n`);
        for (const warning of this.warnings) {
          console.log(`  Line ${warning.line}: ${warning.message}`);
        }
        console.log('');
      }
      
      if (this.tagStack.length > 0) {
        console.log('📚 Unclosed tags at end of file:');
        for (const unclosed of this.tagStack) {
          console.log(`  - <${unclosed.name}> opened at line ${unclosed.line}`);
          console.log(`    Tag: ${unclosed.fullTag}`);
        }
        console.log('');
      }
      
      console.log('═══════════════════════════════════════════\n');
      
      return false;
      
    } catch (error) {
      console.error(`Error reading file: ${error.message}`);
      return false;
    }
  }
}

// Main execution
const targetFile = path.join(__dirname, 'frontend', 'components', 'navigation', 'FloatingNav.tsx');

console.log(`🔍 Checking tags in: ${targetFile}\n`);

const checker = new ImprovedTagChecker();
const isBalanced = checker.checkFile(targetFile);

// Optionally show some sample multiline tags found
console.log('\n💡 Tip: If you see unexpected errors, check for:');
console.log('  - Multiline JSX tags that span multiple lines');
console.log('  - Tags inside string literals or comments');
console.log('  - Self-closing components like <AnimatePresence />');
console.log('  - JSX expressions with nested braces');

process.exit(isBalanced ? 0 : 1);