document.addEventListener('DOMContentLoaded', (event) => {
    //console.clear();
    //console.log('Script loaded')
    updateResult();
});


// TODO

// Change hmm alert to <a> link directly

// remove hmm alert text

// Export Black and Minetti plots from R at reasoanble resolution

// put plots into doc

// Check in R against ground truth equations


// Global state variables
let hill_mode = "grade"
let uphill_or_downhill = "uphill"
let calc_mode = "pace"
let pace_mode = "pace"
let output_pace_mode = 'pace'


let vert_speed_int = 1000 //hardcoded, care
let vert_speed_m_s = vert_speed_int*0.3048/(60*60) 
//initial input is ft/hr

let input_m_s = 3.83 //7:00 mile pace as initial input
let input_grade = 0.05 // Keep as decimal because that's what minetti used

// json is not that big, just load here
// (because I don't know how to async/await!)

// Black et al 2018 data
// lpmatrix export from mgcv gam() in R
const blackGam = {
    "speed_m_s": [0, 0.05, 0.1, 0.15, 0.2, 0.25, 0.3, 0.35, 0.4, 0.45, 0.5, 0.55, 0.6, 0.65, 0.7, 0.75, 0.8, 0.85, 0.9, 0.95, 1, 1.05, 1.1, 1.15, 1.2, 1.25, 1.3, 1.35, 1.4, 1.45, 1.5, 1.55, 1.6, 1.65, 1.7, 1.75, 1.8, 1.85, 1.9, 1.95, 2, 2.05, 2.1, 2.15, 2.2, 2.25, 2.3, 2.35, 2.4, 2.45, 2.5, 2.55, 2.6, 2.65, 2.7, 2.75, 2.8, 2.85, 2.9, 2.95, 3, 3.05, 3.1, 3.15, 3.2, 3.25, 3.3, 3.35, 3.4, 3.45, 3.5, 3.55, 3.6, 3.65, 3.7, 3.75, 3.8, 3.85, 3.9, 3.95, 4, 4.05, 4.1, 4.15, 4.2, 4.25, 4.3, 4.35, 4.4, 4.45, 4.5, 4.55, 4.6, 4.65, 4.7, 4.75, 4.8, 4.85, 4.9, 4.95, 5, 5.05, 5.1, 5.15, 5.2, 5.25, 5.3, 5.35, 5.4, 5.45, 5.5, 5.55, 5.6, 5.65, 5.7, 5.75, 5.8, 5.85, 5.9, 5.95, 6, 6.05, 6.1, 6.15, 6.2, 6.25, 6.3, 6.35, 6.4, 6.45, 6.5, 6.55, 6.6, 6.65, 6.7, 6.75, 6.8, 6.85, 6.9, 6.95, 7, 7.05, 7.1, 7.15, 7.2, 7.25, 7.3, 7.35, 7.4, 7.45, 7.5, 7.55, 7.6, 7.65, 7.7, 7.75, 7.8, 7.85, 7.9, 7.95, 8, 8.05, 8.1, 8.15, 8.2, 8.25, 8.3, 8.35, 8.4, 8.45, 8.5, 8.55, 8.6, 8.65, 8.7, 8.75, 8.8, 8.85, 8.9, 8.95, 9, 9.05, 9.1, 9.15, 9.2, 9.25, 9.3, 9.35, 9.4, 9.45, 9.5, 9.55, 9.6, 9.65, 9.7, 9.75, 9.8, 9.85, 9.9, 9.95, 10],
    "energy_j_kg_m": [6.0976, 6.0592, 6.0208, 5.9824, 5.944, 5.9056, 5.8672, 5.8289, 5.7905, 5.7521, 5.7137, 5.6753, 5.6369, 5.5985, 5.5601, 5.5217, 5.4833, 5.4449, 5.4066, 5.3682, 5.3298, 5.2914, 5.253, 5.2146, 5.1762, 5.1378, 5.0994, 5.061, 5.0227, 4.9843, 4.9459, 4.9075, 4.8691, 4.8307, 4.7923, 4.7539, 4.7155, 4.6771, 4.6387, 4.6004, 4.562, 4.5236, 4.4852, 4.4468, 4.4084, 4.37, 4.3317, 4.2936, 4.2559, 4.2187, 4.1821, 4.1463, 4.1115, 4.0777, 4.0451, 4.0139, 3.9841, 3.956, 3.9297, 3.9053, 3.883, 3.8628, 3.845, 3.8294, 3.816, 3.8046, 3.795, 3.7872, 3.7811, 3.7764, 3.7732, 3.7713, 3.7704, 3.7707, 3.7718, 3.7737, 3.7763, 3.7794, 3.783, 3.7868, 3.791, 3.7955, 3.8002, 3.8051, 3.8103, 3.8157, 3.8213, 3.827, 3.8329, 3.8389, 3.845, 3.8512, 3.8575, 3.8638, 3.8701, 3.8765, 3.8828, 3.8892, 3.8955, 3.9019, 3.9082, 3.9146, 3.9209, 3.9273, 3.9336, 3.94, 3.9463, 3.9527, 3.959, 3.9654, 3.9717, 3.9781, 3.9844, 3.9908, 3.9971, 4.0035, 4.0098, 4.0162, 4.0225, 4.0289, 4.0352, 4.0416, 4.0479, 4.0543, 4.0606, 4.067, 4.0733, 4.0797, 4.086, 4.0924, 4.0987, 4.1051, 4.1114, 4.1178, 4.1241, 4.1305, 4.1368, 4.1432, 4.1495, 4.1559, 4.1622, 4.1686, 4.1749, 4.1813, 4.1876, 4.194, 4.2003, 4.2067, 4.213, 4.2194, 4.2257, 4.2321, 4.2384, 4.2448, 4.2511, 4.2575, 4.2638, 4.2702, 4.2765, 4.2829, 4.2892, 4.2956, 4.3019, 4.3083, 4.3146, 4.321, 4.3273, 4.3337, 4.34, 4.3464, 4.3527, 4.3591, 4.3654, 4.3718, 4.3781, 4.3845, 4.3908, 4.3972, 4.4035, 4.4099, 4.4162, 4.4226, 4.4289, 4.4353, 4.4416, 4.448, 4.4543, 4.4607, 4.467, 4.4734, 4.4797, 4.4861, 4.4924, 4.4988, 4.5051, 4.5115, 4.5178, 4.5242, 4.5305, 4.5369, 4.5432],
    "energy_j_kg_s": [0, 0.303, 0.6021, 0.8974, 1.1888, 1.4764, 1.7602, 2.0401, 2.3162, 2.5884, 2.8568, 3.1214, 3.3821, 3.639, 3.8921, 4.1413, 4.3867, 4.6282, 4.8659, 5.0998, 5.3298, 5.556, 5.7783, 5.9968, 6.2115, 6.4223, 6.6293, 6.8324, 7.0317, 7.2272, 7.4188, 7.6066, 7.7905, 7.9707, 8.1469, 8.3194, 8.488, 8.6527, 8.8136, 8.9707, 9.1239, 9.2733, 9.4189, 9.5606, 9.6985, 9.8325, 9.9629, 10.09, 10.2142, 10.3358, 10.4553, 10.5731, 10.6898, 10.8058, 10.9217, 11.0381, 11.1556, 11.2747, 11.3962, 11.5207, 11.6489, 11.7817, 11.9196, 12.0628, 12.2112, 12.3648, 12.5235, 12.6872, 12.8557, 13.0287, 13.2062, 13.388, 13.5736, 13.763, 13.9557, 14.1515, 14.3499, 14.5508, 14.7536, 14.958, 15.1641, 15.3717, 15.5808, 15.7914, 16.0034, 16.2168, 16.4315, 16.6475, 16.8647, 17.0831, 17.3026, 17.523, 17.7444, 17.9666, 18.1896, 18.4133, 18.6376, 18.8625, 19.0881, 19.3143, 19.5411, 19.7686, 19.9967, 20.2255, 20.4549, 20.6849, 20.9155, 21.1468, 21.3788, 21.6113, 21.8445, 22.0783, 22.3128, 22.5479, 22.7837, 23.02, 23.257, 23.4947, 23.7329, 23.9719, 24.2114, 24.4516, 24.6924, 24.9338, 25.1759, 25.4186, 25.662, 25.906, 26.1506, 26.3959, 26.6418, 26.8883, 27.1355, 27.3833, 27.6317, 27.8808, 28.1305, 28.3808, 28.6318, 28.8834, 29.1357, 29.3885, 29.6421, 29.8962, 30.151, 30.4064, 30.6625, 30.9192, 31.1765, 31.4344, 31.693, 31.9523, 32.2121, 32.4726, 32.7338, 32.9955, 33.2579, 33.521, 33.7847, 34.049, 34.3139, 34.5795, 34.8457, 35.1126, 35.3801, 35.6482, 35.9169, 36.1863, 36.4563, 36.727, 36.9983, 37.2702, 37.5428, 37.816, 38.0898, 38.3643, 38.6394, 38.9152, 39.1915, 39.4685, 39.7462, 40.0245, 40.3034, 40.5829, 40.8631, 41.1439, 41.4254, 41.7075, 41.9902, 42.2736, 42.5576, 42.8422, 43.1275, 43.4134, 43.6999, 43.9871, 44.2749, 44.5633, 44.8524, 45.1421, 45.4325]
  }
  

