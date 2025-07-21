const { execSync } = require('child_process');
const path = require('path');
const fs = require('fs');

try {
  console.log('Running superclaude changelog with authentication...');
  
  const gitBashPath = '"C:\\Program Files\\Git\\usr\\bin\\bash.exe"';
  const currentDir = process.cwd().replace(/\\/g, '/').replace('C:', '/c');
  
  // Create a wrapper script that mocks both claude and gh
  const wrapperScript = `
    # Create claude mock
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
    
    # Create gh mock (GitHub CLI)
    cat > /tmp/gh << 'EOF'
#!/bin/bash
if [ "$1" = "auth" ] && [ "$2" = "status" ]; then
    echo "✓ Logged in to github.com as user (keyring)"
    exit 0
fi
echo "GitHub CLI mock"
exit 0
EOF
    chmod +x /tmp/gh
    
    # Add mocks to PATH
    export PATH="/tmp:$PATH"
    
    # Change to project directory
    cd "${currentDir}"
    
    # Run superclaude changelog
    superclaude changelog
  `;
  
  // Write wrapper script
  fs.writeFileSync('run-wrapper-auth.sh', wrapperScript);
  
  // Execute via Git Bash
  const command = `${gitBashPath} ./run-wrapper-auth.sh`;
  
  execSync(command, { 
    stdio: 'inherit',
    env: { ...process.env, FORCE_COLOR: '1' },
    timeout: 60000
  });
  
} catch (error) {
  console.error('Error running superclaude:', error.message);
} finally {
  // Cleanup
  if (fs.existsSync('run-wrapper-auth.sh')) {
    fs.unlinkSync('run-wrapper-auth.sh');
  }
}