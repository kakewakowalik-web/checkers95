// Run: node assets/make-manifest.cjs  -> writes assets/manifest.js listing every file under assets/
const fs=require('fs'),path=require('path'),root=__dirname,out=[];
(function walk(d){for(const f of fs.readdirSync(d)){const p=path.join(d,f);if(fs.statSync(p).isDirectory())walk(p);else if(!/manifest\.js$|make-manifest/.test(f))out.push(path.relative(root,p).split(path.sep).join('/'));}})(root);
fs.writeFileSync(path.join(root,'manifest.js'),'window.CHECKERS95_MANIFEST='+JSON.stringify(out.sort(),null,1)+';\n');console.log(out.length+' files');
