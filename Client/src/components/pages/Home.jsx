import React from "react";
import { Button } from "../ui/button";
import { useNavigate } from "react-router-dom";

function Home() {
  const navigate = useNavigate();
  return (
    <div className=" flex flex-col gap-10">
      <p className="text-center text-2xl font-bold mt-20">
        Student Record Management System
      </p>
      <Button onClick={() => navigate("/auth")} className={"mt-5 mx-auto"}>
        Get Started
      </Button>
    </div>
  );
}

export default Home;
