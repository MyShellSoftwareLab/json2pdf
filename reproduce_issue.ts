
import { validateElements } from './src/services/validator';

const invalidElements = [
    {
        type: 'table',
        // Missing headers used to trigger "headers must be an array"
        // headers: [], 
        rows: [
            // Malformed row (should be array)
            "not-an-array",
            // Good row but malformed cell
            ["Cell 1", { malformed: true }]
        ]
    },
    {
        type: 'metric',
        // Missing title and value
    }
];

const result = validateElements(invalidElements as any);
console.log(JSON.stringify(result, null, 2));
