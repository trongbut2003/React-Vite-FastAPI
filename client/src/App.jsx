import { useState, useEffect } from 'react'
import axios from 'axios';
import "./App.css";
import { Routes, Route, useLocation  } from "react-router-dom";
import SideMenu from "./Component/sideMenu/sideMenu";
import UserMenu from "./Component/userMenu/userMenu";
import Dashboard from "./pages/Dashboard";
import Setting from "./pages/Settings";
import Chart from "./pages/Chart";
import Report from './pages/Report';
import Home from "./pages/Home";
import Inv from "./pages/Inv";
import Socket from './pages/SocketTest+MoveArrow';
import { useNavigation } from './Component/NavigationContext';
import PageLoader from './Component/PageLoader';
import Models from './pages/Model';
import Sword from './pages/Sword';


function App() {

    const location = useLocation();
    const { loading } = useNavigation();


  return (
  <div className="container">
    <div className="item header" style={{ visibility: loading ? "hidden" : "visible"}}>
      <span><SideMenu /></span>
    </div>
    <Routes location={location} style={{ visibility: loading ? "hidden" : "visible"}}>

        <Route
            path="/"
            element={<Home />}
        />

        <Route
            path="/home"
            element={<Home />}
        />

        <Route
            path="/home/inv1"
            element={<Inv number = {1} />}
        />

        <Route
            path="/home/inv2"
            element={<Inv number = {2} />}
        />

        <Route
            path="/home/inv3"
            element={<Inv number = {3} />}
        />

        <Route
            path="/home/inv4"
            element={<Inv number = {4} />}
        />

        <Route
            path="/dashboard"
            element={<Models />}
        />

        <Route
            path="/chart"
            element={<Chart />}
        />

        <Route
            path="/sword"
            element={<Sword />}
        />

        <Route
            path="/report"
            element={<Report />}
        />

    </Routes>

    <PageLoader loading={loading} />

    <div className="item footer" style={{ visibility: loading ? "hidden" : "visible"}}>
        <div>@test-web</div>
    </div>

  </div>
  )
}

export default App
