

console.log('Script loaded')

// TODO: 

// We do need to go back to using BlackGam for intecept
// Because if oyu don't, it's not identiy-invertible! 

// i.e. 0% grade cals do not give same speed as input! 

// Think more carefully aobut solutions to this wiht a fresh brain
// And maybvwe a nice cup of tea 


//for flip I think
const TRANSITION_DUR_MS = 400;


// json is not that big, just load here
// (because I don't know how to async/await!)

const blackGam = {
    "speed_m_s": [0.5, 0.65, 0.8, 0.95, 1.1, 1.25, 1.4, 1.55, 1.7, 1.85, 2, 2.15, 2.3, 2.45, 2.6, 2.75, 2.9, 3.05, 3.2, 3.35, 3.5, 3.65, 3.8, 3.95, 4.1, 4.25, 4.4, 4.55, 4.7, 4.85, 5, 5.15, 5.3, 5.45, 5.6, 5.75, 5.9, 6.05, 6.2, 6.35, 6.5, 6.65, 6.8, 6.95, 7.1, 7.25, 7.4, 7.55, 7.7, 7.85, 8],
    "energy_j_kg_m": [5.7137, 5.5985, 5.4833, 5.3682, 5.253, 5.1378, 5.0227, 4.9075, 4.7923, 4.6771, 4.562, 4.4468, 4.3317, 4.2187, 4.1115, 4.0139, 3.9297, 3.8628, 3.816, 3.7872, 3.7732, 3.7707, 3.7763, 3.7868, 3.8002, 3.8157, 3.8329, 3.8512, 3.8701, 3.8892, 3.9082, 3.9273, 3.9463, 3.9654, 3.9844, 4.0035, 4.0225, 4.0416, 4.0606, 4.0797, 4.0987, 4.1178, 4.1368, 4.1559, 4.1749, 4.194, 4.213, 4.2321, 4.2511, 4.2702, 4.2892],
    "energy_j_kg_s": [2.8568, 3.639, 4.3867, 5.0998, 5.7783, 6.4223, 7.0317, 7.6066, 8.1469, 8.6527, 9.1239, 9.5606, 9.9629, 10.3358, 10.6898, 11.0381, 11.3962, 11.7817, 12.2112, 12.6872, 13.2062, 13.763, 14.3499, 14.958, 15.5808, 16.2168, 16.8647, 17.523, 18.1896, 18.8625, 19.5411, 20.2255, 20.9155, 21.6113, 22.3128, 23.02, 23.7329, 24.4516, 25.1759, 25.906, 26.6418, 27.3833, 28.1305, 28.8834, 29.6421, 30.4064, 31.1765, 31.9523, 32.7338, 33.521, 34.3139]
  }
// Update later with denser grid  


