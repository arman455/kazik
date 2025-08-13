import { useState } from "react";
import { motion } from "framer-motion";
import "./MainPage.css";
import { CellData } from "./type";

export function MainPage() {
    const [cells, setCells] = useState<CellData[]>(() => generateGrid());
    const [balance, setBalance] = useState(0);
    const [multiplier, setMultiplier] = useState(1);
    const [gameOver, setGameOver] = useState(false);

    function generateGrid(): CellData[] {
        const cashCells: CellData[] = Array.from({ length: 5 }, () => ({
            type: "cash",
            value: Math.floor(Math.random() * 50 + 10) * 10,
            revealed: false,
        }));
        const otherCells: CellData[] = [
            { type: "zero", revealed: false },
            { type: "zero", revealed: false },
            { type: "x2", revealed: false },
            { type: "bomb", revealed: false },
        ];
        const all = [...cashCells, ...otherCells];
        return shuffle(all);
    }

    function shuffle<T>(array: T[]): T[] {
        return array
            .map((item) => ({ item, sort: Math.random() }))
            .sort((a, b) => a.sort - b.sort)
            .map(({ item }) => item);
    }

    function revealCell(index: number) {
        if (cells[index].revealed || gameOver) return;
        const updated = [...cells];
        updated[index].revealed = true;

        const cell = updated[index];
        if (cell.type === "cash") {
            setBalance((prev) => prev + cell.value * multiplier);
        } else if (cell.type === "x2") {
            setMultiplier((prev) => prev * 2);
            setBalance((prev) => prev * 2);
        } else if (cell.type === "bomb") {
            setGameOver(true);
            updated.forEach((c) => (c.revealed = true));
        }

        setCells(updated);
    }

    return (
        <div className="main-container">
            <h1>Roll Craft</h1>

            <div className="balance">
                <img src="/static/image/money.png" alt="money" width={40} height={40} />
                {balance} {multiplier > 1 && <span>x{multiplier}</span>}
            </div>

            <div className="grid">
                {cells.map((cell, i) => (
                    <motion.div
                        key={i}
                        className="flip-card"
                        onClick={() => revealCell(i)}
                        animate={{ rotateY: cell.revealed ? 180 : 0 }}
                        transition={{ duration: 0.6 }}
                    >
                        <div className="flip-card-front">
                            <img src="/static/image/image.png" width={113} height={113} />
                        </div>

                        <div className="flip-card-back">
                            {cell.type === "cash" && `💰 ${cell.value}`}
                            {cell.type === "zero" && "0️⃣"}
                            {cell.type === "x2" && "✖️2"}
                            {cell.type === "bomb" && "💣"}
                        </div>
                    </motion.div>
                ))}
            </div>

            {gameOver && (
                <div className="modal">
                    <h2>💥 Game Over!</h2>
                    <p>Ти зібрав: ${balance}</p>
                    <button
                        onClick={() => {
                            setCells(generateGrid());
                            setBalance(0);
                            setMultiplier(1);
                            setGameOver(false);
                        }}
                    >
                        Зіграти ще
                    </button>
                </div>
            )}
        </div>
    );
}
