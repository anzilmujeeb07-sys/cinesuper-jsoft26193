const supabaseClient = window.supabase.createClient(
  SUPABASE_URL,
  SUPABASE_ANON_KEY
);

console.log("CineSuper connected to Supabase!");

let allMovies = [];
let allRatings = [];

const moviesGrid = document.getElementById("moviesGrid");
const reviewsList = document.getElementById("reviewsList");

const searchInput = document.getElementById("searchInput");
const languageFilter = document.getElementById("languageFilter");
const sortFilter = document.getElementById("sortFilter");

const reviewForm = document.getElementById("reviewForm");
const movieIdSelect = document.getElementById("movieId");

async function loadMovies() {
  const { data, error } = await supabaseClient
    .from("movies")
    .select("*");

  if (error) {
    console.error("Error loading movies:", error);
    moviesGrid.innerHTML =
      '<p class="empty">Could not load movies.</p>';
    return;
  }

  const { data: ratings, error: ratingsError } =
    await supabaseClient
      .from("movie_ratings")
      .select("*");

  if (ratingsError) {
    console.error("Error loading ratings:", ratingsError);
    return;
  }

  allMovies = data || [];
  allRatings = ratings || [];

  populateMovieSelect();
  displayMovies();
}

function populateMovieSelect() {
  movieIdSelect.innerHTML =
    '<option value="">Select a movie</option>';

  allMovies.forEach((movie) => {
    const option = document.createElement("option");

    option.value = movie.id;
    option.textContent = movie.title;

    movieIdSelect.appendChild(option);
  });
}

function displayMovies() {
  const searchTerm =
    searchInput.value.toLowerCase().trim();

  let movies = allMovies.filter((movie) => {

    const matchesSearch =
      movie.title.toLowerCase().includes(searchTerm);

    const matchesLanguage =
      languageFilter.value === "all" ||
      movie.language === languageFilter.value;

    return matchesSearch && matchesLanguage;
  });

  if (sortFilter.value === "newest") {
    movies.sort(
      (a, b) => b.release_year - a.release_year
    );
  }

  if (sortFilter.value === "oldest") {
    movies.sort(
      (a, b) => a.release_year - b.release_year
    );
  }

  if (sortFilter.value === "rating") {
    movies.sort((a, b) => {

      const ratingA =
        allRatings.find((r) => r.id === a.id)
          ?.avg_rating || 0;

      const ratingB =
        allRatings.find((r) => r.id === b.id)
          ?.avg_rating || 0;

      return ratingB - ratingA;
    });
  }

  moviesGrid.innerHTML = "";

  if (movies.length === 0) {
    moviesGrid.innerHTML =
      '<p class="empty">No movies found.</p>';
    return;
  }

  movies.forEach((movie) => {

    const rating = allRatings.find(
      (r) => r.id === movie.id
    );

    const card = document.createElement("article");

    card.className = "movie-card";

    const averageRating =
      rating && rating.avg_rating !== null
        ? rating.avg_rating
        : "No ratings";

    const imdb =
      movie.imdb_rating !== null &&
      movie.imdb_rating !== undefined
        ? movie.imdb_rating
        : "N/A";

    card.innerHTML = `
      <img
        src="${movie.poster_url || "https://placehold.co/300x450/27272a/ffffff?text=No+Poster"}"
        alt="${movie.title}"
        class="movie-poster"
      >

      <div class="movie-info">

        <h3>${movie.title}</h3>

        <div class="movie-meta">
          ${movie.language} · ${movie.release_year}
          · ${movie.duration_min} min
        </div>

        <p class="rating">
          ⭐ ${averageRating}
        </p>

        <p class="imdb">
          🎬 IMDb: ${imdb}
        </p>

        <p class="description">
          ${movie.description || "No description available."}
        </p>

      </div>
    `;

    moviesGrid.appendChild(card);
  });
}

async function loadReviews() {

  const { data: reviews, error } =
    await supabaseClient
      .from("reviews")
      .select("*")
      .order("created_at", {
        ascending: false
      });

  if (error) {
    console.error("Error loading reviews:", error);

    reviewsList.innerHTML =
      '<p class="empty">Could not load reviews.</p>';

    return;
  }

  reviewsList.innerHTML = "";

  if (!reviews || reviews.length === 0) {
    reviewsList.innerHTML =
      '<p class="empty">No reviews yet. Be the first to add one!</p>';
    return;
  }

  reviews.forEach((review) => {

    const card = document.createElement("div");

    card.className = "review-card";

    card.innerHTML = `
      <h3>${review.reviewer_name}</h3>

      <p class="review-rating">
        ${"⭐".repeat(review.rating)}
        (${review.rating}/5)
      </p>

      <p>
        ${review.comment || "No comment"}
      </p>
    `;

    reviewsList.appendChild(card);
  });
}

reviewForm.addEventListener(
  "submit",
  async (event) => {

    event.preventDefault();

    const reviewerName =
      document.getElementById("reviewerName")
        .value.trim();

    const movieId =
      document.getElementById("movieId").value;

    const rating =
      document.getElementById("rating").value;

    const comment =
      document.getElementById("comment")
        .value.trim();

    if (!reviewerName || !movieId || !rating) {
      alert("Please fill in all required fields.");
      return;
    }

    const { error } =
      await supabaseClient
        .from("reviews")
        .insert({
          movie_id: movieId,
          reviewer_name: reviewerName,
          rating: Number(rating),
          comment: comment
        });

    if (error) {
      console.error(
        "Error adding review:",
        error
      );

      alert("Could not submit review.");
      return;
    }

    alert("Review submitted successfully!");

    reviewForm.reset();

    await loadReviews();
    await loadMovies();
  }
);

searchInput.addEventListener(
  "input",
  displayMovies
);

languageFilter.addEventListener(
  "change",
  displayMovies
);

sortFilter.addEventListener(
  "change",
  displayMovies
);

loadMovies();
loadReviews();