import { AbstractRepository } from "./AbstractRepository";
import { reviewSchema } from '../models/Review';


export class ReviewRepository extends AbstractRepository {

    constructor() {
        super("Review");
    }
}