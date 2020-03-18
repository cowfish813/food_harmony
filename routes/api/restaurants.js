const express = require("express");
const router = express.Router();
const jwt = require("jsonwebtoken");
const mongoose = require("mongoose");
const passport = require("passport");

const Restaurant = require("../../models/Restaurants");
const validateRestaurantInput = require("../../validation/restaurants");

router.get("/test", (req, res) => res.json({ msg: "successful test" }));

//gets the restaurants near the location.

router.get("/location", async (req, res) => {
	const geoOptions = {
		distanceField: "distance.calculated",
		spherical: true,
		maxDistance: 20000,
		key: "location.coordinates"  

	};

	const loc = req.body.location;
	try {
		const restaurants = await Restaurant.aggregate([
			{
				$geoNear: {
					near: loc,
					...geoOptions,
				},
			},
		]);
		res.status(200).json(restaurants);
	} catch(error) {
		res.status(404).json(error);
	}
});

// posting new restaurant
router.post(
	"/",
	//passport.authenticate("jwt", { session: false }),

	(req, res) => {
		const { errors, isValid } = validateRestaurantInput(req.body);
		if (!isValid) {
			return res.status(400).json(errors);
		}

		const newRestaurant = new Restaurant({
			name: req.body.name,
			food: req.body.food, //should we keep this here? or expand on it with empty strings?
			priceRange: req.body.priceRange,
			location: req.body.location,
			// photoUrl: req.body.food.photoUrl,
			// description: req.body.food.description,
			// restaurantId: req.body.food.restaurantId,
			// price: req.body.food.price,
			// priceRange: req.body.priceRange
			// add these qualities in some kind of update function...
		});

		newRestaurant.save().then(restaurant => res.json(restaurant));
	}
);

// posting photos w/ restaurant ID
router.patch(
	"/:restaurantId",
	passport.authenticate("jwt", { session: false }),
	(req, res) => {
		Restaurant.findById(req.params.restaurantId, (err, restaurant) => {});
	}
);

module.exports = router;