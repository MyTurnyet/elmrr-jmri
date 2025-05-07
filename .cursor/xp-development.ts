// XP Development Practices Rule Implementation
import path from 'path';
import { promises as fs } from 'fs';

// Define the context interfaces
interface CodeContext {
  code: string;
  fileName: string;
  language: string;
}

interface CommitContext {
  message: string;
  files: string[];
}

interface ProjectContext {
  newFile?: boolean;
  fileName?: string;
  language?: string;
}

// Define the registry interface
interface RuleRegistry {
  onCodeGeneration: (callback: (context: CodeContext) => Promise<string>) => void;
  onCommit: (callback: (context: CommitContext) => Promise<string | void>) => void;
  onProjectChange: (callback: (context: ProjectContext) => Promise<void>) => void;
}

/**
 * Function to analyze code for XP best practices and provide suggestions
 */
export async function analyzeCode(context: CodeContext): Promise<string> {
  const { code, fileName, language } = context;
  const suggestions: string[] = [];
  const ext = path.extname(fileName);

  // Check for test files
  if (fileName.includes('test') || fileName.includes('spec')) {
    suggestions.push(...analyzeTestFile(code));
  } else if (ext === '.ts' || ext === '.js' || ext === '.tsx' || ext === '.jsx') {
    suggestions.push(...analyzeSourceFile(code));
  }

  // If we have suggestions, return them; otherwise, return the original code
  if (suggestions.length > 0) {
    // Add XP principles as comments to the top of the file
    const commentStart = language === 'JavaScript' || language === 'TypeScript' ? '// ' : '# ';
    const commentBlock = 
      `${commentStart}XP Development Suggestions:\n` +
      suggestions.map(s => `${commentStart}${s}`).join('\n') +
      `\n\n`;
    
    return commentBlock + code;
  }

  return code;
}

/**
 * Function to analyze test files for XP best practices
 */
function analyzeTestFile(code: string): string[] {
  const suggestions: string[] = [];

  // Check for test-driven development practices
  if (!code.includes('expect(') && !code.includes('assert(')) {
    suggestions.push('Consider adding assertions to verify expected outcomes.');
  }

  // Check for descriptive test names
  if (code.includes('it(\'test\'') || code.includes('test(\'test\'')) {
    suggestions.push('Use descriptive test names that explain the behavior being tested.');
  }

  // Check for test organization
  if (!code.includes('describe(')) {
    suggestions.push('Consider grouping related tests with describe blocks for better organization.');
  }

  // Check for test isolation
  if (!code.includes('beforeEach(') && code.includes('let') && (code.includes('it(') || code.includes('test('))) {
    suggestions.push('Consider using beforeEach to isolate test setup and ensure test independence.');
  }

  return suggestions;
}

/**
 * Function to analyze source files for XP best practices
 */
function analyzeSourceFile(code: string): string[] {
  const suggestions: string[] = [];

  // Check for function/method size
  const lines = code.split('\n');
  let inFunction = false;
  let functionStart = 0;
  let functionName = '';

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    
    // Simple function detection
    if ((line.includes('function ') || line.includes('=>')) && !inFunction) {
      inFunction = true;
      functionStart = i;
      
      // Extract function name
      const match = line.match(/function\s+([a-zA-Z0-9_]+)/);
      functionName = match ? match[1] : 'anonymous';
    }
    
    // Simple ending detection
    if (inFunction && line === '}') {
      const functionLength = i - functionStart;
      if (functionLength > 20) {
        suggestions.push(`Function '${functionName}' is ${functionLength} lines long. Consider breaking it into smaller functions.`);
      }
      inFunction = false;
    }
  }

  // Check for comments/documentation
  const commentRatio = (code.match(/\/\//g) || []).length / lines.length;
  if (commentRatio < 0.1 && lines.length > 30) {
    suggestions.push('Consider adding more comments to explain complex logic and design decisions.');
  }

  // Check for complex conditionals
  const complexConditions = (code.match(/if\s*\(.*&&.*\)|if\s*\(.*\|\|.*\)/g) || []).length;
  if (complexConditions > 3) {
    suggestions.push('Multiple complex conditions detected. Consider extracting conditions to named variables or functions.');
  }

  // Check for magic numbers
  const magicNumbers = (code.match(/[^a-zA-Z0-9_"']([-+]?[0-9]+(\.[0-9]+)?)[^a-zA-Z0-9_.]/g) || []).filter(
    n => !['0', '1', '-1'].includes(n.trim())
  ).length;
  
  if (magicNumbers > 3) {
    suggestions.push('Multiple magic numbers detected. Consider using named constants for better readability.');
  }

  return suggestions;
}

/**
 * Function to analyze commit messages for XP best practices
 */
export async function analyzeCommit(context: CommitContext): Promise<string | void> {
  const { message, files } = context;
  const suggestions: string[] = [];

  // Check for short, non-descriptive commit messages
  if (message.length < 10) {
    suggestions.push('Use more descriptive commit messages that explain the why, not just the what.');
  }

  // Check for large commits (too many files)
  if (files.length > 10) {
    suggestions.push(`This commit changes ${files.length} files. Consider breaking it into smaller, focused commits.`);
  }

  // If we have suggestions, return them
  if (suggestions.length > 0) {
    return `XP Development Suggestions:\n${suggestions.join('\n')}`;
  }
}

/**
 * Function to handle project changes
 */
export async function handleProjectChange(context: ProjectContext): Promise<void> {
  const { newFile, fileName } = context;
  
  if (newFile && fileName) {
    const ext = path.extname(fileName);
    const baseName = path.basename(fileName, ext);
    
    // For new files, check if we should create a corresponding test file
    if ((ext === '.ts' || ext === '.js') && 
        !fileName.includes('.test.') && 
        !fileName.includes('.spec.') &&
        !fileName.includes('__tests__')) {
      
      const testFileName = fileName.replace(ext, `.test${ext}`);
      const testFilePath = path.join(process.cwd(), testFileName);
      
      // Check if test file already exists
      try {
        await fs.access(testFilePath);
      } catch {
        // Test file doesn't exist, suggest creating one
        console.log(`XP Development Suggestion: Create a test file for ${fileName}`);
        
        // Could optionally create a test template here
        const testTemplate = `import { ${baseName} } from './${baseName}';\n\n` +
                           `describe('${baseName}', () => {\n` +
                           `  it('should be properly tested', () => {\n` +
                           `    // Write your test here\n` +
                           `  });\n` +
                           `});\n`;
        
        // Just log a suggestion rather than creating the file automatically
        console.log(`Suggested test template:\n${testTemplate}`);
      }
    }
  }
}

// Register the rule for auto-execution
export function register(registry: RuleRegistry): void {
  registry.onCodeGeneration(analyzeCode);
  registry.onCommit(analyzeCommit);
  registry.onProjectChange(handleProjectChange);
} 