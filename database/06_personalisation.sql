-- Phase 12.2: Add IMDb rating column

alter table movies
add column imdb_rating numeric(3,1);

update movies
set imdb_rating = 8.5
where title = 'Moonlight Kerala';

update movies
set imdb_rating = 8.1
where title = 'Rainy Day Love';

update movies
set imdb_rating = 7.9
where title = 'Beyond the Backwaters';

update movies
set imdb_rating = 8.3
where title = 'Letters from Kochi';

update movies
set imdb_rating = 8.0
where title = 'One More Sunset';
update movies
set poster_url = 'https://placehold.co/300x450/7f1d1d/ffffff?text=Moonlight+Kerala'
where title = 'Moonlight Kerala';

update movies
set poster_url = 'https://placehold.co/300x450/1e3a8a/ffffff?text=Rainy+Day+Love'
where title = 'Rainy Day Love';

update movies
set poster_url = 'https://placehold.co/300x450/14532d/ffffff?text=Beyond+the+Backwaters'
where title = 'Beyond the Backwaters';

update movies
set poster_url = 'https://placehold.co/300x450/581c87/ffffff?text=Letters+from+Kochi'
where title = 'Letters from Kochi';

update movies
set poster_url = 'https://placehold.co/300x450/92400e/ffffff?text=One+More+Sunset'
where title = 'One More Sunset';