function getEquivFlatSpeed(W_kg) {
    // Works!!
    // Use blackGam to find what flat-ground speed has the metabolic power closest to a given metabolic power
    const speed = blackGam.speed_m_s;
    const met_power = blackGam['energy_j_kg_s'];
    // Check if x is outside the range of speed_m_s
    if (W_kg < met_power[0] || W_kg > met_power[met_power.length - 1]) {
        throw new Error('W_kg is outside of the range of the energy_kg_s');
    } 

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
    const eq_speed = speed[i] + (speed[i + 1] - speed[i]) * ((W_kg - met_power[i]) / (met_power[i + 1] - met_power[i]));
    // f(x) approximation
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
// This is the “inverting” part…
// Will be much easier when using J/kg/s since result is monotonic


// Update results on page
function updateResult(){
    console.log(hill_mode)
    //console.log("do result updates...")

    //updates input_m_s and input_grade
    readCurrentSpeed()
    readCurrentGrade()
    //input_m_s
    //input_grade
    console.log(input_grade)

    // FORWARD MODE

    // 6:00/mi
    // pace on an 
    // uphill with a
    // 5% grade
    // is the same effort as
    // 5:15/mi
    // on flat ground

    console.log('*********')
    // Calculate expected CoT for running up this grade
    let Cr_hill = calcHillCoT(input_grade) // in J/kg/m
    console.log(Cr_hill)
    console.log(`Cr on hill (J/kg/m) is: ${Cr_hill}`);

    let Cr_hill_W_kg = Cr_hill*input_m_s // Multiply by speed to get metabolic power (rate of EE/kg)
    console.log(`Cr on hill (W/kg) is: ${Cr_hill_W_kg}`);
    
    let eq_flat_speed = getEquivFlatSpeed(Cr_hill_W_kg)
    console.log(`eq. flat speed (m/s) is: ${eq_flat_speed}`);
    console.log('*****')    


    // Now convert eq_falt_speed to output units


    // Solve for flat speed that is equal to this Cr as a 
    
    // Calculate cost of running on flat ground at this speed.  
    let flat_Cr_permeter = lookupSpeed(input_m_s,'energy_j_kg_m')


    //WARNING: Only works for forward mode! 
    //    Need to think about reverse mode converion process

    //Total cost to run at input_m_s on a hill of input_grade
    // let total_Cr_permeter = flat_Cr_permeter + delta_Cr
    // let total_Cr_persec = total_Cr_permeter*input_m_s //now in W/kg

    //Find the x_speed value that gives energy_j_kg_s value in blackGam that is closest to total_Cr_persec
    // that x_speed is your GAP


}


// Minetti 2002 quintic polynomial for O2 cost
function calcHillCoT(x_grade){
    // input   - x_grade is gradient in decimal (0.10 for 10% grade, can be negative)
    // returns - Cr - *added* cost of running, above level ground intensity, in J/kg/m
    let Cr_hill = 155.4*x_grade**5 - 30.4*x_grade**4 - 43.3*x_grade**3 + 46.3*x_grade**2 + 19.5*x_grade + 3.6
    return Cr_hill
}





// Get f(x_speed) for either J/kg/m or J/kg/s (=W/kg) in Black data
// which is flat running from ~2.2-4.5
function lookupSpeed(x, col_name) {
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
    const f_x = energy[i] + (energy[i + 1] - energy[i]) * ((x - speed[i]) / (speed[i + 1] - speed[i]));
    // f(x) approximation
    return f_x;
 }





// TODO: 

// Continue calcs

// add m/s to calculator


// Set up appearing alerts for various "bad" situations 
//  - walking more efficint
//  - downhill too steep to take advantage of
//  - outside range of reliable data

// see Gdoc for notes on what %s these ssohudl be at

// As interim, can just display +/- O2 as delta
// instaed fo the real equvialent pace

//Get intaneral state of input speed and output speed, m/s



//leave output units for later, will let me 
//fudge the text as a debug
 
// console.log('-- Minetti test -- ')
// console.log(calcDeltaO2(0.1))
// console.log('---------------')



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

// Input unit selector
const output_buttons = document.querySelectorAll('.output-toggle');

output_buttons.forEach(button => {
    button.addEventListener('click', (e) => {
        // Remove active class from all buttons
        output_buttons.forEach(btn => btn.classList.remove('active'));
        // Toggle the active state of the clicked button
        e.target.classList.toggle('active');
        setOutputText(button);
    });
});



var pace_mode = "pace"


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
            pace_post.textContent = 'pace on an'
        } else {
            pace_post.textContent = 'pace on a'
        }
    }
    if (dial_mode == "speed") {
        // set global var, swap hidden states
        pace_mode = "speed"
        pace_dials.classList.add('hidden');
        speed_dials.classList.remove('hidden');

        //grammar
        if (uphill_or_downhill == "uphill") {
            pace_post.textContent = 'speed on an'
        } else {
            pace_post.textContent = 'speed on a'
        }
    }
}


//Change display text by pace
function setPaceText(button){
    //4 things can happen here: mi, km, mph, kmh.
    let pace_units = document.querySelector('#pace-units')
    let speed_units = document.querySelector('#speed-units')

    console.log('setPaceDetxt FIRE')

    // [/mi] 
    if (button.textContent == "/mi" || button.textContent == "/km") {
        setMode("pace");        
        pace_units.textContent = button.textContent;
        // function like pass_pace_to_speed()
    }
    if (button.textContent == "mph" || button.textContent == "km/h") {
        setMode("speed");
        speed_units.textContent = button.textContent;
        // function like pass_speed_to_pace()
    }
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
    }
    if (button.textContent == "mph" || button.textContent == "km/h") {
        // setMode("speed");
        // speed_units.textContent = button.textContent;
        // function like pass_speed_to_pace()
    }
}


// Uphill or downhill button
var hill_mode = "grade"
var uphill_or_downhill = "uphill"

const hill_indicator = document.querySelector('.hill-button');
const hill_text = document.querySelector('#uphill-or-downhill');


// Negate Incline on button press
hill_indicator.addEventListener('click', (e) => {
    negateIncline()
    updateResult()
});

var vert_speed_int = 1000 //hardcoded, care

var vert_speed_input = document.querySelector('#vert-speed-input')
vert_speed_input.addEventListener("change", (e) => {
    var new_value = +e.target.value
    var old_value = vert_speed_int
    vert_speed_int = new_value

    if (vert_speed_int < 0 && old_value >= 0){
        negateIncline()
    }
    if (vert_speed_int > 0 && old_value <= 0){
        negateIncline()
    }
    updateResult();
});


var rise_input = document.querySelector('#rise')
var rise_int = 100
rise_input.addEventListener("change", (e) => {
    var new_value = +e.target.value
    var old_value = rise_int
    rise_int = new_value

    if (rise_int < 0 && old_value >= 0 || rise_int > 0 && old_value <= 0){
        negateIncline()
    }
    updateResult();
});


