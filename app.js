const supabaseClient = window.supabase.createClient(
  SUPABASE_URL,
  SUPABASE_ANON_KEY
);

console.log("CineSuper connected to Supabase!");

let allMovies = [];
let allRatings = [];

const moviesGrid = document.getElementById("moviesGrid");
const searchInput = document.getElementById("searchInput");
const genreFilter = document.getElementById("genreFilter");
const languageFilter = document.getElementById("languageFilter");

const movieModal = document.getElementById("movieModal");
const movieDetails = document.getElementById("movieDetails");
const closeMovieModal = document.getElementById("closeMovieModal");


/* =========================
   LOAD MOVIES
========================= */

async function loadMovies() {

  const { data, error } = await supabaseClient
    .from("movies")
    .select(`
      *,
      genres (
        name
      )
    `)
    .order("release_year", { ascending: false });

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
    allRatings = [];
  } else {
    allRatings = ratings || [];
  }

  allMovies = data || [];

  populateGenreFilter();
  displayMovies();
}


/* =========================
   GENRE FILTER
========================= */

function populateGenreFilter() {

  genreFilter.innerHTML =
    '<option value="all">All Genres</option>';

  const genres = [];

  allMovies.forEach((movie) => {

    if (
      movie.genres &&
      movie.genres.name &&
      !genres.includes(movie.genres.name)
    ) {
      genres.push(movie.genres.name);
    }

  });

  genres.sort();

  genres.forEach((genre) => {

    const option = document.createElement("option");

    option.value = genre;
    option.textContent = genre;

    genreFilter.appendChild(option);

  });
}


/* =========================
   DISPLAY MOVIES
========================= */

function displayMovies() {

  const searchTerm =
    searchInput.value.toLowerCase().trim();

  const selectedGenre =
    genreFilter.value;

  const selectedLanguage =
    languageFilter.value;

  const filteredMovies =
    allMovies.filter((movie) => {

      const title =
        movie.title
          ? movie.title.toLowerCase()
          : "";

      const movieGenre =
        movie.genres
          ? movie.genres.name
          : "";

      const matchesSearch =
        title.includes(searchTerm);

      const matchesGenre =
        selectedGenre === "all" ||
        movieGenre === selectedGenre;

      const matchesLanguage =
        selectedLanguage === "all" ||
        movie.language === selectedLanguage;

      return (
        matchesSearch &&
        matchesGenre &&
        matchesLanguage
      );

    });

  moviesGrid.innerHTML = "";

  if (filteredMovies.length === 0) {

    moviesGrid.innerHTML =
      '<p class="empty">No movies found.</p>';

    return;
  }

  filteredMovies.forEach((movie) => {

    const rating =
      allRatings.find(
        (item) => item.id === movie.id
      );

    const averageRating =
      rating &&
      rating.avg_rating !== null
        ? rating.avg_rating
        : null;

    const genre =
      movie.genres
        ? movie.genres.name
        : "Unknown";

    const card =
      document.createElement("article");

    card.className = "movie-card";

    card.innerHTML = `

      <img
        src="${
          movie.poster_url ||
          "https://placehold.co/300x450/27272a/ffffff?text=No+Poster"
        }"
        alt="${movie.title}"
        class="movie-poster"
      >

      <div class="movie-info">

        <h3>${movie.title}</h3>

        <div class="movie-meta">
          ${movie.release_year}
          · ${movie.language}
          · ${genre}
        </div>

        <p class="rating">
          ${
            averageRating === null
              ? "No ratings yet"
              : `⭐ ${averageRating}`
          }
        </p>

      </div>

    `;

    card.addEventListener("click", () => {
      openMovieDetails(movie.id);
    });

    moviesGrid.appendChild(card);

  });
}


/* =========================
   OPEN MOVIE DETAILS
========================= */

