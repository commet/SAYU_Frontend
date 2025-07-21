const { execSync } = require('child_process');
const path = require('path');

// Create a temporary claude mock script
const claudeMockPath = path.join(__dirname, 'claude-mock.sh');
const fs = require('fs');

// Write a simple bash mock for claude
fs.writeFileSync(claudeMockPath, `#!/bin/bash
if [ "$1" = "--version" ]; then
    echo "Claude Code v1.0.0"
elif [ "$1" = "--print" ]; then
    echo "$2"
else
    echo "Claude Code mock"
fi
exit 0
`, { mode: 0o755 });

try {
  console.log('Running superclaude changelog with mock claude...');
  
  // Use Git Bash with modified PATH to include our mock
  const gitBashPath = '"C:\\Program Files\\Git\\usr\\bin\\bash.exe"';
  const currentDir = process.cwd().replace(/\\/g, '/').replace('C:', '/c');
  const mockDir = __dirname.replace(/\\/g, '/').replace('C:', '/c');
  
  // Create a wrapper script that adds our mock to PATH
  const wrapperScript = `
    export PATH="${mockDir}:$PATH"
    cd "${currentDir}"
    
    # Create claude wrapper
    cat > /tmp/claude << 'EOF'
#!/bin/bash
if [ "$1" = "--version" ]; then
    echo "Claude Code v1.0.0"
elif [ "$1" = "--print" ]; then
    echo "$2"
else
    echo "Claude Code mock"
fi
exit 0
EOF
    chmod +x /tmp/claude
    export PATH="/tmp:$PATH"
    
    # Now run superclaude
    superclaude changelog
  `;
  
  // Write wrapper script
  fs.writeFileSync('run-wrapper.sh', wrapperScript);
  
  // Execute via Git Bash
  const command = `${gitBashPath} ./run-wrapper.sh`;
  
  execSync(command, { 
    stdio: 'inherit',
    env: { ...process.env, FORCE_COLOR: '1' }
  });
  
} catch (error) {
  console.error('Error running superclaude:', error.message);
} finally {
  // Cleanup
  if (fs.existsSync(claudeMockPath)) {
    fs.unlinkSync(claudeMockPath);
  }
  if (fs.existsSync('run-wrapper.sh')) {
    fs.unlinkSync('run-wrapper.sh');
  }
}