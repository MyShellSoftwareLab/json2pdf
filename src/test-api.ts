import * as fs from 'fs';
import * as path from 'path';
import exampleData from './exampleData.json';

// Example data provided in the prompt
const main = async () => {
    try {
        const response = await fetch('http://localhost:8003/api/generate-pdf', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ elements: exampleData })
        });

        if (response.ok) {
            const buffer = await response.arrayBuffer();
            fs.writeFileSync(path.join(process.cwd(), 'output.pdf'), Buffer.from(buffer));
            console.log('Success! generated output.pdf');
        } else {
            console.error('Failed to generate PDF:', await response.text());
        }
    } catch (e) {
        console.error('Error connecting to API:', e);
    }
};

main();
