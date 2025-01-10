Rick and Morty Swiper App
A single-page application (SPA) that uses Swiper to slide between Characters, Details, and Favorites sections. The app consumes the Rick and Morty API to list characters, show details, and manage favorites in localStorage.

Features
Characters Slide

Pagination: Displays 10 characters per “front-end” page (split from the API’s 20 per page).
Search & Filters: Filter by name, status (alive, dead, unknown), and species (e.g., Human, Alien, etc.).
Add to Favorites: Store selected characters in local storage.
Details Slide

Shows detailed info of the last clicked character (image, species, location, and episodes).
Option to add the current character to favorites.
Favorites Slide

List of all saved favorites from local storage.
Remove from favorites.
Details button to view any character’s info in the Details slide.
Responsive Layout

Uses CSS Grid + media queries: 5 columns on large screens, 3 on tablets, 2 on phones.
Footer stays at the bottom; header with a navigation menu at the top.
Requirements
A modern web browser (Chrome, Firefox, Safari, Edge).
Optional: A local server (like Live Server in VSCode) for hassle-free fetching.
Installation & Usage
Clone or download this repository.
Open the project folder.
If desired, run a local server. For instance, in VSCode, right-click index.html → “Open with Live Server”.
Alternatively, just open index.html in a modern browser (some browsers may restrict fetch calls when using the file:// protocol).
Explore the site:
Swiper Arrows or top menu to move between Characters, Details, and Favorites slides.
Use search and filters to refine character results.
Add or remove favorites, see them saved in local storage.
Click “Details” to view any character’s info on the middle slide.