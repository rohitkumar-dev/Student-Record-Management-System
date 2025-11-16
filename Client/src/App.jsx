import { useState } from "react";
import "./App.css";
import { Outlet } from "react-router-dom";
import Header from "./components/Header";
import Footer from "./components/Footer";

function App() {
  return (
    <div className="bg-gray-300 min-h-dvh">
      <Header />
      <main className="pt-10 mx-4">
        <Outlet />
      </main>
      {/* <Footer /> */}
    </div>
  );
}

export default App;
