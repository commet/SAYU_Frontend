const { execSync } = require('child_process');
const path = require('path');

// Run superclaude changelog using node directly
try {
  console.log('Running superclaude changelog...');
  
  // Try to execute using Git Bash
  const gitBashPath = '"C:\\Program Files\\Git\\usr\\bin\\bash.exe"';
  const command = `${gitBashPath} -c "cd '${process.cwd()}' && export PATH=$PATH:/c/Users/admin/AppData/Roaming/npm && superclaude changelog"`;
  
  execSync(command, { 
    stdio: 'inherit',
    env: { ...process.env, FORCE_COLOR: '1' }
  });
} catch (error) {
  console.error('Error running superclaude:', error.message);
  
  // Alternative: Try running the bash script directly
  console.log('\nTrying alternative method...');
  try {
    const supercladePath = path.join(process.env.APPDATA, 'npm', 'node_modules', 'superclaude', 'bin', 'superclaude');
    const bashCommand = `"C:\\Program Files\\Git\\usr\\bin\\bash.exe" "${supercladePath}" changelog`;
    execSync(bashCommand, { stdio: 'inherit' });
  } catch (altError) {
    console.error('Alternative method also failed:', altError.message);
  }
}