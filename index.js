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

async function run() {
	try {
		await client.connect();
		const db = client.db("pet-haven");
		const petsCollection = db.collection("pets");

		app.post("/pet", async (req, res) => {
			const petData = req.body;
			const result = await petsCollection.insertOne(petData);
			res.json(result);
		});

		app.get("/pet", async (req, res) => {
			const result = await petsCollection.find().toArray();
			res.json(result);
		});

		app.get("/pet/:id", async (req, res) => {
			const { id } = req.params;

			const result = await petsCollection.findOne({
				_id: new ObjectId(id),
			});
			res.json(result);
		});

		app.delete("/pet/:id", async (req, res) => {
			const { id } = req.params;

			const result = await petsCollection.deleteOne({
				_id: new ObjectId(id),
			});

			res.json(result);
		});

		await client.db("admin").command({ ping: 1 });
		console.log(
			"Pinged your deployment. You successfully connected to MongoDB!",
		);
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