// Minetti 2002 quintic polynomial for (change in) energy cost
function calcDeltaEC(x_grade){
    // input   - x_grade is gradient in decimal (0.10 for 10% grade, can be negative)
    // returns - Cr - *added* cost of running, above level ground intensity, in J/kg/m
    let delta_Cr = 155.4*x_grade**5 - 30.4*x_grade**4 - 43.3*x_grade**3 + 46.3*x_grade**2 + 19.5*x_grade
    // Note we exclude the intercept - use Black data instead
    return delta_Cr
}

// Get f(x_speed) for either J/kg/m or J/kg/s (=W/kg) in Black data
// which is flat running data from ~2.2-4.7 m/s
function lookupSpeed(x, col_name) {
    // col anme is energy_j_kg_m or energy_j_kg_s aka W/kg
    const speed = blackGam.speed_m_s;
    const energy = blackGam[col_name];
    let f_x;
    // Check if x is outside the range of speed_m_s
    if (x < speed[0] || x > speed[speed.length - 1]) {
        //throw new Error('x is outside of the range of the speed_m_s column');
        f_x = NaN;
    } else {
        // Find the indices that x falls between
        let i = 0;
        for (; i < speed.length - 1; i++) {
            if (x >= speed[i] && x <= speed[i + 1]) {
                break;
            }
        }
        // Linear interpolation
        // y = y0 + (y1 - y0) * ((x - x0) / (x1 - x0))
        f_x = energy[i] + (energy[i + 1] - energy[i]) * ((x - speed[i]) / (speed[i + 1] - speed[i]));
        // f(x) approximation
    }
    return f_x;
 }

 // Use blackGam to find what flat-ground speed has the metabolic power closest to a given metabolic power
