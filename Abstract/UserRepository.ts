import { AbstractRepository } from "./AbstractRepository";
import { userSchema } from '../models/User';

export class UserRepository extends AbstractRepository {

    constructor() {
        super("User");
    }
}
