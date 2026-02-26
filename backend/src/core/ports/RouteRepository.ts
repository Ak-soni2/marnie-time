import type { Route } from "../domain/entities/Route.js";

export interface RouteRepository {
    findAll(): Promise<Route[]>;
    findBaseline(): Promise<Route | null>;
    setBaseline(route_id: string): Promise<void>;
}