function getEquivFlatSpeed(W_kg) {
    // Works!!
    let eq_speed;
    const speed = blackGam.speed_m_s;
    const met_power = blackGam['energy_j_kg_s'];
    // Check if x is outside the range of speed_m_s
    if (W_kg < met_power[0] || W_kg > met_power[met_power.length - 1]) {
        //throw new Error('W_kg is outside of the range of the energy_kg_s');
        eq_speed = NaN;
    } else {
        // Luckily, W_kg as fxn of speed is monotonic! So we can start slow and go up
        // Find the met power that input W_kg falls between
        let i = 0;
        for (; i < met_power.length - 1; i++) {
            if (W_kg >= met_power[i] && W_kg <= met_power[i + 1]) {
                break;
            }
        }
        // Linear interpolation
        // y = y0 + (y1 - y0) * ((x - x0) / (x1 - x0))
        eq_speed = speed[i] + (speed[i + 1] - speed[i]) * ((W_kg - met_power[i]) / (met_power[i + 1] - met_power[i]));
        // f(x) approximation
    }

    return eq_speed;
}

// Given: speed on flat + grade
// 1. Convert grade to gradient (may be ft/mile, meters per min, etc)
// 2. Convert speed (in min/mi, min/km, km/hr, or mi/hr) to m/s
// 3. Calculate expected energetic cost in J/kg/m using Black equations
// 4. Use Minetti polynomial to calculate added energetic cost (in J/kg/min) of incline or decline

// Now we have expected energetic cost for treadmill

// in J/kg/meter
// Convert to Joules per kg per minute by multiplying by speed, gives J/kg/s

// Go back to the polynomial and solve for equivalent speed that gives you the calculated energetic cost!
// Will be much easier when using J/kg/s since result is monotonic

// -----------------------------------------------
//
//   Convert pace
//
// ----------------------------------------------

let conv_dec

const convert_dict = {
    // functions to convert m/s to [output unit, as key]
    '/mi':function (m_s){
        // to decimal minutes per mile
        conv_dec = 1609.344/(m_s*60)
        return decimal_pace_to_string(conv_dec);
    },
    '/km':function (m_s){
        // to decimal minutes per mile
        conv_dec = 1000/(m_s*60)
        return decimal_pace_to_string(conv_dec);
    },
    'mph':function (m_s){
        conv_dec = m_s*2.23694
        return conv_dec.toFixed(1);
    },
    'km/h':function (m_s){
        conv_dec = m_s*3.6
        return conv_dec.toFixed(1);
    },
    'm/s':function (m_s){
        // ez mode lol
        return m_s.toFixed(2);
    }
}

function decimal_pace_to_string(pace_decimal){
    let pace_min = Math.floor(pace_decimal)
    //Could be zero!! 
    let pace_sec = (pace_decimal - pace_min)*60
    //e.g. 9.50 --> 30 

    //Deal with e.g. 3:59.9 --> 4:00.0
    if (Math.round(pace_sec) === 60) {
        pace_sec = 0
        pace_min = pace_min+1;
    } else {
        pace_sec = Math.round(pace_sec);
    }
    //To formatted string
    res = `${pace_min}:${pace_sec.toString().padStart(2,'0')}` 
    return res
}

function updateOutput(eq_flat_speed){
    let out_text = document.querySelector('#output-text')
    let out_units = document.querySelector('#output-units')
    let convert_text = ''
    let impossible_box = document.querySelector('#impossible-box')

    if (!Number.isFinite(eq_flat_speed) || eq_flat_speed == 0){
        // If we get any funny business...hmm
        convert_text = '🤔' // hmm or scream
        // or out_text.innerHTML = ''<a href="#errors">hmm</a>
        impossible_box.classList.remove('hidden')
    } else {
        const convert_fxn = convert_dict[out_units.textContent]
        convert_text = convert_fxn(eq_flat_speed)
        impossible_box.classList.add('hidden')
    }
    out_text.textContent = convert_text

    //Update text in doc
}


// [lightbulb] At grades steeper than 25%, it may be more
// efficient to walk instead of run and bulb links to section

