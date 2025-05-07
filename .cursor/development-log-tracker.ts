// Development Log Tracker Implementation
import { promises as fs, existsSync } from 'fs';
import path from 'path';

// Define the context interface
interface PromptContext {
  prompt: string;
  response?: string;
}

// Define the registry interface
interface RuleRegistry {
  onPrompt: (callback: (context: PromptContext) => Promise<void>) => void;
}

// Main function that will be called on each prompt
export async function onPrompt(context: PromptContext): Promise<void> {
  try {
    // Get current date and time
    const now = new Date();
    const date = now.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
    const time = now.toLocaleTimeString('en-US', { hour: 'numeric', minute: 'numeric', timeZoneName: 'short' });
    
    // Get user prompt
    const prompt = context.prompt.trim();
    if (!prompt) return; // Skip empty prompts
    
    // Create title based on the prompt content (limited to first 50 chars for brevity)
    const promptTitle = prompt.length > 50 ? prompt.substring(0, 50) + '...' : prompt;
    const title = createTitleFromPrompt(promptTitle);
    
    // Find the next entry number
    const logPath = path.join(process.cwd(), 'DEVELOPMENT_LOG.md');
    
    if (!existsSync(logPath)) {
      console.error('DEVELOPMENT_LOG.md file not found');
      return;
    }
    
    const logContent = await fs.readFile(logPath, 'utf8');
    
    // Parse the log file to get sections and entry counts
    const { highestEntry, sections } = parseLogFile(logContent);
    const newEntryNumber = highestEntry + 1;
    
    // Determine which section this prompt belongs to
    const section = determineSection(prompt, sections);
    
    // Create the new entry
    const newEntry = `
### ${newEntryNumber}. ${title}
**Date:** ${date}  
**Time:** ${time}  
**Prompt:**
\`\`\`
${prompt}
\`\`\`

${context.response || 'Processing this prompt...'}
`;
    
    // Add the entry to the appropriate section
    let updatedContent = addEntryToSection(logContent, newEntry, section);
    
    // Update the table of contents if needed
    updatedContent = updateTableOfContents(updatedContent, sections);
    
    // Write the updated content back to the file
    await fs.writeFile(logPath, updatedContent, 'utf8');
    
    console.log(`Development log updated with entry #${newEntryNumber} in section "${section}"`);
    
  } catch (error) {
    console.error('Error updating development log:', error);
  }
}

// Create a meaningful title from the prompt
function createTitleFromPrompt(prompt: string): string {
  // Extract meaningful keywords from the prompt
  const keywords = [
    { term: /implement|create|add|build|develop/i, prefix: "Implementing" },
    { term: /fix|solve|resolve|correct/i, prefix: "Fixing" },
    { term: /update|modify|change|edit/i, prefix: "Updating" },
    { term: /test|verify|validate/i, prefix: "Testing" },
    { term: /refactor|improve|enhance/i, prefix: "Refactoring" },
    { term: /document|describe|explain/i, prefix: "Documenting" },
    { term: /analyze|examine|investigate/i, prefix: "Analyzing" }
  ];
  
  // Try to match a keyword pattern
  for (const { term, prefix } of keywords) {
    if (term.test(prompt)) {
      const match = prompt.match(term);
      if (match) {
        const verb = match[0];
        const restOfPrompt = prompt.substring(prompt.indexOf(verb) + verb.length).trim();
        const shortRest = restOfPrompt.length > 40 ? restOfPrompt.substring(0, 40) + "..." : restOfPrompt;
        return `${prefix} ${shortRest}`;
      }
    }
  }
  
  // Default title if no patterns match
  return `Processing: ${prompt.substring(0, 40)}${prompt.length > 40 ? "..." : ""}`;
}

// Parse the log file to extract sections and entry numbers
function parseLogFile(content: string): { highestEntry: number, sections: string[] } {
  const sections: string[] = [];
  let highestEntry = 0;
  
  // Extract section headers
  const sectionRegex = /^## (.+)$/gm;
  let match;
  
  while ((match = sectionRegex.exec(content)) !== null) {
    const sectionName = match[1].trim();
    if (sectionName !== "Table of Contents" && !sections.includes(sectionName)) {
      sections.push(sectionName);
    }
  }
  
  // Find the highest entry number
  const entryRegex = /### (\d+)\./g;
  while ((match = entryRegex.exec(content)) !== null) {
    const entryNum = parseInt(match[1], 10);
    if (entryNum > highestEntry) {
      highestEntry = entryNum;
    }
  }
  
  return { highestEntry, sections };
}

// Determine which section the prompt belongs to
function determineSection(prompt: string, sections: string[]): string {
  // Define keywords that map to different sections
  const sectionKeywords: Record<string, RegExp[]> = {
    "Initial Development": [/initial|start|begin|create|new|first/i],
    "Bug Fixes and Improvements": [/fix|bug|issue|improve|optimize|performance/i],
    "Testing": [/test|verify|validate|assert|expect/i],
    "Project Maintenance": [/maintain|update|clean|organize|refactor|document/i]
  };
  
  // Try to match the prompt with section keywords
  for (const section of sections) {
    const keywords = sectionKeywords[section];
    if (keywords) {
      for (const keyword of keywords) {
        if (keyword.test(prompt)) {
          return section;
        }
      }
    }
  }
  
  // Default to Project Maintenance if no match is found
  if (sections.includes("Project Maintenance")) {
    return "Project Maintenance";
  }
  
  // Or use the first non-Table of Contents section
  return sections.find(s => s !== "Table of Contents") || "Project Maintenance";
}

// Add the entry to the appropriate section
function addEntryToSection(content: string, entry: string, section: string): string {
  const sectionRegex = new RegExp(`## ${section}([^#]*)(##\\s|$)`, "s");
  const match = content.match(sectionRegex);
  
  if (match) {
    // If the section exists, add the entry at the end of the section
    const sectionContent = match[1];
    const updatedSectionContent = sectionContent.trim() + entry;
    return content.replace(sectionRegex, `## ${section}\n\n${updatedSectionContent}\n\n$2`);
  } else {
    // If the section doesn't exist, create it before Next Steps
    const nextStepsRegex = /\n## Next Steps/;
    if (nextStepsRegex.test(content)) {
      return content.replace(
        nextStepsRegex,
        `\n## ${section}\n${entry}\n\n## Next Steps`
      );
    } else {
      // If Next Steps doesn't exist, add at the end
      return content + `\n\n## ${section}\n${entry}`;
    }
  }
}

// Update the table of contents if needed
function updateTableOfContents(content: string, sections: string[]): string {
  const tocRegex = /## Table of Contents\s+((?:-\s+\[.+?\]\(.+?\)\s+)+)/;
  const tocMatch = content.match(tocRegex);
  
  if (tocMatch) {
    // Build a new table of contents
    let newToc = "## Table of Contents\n";
    for (const section of sections) {
      if (section !== "Table of Contents") {
        const anchor = section.toLowerCase().replace(/\s+/g, "-");
        newToc += `- [${section}](#${anchor})\n`;
      }
    }
    
    // Replace the old table of contents
    return content.replace(tocRegex, newToc);
  }
  
  return content;
}

// Register the rule for auto-execution on new prompts
export function register(registry: RuleRegistry): void {
  registry.onPrompt(onPrompt);
} 