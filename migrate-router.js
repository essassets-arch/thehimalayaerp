const fs = require('fs');
const path = require('path');

function replaceRouter(dir) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    if (fs.statSync(fullPath).isDirectory()) {
      replaceRouter(fullPath);
    } else if (fullPath.endsWith('.jsx') || fullPath.endsWith('.js') || fullPath.endsWith('.tsx') || fullPath.endsWith('.ts')) {
      let content = fs.readFileSync(fullPath, 'utf8');
      let changed = false;

      // Replace react-router-dom imports
      if (content.includes('react-router-dom')) {
        content = content.replace(/import\s+{(.*?)}\s+from\s+['"]react-router-dom['"];?/g, (match, p1) => {
          let newImports = [];
          if (p1.includes('useNavigate') || p1.includes('useLocation')) {
            newImports.push(`import { useRouter, usePathname } from 'next/navigation';`);
          }
          if (p1.includes('Link') || p1.includes('NavLink')) {
            newImports.push(`import Link from 'next/link';`);
          }
          return newImports.join('\n');
        });
        changed = true;
      }

      // Replace useNavigate -> useRouter
      if (content.includes('useNavigate')) {
        content = content.replace(/useNavigate\(\)/g, 'useRouter()');
        content = content.replace(/navigate\(/g, 'router.push(');
        changed = true;
      }

      // Replace useLocation -> usePathname
      if (content.includes('useLocation')) {
        content = content.replace(/useLocation\(\)/g, '{ pathname: usePathname(), search: "" }');
        changed = true;
      }

      // Replace <NavLink to=... or <Link to=... to <Link href=...
      if (content.includes('<NavLink') || content.includes('<Link')) {
        content = content.replace(/<(NavLink|Link)([^>]*)to={([^}]+)}/g, '<Link$2href={$3}');
        content = content.replace(/<(NavLink|Link)([^>]*)to="([^"]+)"/g, '<Link$2href="$3"');
        content = content.replace(/<\/(NavLink)>/g, '</Link>');
        changed = true;
      }

      // Add 'use client' to top of file if it uses hooks
      if (changed && !content.includes('use client')) {
        content = `'use client';\n\n` + content;
      }

      if (changed) {
        fs.writeFileSync(fullPath, content, 'utf8');
        console.log(`Updated: ${fullPath}`);
      }
    }
  }
}

replaceRouter(path.join(__dirname, 'components'));
replaceRouter(path.join(__dirname, 'hooks'));

replaceRouter(path.join(__dirname, 'modules'));
replaceRouter(path.join(__dirname, 'layouts'));
replaceRouter(path.join(__dirname, 'shared'));
