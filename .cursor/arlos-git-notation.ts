// Arlos Git Notation Rule Implementation
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

// Define the context interfaces
interface CommitContext {
  message: string;
  files: string[];
}

interface PreCommitContext {
  message: string;
}

// Define the registry interface
interface RuleRegistry {
  onCommit: (callback: (context: CommitContext) => Promise<string | void>) => void;
  onPreCommit: (callback: (context: PreCommitContext) => Promise<string | void>) => void;
}

// Regular expression to validate commit message format
const commitFormatRegex = /^(feat|fix|docs|style|refactor|perf|test|chore)\(([a-z0-9-]+)\):\s(.+)$/;

// Valid commit types
const validTypes = ['feat', 'fix', 'docs', 'style', 'refactor', 'perf', 'test', 'chore'];

/**
 * Function to validate a commit message
 */
function validateCommitMessage(message: string): string[] {
  const errors: string[] = [];
  const lines = message.split('\n').filter(line => line.trim() !== '');
  
  if (lines.length === 0) {
    errors.push('Commit message cannot be empty.');
    return errors;
  }
  
  const [subject, ...bodyAndFooter] = lines;
  
  // Validate subject line format
  if (!commitFormatRegex.test(subject)) {
    errors.push('Commit message must follow format: type(scope): subject');
    errors.push('Example: feat(auth): add login page');
    
    // More detailed analysis to help the user
    if (!subject.includes(':')) {
      errors.push('Missing colon in subject line.');
    } else {
      const [typeScope] = subject.split(':');
      
      if (!typeScope.includes('(') || !typeScope.includes(')')) {
        errors.push('Missing scope parentheses. Format should be: type(scope)');
      } else {
        const type = typeScope.split('(')[0];
        
        if (!validTypes.includes(type)) {
          errors.push(`Invalid type "${type}". Valid types are: ${validTypes.join(', ')}`);
        }
        
        const scopeMatch = typeScope.match(/\(([^)]+)\)/);
        if (!scopeMatch || !scopeMatch[1]) {
          errors.push('Missing scope between parentheses.');
        }
      }
    }
    
    const subjectText = subject.split(':')[1]?.trim();
    if (!subjectText) {
      errors.push('Missing subject text after colon.');
    } else if (subjectText[0] === subjectText[0].toUpperCase()) {
      errors.push('Subject should start with lowercase letter.');
    }
    
    if (subject.endsWith('.')) {
      errors.push('Subject line should not end with a period.');
    }
  }
  
  // Check subject line content
  if (/^[a-z]/.test(subject.split(':')[1]?.trim() || '')) {
    // Good: Subject starts with lowercase
  } else {
    errors.push('Subject should start with lowercase letter.');
  }
  
  // Check if the verb is in imperative mood
  const subjectText = subject.split(':')[1]?.trim() || '';
  const firstWord = subjectText.split(' ')[0];
  const commonNonImperativeVerbs = ['added', 'adding', 'fixed', 'fixing', 'updated', 'updating', 'removed', 'removing', 'changed', 'changing'];
  
  if (commonNonImperativeVerbs.includes(firstWord.toLowerCase())) {
    errors.push(`Use imperative mood in subject line: "${firstWord}" should be "${firstWord.replace(/ing$|ed$/, '')}" (present tense).`);
  }
  
  // Check body format if present
  if (bodyAndFooter.length > 0) {
    // Check if there's an empty line between subject and body
    if (bodyAndFooter[0] !== '') {
      errors.push('Add an empty line between subject and body.');
    }
    
    // Check body content
    const body = bodyAndFooter.slice(1);
    if (body.some(line => line.length > 72)) {
      errors.push('Body lines should be wrapped at 72 characters.');
    }
  }
  
  return errors;
}

/**
 * Function to analyze a commit and validate its format
 */
export async function analyzeCommit(context: CommitContext): Promise<string | void> {
  const { message } = context;
  
  // Validate the commit message format
  const errors = validateCommitMessage(message);
  
  if (errors.length > 0) {
    return `Commit Message Format Errors:\n${errors.join('\n')}`;
  }
}

/**
 * Function to check a commit message before it's committed
 */
export async function preCommitCheck(context: PreCommitContext): Promise<string | void> {
  const { message } = context;
  
  // Validate the commit message format
  const errors = validateCommitMessage(message);
  
  if (errors.length > 0) {
    return `Commit Message Format Errors:\n${errors.join('\n')}\n\nPlease format your commit message according to Arlos Git Notation.`;
  }
}

/**
 * Function to set up git commit-msg hook
 */
async function setupGitHook(): Promise<void> {
  try {
    // Check if .git directory exists
    const { stdout } = await execAsync('git rev-parse --is-inside-work-tree');
    
    if (stdout.trim() === 'true') {
      // Set up Git hook for commit-msg
      const hookScript = `#!/bin/sh
# Arlos Git Notation commit message hook
commit_msg_file=$1
message=$(cat $commit_msg_file)

# Check format: type(scope): subject
if ! grep -qE '^(feat|fix|docs|style|refactor|perf|test|chore)\\([a-z0-9-]+\\): .+' "$commit_msg_file"; then
  echo "ERROR: Commit message format is incorrect."
  echo "It should be: type(scope): subject"
  echo "Example: feat(auth): add login page"
  echo ""
  echo "Valid types: feat, fix, docs, style, refactor, perf, test, chore"
  exit 1
fi

# Check subject case (should start with lowercase)
subject=$(grep -E '^(feat|fix|docs|style|refactor|perf|test|chore)\\([a-z0-9-]+\\): .+' "$commit_msg_file" | sed 's/^[^:]*: \\(.*\\)/\\1/')
if echo "$subject" | grep -q '^[A-Z]'; then
  echo "ERROR: Subject should start with lowercase letter."
  exit 1
fi

# Check if subject ends with period
if echo "$subject" | grep -q '\\.$'; then
  echo "ERROR: Subject should not end with a period."
  exit 1
fi

exit 0
`;
      
      console.log('Setting up Arlos Git Notation commit-msg hook...');
      
      // Create .git/hooks directory if it doesn't exist
      await execAsync('mkdir -p .git/hooks');
      
      // Write the commit-msg hook
      await execAsync(`echo '${hookScript}' > .git/hooks/commit-msg`);
      
      // Make it executable
      await execAsync('chmod +x .git/hooks/commit-msg');
      
      console.log('Arlos Git Notation commit-msg hook installed successfully.');
    }
  } catch (error) {
    console.error('Error setting up Git hook:', error);
  }
}

// Set up git hook when rule is loaded
setupGitHook();

// Register the rule
export function register(registry: RuleRegistry): void {
  registry.onCommit(analyzeCommit);
  registry.onPreCommit(preCommitCheck);
} 