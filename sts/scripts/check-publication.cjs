/* Run from any directory: node scripts/check-publication.cjs */
const fs=require('fs'),path=require('path');
const root=path.resolve(__dirname,'..'),problems=[];
function walk(d){for(const e of fs.readdirSync(d,{withFileTypes:true})){
 const p=path.join(d,e.name),r=path.relative(root,p);
 if(e.name==='.git')continue;
 // Never read a connector or credential file, even if one was added later.
 if(/db.*connect|pdo.*connect|^\.env|\.(php|pem|key|pfx|p12|log)$/i.test(e.name)){problems.push(r+': excluded file type');continue;}
 if(e.isDirectory()){walk(p);continue;}
 if(!/\.(html|js|css|json|md|cjs)$/i.test(e.name)||r.startsWith('vendor'+path.sep)||p===__filename)continue;
 const text=fs.readFileSync(p,'utf8');
 const patterns={privateAddress:/\b(?:10\.\d+\.\d+\.\d+|192\.168\.\d+\.\d+|172\.(?:1[6-9]|2\d|3[01])\.\d+\.\d+)\b/,privateKey:/-----BEGIN (?:RSA |EC |OPENSSH )?PRIVATE KEY-----/,token:/\b(?:gh[pousr]_[A-Za-z0-9]{30,}|github_pat_[A-Za-z0-9_]{40,}|AKIA[A-Z0-9]{16})\b/,webhook:/https:\/\/[^\s"']*(?:webhook|hooks\.slack)/i,windowsHome:/[A-Z]:[\\/]Users[\\/]/i};
 for(const [name,re]of Object.entries(patterns))if(re.test(text))problems.push(r+': '+name);
}}
walk(root);if(problems.length){console.error(problems.join('\n'));process.exitCode=1;}else console.log('PASS: no excluded backend/config files or matched secret/internal-address patterns. Manual review is still required for future additions.');
