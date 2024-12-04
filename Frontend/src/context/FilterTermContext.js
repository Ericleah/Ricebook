// context/FilterTermContext.js
import { createContext, useState } from "react";

export const FilterTermContext = createContext({
  filterTerm: "",
  setFilterTerm: () => {},
});

export const FilterTermProvider = ({ children }) => {
  const [filterTerm, setFilterTerm] = useState("");

  return (
    <FilterTermContext.Provider value={{ filterTerm, setFilterTerm }}>
      {children}
    </FilterTermContext.Provider>
  );
};