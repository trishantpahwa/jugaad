"use client";
import { use, useState } from "react";
// import prisma from "../lib/prisma";
import { useSamepleStore } from "../store";

const Home = () => {
  const { sample, addSample } = useSamepleStore();
  const [count, setCount] = useState(0);
  return (
    <main>
      <h1>Jugaad</h1>
      <button onClick={() => {
        setCount((_) => _ + 1);
        addSample({ [count]: "hello" })
        { JSON.stringify(sample) }
      }}>Add {count}</button>
    </main >
  )
};

export default Home;