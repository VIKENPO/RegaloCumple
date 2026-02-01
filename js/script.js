// Data Configuration (Using Local Images)
const trips = [
    {
        id: "venecia",
        title: "Venecia, Italia",
        date: "Enero 2025",
        image: "https://images.unsplash.com/photo-1514890547357-a9ee288728e0?q=80&w=2070&auto=format&fit=crop",
        photos: [
            "images/venecia-1.jpg",
            "images/venecia-2.jpg",
            "images/venecia-3.jpg"
        ],
        theme: "italy"
    },
    {
        id: "niza",
        title: "Niza, Francia",
        date: "Septiembre 2025",
        image: "images/niza.jpg",
        photos: [
            "images/niza-1.jpg",
            "images/niza-2.jpg",
            "images/niza-3.jpg"
        ],
        theme: "france"
    },
    {
        id: "milan",
        title: "Milán, Italia",
        date: "Septiembre 2025",
        image: "https://images.unsplash.com/photo-1513581166391-887a96ddeafd?q=80&w=2070&auto=format&fit=crop",
        photos: [
            "images/milan-1.jpg",
            "images/milan-2.jpg",
            "images/milan-3.jpg"
        ],
        theme: "italy"
    }
];

const phrases = {
    "Africa": "¡Un safari sería increíble, pero no es el siguiente!",
    "Asia": "¡Tanta cultura por descubrir... pero espera un poco más!",
    "North America": "¡El sueño americano tendrá que esperar!",
    "South America": "¡La selva nos llama, pero no esta vez!",
    "Oceania": "¡Demasiado lejos para una escapada rápida!",
    "Antarctica": "¡Hace demasiado frío para nuestro gusto ahora mismo!"
};

const europePhrase = "¡Bingo! Prepara las maletas... Ahora solo falta el país";

// DOM Elements
const gallery = document.getElementById('trips-gallery');
const btn = document.getElementById('next-trip-btn');

// Map Modal Elements
const mapModal = document.getElementById('map-modal');
const closeMapBtn = document.getElementById('close-modal');
const phrasePopup = document.getElementById('phrase-popup');
const phraseText = document.getElementById('phrase-text');

// Trip Modal Elements
const tripModal = document.getElementById('trip-modal');
const closeTripModalBtn = document.getElementById('close-trip-modal');
const tripModalTitle = document.getElementById('trip-modal-title');
const tripImagesContainer = document.getElementById('trip-images-container');

// 1. Render Trips
function renderTrips() {
    gallery.innerHTML = ""; // Clear existing
    trips.forEach(trip => {
        const card = document.createElement('div');
        card.className = 'card';
        // Add click handler for trip modal
        card.onclick = () => openTripModal(trip);

        card.innerHTML = `
            <img src="${trip.image}" alt="${trip.title}" class="card-image" onerror="this.src='https://images.unsplash.com/photo-1522881451255-f59ad836fdbc?q=80&w=2072&auto=format&fit=crop'"> <!-- Fallback image -->
            <h3>${trip.title}</h3>
            <p>${trip.date}</p>
        `;
        gallery.appendChild(card);
    });
}

function openTripModal(trip) {
    tripModalTitle.innerText = trip.title;
    tripImagesContainer.innerHTML = "";

    // Reset classes
    const content = document.querySelector('.trip-modal-content');
    content.className = 'trip-modal-content'; // Reset
    if (trip.theme) content.classList.add(`theme-${trip.theme}`);

    trip.photos.forEach((photoSrc, index) => {
        const card = document.createElement('div');
        card.className = 'photo-card';
        // Stagger animation delay
        card.style.animationDelay = `${index * 0.2}s`;

        const img = document.createElement('img');
        img.src = photoSrc;
        img.className = 'trip-photo';
        img.alt = `Foto de ${trip.title}`;
        img.onerror = function () {
            this.src = 'https://images.unsplash.com/photo-1621609764180-2ca554a9d6f2?q=80&w=1974&auto=format&fit=crop';
        };

        card.appendChild(img);
        tripImagesContainer.appendChild(card);
    });

    tripModal.classList.add('active');
    tripModal.classList.remove('hidden');
}

