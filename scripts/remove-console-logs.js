#!/usr/bin/env node

const fs = require('fs').promises;
const path = require('path');

// Files and directories to exclude
const excludePaths = [
  'node_modules',
  '.next',
  '.git',
  'dist',
  'build',
  'scripts/remove-console-logs.js',
  'lib/admin-auth.ts', // Keep auth logging for security
  'lib/session.ts', // Keep session logging for security
  'app/api/admin/auth/route.ts', // Keep auth error logging
];

// Keep certain console statements for security/error handling
const keepPatterns = [
  /console\.error\s*\(\s*['"`]Auth/i,
  /console\.error\s*\(\s*['"`]Session/i,
  /console\.error\s*\(\s*['"`]ADMIN_PASSWORD/i,
  /console\.warn\s*\(\s*['"`]Security/i,
];

async function shouldExcludePath(filePath) {
  return excludePaths.some(exclude => filePath.includes(exclude));
}

async function shouldKeepLine(line) {
  return keepPatterns.some(pattern => pattern.test(line));
}

async function processFile(filePath) {
  try {
    const content = await fs.readFile(filePath, 'utf8');
    const lines = content.split('\n');
    let modified = false;
    const newLines = [];

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];

      // Check if line contains console statement
      if (line.includes('console.')) {
        // Check if we should keep this specific console statement
        if (!shouldKeepLine(line)) {
          // Check if it's a multi-line console statement
          if (line.trim().startsWith('console.') || line.includes('console.log') ||
              line.includes('console.error') || line.includes('console.warn') ||
              line.includes('console.debug') || line.includes('console.info')) {

            // Handle multi-line console statements
            let fullStatement = line;
            let j = i;
            let openParens = (line.match(/\(/g) || []).length;
            let closeParens = (line.match(/\)/g) || []).length;

            while (openParens > closeParens && j < lines.length - 1) {
              j++;
              fullStatement += '\n' + lines[j];
              openParens += (lines[j].match(/\(/g) || []).length;
              closeParens += (lines[j].match(/\)/g) || []).length;
            }

            // Skip all lines that were part of the console statement
            i = j;
            modified = true;

            // Add a comment if this was an important log
            if (line.includes('error') || line.includes('Error')) {
              newLines.push('    // Debug log removed - consider proper error handling');
            }
            continue;
          }
        }
      }

      newLines.push(line);
    }

    if (modified) {
      await fs.writeFile(filePath, newLines.join('\n'));
      return true;
    }
    return false;
  } catch (error) {
    console.error(`Error processing ${filePath}:`, error.message);
    return false;
  }
}

async function walkDirectory(dir) {
  const files = [];
  const items = await fs.readdir(dir, { withFileTypes: true });

  for (const item of items) {
    const fullPath = path.join(dir, item.name);

    if (await shouldExcludePath(fullPath)) {
      continue;
    }

    if (item.isDirectory()) {
      files.push(...await walkDirectory(fullPath));
    } else if (item.isFile() &&
               (item.name.endsWith('.ts') ||
                item.name.endsWith('.tsx') ||
                item.name.endsWith('.js') ||
                item.name.endsWith('.jsx'))) {
      files.push(fullPath);
    }
  }

  return files;
}

async function main() {
  console.log('🧹 Starting console.log cleanup...\n');

  const projectRoot = path.resolve(__dirname, '..');
  const files = await walkDirectory(projectRoot);

  console.log(`Found ${files.length} files to process\n`);

  let modifiedCount = 0;
  const modifiedFiles = [];

  for (const file of files) {
    const wasModified = await processFile(file);
    if (wasModified) {
      modifiedCount++;
      modifiedFiles.push(file);
      console.log(`✓ Cleaned: ${path.relative(projectRoot, file)}`);
    }
  }

  console.log('\n' + '='.repeat(50));
  console.log(`\n✨ Cleanup complete!`);
  console.log(`   Files scanned: ${files.length}`);
  console.log(`   Files modified: ${modifiedCount}`);

  if (modifiedFiles.length > 0) {
    console.log('\n📝 Modified files:');
    modifiedFiles.forEach(file => {
      console.log(`   - ${path.relative(projectRoot, file)}`);
    });
  }
}

main().catch(console.error);