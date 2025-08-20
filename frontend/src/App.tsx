import { Routes, Route } from "react-router";
import Home from "./pages/home";
import Login from "./pages/login";


const App = () => {
  return <Routes>
    <Route path="/">
    <Route index element={<Home/>}></Route>
    <Route path="/auth" element = {<Login/>}></Route>
    </Route>
  </Routes>
}

export default App;