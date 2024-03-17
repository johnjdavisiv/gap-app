

console.log('Script loaded')






// Asynchronously load the JSON data
async function loadData() {
try {
    const response = await fetch('data/black_data_gam.json'); // Adjust the path to where your JSON file is located
    if (!response.ok) {
        throw new Error('Network response was not ok');
    }
    const data = await response.json();
    return data; // Returns the loaded JSON data
} catch (error) {
    console.error('There was a problem loading the data:', error);
}
}

// Example usage of loadData
(async () => {
const data = await loadData();
if (data) {
    // Works!!!!
    // console.log(data); // Now you have your data as a variable

    // // Example: Access and log the arrays
    // console.log("Speed (m/s):", data.speed_m_s);
    // console.log("Energy (J/kg*m):", data.energy_j_kg_m);
    // console.log("Energy (J/kg*s):", data.energy_j_kg_s);

    // Further processing of data can be done here
}
})();