closeTripModalBtn.addEventListener('click', () => {
    tripModal.classList.remove('active');
    setTimeout(() => {
        tripModal.classList.add('hidden');
    }, 300);
});

// 2. Map Initialization
let map;
let continentsLayer;
let europeLayer;

function initMap() {
    if (map) return; // Prevent re-init

    // Initialize Map centered on World - Zoom Disabled
    map = L.map('map', {
        center: [20, 0],
        zoom: 2,
        minZoom: 2,
        zoomControl: false,
        scrollWheelZoom: false,
        doubleClickZoom: false,
        touchZoom: false,
        attributionControl: false, // Hide attribution text
        dragging: true // Allow dragging to see everything
    });

    // Tile Layer (Satellite View)
    L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
        attribution: 'Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community'
    }).addTo(map);

    // Load Continents (Local Variable)
    if (typeof continentsData !== 'undefined') {
        continentsLayer = L.geoJson(continentsData, {
            style: (feature) => {
                const name = feature.properties.CONTINENT;
                let color = '#CCCCCC'; // Default

                if (name === "North America" || name === "South America") color = '#4A90E2'; // Blue
                else if (name === "Europe") color = '#66BB6A'; // Green
                else if (name === "Asia") color = '#EF5350'; // Red
                else if (name === "Africa") color = '#FFCA28'; // Yellow/Orange
                else if (name === "Oceania") color = '#AB47BC'; // Purple

                return {
                    fillColor: color,
                    weight: 2,
                    opacity: 1,
                    color: 'white',
                    dashArray: '3',
                    fillOpacity: 0.6 // More visible
                };
            },
            onEachFeature: (feature, layer) => {
                onContinentEachFeature(feature, layer);

                // Add Labels
                const name = feature.properties.CONTINENT;
                let label = "";

                if (name === "North America" || name === "South America") label = "América";
                else if (name === "Europe") label = "Europa";
                else if (name === "Asia") label = "Asia";
                else if (name === "Africa") label = "África";
                else if (name === "Oceania") label = "Oceanía";

                // Prevent duplicate label for America (North/South) - A bit hacky but works for centroid
                // Or simple let both show "América". Let's show for all valid ones.

                if (label && name !== "Antarctica") {
                    layer.bindTooltip(label, {
                        permanent: true,
                        direction: "center",
                        className: "continent-label"
                    }).openTooltip();
                }


            }
        }).addTo(map);
    } else {
        console.error("Continents data not loaded");
    }
}

function onContinentEachFeature(feature, layer) {
    layer.on({
        mouseover: highlightFeature,
        mouseout: resetHighlight,
        click: handleContinentClick
    });
}

function highlightFeature(e) {
    var layer = e.target;
    layer.setStyle({
        weight: 3,
        color: '#FFF', // White border for better visibility on satellite
        dashArray: '',
        fillOpacity: 0.8
    });
    if (!L.Browser.ie && !L.Browser.opera && !L.Browser.edge) {
        layer.bringToFront();
    }
}

function resetHighlight(e) {
    if (continentsLayer) {
        continentsLayer.resetStyle(e.target);
    }
}

function handleContinentClick(e) {
    const properties = e.target.feature.properties;
    // Note: The GeoJSON property for name might vary
    const name = properties.CONTINENT || properties.name || "Unknown";

    if (name === "Europe") {
        document.getElementById('map-title').innerText = "Elige el país que toca";
        showPhrase(europePhrase);
        zoomToEurope();
    } else {
        const msg = phrases[name] || "¡Sigue buscando!";
        showPhrase(msg);
    }
}

function showPhrase(text) {
    phraseText.innerHTML = text;
    phrasePopup.classList.remove('hidden');
}

