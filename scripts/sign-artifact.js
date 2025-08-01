const { execSync } = require('child_process');
const path = require('path');

const signArtifact = (filePath) => {
  try {
    // Placeholder: Replace with actual Tableau signing tool command
    execSync(`taco sign ${path.resolve(filePath)}`, { stdio: 'inherit' });
    console.log(`Signed ${filePath}`);
  } catch (error) {
    console.error(`Error signing ${filePath}:`, error);
  }
};

if (require.main === module) {
  const filePath = process.argv[2];
  if (!filePath) {
    console.error('Please provide the path to the artifact to sign');
    process.exit(1);
  }
  signArtifact(filePath);
}