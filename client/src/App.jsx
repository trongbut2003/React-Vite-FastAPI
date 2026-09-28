import { useState, useEffect } from 'react'
import axios from 'axios';
import "./App.css";
import { Routes, Route, useLocation  } from "react-router-dom";
import SideMenu from "./Component/sideMenu/sideMenu";
import UserMenu from "./Component/userMenu/userMenu";
import Dashboard from "./pages/Dashboard";
import Chart from "./pages/Chart";
import Report from './pages/Report';
import Home from "./pages/Home";
import Inv from "./pages/Inv";
import Socket from './pages/SocketTest+MoveArrow';
import { useNavigation } from './Component/NavigationContext';
import PageLoader from './Component/PageLoader';
import Models from './pages/Model';
import MonitorDashBoard from './pages/DashBoard/MonitorDashBoard';


function App() {

    const location = useLocation();
    const { loading } = useNavigation();


  return (
  <div className="container">
    <span><SideMenu /></span>
    <Routes location={location}>

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
            element={<MonitorDashBoard />}
        />

        <Route
            path="/sword"
            element={<MonitorDashBoard />}
        />

        <Route
            path="/chart"
            element={<Chart />}
        />

        <Route
            path="/report"
            element={<Report />}
        />

    </Routes>

    <PageLoader loading={loading} />

  </div>
  )
}

export default App
