

console.log('Script loaded')

// TODO: 

// Fix the bug with reverting / inverting negatives
// Total cluster, need to redo it from scratch and cahse sign flips

// Get things to flip correct when you do uphill/downhill

// implement unit changes on output

//Get intaneral state of input speed and output speed, m/s

//tnraslte m/s to pace for output (with conversions)



// Input pace toggles

const TRANSITION_DUR_MS = 400;


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
    }
    if (dial_mode == "speed") {
        // set global var, swap hidden states
        pace_mode = "speed"
        pace_dials.classList.add('hidden');
        speed_dials.classList.remove('hidden');
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
    // HACK ALERT
    if (hill_mode == "vert speed") {
        negateVertSpeed()
    }
    if (hill_mode == "rise/run") {
        negateRise()
    }
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
});


var run_input = document.querySelector('#run')
var run_int = 100
run_input.addEventListener("change", (e) => {
    run_int = +e.target.value
});



// CARE CARE CARE with math, track units!!!
var pace_post = document.querySelector('#pace-post')

function negateIncline(){
    // Maybe edit across the board? So its' ok if you sitch? 

    if (hill_text.textContent == "uphill") {
        // flip to downhill and fix grammar
        uphill_or_downhill == "downhill"
        hill_text.textContent = "downhill"
        pace_post.textContent = 'pace on a'
        hill_indicator.classList.toggle('mirrored');
        //Call swap function to whatever mode is active to +/- it
    } else if (hill_text.textContent == "downhill") {
        uphill_or_downhill = "uphill"
        hill_text.textContent = "uphill"
        pace_post.textContent = 'pace on an'
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
    negateRise()
    var rise_post_text = document.querySelector('#rise-post-text')
    if (rise_post_text.innerHTML == "&nbsp;of gain") {
        rise_post_text.innerHTML = '&nbsp;of loss'
    } else {
        rise_post_text.innerHTML = "&nbsp;of gain"
    }

    //vert speed
    negateVertSpeed()
    var vert_post_text = document.querySelector('#vert-speed-post-text')
    if (vert_post_text.innerHTML == "&nbsp;gain") {
        vert_post_text.innerHTML = '&nbsp;loss'
    } else {
        vert_post_text.innerHTML = "&nbsp;gain"
    }
}

function negateVertSpeed(){
    vert_speed_int = vert_speed_int*-1
    vert_speed_input.value = vert_speed_int
}
function negateRise(){
    console.log("FIREEEEEEEEEEEEEEEee")
    rise_int = rise_int*-1
    rise_input.value = rise_int
    console.log(rise_input.value)
}


uphill_post_text = document.querySelector('#uphill-post-text')


// grade mode selector
const hill_buttons = document.querySelectorAll('.hill-toggle');
console.log(hill_buttons)

hill_buttons.forEach(button => {
    button.addEventListener('click', (e) => {
        console.log(button)
        // Remove active class from all buttons
        hill_buttons.forEach(btn => btn.classList.remove('active'));
        // // Toggle the active state of the clicked button
        e.target.classList.toggle('active');

        setHillInput(button);
    });
});


function setHillInput(button){
    console.log(button.textContent);
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
    });
});

run_unit_buttons.forEach(button => {
    button.addEventListener('click', (e) => {
        run_unit_buttons.forEach(btn => btn.classList.remove('active'));
        e.target.classList.toggle('active');
        setRunText(button);
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
}












// Update results on page
function updateResult(){
    //console.log("do result updates...")

    // IMPORTANT - we need to update global speed in m/s each time a button is pressed

    // farm to a function so we can 




}

// Humm well... we can load the data! 
//  
//  Now I think next step is DOM manipulation basics
// 

// TODO:

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


// May need to detect if user inputs a negative sign in text input! 
//Should accept that as valid and switch mode to dnegative
// if entry is on keyboard, should expect negatives here


// detect and change "pace on a" to "pace on an" for uphill and other a/an stuff

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


