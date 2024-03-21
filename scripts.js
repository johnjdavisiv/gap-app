

console.log('Script loaded')

// TODO: make degrees cange with buttons
// get rise/run and vert speed, console log

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
    
    
    // //needs a rework w/ the two!!!
    // const from_units = document.querySelector('.pace-units')

    // const pace_dials = document.querySelector('#pace-dials')
    // const speed_dials = document.querySelector('#speed-dials')

    // from_units_string = button.textContent
    // from_units.textContent = button.textContent

    // console.log(button.textContent);

    // //if from units are paces and to units are speeds...
    // if (from_units == "/mi" || from_units == "/km") {
    //     console.log('SWITCH');   
    // }

    //button.textContent is the to-pace. from_units are, well , the from units

    //Change the input pace clock


    //if from units are paces and to units are speeds...

}


// Uphill or downhill button
var hill_mode = "grade"
var uphill_or_downhill = "uphill"

const hill_indicator = document.querySelector('.hill-button');
const hill_text = document.querySelector('#uphill-or-downhill');

hill_indicator.addEventListener('click', (e) => {
    if (hill_text.textContent == "uphill") {
        hill_text.textContent = "downhill"
        hill_indicator.classList.toggle('mirrored');
        //Call swap function to whatever mode is active to +/- it
    } else if (hill_text.textContent == "downhill") {
        hill_text.textContent = "uphill"
        hill_indicator.classList.toggle('mirrored')
        //Call swap function to whatever mode is active to +/- it
    }
});

function negateIncline(){
    if (uphill_or_downhill == "uphill") {
        uphill_or_downhill = "downhill"
        hill_indicator.textContent = "downhill"
        //flip whatever hill mode we have to negative

    }

    // if mode is grade... invert grade
    if (hill_mode == "grade"){
        
    }

    //
}


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
    }
    if (button.textContent == "degrees") {  
        hill_mode = "angle"      
        angle_input.classList.remove('hidden');
    }
    if (button.textContent == "rise/run") {     
        hill_mode = "rise/run"   
        riserun_input.classList.remove('hidden');
    }
    if (button.textContent == "vert speed") {   
        hill_mode = "vert speed"   
        vertspeed_input.classList.remove('hidden');
    }
    
}



// ----- Incremnt grade ----

// Percent changes
let incline_text = document.querySelector(".incline-digits")
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
        console.log('FLIPPING TO NEGATIVE')
    }

    if (pct_int <= 0 && pct_int + change > 0) {
        //flipping negative
        console.log('FLIPPING TO POSITIVE')
    }


    if (pct_int + change <= 50 && pct_int + change >= -50) {
        pct_int = pct_int + change
        incline_text.textContent = pct_int;
    }

    // else if here about edge cases of 46 + 5?

    // if we go from zero to negative, or vv. 
    // .,... DO SOMETHING???

    updateResult();
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


