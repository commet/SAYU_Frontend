import re

# Read the SQL file
with open('batch-exhibitions-update.sql', 'r', encoding='utf-8') as f:
    content = f.read()

# Pattern to find INSERT INTO exhibitions_translations blocks
pattern = r'(INSERT INTO exhibitions_translations \([^)]+\) VALUES \([^;]+\);)'

def fix_insert_statement(match):
    statement = match.group(1)
    
    # Check if it has email values (email addresses)
    has_email = '@' in statement and '.com' in statement or '.kr' in statement or '.org' in statement
    
    # Check if it has subtitle (usually appears with two quoted strings in a row for title)
    lines = statement.split('\n')
    
    # Find the column declaration line
    for i, line in enumerate(lines):
        if 'INSERT INTO exhibitions_translations' in line:
            # Check the columns in the next few lines
            column_section = []
            for j in range(i, min(i+10, len(lines))):
                column_section.append(lines[j])
                if ') VALUES' in lines[j]:
                    break
            
            column_text = ' '.join(column_section)
            
            # Check what columns are missing
            needs_email = has_email and 'email' not in column_text
            
            # Count the number of values
            values_section = statement.split('VALUES')[1] if 'VALUES' in statement else ''
            
            # If we need to add email column
            if needs_email:
                # Find where to insert email
                if 'phone_number, address' in column_text:
                    column_text = column_text.replace('phone_number, address', 'phone_number, email, address')
                elif 'phone_number\n' in column_text:
                    # Find and update
                    for k, line in enumerate(lines):
                        if 'phone_number' in line and 'email' not in line:
                            next_line_idx = k + 1
                            if next_line_idx < len(lines) and ') VALUES' in lines[next_line_idx]:
                                lines[k] = line.rstrip() + ', email'
            
            # Check for subtitle
            # Count commas in values to see if there's an extra value
            if "'Flow of Debris'" in statement or "'Spectral Crossings'" in statement or "Where a New Song Begins" in statement:
                if 'subtitle' not in column_text:
                    # Add subtitle after exhibition_title
                    column_text = column_text.replace('exhibition_title,', 'exhibition_title, subtitle,')
                    for k, line in enumerate(lines):
                        if 'exhibition_title,' in line and 'subtitle' not in line:
                            lines[k] = line.replace('exhibition_title,', 'exhibition_title, subtitle,')
            
            return '\n'.join(lines)
    
    return statement

# Apply fixes
fixed_content = re.sub(pattern, fix_insert_statement, content, flags=re.DOTALL)

# Write the fixed content
with open('batch-exhibitions-update-fixed.sql', 'w', encoding='utf-8') as f:
    f.write(fixed_content)

print("Fixed SQL file created: batch-exhibitions-update-fixed.sql")