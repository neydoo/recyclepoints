import { AbstractRepository } from "./AbstractRepository";
import { requestSchema } from '../models/Request';

export class RequestRepository extends AbstractRepository {

    constructor() {
        super("Request");
    }
}