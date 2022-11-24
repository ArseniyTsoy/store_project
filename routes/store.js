import express from "express";
import storeController from "../controllers/store.js";

const router = express.Router();

router.get("/about", storeController.getAbout);

router.get("/catalog", storeController.getCatalog);

router.get("/category", storeController.getCategory);

router.get("/contacts", storeController.getContacts);

router.get("/search", storeController.getSearch);

router.get("/show-product/:id", storeController.getSingleProduct);

router.get("/", storeController.getIndex);

export default router;