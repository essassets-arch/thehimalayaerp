const fs = require('fs');
const content = fs.readFileSync('C:\\Users\\SYSTEM3\\.gemini\\antigravity-ide\\brain\\f6f280a5-a143-47f4-8969-8f6d52e20f25\\.system_generated\\logs\\transcript.jsonl', 'utf8');
const lines = content.split('\n');
for (const line of lines) {
  if (line.includes('"step_index":245')) {
    console.log(JSON.parse(line).content);
    break;
  }
}
