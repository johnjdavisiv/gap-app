// apps.js — single source of truth for the app-gallery block.
//
// Classic script (no ES module syntax). Loaded two ways:
//   1. Vanilla apps: <script src="./apps.js" defer></script>
//      Assigns to window.RW_APPS so no fetch() is needed — index.html
//      works when double-clicked (file://) as well as via HTTP.
//   2. React/Vite apps: `import './apps.js'` for the side effect,
//      then read from window.RW_APPS. Vite bundles it as-is.
//
// SVGs are from Material Symbols Outlined:
//   https://fonts.gstatic.com/s/i/short-term/release/materialsymbolsoutlined/<name>/default/24px.svg
// Paths inherit color via `fill: currentColor` (set in app-gallery.css).

(function (root) {
  root.RW_APPS = [
    {
      id: 'pace-percent',
      title: 'Pace percent calculator',
      href: 'https://apps.runningwritings.com/pace-percent/',
      icon: 'calculate',
      iconSvg: '<svg xmlns="http://www.w3.org/2000/svg" height="24" viewBox="0 -960 960 960" width="24"><path d="M320-240h60v-80h80v-60h-80v-80h-60v80h-80v60h80v80Zm200-30h200v-60H520v60Zm0-100h200v-60H520v60Zm44-152 56-56 56 56 42-42-56-58 56-56-42-42-56 56-56-56-42 42 56 56-56 58 42 42Zm-314-70h200v-60H250v60Zm-50 472q-33 0-56.5-23.5T120-200v-560q0-33 23.5-56.5T200-840h560q33 0 56.5 23.5T840-760v560q0 33-23.5 56.5T760-120H200Zm0-80h560v-560H200v560Zm0-560v560-560Z"/></svg>',
    },
    {
      id: 'race-pace-calculator',
      title: 'Race pace calculator',
      href: 'https://apps.runningwritings.com/race-pace-calculator/',
      icon: 'timer',
      iconSvg: '<svg xmlns="http://www.w3.org/2000/svg" height="24" viewBox="0 -960 960 960" width="24"><path d="M360-840v-80h240v80H360Zm80 440h80v-240h-80v240Zm-99.5 291.5Q275-137 226-186t-77.5-114.5Q120-366 120-440t28.5-139.5Q177-645 226-694t114.5-77.5Q406-800 480-800q62 0 119 20t107 58l56-56 56 56-56 56q38 50 58 107t20 119q0 74-28.5 139.5T734-186q-49 49-114.5 77.5T480-80q-74 0-139.5-28.5ZM678-242q82-82 82-198t-82-198q-82-82-198-82t-198 82q-82 82-82 198t82 198q82 82 198 82t198-82ZM480-440Z"/></svg>',
    },
    {
      id: 'gap-calculator',
      title: 'GAP calculator',
      href: 'https://apps.runningwritings.com/gap-calculator/',
      icon: 'elevation',
      iconSvg: '<svg xmlns="http://www.w3.org/2000/svg" height="24" viewBox="0 -960 960 960" width="24"><path d="m82-120 258-360h202l298-348v708H82Zm70-233-64-46 172-241h202l188-219 60 52-212 247H300L152-353Zm86 153h522v-412L578-400H380L238-200Zm522 0Z"/></svg>',
    },
    {
      id: 'wind-calculator',
      title: 'Wind calculator',
      href: 'https://apps.runningwritings.com/wind-calculator/',
      icon: 'air',
      iconSvg: '<svg xmlns="http://www.w3.org/2000/svg" height="24" viewBox="0 -960 960 960" width="24"><path d="M460-160q-50 0-85-35t-35-85h80q0 17 11.5 28.5T460-240q17 0 28.5-11.5T500-280q0-17-11.5-28.5T460-320H80v-80h380q50 0 85 35t35 85q0 50-35 85t-85 35ZM80-560v-80h540q26 0 43-17t17-43q0-26-17-43t-43-17q-26 0-43 17t-17 43h-80q0-59 40.5-99.5T620-840q59 0 99.5 40.5T760-700q0 59-40.5 99.5T620-560H80Zm660 320v-80q26 0 43-17t17-43q0-26-17-43t-43-17H80v-80h660q59 0 99.5 40.5T880-380q0 59-40.5 99.5T740-240Z"/></svg>',
    },
    {
      id: 'track-wind-calculator',
      title: 'Track wind calculator',
      href: 'https://apps.runningwritings.com/track-wind-calculator/',
      icon: 'laps',
      iconSvg: '<svg xmlns="http://www.w3.org/2000/svg" height="24" viewBox="0 -960 960 960" width="24"><path d="m360-120-57-56 64-64h-7q-117 0-198.5-81.5T80-520q0-117 81.5-198.5T360-800h240q117 0 198.5 81.5T880-520q0 117-81.5 198.5T600-240v-80q83 0 141.5-58.5T800-520q0-83-58.5-141.5T600-720H360q-83 0-141.5 58.5T160-520q0 83 58.5 142.5T360-312h16l-72-72 56-56 160 160-160 160Z"/></svg>',
    },
    {
      id: 'heat-adjusted-pace',
      title: 'Heat-adjusted pace',
      href: 'https://apps.runningwritings.com/heat-adjusted-pace/',
      icon: 'dew_point',
      iconSvg: '<svg xmlns="http://www.w3.org/2000/svg" height="24" viewBox="0 -960 960 960" width="24"><path d="M577.5-537.5Q560-555 560-580q0-17 9.5-34.5t20.5-32q11-14.5 20.5-24l9.5-9.5 9.5 9.5q9.5 9.5 20.5 24t20.5 32Q680-597 680-580q0 25-17.5 42.5T620-520q-25 0-42.5-17.5Zm160-120Q720-675 720-700q0-17 9.5-34.5t20.5-32q11-14.5 20.5-24l9.5-9.5 9.5 9.5q9.5 9.5 20.5 24t20.5 32Q840-717 840-700q0 25-17.5 42.5T780-640q-25 0-42.5-17.5Zm0 240Q720-435 720-460q0-17 9.5-34.5t20.5-32q11-14.5 20.5-24l9.5-9.5 9.5 9.5q9.5 9.5 20.5 24t20.5 32Q840-477 840-460q0 25-17.5 42.5T780-400q-25 0-42.5-17.5Zm-519 239Q160-237 160-320q0-48 21-89.5t59-70.5v-240q0-50 35-85t85-35q50 0 85 35t35 85v240q38 29 59 70.5t21 89.5q0 83-58.5 141.5T360-120q-83 0-141.5-58.5ZM240-320h240q0-29-12.5-54T432-416l-32-24v-280q0-17-11.5-28.5T360-760q-17 0-28.5 11.5T320-720v280l-32 24q-23 17-35.5 42T240-320Z"/></svg>',
    },
    {
      id: 'cv-threshold-calculator',
      title: 'CV / Threshold / VO2max',
      href: 'https://apps.runningwritings.com/cv-threshold-calculator/',
      icon: 'sprint',
      iconSvg: '<svg xmlns="http://www.w3.org/2000/svg" height="24" viewBox="0 -960 960 960" width="24"><path d="m216-160-56-56 384-384H440v80h-80v-160h233q16 0 31 6t26 17l120 119q27 27 66 42t84 16v80q-62 0-112.5-19T718-476l-40-42-88 88 90 90-262 151-40-69 172-99-68-68-266 265Zm-96-280v-80h200v80H120ZM40-560v-80h200v80H40Zm739-80q-33 0-57-23.5T698-720q0-33 24-56.5t57-23.5q33 0 57 23.5t24 56.5q0 33-24 56.5T779-640Zm-659-40v-80h200v80H120Z"/></svg>',
    },
    {
      id: 'critical-speed',
      title: 'Critical speed calculator',
      href: 'https://apps.runningwritings.com/critical-speed/',
      icon: 'body_system',
      iconSvg: '<svg xmlns="http://www.w3.org/2000/svg" height="24" viewBox="0 -960 960 960" width="24"><path d="m316-240 76-364-72 28v96h-80v-148l202-85q14-6 29.5-7.5T501-717q14 5 26.5 14t20.5 23l40 64q28 45 73.5 70.5T760-520v80q-70 0-125.5-28T540-540l-24 60 84 80v160h-80v-122l-78-72-42 194h-84Zm167.5-523.5Q460-787 460-820t23.5-56.5Q507-900 540-900t56.5 23.5Q620-853 620-820t-23.5 56.5Q573-740 540-740t-56.5-23.5ZM480-80q-83 0-156-31.5T197-197q-54-54-85.5-127T80-480q0-119 61.5-214T302-838l36 71q-79 39-128.5 115.5T160-480q0 134 93 227t227 93q134 0 227-93t93-227h80q0 83-31.5 156T763-197q-54 54-127 85.5T480-80Z"/></svg>',
    },
    {
      id: 'power-law',
      title: 'Power law calculator',
      href: 'https://apps.runningwritings.com/power-law/',
      icon: 'chart_data',
      iconSvg: '<svg xmlns="http://www.w3.org/2000/svg" height="24" viewBox="0 -960 960 960" width="24"><path d="m296-320 122-122 80 80 142-141v63h80v-200H520v80h63l-85 85-80-80-178 179 56 56Zm-96 200q-33 0-56.5-23.5T120-200v-560q0-33 23.5-56.5T200-840h560q33 0 56.5 23.5T840-760v560q0 33-23.5 56.5T760-120H200Zm0-80h560v-560H200v560Zm0-560v560-560Z"/></svg>',
    },
  ];

  root.RW_APP_GALLERY_UI_ICONS = {
    chevronLeft: '<svg xmlns="http://www.w3.org/2000/svg" height="24" viewBox="0 -960 960 960" width="24"><path d="M560-240 320-480l240-240 56 56-184 184 184 184-56 56Z"/></svg>',
    chevronRight: '<svg xmlns="http://www.w3.org/2000/svg" height="24" viewBox="0 -960 960 960" width="24"><path d="M504-480 320-664l56-56 240 240-240 240-56-56 184-184Z"/></svg>',
  };
})(typeof window !== 'undefined' ? window : globalThis);
