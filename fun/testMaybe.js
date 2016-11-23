/*
 * testMaybe.js
 */

var response1 = {
    'location': {
        'country': 'USA',
        'city': {
            'name': 'Boston',
            'coordinates': {
                'latitude': 1234,
                'longitude': 2345
            }
        }
    }
};

var badResponse = {
    'location': {
        'country': 'USA',
        'city': {
            'name': 'Boston',
            'coordinates': null
        }
    }
};

var emptyResponse = {
    'location': null
};

function getCoordinates(response) {
    return Maybe(response).bind(function(r) {
        return r.location;
    }).bind(function(r) {
        return r.city;
    }).bind(function(r) {
        return r.coordinates;
    }).maybe("Error: Coordinates cannot be null", function(r) {
        return [r.latitude, r.longitude];
    });
}

print ("response1: ", getCoordinates(response1));
print ("badResponse: ", getCoordinates(badResponse));
print ("emptyResponse: ", getCoordinates(emptyResponse));
