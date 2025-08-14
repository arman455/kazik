export type CellType = "cash" | "zero" | "x2" | "bomb";

export type CellData =
    | { type: "cash"; value: number; revealed: boolean }
    | { type: "zero"; revealed: boolean }
    | { type: "x2"; revealed: boolean }
    | { type: "bomb"; revealed: boolean };

export type Cell = {
    type: string;
    value?: number;
    isOpen: boolean;
};