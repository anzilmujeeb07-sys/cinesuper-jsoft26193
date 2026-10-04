-- QUERY 1: Top 5 highest-rated movies
select *
from movie_ratings
where review_count > 0
order by avg_rating desc
limit 5;

-- QUERY 2: Malayalam movies
select *
from movies
where language = 'Malayalam'
order by release_year desc;

-- QUERY 3: Movies with no reviews
select *
from movies
where id not in (
  select movie_id from reviews
);

-- QUERY 4: Average rating by genre
select
  g.name as genre,
  round(avg(r.rating), 1) as avg_rating
from genres g
join movies m on m.genre_id = g.id
join reviews r on r.movie_id = m.id
group by g.id, g.name
order by avg_rating desc;