/***************************************
 * SWIPER INITIALIZATION              *
 ***************************************/
let swiper;

// Wait for the window to load
window.addEventListener('load', () => {
  // Initialize Swiper
  swiper = new Swiper('.swiper-container', {
    loop: false,
    navigation: {
      nextEl: '.swiper-button-next',
      prevEl: '.swiper-button-prev',
    },
  });

  // Now initialize our app
  initApp();
});

/***************************************
 * GLOBAL STATE / UTILITY             *
 ***************************************/
// We'll store current page, search text, status, and species
let currentPage = 1;
let nameFilter = '';
let statusFilter = 'any';   // can be 'any', 'alive', 'dead', 'unknown'
let speciesFilter = 'any';  // can be 'any', 'Human', 'Alien', 'Robot', etc.

function userPageToApiPage(userPage) {
  // Convert front-end page to Rick and Morty API page
  return Math.ceil(userPage / 2);
}

function getTenCharactersSlice(results, userPage) {
  // The API returns 20 characters per page; we want 10 per page
  const isOdd = userPage % 2 !== 0;
  return isOdd ? results.slice(0, 10) : results.slice(10, 20);
}

/***************************************
 * API CALLS                           *
 ***************************************/

async function fetchCharacters(apiPage, name = '', status = '', species = '') {
  let url = `https://rickandmortyapi.com/api/character?page=${apiPage}`;

  if (name) {
    url += `&name=${encodeURIComponent(name)}`;
  }
  if (status && status !== 'any') {
    url += `&status=${encodeURIComponent(status)}`;
  }
  if (species && species !== 'any') {
    url += `&species=${encodeURIComponent(species)}`;
  }

  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error('Failed to fetch characters');
    }
    return await response.json(); // { info, results }
  } catch (error) {
    console.error(error);
    return null;
  }
}

async function fetchCharacterById(id) {
  try {
    const response = await fetch(`https://rickandmortyapi.com/api/character/${id}`);
    if (!response.ok) {
      throw new Error(`Character with ID ${id} not found`);
    }
    return await response.json();
  } catch (error) {
    console.error(error);
    return null;
  }
}

