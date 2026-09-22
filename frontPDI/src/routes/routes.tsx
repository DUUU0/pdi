import { BrowserRouter, Routes, Route } from "react-router-dom";
import Login from "../pages/Login/login";
import Dashboard from "../pages/Dashboard/dashboard";
import CadastroPessoa from "../pages/CadastroPessoa/CadastroPessoa";
import Monitoramento from "../pages/Monitoramento/Supervisao";
import Mapa from "../pages/Mapa/Mapa";

function RoutesApp() {
    return (
        <BrowserRouter>
            <Routes>
                <Route path="/" element={<Login />} />
            </Routes>

            <Routes>
                <Route path="/dashboard" element={<Dashboard />} />
            </Routes>

            <Routes>
                <Route path="/cadastro-pessoa" element={<CadastroPessoa />} />
            </Routes>

            <Routes>
                <Route path="/supervisao" element={<Monitoramento />} />
            </Routes>

            <Routes>
                <Route path="/mapa" element={<Mapa />} />
            </Routes>
        </BrowserRouter>
    );
}

export default RoutesApp;