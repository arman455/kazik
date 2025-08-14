import { useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { CellData } from "./type";
import "./MainPage.css";

export function MainPage() {
    const [cells, setCells] = useState<CellData[]>(() => generateGrid());
    const [balance, setBalance] = useState(0);
    const [multiplier, setMultiplier] = useState(1);
    const [gameOver, setGameOver] = useState(false);
    const [bomb, setBomb] = useState(false);
    const [isMoneyAnimating, setIsMoneyAnimating] = useState(false);
    const [flyingMoney, setFlyingMoney] = useState<Array<{
        id: number;
        startX: number;
        startY: number;
        endX: number;
        endY: number;
    }>>([]);

    const balanceRef = useRef<HTMLDivElement>(null);

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
            setIsMoneyAnimating(true);
            const cellElement = document.querySelectorAll(".cell")[index] as HTMLElement;
            const cellRect = cellElement.getBoundingClientRect();
            const balanceRect = balanceRef.current?.getBoundingClientRect();

            if (balanceRect) {
                const moneyCount = 15;
                let totalAdded = 0;

                const addMoneyWithDelay = (i: number) => {
                    setTimeout(() => {
                        const offsetX = (Math.random() - 0.5) * 60;
                        const offsetY = (Math.random() - 0.5) * 120;

                        const newMoney = {
                            id: Date.now() + i,
                            startX: cellRect.left + cellRect.width / 2 + offsetX,
                            startY: cellRect.top + cellRect.height / 2 + offsetY,
                            endX: balanceRect.left + balanceRect.width / 2 + offsetX * 0.2,
                            endY: balanceRect.top + balanceRect.height / 2 + offsetY * 0.1,
                        };

                        setFlyingMoney((prev) => [...prev, newMoney]);
                        totalAdded++;

                        if (totalAdded === moneyCount) {
                            setTimeout(() => {
                                setIsMoneyAnimating(false);
                                setBalance((prev) => prev + cell.value * multiplier);
                            }, 1000);
                        }
                    }, i * 100);
                };

                for (let i = 0; i < moneyCount; i++) {
                    addMoneyWithDelay(i);
                }
            }
        } else if (cell.type === "x2") {
            setMultiplier((prev) => prev * 2);
            setBalance((prev) => prev * 2);
        } else if (cell.type === "bomb") {
            setGameOver(true);
            setBomb(true);
            updated.forEach((c) => (c.revealed = true));
        }

        setCells(updated);
    }

    function getCardBackground(type: string) {
        switch (type) {
            case "cash": return "/static/image/Cash.png";
            case "zero": return "/static/image/zero.png";
            case "x2": return "/static/image/x2.png";
            case "bomb": return "/static/image/bomb.png";
            default: return "";
        }
    }

    function revealAllAndEndGame(
        cells: CellData[],
        setCells: (cells: CellData[]) => void,
        setGameOver: (value: boolean) => void
    ) {
        const hasRevealed = cells.some(cell => cell.revealed);
        if (hasRevealed) {
            const allRevealed = cells.map(cell => ({ ...cell, revealed: true }));
            setCells(allRevealed);
            setGameOver(true);
            setBomb(false);
        }
    }

    return (
        <div className="main-container">
            <h1 style={{ fontSize: "48px", color: "white" }}>Roll Craft</h1>

            <div className="balance" ref={balanceRef}>
                <AnimatePresence>
                    {flyingMoney.map((m) => (
                        <motion.img
                            key={m.id}
                            src="/static/image/money.png"
                            className="flying-money"
                            initial={{
                                position: "fixed",
                                left: m.startX,
                                top: m.startY,
                                scale: 1,
                                opacity: 1,
                                x: "-50%",
                                y: "-50%"
                            }}
                            animate={{
                                left: m.endX,
                                top: m.endY,
                                scale: 0.5,
                                opacity: 0,
                                x: "-50%",
                                y: "-50%"
                            }}
                            exit={{ opacity: 0 }}
                            transition={{
                                duration: 0.8,
                                ease: [0.2, 0.8, 0.8, 1]
                            }}
                            onAnimationComplete={() => {
                                setFlyingMoney(prev => prev.filter(money => money.id !== m.id));
                            }}
                        />
                    ))}
                </AnimatePresence>
                <img src="/static/image/money.png" alt="money" width={40} height={40} />
                <p className={`balance-text ${isMoneyAnimating ? "balance-animated" : "balance-text-1"}`}>
                    {balance}
                </p>
            </div>

            <div className="grid">
                {cells.map((cell, i) => (
                    <div key={i} onClick={() => revealCell(i)} className="cell">
                        <AnimatePresence>
                            {!cell.revealed && (
                                <motion.img
                                    src="/static/image/image.png"
                                    alt="back"
                                    style={{
                                        width: "var(--cell-size)",
                                        height: "var(--cell-size)"
                                    }}
                                    initial={{ rotateY: 0 }}
                                    animate={{ rotateY: cell.revealed ? 90 : 0 }}
                                    transition={{ duration: 0.4 }}
                                />
                            )}

                            {cell.revealed && (
                                <motion.div
                                    className="card-front"
                                    style={{
                                        backgroundImage: `url(${getCardBackground(cell.type)})`,
                                        backgroundSize: "cover",
                                        width: "var(--cell-size)",
                                        height: "var(--cell-size)",
                                        display: "flex",
                                        alignItems: "center",
                                        justifyContent: "center",
                                        fontSize: "20px"
                                    }}
                                    initial={{ rotateY: 90, opacity: 0 }}
                                    animate={{ rotateY: 0, opacity: 1 }}
                                    exit={{ opacity: 0 }}
                                    transition={{ duration: 0.4 }}
                                >
                                    <p style={{ paddingTop: "70px", color: "white" }}>
                                        {cell.type === "cash" && `${cell.value}`}
                                    </p>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                ))}
            </div>

            <button className="button" onClick={() => revealAllAndEndGame(cells, setCells, setGameOver)}>Claim</button>

            {gameOver && (
                <div className="modal">
                    {bomb
                        ? <h2 className="header-text" id="gameover">Danger ahead!</h2>
                        : <h2 className="header-text" id="gamevictory">Game Over!</h2>}
                    {bomb
                        ? <p className="text">You're on a Bomb Square! You hit a bomb and lose all rewards from this field...</p>
                        : <p className="text">You've reached the end of this run...</p>}
                    {bomb
                        ? <img src="/static/image/bomb.png" alt="" />
                        : <img src="/static/image/stop.png" alt="" />}
                    <div>
                        <img src="/static/image/money.png" width={48} height={48} />
                        <p className="text-balanc">${balance}</p>
                    </div>
                    {bomb
                        ? <p className="text">...or defuse it and save your run!</p>
                        : <p className="text">...claim and return to the main board</p>}
                    <button
                        onClick={() => {
                            setCells(generateGrid());
                            setBalance(0);
                            setMultiplier(1);
                            setGameOver(false);
                            setFlyingMoney([]);
                        }}
                        className="button"
                    >
                        Claim
                    </button>
                </div>
            )}
        </div>
    );
}
