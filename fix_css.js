const fs = require("fs");
const path = require("path");

function walkDir(dir, callback) {
  fs.readdirSync(dir).forEach(f => {
    let dirPath = path.join(dir, f);
    let isDirectory = fs.statSync(dirPath).isDirectory();
    isDirectory ? walkDir(dirPath, callback) : callback(path.join(dir, f));
  });
}

walkDir("modules/procurement", function(f) {
  if (f.endsWith(".jsx")) {
    let content = fs.readFileSync(f, "utf8");
    // Replace the outermost wrapper
    let newContent = content
      .replace(/className="bg-white rounded-lg shadow p-6 max-w-4xl mx-auto"/g, `className="w-full"`)
      .replace(/className="bg-white rounded-lg shadow p-6 max-w-5xl mx-auto"/g, `className="w-full"`)
      .replace(/className="bg-white rounded-lg shadow p-6"/g, `className="w-full"`)
      .replace(/className="bg-white rounded-lg shadow p-6 border border-gray-200"/g, `className="w-full border border-gray-200"`);
    
    if (content !== newContent) {
      fs.writeFileSync(f, newContent);
      console.log("Fixed: " + f);
    }
  }
});