// call to show.hide alerts based on state of calculators
function showAlerts(){
    let alert_box = document.querySelector('.alert-box')
    let info_box = document.querySelector('.info-box')
    let info_text = document.querySelector('.info-text')
    let info_i = document.querySelector('#info-i')
    // input_grade below -0.08 or whatever
    // show can't take advntage of steep downhills
    //input garde above 25% - may be mroe economical to walk

    if (input_grade < -0.08 && !Number.isNaN(input_grade)) {
        // change text and i link
        info_i.href = '#steep-downhills'
        info_text.textContent = 'This downhill might be too steep to gain the full energetic benefit'
        info_box.classList.remove('hidden')
    } else if (input_grade > 0.25) {
        console.log(input_grade)
        // Change text
        info_i.href = '#walk-vs-run'
        info_text.textContent = 'This uphill might be steep enough that walking would be more energetically efficient'
        info_box.classList.remove('hidden')
    } else {
        info_box.classList.add('hidden')
    }

    // This uphill might be steep enough that walking is more energetically efficient than running

    if (calc_mode == "effort" && hill_mode == "vert speed") {
        alert_box.classList.remove('hidden')
    } else {
        alert_box.classList.add('hidden')
    }
}


// Update results on page
function updateResult(){    
    //updates input_m_s and input_grade
    readCurrentSpeed()
    readCurrentGrade()
    flip_pace_effort_text();

    //input_m_s
    //input_grade
    // need for both
    let flat_Cr = lookupSpeed(input_m_s, 'energy_j_kg_m')
    let delta_Cr = calcDeltaEC(input_grade)
    let total_Cr = flat_Cr + delta_Cr
    
    // FORWARD MODE

    if (calc_mode == 'pace'){
        let total_Cr_W_kg = total_Cr*input_m_s
        let eq_flat_speed = getEquivFlatSpeed(total_Cr_W_kg)
        updateOutput(eq_flat_speed);

    } else if (calc_mode == 'effort' && hill_mode == 'vert speed'){
        // REVERSE MODE, hard version
        let solve_speed = solveVertSpeed(input_m_s, vert_speed_m_s)
        updateOutput(solve_speed);

    } else {
        // REVERSE MODE
        let target_W_kg = lookupSpeed(input_m_s, 'energy_j_kg_s')
        let resultant_speed = target_W_kg/total_Cr

        updateOutput(resultant_speed);
    }

    showAlerts();

}

// Set up appearing alerts for various "bad" situations 
//  - walking more efficint
//  - downhill too steep to take advantage of
//  - outside range of reliable data

// see Gdoc for notes on what %s these ssohudl be at

// As interim, can just display +/- O2 as delta
// instaed fo the real equvialent pace


// --- Incrementing pace dials --- 

//First incrementor
let d1 = document.querySelector("#d1");
const d1_up = document.querySelector('#d1-up');
const d1_down = document.querySelector('#d1-down');

d1_up.addEventListener('click', () => {
    increment_minutes(d1,1);
    updateResult();
});

d1_down.addEventListener('click', () => {
    increment_minutes(d1,-1);
    updateResult();
});

//Second incrementors - a bit different
const d2_up = document.querySelector('#d2-up');
const d2_down = document.querySelector('#d2-down');

d2_up.addEventListener('click', () => {
    increment_sec_digit(d2,6,1);
    updateResult();
});

d2_down.addEventListener('click', () => {
    increment_sec_digit(d2,6,-1);
    updateResult();
});

// 3rd digit is limit 10
const d3_up = document.querySelector('#d3-up');
const d3_down = document.querySelector('#d3-down');

d3_up.addEventListener('click', () => {
    increment_sec_digit(d3,10,1);
    updateResult();
});

d3_down.addEventListener('click', () => {
    increment_sec_digit(d3,10,-1,5); //floor of 5
    updateResult();
});

// --- icnrementing speed

//First incrementor
let s1 = document.querySelector("#s1");
const s1_up = document.querySelector('#s1-up');
const s1_down = document.querySelector('#s1-down');

s1_up.addEventListener('click', () => {
    increment_minutes(s1,1);
    updateResult();
});

s1_down.addEventListener('click', () => {
    increment_minutes(s1,-1);
    updateResult();
});

//Second incrementors - a bit different
const s2_up = document.querySelector('#s2-up');
const s2_down = document.querySelector('#s2-down');

s2_up.addEventListener('click', () => {
    increment_sec_digit(s2,10,1);
    updateResult();
});

s2_down.addEventListener('click', () => {
    increment_sec_digit(s2,10,-1);
    updateResult();
});



// incremntor functions

function increment_sec_digit(digit_object, digit_limit, change){
    let digit_val = parseInt(digit_object.textContent);
    // mod ops to circularize
    if (change === 1) {
        digit_val = (digit_val + 1) % digit_limit;
    }
    if (change === -1) {
        digit_val = (digit_val - 1 + digit_limit) % digit_limit;
    }
    // DEAL WITH 0:00 SOMEHOW...
    digit_object.textContent = digit_val;
}

function increment_minutes(digit_object,change){
    let digit_val = parseInt(digit_object.textContent);
    //Disallow > 60
    if (change > 0 && digit_val < 60) {
        digit_object.textContent = digit_val + change
    }
    //Disallow < 0
    if (digit_val > 0 && change < 0) {
        digit_object.textContent = digit_val + change
    }
}

// ------ Unit selectors (Input / output) -------


// Input unit selector
const pace_buttons = document.querySelectorAll('.pace-toggle');

