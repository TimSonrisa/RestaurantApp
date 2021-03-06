/**
 * Common database helper functions.
 */
class DBHelper {

    static get DATABASE_URL() {
        const port = 1337;
        return `http://localhost:${port}`;
    }

    static fetchRestaurants(callback) {
        fetch(DBHelper.DATABASE_URL + `/restaurants`)
            .then(response => response.json())
            .then(response => callback(null, response))
            .catch(e => callback(e, null));
    }

    static fetchRestaurantById(id, callback) {
        fetch(DBHelper.DATABASE_URL + `/restaurants/${id}`)
            .then(response => response.json())
            .then(response => callback(null, response))
            .catch(e => callback(e, null));
    }

    static fetchReviewsForRestaurantID(id, callback) {
        return fetch(DBHelper.DATABASE_URL + `/reviews/?restaurant_id=${id}`, { method: 'GET' })
            .then(response => response.json())
            .then(reviews => callback(null, reviews))
            .catch(e => callback(e, null));
    }

    static addNewReview(id, review) {
        let reviewSend = {
            "name": review.name,
            "rating": parseInt(review.rating),
            "comments": review.comments,
            "restaurant_id": parseInt(review.restaurant_id)
        };
        return fetch(DBHelper.DATABASE_URL + `/reviews/`, {
            method: 'POST',
            body: JSON.stringify(reviewSend),
            headers: new Headers({'Content-Type': 'application/json'})
        })
    }

    /**
     * Fetch restaurants by a cuisine type with proper error handling.
     */
    static fetchRestaurantByCuisine(cuisine, callback) {
        // Fetch all restaurants  with proper error handling
        DBHelper.fetchRestaurants((error, restaurants) => {
            if (error) {
                callback(error, null);
            } else {
                // Filter restaurants to have only given cuisine type
                const results = restaurants.filter(r => r.cuisine_type == cuisine);
                callback(null, results);
            }
        });
    }

    /**
     * Fetch restaurants by a neighborhood with proper error handling.
     */
    static fetchRestaurantByNeighborhood(neighborhood, callback) {
        // Fetch all restaurants
        DBHelper.fetchRestaurants((error, restaurants) => {
            if (error) {
                callback(error, null);
            } else {
                // Filter restaurants to have only given neighborhood
                const results = restaurants.filter(r => r.neighborhood == neighborhood);
                callback(null, results);
            }
        });
    }

    /**
     * Fetch restaurants by a cuisine and a neighborhood with proper error handling.
     */
    static fetchRestaurantByCuisineAndNeighborhood(cuisine, neighborhood, callback) {
        // Fetch all restaurants
        DBHelper.fetchRestaurants((error, restaurants) => {
            if (error) {
                callback(error, null);
            } else {
                let results = restaurants
                if (cuisine != 'all') { // filter by cuisine
                    results = results.filter(r => r.cuisine_type == cuisine);
                }
                if (neighborhood != 'all') { // filter by neighborhood
                    results = results.filter(r => r.neighborhood == neighborhood);
                }
                callback(null, results);
            }
        });
    }

    /**
     * Fetch all neighborhoods with proper error handling.
     */
    static fetchNeighborhoods(callback) {
        // Fetch all restaurants
        DBHelper.fetchRestaurants((error, restaurants) => {
            if (error) {
                callback(error, null);
            } else {
                // Get all neighborhoods from all restaurants
                const neighborhoods = restaurants.map((v, i) => restaurants[i].neighborhood)
                // Remove duplicates from neighborhoods
                const uniqueNeighborhoods = neighborhoods.filter((v, i) => neighborhoods.indexOf(v) == i)
                callback(null, uniqueNeighborhoods);
            }
        });
    }

    /**
     * Fetch all cuisines with proper error handling.
     */
    static fetchCuisines(callback) {
        // Fetch all restaurants
        DBHelper.fetchRestaurants((error, restaurants) => {
            if (error) {
                callback(error, null);
            } else {
                // Get all cuisines from all restaurants
                const cuisines = restaurants.map((v, i) => restaurants[i].cuisine_type)
                // Remove duplicates from cuisines
                const uniqueCuisines = cuisines.filter((v, i) => cuisines.indexOf(v) == i)
                callback(null, uniqueCuisines);
            }
        });
    }

    /**
     * Restaurant page URL.
     */
    static urlForRestaurant(restaurant) {
        return (`./restaurant.html?id=${restaurant.id}`);
    }

    /**
     * Restaurant image URL.
     */
    static imageUrlForRestaurant(restaurant) {
        if (restaurant.photograph) {
            return `/img/${restaurant.photograph}`;
        }
        return `/img/${restaurant.id}`;
    }

    /**
     * Map marker for a restaurant.
     */
    static mapMarkerForRestaurant(restaurant, map) {
        const marker = new google.maps.Marker({
            position: restaurant.latlng,
            title: restaurant.name,
            url: DBHelper.urlForRestaurant(restaurant),
            map: map,
            animation: google.maps.Animation.DROP
        }
        );
        return marker;
    }

    static changeFavState(restaurant, newfavState) {
        let url = `http://localhost:1337/restaurants/${restaurant.id}/?is_favorite=${newfavState}`;
        fetch(url, { method: 'PUT' });
    }

}
