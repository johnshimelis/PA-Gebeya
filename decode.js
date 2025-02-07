const fetch = require('node-fetch');

const cheerio = require('cheerio');

async function printGridFromGoogleDoc(url) {
    try {
        // Step 1: Fetch the Google Doc content
        const response = await fetch(url);
        if (!response.ok) {
            console.log("Failed to fetch the document.");
            return;
        }
        const html = await response.text();

        // Step 2: Parse the content using cheerio
        const $ = cheerio.load(html);
        const table = $('table');
        if (!table.length) {
            console.log("No table found in the document.");
            return;
        }

        // Step 3: Extract the data from the table
        const data = [];
        table.find('tr').each((_, row) => {
            const cells = $(row).find('td');
            if (cells.length === 3) {
                try {
                    const x = parseInt($(cells[0]).text().trim());
                    const character = $(cells[1]).text().trim();
                    const y = parseInt($(cells[2]).text().trim());
                    if (!isNaN(x) && !isNaN(y)) {
                        data.push({ x, y, character });
                    }
                } catch (e) {
                    // Skip invalid rows
                }
            }
        });

        if (!data.length) {
            console.log("No valid data found in the table.");
            return;
        }

        // Step 4: Determine the grid size
        const maxX = Math.max(...data.map(entry => entry.x));
        const maxY = Math.max(...data.map(entry => entry.y));

        // Step 5: Create and populate the grid
        const grid = Array.from({ length: maxY + 1 }, () =>
            Array(maxX + 1).fill(' ')
        );

        data.forEach(({ x, y, character }) => {
            grid[maxY - y][x] = character; // Flip y-coordinate for orientation
        });

        // Step 6: Print the grid
        grid.forEach(row => console.log(row.join('')));
    } catch (error) {
        console.error("An error occurred:", error.message);
    }
}

// Example usage
const url = "https://docs.google.com/document/d/e/2PACX-1vSHesOf9hv2sPOntssYrEdubmMQm8lwjfwv6NPjjmIRYs_FOYXtqrYgjh85jBUebK9swPXh_a5TJ5Kl/pub";
printGridFromGoogleDoc(url);