pace_buttons.forEach(button => {
    button.addEventListener('click', (e) => {
        // Remove active class from all buttons
        pace_buttons.forEach(btn => btn.classList.remove('active'));
        // Toggle the active state of the clicked button
        e.target.classList.toggle('active');
        setPaceText(button);
    });
});

// Output unit selector
const output_buttons = document.querySelectorAll('.output-toggle');

output_buttons.forEach(button => {
    button.addEventListener('click', (e) => {
        // Remove active class from all buttons
        output_buttons.forEach(btn => btn.classList.remove('active'));
        // Toggle the active state of the clicked button
        e.target.classList.toggle('active');
        setOutputText(button);
        updateResult();
    });
});


var speed_dials = document.querySelector('#speed-dials')
var pace_dials = document.querySelector('#pace-dials')

function setMode(dial_mode) {
    if (dial_mode == "pace") {
        // set global var, swap hidden states
        pace_mode = "pace"
        speed_dials.classList.add('hidden');
        pace_dials.classList.remove('hidden');

        // grammar
        if (uphill_or_downhill == "uphill") {
            pace_post.textContent = 'on an'
        } else {
            pace_post.textContent = 'on a'
        }
    }
    if (dial_mode == "speed") {
        // set global var, swap hidden states
        pace_mode = "speed"
        pace_dials.classList.add('hidden');
        speed_dials.classList.remove('hidden');

        //grammar
        if (uphill_or_downhill == "uphill") {
            pace_post.textContent = 'on an'
        } else {
            pace_post.textContent = 'on a'
        }
    }
}


//Change display text by pace
function setPaceText(button){
    //4 things can happen here: mi, km, mph, kmh.
    let pace_units = document.querySelector('#pace-units')
    let speed_units = document.querySelector('#speed-units')

    // [/mi] 
    if (button.textContent == "/mi" || button.textContent == "/km") {
        setMode("pace");        
        pace_units.textContent = button.textContent;
        // function like pass_pace_to_speed()
    }
    if (button.textContent == "mph" || button.textContent == "km/h" || button.textContent == "m/s") {
        setMode("speed");
        speed_units.textContent = button.textContent;
        // function like pass_speed_to_pace()
    }

    updateResult();
}

var output_text = document.querySelector('#output-text')
// Use this to change otuput text directly

//easy once you get inoptu as m/s and output as m/s

// Chang eoutptu text
function setOutputText(button){
    //4 things can happen here: mi, km, mph, kmh.
    let output_units = document.querySelector('#output-units')
    // [/mi] 
    output_units.textContent = button.textContent;
    if (button.textContent == "/mi" || button.textContent == "/km") {
        // UNIT CONVERTION TODO FIX HACK BUG    
        // output_units.textContent = button.textContent;
        // function like pass_pace_to_speed()
        output_pace_mode = 'pace'
    }
    if (button.textContent == "mph" || button.textContent == "km/h" || button.textContent == "m/s") {
        // setMode("speed");
        // speed_units.textContent = button.textContent;
        // function like pass_speed_to_pace()
        output_pace_mode = 'speed'
    }
}

const hill_indicator = document.querySelector('.hill-button');
const hill_text = document.querySelector('#uphill-or-downhill');

// Negate Incline on button press
hill_indicator.addEventListener('click', (e) => {
    negateIncline()
    updateResult()
});


let vert_speed_input = document.querySelector('#vert-speed-input')
vert_speed_input.addEventListener("change", (e) => {
    let new_value = +e.target.value
    let old_value = vert_speed_int
    vert_speed_int = new_value

    if (vert_speed_int < 0 && old_value >= 0){
        negateIncline()
    }
    if (vert_speed_int > 0 && old_value <= 0){
        negateIncline()
    }
    updateResult();
});


let rise_input = document.querySelector('#rise')
let rise_int = 100
rise_input.addEventListener("change", (e) => {
    let new_value = +e.target.value
    let old_value = rise_int
    rise_int = new_value

    if (rise_int < 0 && old_value >= 0 || rise_int > 0 && old_value <= 0){
        negateIncline()
    }
    updateResult();
});


let run_input = document.querySelector('#run')
let run_int = parseInt(run_input.value)
run_input.addEventListener("change", (e) => {
    run_int = +e.target.value
    updateResult();
});



// CARE CARE CARE with math, track units!!!
let pace_post = document.querySelector('#on-a-an')