function zoomToEurope() {
    // 1. Remove continents layer
    map.removeLayer(continentsLayer);

    // Reset selection state to ensure hover works
    italySelected = false;

    // 2. Load Europe Countries
    fetch('https://raw.githubusercontent.com/leakyMirror/map-of-europe/master/GeoJSON/europe.geojson')
        .then(res => res.json())
        .then(data => {
            europeLayer = L.geoJson(data, {
                style: {
                    fillColor: '#4ECDC4',
                    weight: 1,
                    opacity: 1,
                    color: 'white',
                    fillOpacity: 0.6
                },
                onEachFeature: onCountryEachFeature
            }).addTo(map);

            // Zoom to Europe smoothly (Fit Bounds to see the WHOLE continent)
            // This applies to BOTH Mobile and PC
            map.flyToBounds(europeLayer.getBounds(), {
                padding: [50, 50],
                duration: 3,
                easeLinearity: 0.1
            });

            // Update instructions
            document.getElementById('map-title').innerText = "¡Explora los países de Europa!";
            document.getElementById('map-subtitle').innerText = ""; // Clear subtitle
        });
}

function onCountryEachFeature(feature, layer) {
    const name = feature.properties.NAME || feature.properties.name;

    // Check for Italy
    if (name === "Italy" || name === "Italia") {
        layer.on('click', (e) => {
            italySelected = true; // Lock highlight

            // Slow zoom to Italy
            map.flyToBounds(e.target.getBounds(), {
                duration: 3,
                easeLinearity: 0.1
            });

            // Highlight ONLY Italy (Hide others)
            europeLayer.eachLayer((l) => {
                if (l !== layer) {
                    l.setStyle({ opacity: 0, fillOpacity: 0 });
                } else {
                    // Ensure Italy is Green/Visible
                    l.setStyle({ fillColor: '#66BB6A', opacity: 1, fillOpacity: 0.6 });
                    l.bringToFront();
                }
            });

            showPhrase("¡Siii! ¡Nos vamos a Italia! 🍕🍷<br><span style='font-size: 0.9em; font-weight: normal;'>Como lo hemos visto poco toca elegir un sitio nuevo 😉</span>");

            // Transition to City Guessing Game after a delay
            setTimeout(() => {
                startCityGuessingGame();
            }, 4000);
        });
    } else {
        // Standard Popup for others with "Cloud" message
        layer.bindPopup(`<strong>${name}</strong><br>Esta vez no será... ☁️`);
    }

    layer.on({
        mouseover: (e) => {
            if (!italySelected) highlightFeature(e);
        },
        mouseout: (e) => {
            if (!italySelected) europeLayer.resetStyle(e.target);
        }
    });
}

function startCityGuessingGame() {
    // Update UI
    document.getElementById('map-title').innerText = "Ahora, ¿qué destino será? ¡Qué nervios! 😬";
    showPhrase("¡Se han desbloqueado nuevos destinos! Haz click en las chinchetas para adivinar... 📍");

    // City Coordinates
    const cities = [
        { name: "Roma", coords: [41.9028, 12.4964], hint: "A Roma ya vas con tus padres, en otro momento iremos juntos. 😊" },
        { name: "Milán", coords: [45.4642, 9.1900], hint: "¡Ya hemos estado! Toca cambiar de aires. 🛍️" },
        { name: "Venecia", coords: [45.4408, 12.3155], hint: "¡Precioso, pero ya lo conocemos! 🎭" },
        { name: "Florencia", coords: [43.7696, 11.2558], hint: "¡Casi! Pero buscamos algo más... rojo. 🎨" },
        { name: "Bolonia", coords: [44.4949, 11.3426], hint: "WINNER" }
    ];

    cities.forEach(city => {
        const marker = L.marker(city.coords).addTo(map);

        marker.bindTooltip(city.name, {
            permanent: false,
            direction: 'top'
        });

        marker.on('click', () => {
            if (city.hint === "WINNER") {
                // Success State
                showPhrase("¡SIII! ¡PREMIO! 🎉<br><strong>¡NOS VAMOS A BOLONIA!</strong> 🍝🍷");
                document.getElementById('map-title').innerText = "¡BOLONIA!";
                marker.bindPopup("¡Destino Final! 🎁").openPopup();

                // Clear map colors (Remove Europe Layer) for Satellite view
                if (typeof europeLayer !== 'undefined') map.removeLayer(europeLayer);

                // Progressive Zoom & Reveal
                setTimeout(() => {
                    // Zoom smoothly to street level
                    map.flyTo(city.coords, 14, {
                        duration: 5, // Slow zoom over 5 seconds
                        easeLinearity: 0.1
                    });

                    // Trigger Video transition towards end of zoom
                    setTimeout(() => {
                        showVideoReveal();
                    }, 4000);

                }, 1000);

            } else {
                showPhrase(`<strong>${city.name}</strong>: ${city.hint}`);
            }
        });
    });
}