var run_input = document.querySelector('#run')
var run_int = parseInt(run_input.value)
run_input.addEventListener("change", (e) => {
    run_int = +e.target.value
    updateResult();
});



// CARE CARE CARE with math, track units!!!
var pace_post = document.querySelector('#pace-post')

function negateIncline(){
    console.log('***************')
    console.log(vert_speed_int)
    // Maybe edit across the board? So its' ok if you sitch? 

    if (hill_text.textContent == "uphill") {
        // flip to downhill and fix grammar
        uphill_or_downhill = "downhill"
        hill_text.textContent = "downhill"
        if (pace_mode == "pace") {
            pace_post.textContent = 'pace on a'
        } else {
            pace_post.textContent = 'speed on a'
        }
        hill_indicator.classList.toggle('mirrored');
        //Call swap function to whatever mode is active to +/- it
    } else if (hill_text.textContent == "downhill") {
        uphill_or_downhill = "uphill"
        hill_text.textContent = "uphill"
        if (pace_mode == "pace") {
            pace_post.textContent = 'pace on an'
        } else {
            pace_post.textContent = 'speed on an'
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
    var rise_post_text = document.querySelector('#rise-post-text')
    if (rise_post_text.innerHTML == "&nbsp;of gain") {
        rise_post_text.innerHTML = '&nbsp;of loss'
    } else {
        rise_post_text.innerHTML = "&nbsp;of gain"
    }

    //vert speed
    var vert_post_text = document.querySelector('#vert-speed-post-text')
    if (vert_post_text.innerHTML == "&nbsp;gain") {
        vert_post_text.innerHTML = '&nbsp;loss'
    } else {
        vert_post_text.innerHTML = "&nbsp;gain"
    }


    // flip rise and vert IF NEEDED
    if (vert_speed_int < 0 && uphill_or_downhill == "uphill" || 
    vert_speed_int > 0 && uphill_or_downhill == "downhill") {
        console.log(vert_speed_int)
        negateVertSpeed() 
    }

    if (rise_int < 0 && uphill_or_downhill == "uphill" || 
    rise_int > 0 && uphill_or_downhill == "downhill") {
        negateRise()
    }

}

function negateVertSpeed(){
    console.log('fire negvs')
    console.log(vert_speed_int)
    vert_speed_int = vert_speed_int*-1
    vert_speed_input.value = vert_speed_int
    console.log(vert_speed_int)
    console.log('-------')
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

    // else if here about edge cases of 46 + 5?

    // if we go from zero to negative, or vv. 
    // .,... DO SOMETHING???

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


function readCurrentSpeed(){
    // Pace mode
    if (pace_mode == "pace") {
        // read mm:ss
        var minute_val = parseInt(d1.textContent)
        var sec_val = 10*parseInt(d2.textContent) + parseInt(d3.textContent)
        var dec_minutes = minute_val + sec_val/60
        console.log(dec_minutes)

        const pace_units = document.querySelector('#pace-units').textContent

        if (pace_units == "/mi"){
            //Convert to m/s
            input_m_s = 1609.344/(60*dec_minutes)
            console.log(input_m_s)
        } else if (pace_units == "/km"){
            //Convert to m/s
            input_m_s = 1000/(60*dec_minutes)
            console.log(input_m_s)
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
        }
    }
}

function readCurrentGrade(){
    // Return current input grade as decimal grade
    // e.g. %5 is 0.05
    console.log('FIRE')

    if (hill_mode == "grade") {
        // easy
        input_grade = pct_int/100.0
        console.log(angle_int)
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
            console.log(run_meters)
        } else if (run_text.textContent == "kilometers"){
            var run_meters = run_int*1000
        }

        // NOW can calc
        input_grade = rise_meters/run_meters
        console.log(input_grade)

    } else if (hill_mode == "vert speed") {
        // vert speed is tricky because it depends on speed
        // Also it has weird trig contraints
        // Easier to just detect NaN and Inf and replace with ::hmm
        // vs solving dynamically the limits

        //convert vert speed to meters per second
        if (vert_text.textContent == 'feet per hour') {
            //convert to m/hr, then m/s
            var vert_speed_m_s = vert_speed_int*0.3048/(60*60)
        } else if (vert_text.textContent == 'meters per hour') {
            //..
            var vert_speed_m_s = vert_speed_int/(60*60)
        }
        //do on velocity scale, doesn't matter
        var run_x_meters = Math.sqrt(input_m_s**2 - vert_speed_m_s**2)
        //techncially input speed is parallel to slope, not x-axis speed
        //only matters for extreme steep slopes
        input_grade = vert_speed_m_s/run_x_meters
    }
}


var input_m_s = 4.4704 //6:00 mile pace as input initail
var input_grade = 0.05 // Keep as decimal because that's what minetti used

// TODO:

// 7) Implement Minetti equation + gam and run console tests
// 8) Implement alert/warning insertions when outside ranges


// 6) Implement unit conversions for results