function negateIncline(){
    // Maybe edit across the board? So its' ok if you sitch? 

    if (hill_text.textContent == "uphill") {
        // flip to downhill and fix grammar
        uphill_or_downhill = "downhill"
        hill_text.textContent = "downhill"
        if (pace_mode == "pace") {
            pace_post.textContent = 'on a'
        } else {
            pace_post.textContent = 'on a'
        }
        hill_indicator.classList.toggle('mirrored');
        //Call swap function to whatever mode is active to +/- it
    } else if (hill_text.textContent == "downhill") {
        uphill_or_downhill = "uphill"
        hill_text.textContent = "uphill"
        if (pace_mode == "pace") {
            pace_post.textContent = 'on an'
        } else {
            pace_post.textContent = 'on an'
        }
        hill_indicator.classList.toggle('mirrored')
        //Call swap function to whatever mode is active to +/- it
    }

    //grade
    pct_int = pct_int*-1
    incline_text.textContent = pct_int   

    //angle
    angle_int = angle_int*-1
    angle_text.textContent = angle_int  
    //rise run
    let rise_post_text = document.querySelector('#rise-post-text')
    if (rise_post_text.innerHTML == "&nbsp;of gain") {
        rise_post_text.innerHTML = '&nbsp;of loss'
    } else {
        rise_post_text.innerHTML = "&nbsp;of gain"
    }

    //vert speed
    let vert_post_text = document.querySelector('#vert-speed-post-text')
    if (vert_post_text.innerHTML == "&nbsp;gain") {
        vert_post_text.innerHTML = '&nbsp;loss'
    } else {
        vert_post_text.innerHTML = "&nbsp;gain"
    }


    // flip rise and vert IF NEEDED
    if (vert_speed_int < 0 && uphill_or_downhill == "uphill" || 
    vert_speed_int > 0 && uphill_or_downhill == "downhill") {
        negateVertSpeed() 
    }

    if (rise_int < 0 && uphill_or_downhill == "uphill" || 
    rise_int > 0 && uphill_or_downhill == "downhill") {
        negateRise()
    }

}

function negateVertSpeed(){
    vert_speed_int = vert_speed_int*-1
    vert_speed_input.value = vert_speed_int
}
function negateRise(){
    rise_int = rise_int*-1
    rise_input.value = rise_int
}


uphill_post_text = document.querySelector('#uphill-post-text')


// grade mode selector
const hill_buttons = document.querySelectorAll('.hill-toggle');


hill_buttons.forEach(button => {
    button.addEventListener('click', (e) => {
        // Remove active class from all buttons
        hill_buttons.forEach(btn => btn.classList.remove('active'));
        // // Toggle the active state of the clicked button
        e.target.classList.toggle('active');

        setHillInput(button);
    });
});


function setHillInput(button){
    // 4 options, grade, degrees, rise/run, vert speed
    //Hide all
    const grade_input = document.querySelector('#grade-input');
    const angle_input = document.querySelector('#angle-input');
    const riserun_input = document.querySelector('#riserun-input');
    const vertspeed_input = document.querySelector('#vertspeed-input');

    //Non optimal but can't think of cleverer fix
    grade_input.classList.add('hidden');
    angle_input.classList.add('hidden');
    riserun_input.classList.add('hidden');
    vertspeed_input.classList.add('hidden');

    if (button.textContent == "grade") {
        hill_mode = "grade"
        grade_input.classList.remove('hidden');
        uphill_post_text.innerHTML = '&nbsp;with a'
    }
    if (button.textContent == "degrees") {  
        hill_mode = "angle"      
        angle_input.classList.remove('hidden');
        uphill_post_text.innerHTML = '&nbsp;with a'
    }
    if (button.textContent == "rise/run") {     
        hill_mode = "rise/run"   
        riserun_input.classList.remove('hidden');
        uphill_post_text.innerHTML = '&nbsp;with'
    }
    if (button.textContent == "vert speed") {   
        hill_mode = "vert speed"   
        vertspeed_input.classList.remove('hidden');
        uphill_post_text.innerHTML = '&nbsp;at a rate of'
    }   
    //Must update after switch to mode
    updateResult()
}



// ----- Incremnt grade ----

// Percent changes
let incline_text = document.querySelector("#grade-pct")
let pct_int = parseInt(incline_text.textContent)

// In order left to right...
const pct_m5 = document.querySelector("#grade-m5")
pct_m5.addEventListener('click', () => {
    increment_grade(-5)
})

const pct_m1 = document.querySelector("#grade-m1")
pct_m1.addEventListener('click', () => {
    increment_grade(-1)
})

const pct_p1 = document.querySelector("#grade-p1")
pct_p1.addEventListener('click', () => {
    increment_grade(1)
})

const pct_p5 = document.querySelector("#grade-p5")
pct_p5.addEventListener('click', () => {
    increment_grade(5)
})

function increment_grade(change){
    // postiive negative flip detection here
    if (pct_int >= 0 && pct_int + change < 0) {
        //flipping negative
        negateIncline()
    }
    if (pct_int <= 0 && pct_int + change > 0) {
        //flipping negative
        negateIncline()
    }
    // allow if below 50
    if (pct_int + change <= 50 && pct_int + change >= -50) {
        pct_int = pct_int + change
        incline_text.textContent = pct_int;
    }

    updateResult();
}



// Angle changes
let angle_text = document.querySelector("#angle-pct")
let angle_int = parseInt(incline_text.textContent)

// In order left to right...
const angle_m5 = document.querySelector("#angle-m5")
angle_m5.addEventListener('click', () => {
    increment_angle(-5)
})

const angle_m1 = document.querySelector("#angle-m1")
angle_m1.addEventListener('click', () => {
    increment_angle(-1)
})

const angle_p1 = document.querySelector("#angle-p1")
angle_p1.addEventListener('click', () => {
    increment_angle(1)
})

const angle_p5 = document.querySelector("#angle-p5")
angle_p5.addEventListener('click', () => {
    increment_angle(5)
})


