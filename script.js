document.addEventListener("DOMContentLoaded", () => {
    const filmsList = document.getElementById("films");
    const movieTitle = document.getElementById("movie-title");
    const moviePoster = document.getElementById("movie-poster");
    const movieRuntime = document.getElementById("movie-runtime");
    const movieShowtime = document.getElementById("movie-showtime");
    const movieTickets = document.getElementById("movie-tickets");
    const buyTicketButton = document.getElementById("buy-ticket");

    const dbUrl = "http://localhost:3000/films";

    let selectedMovie = null; // Stores the currently selected movie

    //Fetch movies from db.json and display them in the movie list
    function fetchMovies() {
        fetch(dbUrl)
            .then(response => response.json())
            .then(movies => {
                filmsList.innerHTML = ""; // Clear any existing movies
                movies.forEach(movie => displayMovieInList(movie));
    
                // Restore last selected movie if it exists
                const lastMovieId = localStorage.getItem("selectedMovieId");
                const lastMovie = movies.find(movie => movie.id == lastMovieId);
    
                if (lastMovie) {
                    loadMovieDetails(lastMovie);
                } else if (movies.length > 0) {
                    loadMovieDetails(movies[0]);
                }
            })
            .catch(error => console.error("Error fetching movies:", error));
    }
    //Display each movie title in the aside list
    function displayMovieInList(movie) {
        const li = document.createElement("li");
        li.textContent = movie.title;
        li.classList.add("film-item"); // Adding a class for styling
        li.addEventListener("click", () => loadMovieDetails(movie)); // When clicked, load details
        filmsList.appendChild(li);
    }

    //Load the movie details when a movie is clicked
    function loadMovieDetails(movie) {
        console.log("Loading movie details:", movie);
        selectedMovie = movie;
        localStorage.setItem("selectedMovieId", movie.id); // Store in localStorage
    
        movieTitle.textContent = movie.title;
        moviePoster.src = movie.poster;
        movieRuntime.textContent = `Runtime: ${movie.runtime} mins`;
        movieShowtime.textContent = `Showtime: ${movie.showtime}`;
        updateAvailableTickets();
    }

    //Update available tickets
    function updateAvailableTickets() {
        console.log("Updating available tickets...");
        if (selectedMovie) {
            let availableTickets = selectedMovie.capacity - selectedMovie.tickets_sold;
            movieTickets.textContent = `Available Tickets: ${availableTickets}`;

            if (availableTickets <= 0) {
                buyTicketButton.textContent = "Sold Out";
                buyTicketButton.disabled = true;
            } else {
                buyTicketButton.textContent = "Buy Ticket";
                buyTicketButton.disabled = false;
            }
        }
    }

    //Handle ticket purchase
    buyTicketButton.addEventListener("click", (event) => {
        event.preventDefault();//testing to see if it'll prevent page reload
        event.stopPropagation();//testing to see if it'll prevent page reload
        console.log("Buy Ticket button clicked!"); 
        if (selectedMovie && selectedMovie.tickets_sold < selectedMovie.capacity) {
            selectedMovie.tickets_sold++;

            console.log("Tickets sold updated:", selectedMovie.tickets_sold);
            updateAvailableTickets(); // Update ticket count in UI

            // (Optional) Send updated data back to the server (if using JSON Server)
            fetch(`${dbUrl}/${selectedMovie.id}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ tickets_sold: selectedMovie.tickets_sold })
            })
            .then(response => response.json())
            .then(updatedMovie => {
                selectedMovie = updatedMovie; // Sync with server data
            })
            .catch(error => console.error("Error updating ticket count:", error));
        }
        
    });

    //Load movies when the page is ready
    fetchMovies();
    
});
