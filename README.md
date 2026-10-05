# 🎬 CineSuper — Mini OTT Movie Database

**Live Demo:** https://anzilmujeeb07-sys.github.io/cinesuper-jsoft26193/

**Student:** Anzil Mujeeb | **JSOFT ID:** jsoft26193  
**Institution:** Jain School of Future Technology  
**Course:** Database Management Systems | **Faculty:** Sathish Kumar M

## Tech Stack

- Supabase (PostgreSQL) – database
- HTML, CSS, JavaScript – frontend
- GitHub Pages – hosting

## Database

- `genres` (id, name)
- `movies` (id, title, release_year, language, duration_min, description, poster_url, genre_id → genres, imdb_rating)
- `reviews` (id, movie_id → movies, reviewer_name, rating 1–5, comment, created_at)
- View: `movie_ratings` (average rating and review count per movie)
- Row Level Security enabled for database tables
- SQL scripts: see the `database/` folder

## Features

- Browse movies from the Supabase database
- Search movies by title
- Filter movies by language
- Sort movies by newest, oldest, or top rated
- Display movie posters and details
- Display IMDb ratings
- View movie reviews
- Add a review that is saved to the database
- Row Level Security enabled

## My Personalisation

- New movies added: Moonlight Kerala, Rainy Day Love, Beyond the Backwaters, Letters from Kochi, and One More Sunset
- New genre added: Romance
- New column: IMDb rating (`imdb_rating`)
- Extra features: Language filter, movie search, and sorting
- New theme colour: Purple
- Custom placeholder posters added for the 5 new movies