async function fetchEpisodeByUrl(url) {
  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Failed to fetch episode: ${url}`);
    }
    return await response.json();
  } catch (error) {
    console.error(error);
    return null;
  }
}

/***************************************
 * FAVORITES (LOCAL STORAGE)          *
 ***************************************/
function getFavorites() {
  return JSON.parse(localStorage.getItem('favorites')) || [];
}

function setFavorites(favs) {
  localStorage.setItem('favorites', JSON.stringify(favs));
}

function addToFavorites(character) {
  const favorites = getFavorites();
  if (!favorites.some(f => f.id === character.id)) {
    favorites.push(character);
    setFavorites(favorites);
    alert(`${character.name} added to Favorites!`);
    renderFavoritesSlide(); // Refresh
  } else {
    alert(`${character.name} is already in Favorites`);
  }
}

function removeFromFavorites(characterId) {
  let favorites = getFavorites();
  favorites = favorites.filter(f => f.id !== characterId);
  setFavorites(favorites);
  renderFavoritesSlide();
}

/***************************************
 * RENDER: CHARACTERS SLIDE           *
 ***************************************/
function renderCharactersSlide() {
  const section = document.getElementById('charactersSection');
  section.innerHTML = '';

  // Create search bar with multiple filters
  const searchBar = document.createElement('div');
  searchBar.className = 'search-bar';

  // Name Input
  const nameInput = document.createElement('input');
  nameInput.type = 'text';
  nameInput.placeholder = 'Search by name...';
  nameInput.value = nameFilter;

  // Status Select
  const statusSelect = document.createElement('select');
  const statusOptions = ['any', 'alive', 'dead', 'unknown'];
  statusOptions.forEach(opt => {
    const optionEl = document.createElement('option');
    optionEl.value = opt;
    optionEl.textContent = opt.charAt(0).toUpperCase() + opt.slice(1);
    if (opt === statusFilter) {
      optionEl.selected = true;
    }
    statusSelect.appendChild(optionEl);
  });

  // Species Select
  const speciesSelect = document.createElement('select');
  // You can expand this list
  const speciesOptions = ['any', 'Human', 'Alien', 'Robot', 'Animal'];
  speciesOptions.forEach(opt => {
    const optionEl = document.createElement('option');
    optionEl.value = opt;
    optionEl.textContent = opt;
    if (opt === speciesFilter) {
      optionEl.selected = true;
    }
    speciesSelect.appendChild(optionEl);
  });

  // Search Button
  const searchButton = document.createElement('button');
  searchButton.textContent = 'Search';

  // On click, update filters and re-render
  searchButton.addEventListener('click', () => {
    nameFilter = nameInput.value.trim();
    statusFilter = statusSelect.value;
    speciesFilter = speciesSelect.value;
    currentPage = 1;
    renderCharactersSlide();
  });

  // Append controls to searchBar
  searchBar.appendChild(nameInput);
  searchBar.appendChild(statusSelect);
  searchBar.appendChild(speciesSelect);
  searchBar.appendChild(searchButton);
  section.appendChild(searchBar);

  // Loading message
  const loadingText = document.createElement('p');
  loadingText.textContent = 'Loading characters...';
  section.appendChild(loadingText);

  const apiPage = userPageToApiPage(currentPage);

  fetchCharacters(apiPage, nameFilter, statusFilter, speciesFilter).then(data => {
    if (!data || !data.results) {
      section.innerHTML = '<p>No characters found or error fetching data.</p>';
      return;
    }

    section.removeChild(loadingText);
    const resultsSlice = getTenCharactersSlice(data.results, currentPage);

    // Container for the 10 characters
    const container = document.createElement('div');
    container.className = 'characters-container';

    resultsSlice.forEach(character => {
      const card = document.createElement('div');
      card.className = 'card';
      card.innerHTML = `
        <img src="${character.image}" alt="${character.name}" />
        <h3>${character.name}</h3>
        <p>Status: ${character.status}</p>
      `;

      // "Details" button
      const detailsBtn = document.createElement('button');
      detailsBtn.textContent = 'Details';
      detailsBtn.addEventListener('click', async () => {
        const fullCharacter = await fetchCharacterById(character.id);
        renderDetailsSlide(fullCharacter);
        swiper.slideTo(1); // Go to Details slide
      });
      card.appendChild(detailsBtn);

      // "Add to Favorites" button
      const favBtn = document.createElement('button');
      favBtn.textContent = 'Add to Favorites';
      favBtn.addEventListener('click', () => addToFavorites(character));
      card.appendChild(favBtn);

      container.appendChild(card);
    });

    section.appendChild(container);

    // Pagination
    const paginationDiv = document.createElement('div');
    paginationDiv.className = 'pagination';

    // The max front-end page is data.info.pages * 2
    const maxFrontEndPage = data.info.pages * 2;

    // Prev
    if (currentPage > 1) {
      const prevBtn = document.createElement('button');
      prevBtn.textContent = 'Prev';
      prevBtn.addEventListener('click', () => {
        currentPage--;
        renderCharactersSlide();
      });
      paginationDiv.appendChild(prevBtn);
    }

    // Next
    if (data.info.next && currentPage < maxFrontEndPage) {
      const nextBtn = document.createElement('button');
      nextBtn.textContent = 'Next';
      nextBtn.addEventListener('click', () => {
        currentPage++;
        renderCharactersSlide();
      });
      paginationDiv.appendChild(nextBtn);
    }

    const pageIndicator = document.createElement('span');
    pageIndicator.textContent = `Page ${currentPage} of ${maxFrontEndPage}`;
    paginationDiv.appendChild(pageIndicator);

    section.appendChild(paginationDiv);
  });
}

/***************************************
 * RENDER: DETAILS SLIDE              *
 ***************************************/
function renderDetailsSlide(character) {
  const section = document.getElementById('detailsSection');
  if (!character) {
    section.innerHTML = '<p>No character selected yet.</p>';
    return;
  }

  section.innerHTML = '';

  const detailContainer = document.createElement('div');
  detailContainer.className = 'character-detail card';
  detailContainer.innerHTML = `
    <img src="${character.image}" alt="${character.name}" />
    <h2>${character.name}</h2>
    <p><strong>Status:</strong> ${character.status}</p>
    <p><strong>Species:</strong> ${character.species}</p>
    <p><strong>Gender:</strong> ${character.gender}</p>
    <p><strong>Origin:</strong> ${character.origin?.name || 'Unknown'}</p>
    <p><strong>Location:</strong> ${character.location?.name || 'Unknown'}</p>

    <h3>Episodes:</h3>
    <ul id="episodes-list">
      <li>Loading episode info...</li>
    </ul>
  `;

  // "Add to Favorites" button
  const favBtn = document.createElement('button');
  favBtn.textContent = 'Add to Favorites';
  favBtn.addEventListener('click', () => addToFavorites(character));
  detailContainer.appendChild(favBtn);

  section.appendChild(detailContainer);

  // Fetch each episode's name & code instead of showing the full URL
  const episodesUl = detailContainer.querySelector('#episodes-list');
  episodesUl.innerHTML = ''; // clear the placeholder

  if (Array.isArray(character.episode)) {
    const episodePromises = character.episode.map(epUrl => {
      return fetchEpisodeByUrl(epUrl); // We'll fetch name & code for each
    });

    Promise.all(episodePromises).then(episodesData => {
      if (!episodesData || !episodesData.length) {
        episodesUl.innerHTML = '<li>No episodes found.</li>';
        return;
      }

      episodesData.forEach(ep => {
        if (ep) {
          const li = document.createElement('li');
          // ep.episode -> "S01E01", ep.name -> "Pilot"
          li.textContent = `${ep.episode} - ${ep.name}`;
          episodesUl.appendChild(li);
        }
      });
    });
  } else {
    episodesUl.innerHTML = '<li>No episodes array found.</li>';
  }
}

/***************************************
 * RENDER: FAVORITES SLIDE            *
 ***************************************/
function renderFavoritesSlide() {
  const section = document.getElementById('favoritesSection');
  section.innerHTML = '<h2>Favorites</h2>';

  const favorites = getFavorites();
  if (favorites.length === 0) {
    section.innerHTML += '<p>No favorites yet.</p>';
    return;
  }

  const container = document.createElement('div');
  container.className = 'favorites-container';

  favorites.forEach(character => {
    const card = document.createElement('div');
    card.className = 'card';
    card.innerHTML = `
      <img src="${character.image}" alt="${character.name}" />
      <h3>${character.name}</h3>
      <p>Status: ${character.status}</p>
    `;

    // "Details" button
    const detailsBtn = document.createElement('button');
    detailsBtn.textContent = 'Details';
    detailsBtn.addEventListener('click', async () => {
      const fullCharacter = await fetchCharacterById(character.id);
      renderDetailsSlide(fullCharacter);
      swiper.slideTo(1);
    });
    card.appendChild(detailsBtn);

    // "Remove"
    const removeBtn = document.createElement('button');
    removeBtn.textContent = 'Remove';
    removeBtn.addEventListener('click', () => removeFromFavorites(character.id));
    card.appendChild(removeBtn);

    container.appendChild(card);
  });

  section.appendChild(container);
}

/***************************************
 * INIT APP                           *
 ***************************************/
function initApp() {
  // Render each slide
  renderCharactersSlide();   // Slide 0
  renderDetailsSlide(null);  // Slide 1 (initially no character)
  renderFavoritesSlide();    // Slide 2
}
