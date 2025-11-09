#!/bin/bash

echo "Starting comprehensive console statement cleanup..."

# Count initial console statements
initial_count=$(grep -r "console\." --include="*.ts" --include="*.tsx" app/ components/ lib/ | wc -l)
echo "Found $initial_count console statements to review"

# Process each file
for file in $(find app components lib -type f \( -name "*.ts" -o -name "*.tsx" \)); do
  # Skip critical auth and session files
  if [[ "$file" == *"admin-auth"* ]] || [[ "$file" == *"session.ts"* ]]; then
    echo "Skipping security file: $file"
    continue
  fi

  # Create temp file
  temp_file=$(mktemp)

  # Process the file line by line
  while IFS= read -r line; do
    # Remove standalone console.log statements
    if echo "$line" | grep -q "^\s*console\.log"; then
      echo "    // Debug log removed" >> "$temp_file"
    # Remove standalone console.error (but keep error handling)
    elif echo "$line" | grep -q "^\s*console\.error"; then
      if echo "$line" | grep -q "Auth\|Session\|ADMIN_PASSWORD"; then
        echo "$line" >> "$temp_file"
      else
        echo "    // Error log removed - TODO: Add proper error handling" >> "$temp_file"
      fi
    # Remove console.warn
    elif echo "$line" | grep -q "^\s*console\.warn"; then
      echo "    // Warning log removed" >> "$temp_file"
    # Remove console.debug
    elif echo "$line" | grep -q "^\s*console\.debug"; then
      echo "    // Debug log removed" >> "$temp_file"
    # Keep all other lines
    else
      echo "$line" >> "$temp_file"
    fi
  done < "$file"

  # Replace original file with cleaned version
  mv "$temp_file" "$file"
done

# Count remaining console statements
final_count=$(grep -r "console\." --include="*.ts" --include="*.tsx" app/ components/ lib/ | grep -v "// Debug log removed" | grep -v "// Error log removed" | wc -l)

echo "Cleanup complete!"
echo "Initial console statements: $initial_count"
echo "Remaining console statements: $final_count"
echo "Removed: $((initial_count - final_count)) statements"