﻿let restaurant;
var map;

/**
 * Initialize Google map, called from HTML.
 */
window.initMap = () => {
    fetchRestaurantFromURL((error, restaurant) => {
        if (error) { // Got an error!
            console.error(error);
        } else {
            self.map = new google.maps.Map(document.getElementById('map'), {
                zoom: 16,
                center: restaurant.latlng,
                scrollwheel: false
            });
            fillBreadcrumb();
            DBHelper.mapMarkerForRestaurant(self.restaurant, self.map);
        }
    });
}


/**
 * Get current restaurant from page URL.
 */
fetchRestaurantFromURL = (callback) => {
    if (self.restaurant) { // restaurant already fetched!
        callback(null, self.restaurant);
        return;
    }
    const id = getParameterByName('id');
    if (!id) { // no id found in URL
        error = 'No restaurant id in URL'
        callback(error, null);
    } else {
        DBHelper.fetchRestaurantById(id, (error, restaurant) => {
            self.restaurant = restaurant;
            console.log('Fetching restaurant by id')
            if (!restaurant) {
                console.error(error);
                return;
            }
            fillRestaurantHTML();
            callback(null, restaurant)
        });
    }
}

/**
 * Create restaurant HTML and add it to the webpage
 */
fillRestaurantHTML = (restaurant = self.restaurant) => {

    const name = document.getElementById('restaurant-name');
    name.innerHTML = restaurant.name;

    const address = document.getElementById('restaurant-address');
    address.innerHTML = restaurant.address;

    const image = document.getElementById('restaurant-img');
    image.className = 'restaurant-img';

    const imgNameOrig = DBHelper.imageUrlForRestaurant(restaurant).replace('/img/', '/img/details/');
    const imgParts = imgNameOrig.split('.');

    const imgUrl_1x = imgParts[0] + '_1x.jpg';
    const imgUrl_2x = imgParts[0] + '_2x.jpg';

    image.src = imgUrl_1x;
    image.srcset = `${imgUrl_1x} 1x, ${imgUrl_2x} 2x`;
    image.alt = 'Image of ' + restaurant.name;

    const cuisine = document.getElementById('restaurant-cuisine');
    cuisine.innerHTML = restaurant.cuisine_type;

    // fill operating hours
    if (restaurant.operating_hours) {
        fillRestaurantHoursHTML();
    }
    // fill reviews
    DBHelper.fetchReviewsForRestaurantID(self.restaurant.id, (error, reviews) => {
        if (error) {
            console.error(error);
        } else {
            fillReviewsHTML(reviews);
        }
    });   
}

/**
 * Create restaurant operating hours HTML table and add it to the webpage.
 */
fillRestaurantHoursHTML = (operatingHours = self.restaurant.operating_hours) => {
    const hours = document.getElementById('restaurant-hours');
    for (let key in operatingHours) {
        const row = document.createElement('tr');

        const day = document.createElement('td');
        day.innerHTML = key;
        row.appendChild(day);

        const time = document.createElement('td');
        time.innerHTML = operatingHours[key];
        row.appendChild(time);

        hours.appendChild(row);
    }
}

/**
 * Create all reviews HTML and add them to the webpage.
 */
fillReviewsHTML = (reviews = self.restaurant.reviews) => {
    
    const container = document.getElementById('reviews-container');
    if (!reviews) {
        const noReviews = document.createElement('p');
        noReviews.innerHTML = 'No reviews yet!';
        container.appendChild(noReviews);
        return;
    }
    const ul = document.getElementById('reviews-list');
    reviews.forEach(review => {
        ul.appendChild(createReviewHTML(review));
    });
    container.appendChild(ul);

    const submitButton = document.getElementById('submitButton');
    submitButton.onclick = function () {
        event.preventDefault();
        console.log('Submitting New Custom Review')

        newReview = {
            "id": 8,
            "restaurant_id": self.restaurant.id,
            "name": document.getElementById('review-name').value,
            "createdAt": Date.now(),
            "updatedAt": Date.now(),
            "rating": document.getElementById('review-rating').value,
            "comments": document.getElementById('review-text').value
        };
        const ul = document.getElementById('reviews-list');
        ul.appendChild(createReviewHTML(newReview))
        console.log(name)
        DBHelper.addNewReview(self.restaurant.id, newReview);
    }
}


/**
 * Create review HTML and add it to the webpage.
 */
createReviewHTML = (review) => {
    const li = document.createElement('li');
    const name = document.createElement('p');
    name.innerHTML = `🙎: ${review.name}`;
    li.appendChild(name);

    const date = document.createElement('p');
    date.innerHTML = `📅: ${new Date(review.createdAt).toLocaleString()}`;
    li.appendChild(date);

    const rating = document.createElement('p');
    const nStars = review.rating;
    rating.innerHTML = `★`.repeat(nStars);
    li.appendChild(rating);

    const comments = document.createElement('p');
    comments.innerHTML = `<br>` + review.comments;
    li.appendChild(comments);

    return li;
}

/**
 * Add restaurant name to the breadcrumb navigation menu
 */
fillBreadcrumb = (restaurant = self.restaurant) => {
    const breadcrumb = document.getElementById('breadcrumb');
    const li = document.createElement('li');
    li.innerHTML = restaurant.name;
    breadcrumb.appendChild(li);
}

/**
 * Get a parameter by name from page URL.
 */
getParameterByName = (name, url) => {
    if (!url)
        url = window.location.href;
    name = name.replace(/[\[\]]/g, '\\$&');
    const regex = new RegExp(`[?&]${name}(=([^&#]*)|&|#|$)`),
        results = regex.exec(url);
    if (!results)
        return null;
    if (!results[2])
        return '';
    return decodeURIComponent(results[2].replace(/\+/g, ' '));
}
