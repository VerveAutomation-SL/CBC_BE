import express from "express";
import { addReview, delReview, listReviews, updateReview } from "../controllers/reviewController.js";


const reviewRouter = express.Router(); 

reviewRouter.post("/", addReview)

reviewRouter.get("/", listReviews)

reviewRouter.post("/update", updateReview)

reviewRouter.delete("/delete/:id", delReview);

export default reviewRouter;