function increment_angle(change){
    // postiive negative flip detection here
    if (angle_int >= 0 && angle_int + change < 0) {
        //flipping negative
        negateIncline()
    }
    if (angle_int <= 0 && angle_int + change > 0) {
        //flipping negative
        negateIncline()
    }
    // allow if below 45
    if (angle_int + change <= 45 && angle_int + change >= -45) {
        angle_int = angle_int + change
        angle_text.textContent = angle_int;
    }
    updateResult();
}

// ------ Adjsting rise/run stuff
const rise_unit_buttons = document.querySelectorAll('.rise-toggle');
const run_unit_buttons = document.querySelectorAll('.run-toggle');

var rise_text = document.querySelector('#rise-input-unit')
var run_text = document.querySelector('#rise-output-unit')

rise_unit_buttons.forEach(button => {
    button.addEventListener('click', (e) => {
        rise_unit_buttons.forEach(btn => btn.classList.remove('active'));
        e.target.classList.toggle('active');
        setRiseText(button);
        updateResult();
    });
});

run_unit_buttons.forEach(button => {
    button.addEventListener('click', (e) => {
        run_unit_buttons.forEach(btn => btn.classList.remove('active'));
        e.target.classList.toggle('active');
        setRunText(button);
        updateResult();
    });
});

function setRiseText(button){
    rise_text.textContent = button.textContent
}

function setRunText(button){
    if (button.textContent == "mi"){
        run_text.textContent = "miles"
    }
    if (button.textContent == "km"){
        run_text.textContent = "kilometers"
    }
}


// ---- Vert speed
const vert_buttons = document.querySelectorAll('.vert-toggle');
var vert_text = document.querySelector('#vert-unit')

vert_buttons.forEach(button => {
    button.addEventListener('click', (e) => {
        vert_buttons.forEach(btn => btn.classList.remove('active'));
        e.target.classList.toggle('active');
        setVertText(button);
    });
});


function setVertText(button){
    if (button.textContent == "ft/hr"){
        vert_text.textContent = "feet per hour"
    }
    if (button.textContent == "m/hr"){
        vert_text.textContent = "meters per hour"
    }
    updateResult();
}


// ----- Toggle switch reading and cahnigng text

// Change the percent / speed text
let pace_or_effort_pre_text = document.querySelector('#pace-or-effort-pre')
let pace_or_effort_text = document.querySelector('#pace-or-effort');
let result_pre_text = document.querySelector('#result-pre')
let post_results_text = document.querySelector('#post-result-text')
const checkbox = document.querySelector('.switch input[type="checkbox"]');

let result_pace_speed_text = document.querySelector('#result-speed-or-pace')
let result_of_text = document.querySelector('#results-of')

//result-speed-or-pace
checkbox.addEventListener('change', () => {
    updateResult()
})

function flip_pace_effort_text(){
    if (checkbox.checked) {
        //percent of pace
        calc_mode = 'pace'
        pace_or_effort_pre_text.innerHTML = ''
        if (pace_mode == 'pace'){
            pace_or_effort_text.innerHTML = 'pace&nbsp;'
        } else if (pace_mode == 'speed') {
            pace_or_effort_text.innerHTML = 'speed&nbsp;'
        }
        result_pre_text.textContent = 'is the same effort as'
        post_results_text.textContent = 'on flat ground'
        result_pace_speed_text.textContent = ''
        result_of_text.innerHTML = ''
    } else {
        pace_or_effort_pre_text.innerHTML = 'flat-ground&nbsp;'
        pace_or_effort_text.innerHTML = 'effort&nbsp;'
        calc_mode = 'effort'
        result_pre_text.innerHTML = 'results in a&nbsp;'
        if (output_pace_mode == "pace"){
            post_results_text.textContent = 'on the hill'
            result_pace_speed_text.textContent = 'pace'
        } else if (output_pace_mode == "speed"){
            post_results_text.textContent = 'on the hill'
            result_pace_speed_text.textContent = 'speed'
        }

        // after grammar
        result_of_text.innerHTML = '&nbsp;of'
    }
}


// ----- Reading speed from digits

function readCurrentSpeed(){
    // Pace mode
    if (pace_mode == "pace") {
        // read mm:ss
        var minute_val = parseInt(d1.textContent)
        var sec_val = 10*parseInt(d2.textContent) + parseInt(d3.textContent)
        var dec_minutes = minute_val + sec_val/60

        const pace_units = document.querySelector('#pace-units').textContent

        if (pace_units == "/mi"){
            //Convert to m/s
            input_m_s = 1609.344/(60*dec_minutes)
        } else if (pace_units == "/km"){
            //Convert to m/s
            input_m_s = 1000/(60*dec_minutes)
        }

    // Speed mode
    } else if (pace_mode == "speed") {
        const speed_units = document.querySelector('#speed-units').textContent
        //speed changes
        var dec_speed = parseInt(s1.textContent) + parseInt(s2.textContent)/10

            if (speed_units == "mph"){
            //Convert to m/s
            input_m_s = dec_speed*1609.344/3600
        } else if (speed_units == "km/h"){
            //Convert to m/s
            input_m_s = dec_speed*1000/3600
        } else if (speed_units == "m/s"){
            input_m_s = dec_speed // lol
        }
    }
}

