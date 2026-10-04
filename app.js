const supabaseClient = window.supabase.createClient(
  SUPABASE_URL,
  SUPABASE_ANON_KEY
);

console.log("CineSuper connected to Supabase!");

async function loadMovies() {
  const { data, error } = await supabaseClient
    .from("movies")
    .select("*");

  if (error) {
    console.error("Error loading movies:", error);
    return;
  }

  console.log("Movies:", data);

  const { data: ratings, error: ratingsError } = await supabaseClient
    .from("movie_ratings")
    .select("*");

  if (ratingsError) {
    console.error("Error loading ratings:", ratingsError);
    return;
  }

  const moviesContainer = document.getElementById("movies");

  data.forEach((movie) => {
    const rating = ratings.find((r) => r.id === movie.id);

    const movieCard = document.createElement("div");

    movieCard.innerHTML = `
      <img src="${movie.poster_url || 'https://via.placeholder.com/250x350'}"
           alt="${movie.title}"
           class="movie-poster">

      <h2>${movie.title}</h2>
      <p>${movie.language} | ${movie.release_year}</p>

      <p>⭐ Rating: ${
        rating && rating.avg_rating !== null
          ? rating.avg_rating
          : "No ratings yet"
      }</p>

      <p>${movie.description || "No description available."}</p>
    `;

    moviesContainer.appendChild(movieCard);
  });
}

loadMovies();


const reviewForm = document.getElementById("reviewForm");

reviewForm.addEventListener("submit", async (event) => {
  event.preventDefault();

  const reviewerName = document.getElementById("reviewerName").value;
  const movieId = document.getElementById("movieId").value;
  const rating = document.getElementById("rating").value;
  const comment = document.getElementById("comment").value;

  const { error } = await supabaseClient
    .from("reviews")
    .insert({
      movie_id: movieId,
      reviewer_name: reviewerName,
      rating: rating,
      comment: comment
    });

  if (error) {
    console.error("Error adding review:", error);
    alert("Could not submit review.");
    return;
  }

  alert("Review submitted successfully!");
  reviewForm.reset();
});


async function loadReviews() {
  const { data: reviews, error } = await supabaseClient
    .from("reviews")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error loading reviews:", error);
    return;
  }

  console.log("Reviews:", reviews);
  const reviewsContainer = document.getElementById("reviews");

reviews.forEach((review) => {
  const reviewCard = document.createElement("div");

  reviewCard.innerHTML = `
    <h3>${review.reviewer_name}</h3>
    <p>⭐ ${review.rating}/5</p>
    <p>${review.comment || "No comment"}</p>
  `;

  reviewsContainer.appendChild(reviewCard);
});
}

loadReviews();