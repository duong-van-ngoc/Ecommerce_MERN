const fs = require('fs');
const path = require('path');

function flatFiles(dir, files = []) {
    if (!fs.existsSync(dir)) return files;
    fs.readdirSync(dir).forEach(f => {
        let p = path.join(dir, f);
        if (fs.statSync(p).isDirectory()) {
            flatFiles(p, files);
        } else if (p.endsWith('.js') || p.endsWith('.jsx')) {
            files.push(p);
        }
    });
    return files;
}

const allFiles = flatFiles(path.join(__dirname, 'src'));

allFiles.forEach(f => {
    let content = fs.readFileSync(f, 'utf8');
    let original = content;
    
    // Replace various relative variants targeting adminSlice
    content = content.replace(/['"](\.\.\/)+adminSLice[\\/]adminSlice['"]/g, '"@/admin/adminSLice/adminSlice"');
    content = content.replace(/['"]\.\/adminSLice[\\/]adminSlice['"]/g, '"@/admin/adminSLice/adminSlice"');
    content = content.replace(/['"]\.\.\/\.\.\/\.\.\/admin[\\/]adminSLice[\\/]adminSlice['"]/g, '"@/admin/adminSLice/adminSlice"');
    
    // Also, some files in src/admin/components might import ../adminSLice
    content = content.replace(/['"]\.\.\/adminSLice[\\/]adminSlice['"]/g, '"@/admin/adminSLice/adminSlice"');
    
    if (content !== original) {
        fs.writeFileSync(f, content, 'utf8');
        console.log('Fixed', f);
    }
});
