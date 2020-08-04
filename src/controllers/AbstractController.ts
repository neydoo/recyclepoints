import { NextFunction, Request, Response } from "express";
import { Get, Delete } from "@overnightjs/core";

export class AbstractController {
    protected repository: any;

    constructor(repository: any) {
        this.repository = repository;
    }

    @Get("")
    public async index(req: Request, res: Response): Promise<void> {
        try {
            const data = await this.repository.findAll();
            res.status(200).send({ success: true, data });
        } catch (error) {
            res.status(400).json({ success: false, error, message: error.message });
        }
    }

    @Delete("destroy/:id")
    public async destroy(req: Request, res: Response): Promise<void> {
        try {
            this.repository.forceDelete(req.params.id);
            res.status(200).send({ success: true, message: "record deleted successfull"});
        } catch (error) {
            res.status(400).json({ success: false, error, message: error.message });
        }

    }

    @Delete("delete/:id")
    public async delete(req: Request, res: Response): Promise<void> {
        try {
            this.repository.softDelete(req.params.id);
            res.status(200).send({ success: true, message: "record deleted successfull"});
        } catch (error) {
            res.status(400).json({ success: false, error, message: error.message });
        }

    }
}
