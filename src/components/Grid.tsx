import React, { useEffect, useState } from "react";
import {
  generateRowFromLetters,
  getGridRow,
  isGridRowWin,
  isValidKey,
} from "../utils/helpers";
import { GridData } from "../utils/types";
import GridRow from "./GridRow";

type GridProps = {
  hexOfDay: string;
  handleWin: (gridData: GridData) => void;
  handleLose: (gridData: GridData) => void;
  dayKey: string;
};

const Grid = ({ hexOfDay, handleWin, handleLose, dayKey }: GridProps) => {
  const [gridData, setGridData] = useState<GridData>(() => {
    const saved = localStorage.getItem(dayKey);
    return saved ? JSON.parse(saved) : [];
  });

  useEffect(() => {
    localStorage.setItem(dayKey, JSON.stringify(gridData));
  }, [gridData, dayKey]);

  const [currentRowLetters, setCurrentRowLetters] = useState<string[]>([]);
  const currentRowIndex = gridData.length;

  const handleKeyDownString = (key: string) => {
    const appendLetter = (newLetter: string) => {
      if (currentRowLetters.length >= 6) return;
      setCurrentRowLetters([...currentRowLetters, newLetter.toUpperCase()]);
    };

    const onBackspace = () => {
      if (currentRowLetters.length === 0) return;
      setCurrentRowLetters(currentRowLetters.slice(0, -1));
    };

    const onEnter = (submittedLetters: string[]) => {
      if (submittedLetters.length !== 6) return;
      const gridDataCopy = JSON.parse(JSON.stringify(gridData));
      const newGridRow = getGridRow(
        submittedLetters,
        hexOfDay.split(""),
        currentRowIndex
      );

      // Invalid hex code, do not do anything.
      if (!newGridRow) return;

      const newGridData: GridData = [...gridDataCopy, newGridRow];
      setGridData(newGridData);
      setCurrentRowLetters([]);

      if (isGridRowWin(newGridRow)) {
        handleWin(gridData);
      } else if (currentRowIndex >= 5) {
        handleLose(gridData);
      }
    };

    if (!isValidKey(key)) return;

    // Handle submit
    if (key === "Enter") {
      onEnter(currentRowLetters);
    } else if (key === "Backspace" || key === "Delete") {
      onBackspace();
    } else {
      appendLetter(key);
    }
  };

  useEffect(() => {
    const handleKeyDown = (e: any) => {
      handleKeyDownString(e.key);
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [currentRowLetters]);

  useEffect(() => {
    if (gridData[0] && isGridRowWin(gridData[gridData.length - 1])) {
      handleWin(gridData);
    } else if (currentRowIndex >= 5) {
      handleLose(gridData);
    }
  }, [])

  const keys = [
    ["A", "B", "C", "D", "E", "F"],
    ["0", "1", "2", "3", "4", "5"],
    ["Delete", "6", "7", "8", "9", "Enter"],
  ];

  const letterCells = keys.map((letterRow: string[], row: number) => {
    return (
      <div className="letter-row">
        {letterRow.map((letter: string, col: number) => (
          <div
            className="item letter"
            id={`${letter}Color`}
            onClick={() => handleKeyDownString(letter)}
          >
            <span className="letterText">{letter}</span>
          </div>
        ))}
      </div>
    );
  });

  return (
    <>
      <div className="letter-row-container">
        {Array(6)
          .fill("")
          .map((_, rowIndex: number) => {
            if (rowIndex < currentRowIndex) {
              return (
                <GridRow tiles={gridData[rowIndex]} key={rowIndex}></GridRow>
              );
            }
            const letters = rowIndex > currentRowIndex ? [] : currentRowLetters;
            return (
              <GridRow
                tiles={generateRowFromLetters(letters, rowIndex)}
                key={rowIndex}
              />
            );
          })}
      </div>
      <br />
      <div className="letter-row-container">{letterCells}</div>
    </>
  );
};

export default Grid;
