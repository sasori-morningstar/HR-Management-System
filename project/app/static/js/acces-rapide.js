const addFonctionnaliteFavoris = document.getElementById('add-fonctionnalite-favoris');
const removeFonctionnaliteFavoris = document.getElementById('remove-fonctionnalite-favoris');
const favorisElements = document.querySelectorAll('.fav');
const favorisPopup = document.getElementById('add-favoris-popup');
const deleteFavorisPopup = document.getElementById('delete-favoris-popup');
const closePopup = document.getElementsByClassName('close-popup');
const submitFavori = document.getElementById('ajouter-favori-btn');
const submitDeleteFavori = document.getElementById('supprimer-favori-btn');

Array.from(closePopup).forEach(btn => {
    btn.addEventListener('click', e => {
        e.target.parentElement.parentElement.style.display = "none";
    });
});

function getCSRFToken() {
    return document.querySelector('meta[name="csrf-token"]').getAttribute('content');
}

addFonctionnaliteFavoris.addEventListener('click', () => {
    favorisPopup.style.display = "flex";
});

removeFonctionnaliteFavoris.addEventListener('click', () => {
    deleteFavorisPopup.style.display = "flex";
});

submitFavori.addEventListener('click', () => {
    const fonctionnaliteTitre = document.getElementById('fonctionnalite-titre').value;
    const formdata = new FormData();
    formdata.append('fonctionnalite_titre', fonctionnaliteTitre);
    formdata.append('action', 'add');
    fetch(`/`, {
        method: 'POST',
        headers: {
            'X-CSRFToken': getCSRFToken()
        },
        body: formdata
    }).then(response => {
        if (response.ok) {
            window.location.reload();
        } else {
            favorisPopup.style.display = "none";
        }
    });
});

submitDeleteFavori.addEventListener('click', () => {
    const fonctionnaliteTitre = document.getElementById('favori-titre').value;
    const formdata = new FormData();
    formdata.append('fonctionnalite_titre', fonctionnaliteTitre);
    formdata.append('action', 'delete');
    fetch(`/`, {
        method: 'POST',
        headers: {
            'X-CSRFToken': getCSRFToken()
        },
        body: formdata
    }).then(response => {
        if (response.ok) {
            window.location.reload();
        } else {
            deleteFavorisPopup.style.display = "none";
        }
    });
});