function showVideoReveal() {
    const videoOverlay = document.getElementById('video-reveal');
    const video = document.getElementById('reveal-video');

    // Reset and Play
    video.currentTime = 0;
    videoOverlay.classList.remove('hidden');

    // Force reflow
    void videoOverlay.offsetWidth;
    videoOverlay.classList.add('active');

    // Play after transition
    setTimeout(() => {
        video.play().catch(e => console.log("User interaction needed for play", e));
    }, 500);

    document.getElementById('close-video').onclick = () => {
        videoOverlay.classList.remove('active');
        video.pause();
        setTimeout(() => {
            videoOverlay.classList.add('hidden');
            // Show Tickets
            showTickets();
        }, 500);
    };
}

function showTickets() {
    const ticketsModal = document.getElementById('tickets-modal');
    const closeTicketsBtn = document.getElementById('close-tickets');

    ticketsModal.classList.remove('hidden');
    ticketsModal.classList.add('active'); // Reuse modal active logic if any or just display

    closeTicketsBtn.onclick = () => {
        ticketsModal.classList.add('hidden');

        // Enable Map Interaction for exploration
        map.dragging.enable();
        map.touchZoom.enable();
        map.doubleClickZoom.enable();
        map.scrollWheelZoom.enable();
        map.boxZoom.enable();
        map.keyboard.enable();

        // Optional: Show zoom controls
        if (map.zoomControl) map.zoomControl.enable();

        document.getElementById('map-title').innerText = "¡Explora Bolonia desde el aire! 🛰️";
        showPhrase("Ahora puedes moverte, hacer zoom y cotillear todo lo que quieras. 👀");
    };
}

// 3. Map Modal Logic
btn.addEventListener('click', () => {
    mapModal.classList.add('active');
    mapModal.classList.remove('hidden'); // Ensure display block

    // Resize map after modal is visible
    setTimeout(() => {
        initMap();
        map.invalidateSize();
    }, 100);
});

closeMapBtn.addEventListener('click', () => {
    mapModal.classList.remove('active');
    setTimeout(() => {
        mapModal.classList.add('hidden');
    }, 300);
});

// 4. Welcome Screen Logic
const welcomeScreen = document.getElementById('welcome-screen');
const giftBox = document.getElementById('gift-box');
const mainApp = document.getElementById('main-app');
const instructionText = document.querySelector('.click-instruction');

let clickCount = 0;
const clickMessages = [
    "¡Un click más! 👇",
    "¡Uno más! 🎁",
    "¡Un poquito más! 🤏",
    "¡Estás casi! 😬",
    "¡YA! 🎉"
];

if (giftBox) {
    giftBox.addEventListener('click', () => {
        // Shake animation
        giftBox.classList.remove('shake');
        void giftBox.offsetWidth;
        giftBox.classList.add('shake');

        // Update Text
        if (clickCount < clickMessages.length) {
            instructionText.innerText = clickMessages[clickCount];
            instructionText.style.transform = "scale(1.1)";
            setTimeout(() => instructionText.style.transform = "scale(1)", 200);
        }

        clickCount++;

        // Open after 5 clicks (indices 0-4 consumed)
        if (clickCount >= 5) {
            setTimeout(() => {
                revealMainApp();
            }, 500);
        }
    });
}

function revealMainApp() {
    welcomeScreen.classList.add('fade-out');

    // Wait for transition to finish
    setTimeout(() => {
        welcomeScreen.style.display = 'none';

        mainApp.style.display = 'block';
        // Small delay to allow display:block to apply before opacity transition
        requestAnimationFrame(() => {
            mainApp.classList.add('visible');
            mainApp.classList.remove('hidden-app'); // Ensure hidden class is removed if used

            // Re-init map to ensure correct sizing after becoming visible
            if (typeof map !== 'undefined') {
                map.invalidateSize();
            }
        });

    }, 1000); // Matches CSS transition duration
}

// Init
renderTrips();