async function openMovieDetails(movieId) {

  const movie =
    allMovies.find(
      (item) => item.id === movieId
    );

  if (!movie) {
    return;
  }

  movieModal.classList.add("active");

  movieDetails.innerHTML = `
    <p class="loading">
      Loading movie details...
    </p>
  `;

  const genre =
    movie.genres
      ? movie.genres.name
      : "Unknown";

  const rating =
    allRatings.find(
      (item) => item.id === movie.id
    );

  const averageRating =
    rating &&
    rating.avg_rating !== null
      ? rating.avg_rating
      : null;


  /* =========================
     LOAD REVIEWS
  ========================= */

  const {
    data: reviews,
    error: reviewsError
  } = await supabaseClient
    .from("reviews")
    .select("*")
    .eq("movie_id", movie.id)
    .order("created_at", {
      ascending: false
    });

  if (reviewsError) {
    console.error(
      "Error loading reviews:",
      reviewsError
    );
  }

  const movieReviews =
    reviews || [];


  /* =========================
     REVIEWS HTML
  ========================= */

  let reviewsHTML = "";

  if (movieReviews.length === 0) {

    reviewsHTML = `
      <p class="empty">
        No reviews yet. Be the first to review this movie!
      </p>
    `;

  } else {

    reviewsHTML =
      movieReviews
        .map((review) => {

          const reviewDate =
            review.created_at
              ? new Date(
                  review.created_at
                ).toLocaleString()
              : "";

          return `
            <div class="modal-review-card">

              <strong>
                ${escapeHTML(review.reviewer_name)}
              </strong>

              <div class="modal-review-rating">
                ${"⭐".repeat(Number(review.rating))}
              </div>

              <p class="modal-review-comment">
                ${
                  review.comment
                    ? escapeHTML(review.comment)
                    : "No comment"
                }
              </p>

              <div class="modal-review-date">
                ${reviewDate}
              </div>

            </div>
          `;

        })
        .join("");

  }


  /* =========================
     MOVIE DETAILS HTML
  ========================= */

  movieDetails.innerHTML = `

    <div class="movie-detail">

      <h2>
        ${escapeHTML(movie.title)}
      </h2>

      <div class="movie-detail-meta">
        ${movie.release_year}
        · ${escapeHTML(movie.language)}
        · ${escapeHTML(genre)}
        ${
          movie.duration_min
            ? ` · ${movie.duration_min} min`
            : ""
        }
      </div>

      <div class="movie-detail-rating">
        ${
          averageRating === null
            ? "No ratings yet"
            : `⭐ ${averageRating}`
        }
      </div>

      ${
        movie.director
          ? `
            <div class="movie-detail-director">
              🎬 Directed by
              <strong>
                ${escapeHTML(movie.director)}
              </strong>
            </div>
          `
          : ""
      }

      <p class="movie-detail-description">
        ${escapeHTML(
          movie.detailed_description ||
          movie.description ||
          "No description available."
        )}
      </p>

      <h3>
        Reviews
      </h3>

      <div class="modal-reviews">
        ${reviewsHTML}
      </div>

      <h3>
        Add your review
      </h3>

      <form
        class="modal-review-form"
        id="modalReviewForm"
      >

        <input
          type="text"
          id="modalReviewerName"
          placeholder="Your name"
          maxlength="50"
          required
        >

        <select
          id="modalRating"
          required
        >

          <option value="">
            Select rating
          </option>

          <option value="5">
            ⭐⭐⭐⭐⭐ (5)
          </option>

          <option value="4">
            ⭐⭐⭐⭐ (4)
          </option>

          <option value="3">
            ⭐⭐⭐ (3)
          </option>

          <option value="2">
            ⭐⭐ (2)
          </option>

          <option value="1">
            ⭐ (1)
          </option>

        </select>

        <textarea
          id="modalComment"
          placeholder="Write your review..."
          maxlength="500"
        ></textarea>

        <button type="submit">
          Submit Review
        </button>

      </form>

    </div>

  `;


  /* =========================
     REVIEW FORM SUBMIT
  ========================= */

  const form =
    document.getElementById(
      "modalReviewForm"
    );

  form.addEventListener(
    "submit",
    async (event) => {

      event.preventDefault();

      const reviewerName =
        document
          .getElementById("modalReviewerName")
          .value
          .trim();

      const ratingValue =
        document
          .getElementById("modalRating")
          .value;

      const comment =
        document
          .getElementById("modalComment")
          .value
          .trim();

      if (!reviewerName) {

        alert(
          "Please enter your name."
        );

        return;
      }

      if (!ratingValue) {

        alert(
          "Please select a rating."
        );

        return;
      }

      const rating =
        Number(ratingValue);

      const { error } =
        await supabaseClient
          .from("reviews")
          .insert({
            movie_id: movie.id,
            reviewer_name: reviewerName,
            rating: rating,
            comment: comment
          });

      if (error) {

        console.error(
          "Error adding review:",
          error
        );

        alert(
          "Could not submit review. Check the browser console for details."
        );

        return;
      }

      alert(
        "Review submitted successfully!"
      );

      form.reset();

      await loadMovies();

      await openMovieDetails(movie.id);

    }
  );

}


/* =========================
   ESCAPE HTML
========================= */

function escapeHTML(value) {

  const div =
    document.createElement("div");

  div.textContent =
    value ?? "";

  return div.innerHTML;
}


/* =========================
   CLOSE MODAL
========================= */

closeMovieModal.addEventListener(
  "click",
  () => {

    movieModal.classList.remove(
      "active"
    );

  }
);


movieModal.addEventListener(
  "click",
  (event) => {

    if (
      event.target === movieModal
    ) {

      movieModal.classList.remove(
        "active"
      );

    }

  }
);


document.addEventListener(
  "keydown",
  (event) => {

    if (event.key === "Escape") {

      movieModal.classList.remove(
        "active"
      );

    }

  }
);


/* =========================
   SEARCH + FILTERS
========================= */

searchInput.addEventListener(
  "input",
  displayMovies
);

genreFilter.addEventListener(
  "change",
  displayMovies
);

languageFilter.addEventListener(
  "change",
  displayMovies
);


/* =========================
   START
========================= */

loadMovies();