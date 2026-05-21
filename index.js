const express = require("express");
const app = express();
const cors = require("cors");
const dotenv = require("dotenv");
dotenv.config();

app.use(cors());
app.use(express.json());

const port = process.env.PORT;
const uri = process.env.MONGODB_URI;

const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const dns = require("node:dns");
dns.setServers(["8.8.8.8", "8.8.4.4"]);

const client = new MongoClient(uri, {
	serverApi: {
		version: ServerApiVersion.v1,
		strict: true,
		deprecationErrors: true,
	},
});

const { createRemoteJWKSet, jwtVerify } = require("jose-cjs");

const JWKS = createRemoteJWKSet(
	new URL(`${process.env.CLIENT_SIDE_URL}/api/auth/jwks`),
);

const verifyToken = async (req, res, next) => {
	const authHeader = req?.headers.authorization;

	if (!authHeader) {
		return res.status(401).json({ message: "Unauthorized" });
	}

	const token = authHeader.split(" ")[1];

	if (!token) {
		return res.status(401).json({ message: "Unauthorized" });
	}

	try {
		const { payload } = await jwtVerify(token, JWKS);
		next();
	} catch (error) {
		return res.status(403).json({ message: "Forbidden" });
	}
};

async function run() {
	try {
		// await client.connect();
		const db = client.db("pet-haven");
		const petsCollection = db.collection("pets");
		const adoptionRequestsCollection = db.collection("adoptionRequests");

		/* Adoption Requests Collection */
		// Create New Adoption Request
		app.post("/adoption", verifyToken, async (req, res) => {
			const adoptionRequestData = req.body;
			const result =
				await adoptionRequestsCollection.insertOne(adoptionRequestData);
			res.json(result);
		});

		// Get Particular User Adoption Requests
		app.get("/adoption/:userId", verifyToken, async (req, res) => {
			const { userId } = req.params;
			const result = await adoptionRequestsCollection
				.find({
					userId: userId,
				})
				.toArray();
			res.json(result);
		});

		// Get Particular User Pets Data by petId
		app.get(
			"/my-pet-adoption-requests/:petId",
			verifyToken,
			async (req, res) => {
				const { petId } = req.params;
				const result = await adoptionRequestsCollection
					.find({
						petId: petId,
					})
					.toArray();
				res.json(result);
			},
		);

		// Delete Particular User Adoption Request
		app.delete("/delete-adoption/:id", verifyToken, async (req, res) => {
			const { id } = req.params;
			const result = await adoptionRequestsCollection.deleteOne({
				_id: new ObjectId(id),
			});

			res.json(result);
		});

		// Update Adoption Status
		app.patch(
			"/update-status/:requestId",
			verifyToken,
			async (req, res) => {
				const { requestId } = req.params;
				const updatedStatus = req.body;
				const result = await adoptionRequestsCollection.updateOne(
					{
						_id: new ObjectId(requestId),
					},
					{
						$set: updatedStatus,
					},
				);

				res.json(result);
			},
		);

		// Update Adoption Request Count +1
		app.patch(
			"/adoption-request-count/:id",
			verifyToken,
			async (req, res) => {
				const { id } = req.params;

				const result = await petsCollection.updateOne(
					{
						_id: new ObjectId(id),
					},
					{ $inc: { adoptionRequest: 1 } },
				);

				res.json(result);
			},
		);

		/* Pets Collection */
		// Add New pet
		app.post("/pet", verifyToken, async (req, res) => {
			const petData = req.body;
			const result = await petsCollection.insertOne(petData);
			res.json(result);
		});

		// Get Particular User Pets
		app.get("/mypets/:userId", verifyToken, async (req, res) => {
			const { userId } = req.params;
			const result = await petsCollection
				.find({
					userId: userId,
				})
				.toArray();
			res.json(result);
		});

		// Get All Pets - Also Can Searching and Filtering
		app.get("/pet", async (req, res) => {
			const { search, category } = req.query;
			let query = {};

			// Search by pet name
			if (search) {
				query.petName = {
					$regex: search,
					$options: "i",
				};
			}

			// Filter by category
			if (category) {
				query.species = category;
			}

			const result = await petsCollection.find(query).toArray();

			res.json(result);
		});

		// Get Single pet
		app.get("/pet/:id", verifyToken, async (req, res) => {
			const { id } = req.params;

			const result = await petsCollection.findOne({
				_id: new ObjectId(id),
			});
			res.json(result);
		});

		// Update Single Pet
		app.patch("/pet/:id", verifyToken, async (req, res) => {
			const { id } = req.params;
			const updatedPetData = req.body;

			const result = await petsCollection.updateOne(
				{
					_id: new ObjectId(id),
				},
				{ $set: updatedPetData },
			);

			res.json(result);
		});

		// Delete Single Pet
		app.delete("/pet/:id", verifyToken, async (req, res) => {
			const { id } = req.params;

			const result = await petsCollection.deleteOne({
				_id: new ObjectId(id),
			});

			res.json(result);
		});

		// await client.db("admin").command({ ping: 1 });
		// console.log(
		// 	"Pinged your deployment. You successfully connected to MongoDB!",
		// );
	} finally {
		// await client.close();
	}
}
run().catch(console.dir);

app.get("/", (req, res) => {
	res.json("Server is running!");
});

app.listen(port, () => {
	console.log(`Server running at ${port} port`);
});
