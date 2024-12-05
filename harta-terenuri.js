let map;
let allMarkers = [];

function initMap() {
    map = new google.maps.Map(document.getElementById("map"), {
        center: { lat: 44.4268, lng: 26.1025 },
        zoom: 12,
    });
        
    fetch("http://localhost:3000/get-sports-fields")
        .then((response) => response.json())
        .then(async (fields) => {
            populateFieldSelector(fields);
        
            for (const field of fields) {
                const address = field.adresa;
        
                try {
                    const response = await fetch(
                        `http://localhost:3000/get-coordinates?address=${encodeURIComponent(address)}`
                    );
                    const data = await response.json();
        
                    if (data.success) {
                        const marker = new google.maps.Marker({
                            position: { lat: data.lat, lng: data.lng },
                            map: map,
                            title: field.denumire_teren,
                            visible: false
                        });
                        marker.fieldId = field.id_teren;
                        allMarkers.push(marker);
                    } else {
                        console.warn(`Could not fetch coordinates for: ${address}`);
                    }
                } catch (error) {
                    console.error(`Error fetching coordinates for: ${address}`, error);
                }
            }
        })
        .catch((error) => {
            console.error("Error fetching sports fields:", error);
        });
}        

function populateFieldSelector(fields) {
    const selector = document.getElementById("field-selector");
    fields.forEach((field) => {
        const option = document.createElement("option");
        option.value = field.id_teren;
        option.textContent = field.denumire_teren;
        selector.appendChild(option);
    });

    selector.addEventListener("change", (event) => {
        const selectedFieldId = event.target.value;
        console.log("acesta e ID-ul terenului selectat : ", selectedFieldId);
        handleFieldSelection(selectedFieldId);
    });
}

function handleFieldSelection(fieldId) {
    allMarkers.forEach((marker) => {
        marker.setVisible(false);
    });
    
    if (fieldId) {
        const selectedMarker = allMarkers.find((marker) => String(marker.fieldId) === String(fieldId));
        console.log("Selected Marker value : ", selectedMarker);
            
        if (selectedMarker) {
            selectedMarker.setVisible(true);
            map.setCenter(selectedMarker.getPosition());
            map.setZoom(15);
        } else {
            console.warn("No marker found for the selected field ID:", fieldId);
        }
    } else {
        map.setCenter({ lat: 44.4268, lng: 26.1025 });
        map.setZoom(12);
    }
}

window.onload = initMap;