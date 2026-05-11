
const fs = require('fs');
const path = 'src/lib/components/AncestryTree.svelte';

let content = fs.readFileSync(path, 'utf8');
let lines = content.split('\n');

let newLines = [];
let foundFirst = false;

for (let line of lines) {
    if (line.includes('{@const offset = getTextOffset(node)}')) {
        if (!foundFirst) {
            newLines.push(line);
            foundFirst = true;
        } else {
            // Remove the second one
            console.log("Removing redundant line...");
        }
    } else {
        newLines.push(line);
    }
}

fs.writeFileSync(path, newLines.join('\n'));
console.log("Fixed!");
