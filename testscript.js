


console.log('script loaded');


let blackGam; // Placeholder for loaded data

 // Async function to load data
 async function loadData() {
     const response = await fetch('data/black_data_gam.json');
     if (!response.ok) {
         throw new Error('Network response was not ok');
     }
     return response.json(); // Directly return the parsed JSON
 }
 
 // Initialize data loading and handle errors
 let dataLoadedPromise = loadData().then(data => blackGam = data)

// Gam lookup table // NOT RPOOFED
// Use linear interpolation to seek what we need in the gam lpmatrix
function lookup(x, col_name) {
    const speed = blackGam.speed_m_s;
    const energy = blackGam[col_name];

    // Check if x is outside the range of speed_m_s
    if (x < speed[0] || x > speed[speed.length - 1]) {
        throw new Error('x is outside of the range of the speed_m_s column');
    } // consider modifying this to linearly extrapolate?

    // Find the indices that x falls between
    let i = 0;
    for (; i < speed.length - 1; i++) {
        if (x >= speed[i] && x <= speed[i + 1]) {
            break;
        }
    }
    // Linear interpolation
    // y = y0 + (y1 - y0) * ((x - x0) / (x1 - x0))
    const interpolatedValue = energy[i] + (energy[i + 1] - energy[i]) * ((x - speed[i]) / (speed[i + 1] - speed[i]));
    return interpolatedValue;
}

//GPT says I should use try-catch here, ah well
async function queryGam(xq, seek_col){
    await dataLoadedPromise;
    return lookup(xq, seek_col)
}

// Example of safely using performLookup later in the application
queryGam(2.5, 'energy_j_kg_m').then(rr => console.log(rr))








