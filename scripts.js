

console.log('Script loaded')

// Humm well... we can load the data! 
//  
//  Now I think next step is DOM manipulation basics
// 

// TODO:

// -1) Fix the floating ? and switcheroo buttons
//     Need to implement a flex div that contins the nentire app 
//    but is NOT 100% width. Like flex 1 and it grows with width of app

// 0) Sketch out what rise/run and vert speed should look like
// 1) Get pace flippers working and printing pace to console
// 2) Get unit conversion toggles changing active state
//     (leave actual conversions of result for the end)
// 3) Get << < > >> arrows working
// 4) Get mph and km/h on input to change to [DD] . [D] format
//     (i.e. one decimal place, one toggle for each, . instead of :)
// 5) Get grade toggles working and changing text
//    (a) degrees can still use << < DD* > >> with +1 and +5
//    (b) rise/run will...probs need text input?
//    (c) ditto for vert speed
//    (d) changing units should NOT screw you over (ie lose old result)
//        ...so track state internally, always as grade?
//        and maybe "lift" to desired unit? 
// 6) Implement unit conversions for results
// 7) Implement Minetti equation + gam and run console tests
// 8) Implement alert/warning insertions when outside ranges

// Consider mockup of text pop-up modal separately 


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