function readCurrentGrade(){
    // Return current input grade as decimal grade
    // e.g. %5 is 0.05
    if (hill_mode == "grade") {
        // easy
        input_grade = pct_int/100.0
    } else if (hill_mode == "angle") {
        // Convert to rad first, then tan
        var angle_rad = angle_int * (Math.PI / 180);
        input_grade = Math.tan(angle_rad);
        //..
    } else if (hill_mode == "rise/run") {
        // Grade is just rise divided by run
        
        // Care, unit conversions! convert all to meters
        if (rise_text.textContent == "feet") {
            var rise_meters = rise_int*0.3048
        } else if (rise_text.textContent == "meters") {
            var rise_meters = rise_int
        }
        // Convert run to meters, from km or mi
        if (run_text.textContent == "miles"){
            var run_meters = run_int*1609.344
        } else if (run_text.textContent == "kilometers"){
            var run_meters = run_int*1000
        }

        // NOW can calc
        input_grade = rise_meters/run_meters

    } else if (hill_mode == "vert speed") {
        // vert speed is tricky because it depends on speed
        // Also it has weird trig contraints
        // Easier to just detect NaN and Inf and replace with ::hmm
        // vs solving dynamically the limits

        //convert vert speed to meters per second
        if (vert_text.textContent == 'feet per hour') {
            //convert to m/hr, then m/s
            vert_speed_m_s = vert_speed_int*0.3048/(60*60)
        } else if (vert_text.textContent == 'meters per hour') {
            //..
            vert_speed_m_s = vert_speed_int/(60*60)
        }

        if (calc_mode == "pace") {
            // this one is the simpler one
            //do on velocity scale, doesn't matter
            var run_x_meters = Math.sqrt(input_m_s**2 - vert_speed_m_s**2)
            //techncially input speed is parallel to slope, not x-axis speed
            //only matters for extreme steep slopes
            input_grade = vert_speed_m_s/run_x_meters
        } else {
            // don't want to read grade here, let solver do it later
        }
    }
}

function solveVertSpeed(input_m_s, vert_spd){
    // Solving effort-based vert speed is super hard actually

    // Shooting for this metabolic power, it's W/kg at input m/s onf lat groudn
    target_W_kg = lookupSpeed(input_m_s, 'energy_j_kg_s')

    let W_results = []
    let grade_trials = []
    let vact_results = []

    //if uphill mode; if uphill_or_downhill == "uphill" seek 0.01 to +1, else -0.01 to -1

    if (uphill_or_downhill == "uphill") {
        for (let grade_i = 0.005;  grade_i <=0.5; grade_i +=0.005) {
            //What is metabolic rate for input vert speed if grade is grade_i?
            let [v_act_res, Wi_res] = calcWtrial(grade_i, vert_spd)
            // debug...
    
            //console.log(`Grade ${grade_i.toFixed(2)} Wcalc ${Wi_res.toFixed(2)}`)
    
            W_results.push(Wi_res)
            vact_results.push(v_act_res)
            //inefficeint but w/e
            grade_trials.push(grade_i)     
        }
    } else if (uphill_or_downhill == "downhill") {
        // seek negative
        for (let grade_i = -0.005;  grade_i >= -0.5; grade_i -=0.005) {
            //What is metabolic rate for input vert speed if grade is grade_i?
            let [v_act_res, Wi_res] = calcWtrial(grade_i, vert_spd)
            // debug...
            //console.log(`Grade ${grade_i.toFixed(2)} Wcalc ${Wi_res.toFixed(2)}`)
    
            W_results.push(Wi_res)
            vact_results.push(v_act_res)
            //inefficeint but w/e
            grade_trials.push(grade_i)     
        }
    }

    //which entry is closest to target_W_kg?
    let closestIndex = 0;
    let smallestDifference = Infinity;

    for (let i = 0; i < W_results.length; i++) {
        let difference = Math.abs(W_results[i] - target_W_kg);
        if (difference < smallestDifference) {
            smallestDifference = difference;
            closestIndex = i;
        }
    }
    // Now closestIndex holds the index of the closest value
    let closestGrade = grade_trials[closestIndex];
    let closestW = W_results[closestIndex];
    let closestV = vact_results[closestIndex];
    let pct_diff = Math.abs(smallestDifference/target_W_kg)

    input_grade = closestGrade;

    if (pct_diff > 0.05) {
        closestV = NaN
    }

    return closestV

}

// Utility for the grade grisearch
function calcWtrial(grade_i, vy) {
    if (grade_i == 0) throw new Error("x should not be 0");
    const vx = vy/grade_i
    // do not worry about negative vy, squares take care of it
    const v_act = Math.sqrt(vx**2 + vy**2)
    
    // TOTAL Cost of running for this trial guess is flat cost + incline cost
    const Cr_i = lookupSpeed(v_act, 'energy_j_kg_m') + calcDeltaEC(grade_i)
    // Metabolic power = cost of running * speed along direction of treadmill belt
    // in practice in's only like 3% diff even for 25% grade but w/e
    let W_i = Cr_i*v_act
    // outside range or error? call W/kg infinitely high
    if (Number.isNaN(W_i)) W_i = Infinity
    return [v_act, W_i]
}