import * as fs from 'fs';
import * as path from 'path';

const elements = [
    { type: "title", content: "Test Report" },
    { type: "paragraph", content: "This is a test paragraph." },
    { type: "metric", title: "Score", value: 95, severity: "success" },
    { type: "bar_chart", title: "Bar Chart", data: [{ label: "A", value: 10 }, { label: "B", value: 20 }] }
];

const main = async () => {
    try {
        const response = await fetch('http://localhost:8003/api/generate-pdf', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ elements })
        });

        if (response.ok) {
            const buffer = await response.arrayBuffer();
            fs.writeFileSync(path.join(process.cwd(), 'test-output.pdf'), Buffer.from(buffer));
            console.log('Success! generated test-output.pdf');
        } else {
            console.error('Failed:', await response.text());
        }
    } catch (e) {
        console.error('Error:', e);
    }
};

main();
