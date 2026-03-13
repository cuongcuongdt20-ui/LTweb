import {Routes, Route, Navigate} from 'react-router-dom'; 
import Login from './pages/Login';
import Register from './pages/Register';
import Layout from './components/Layout'; 
import Dashboard from './pages/Dashboard';
function App(){
  return (
    <Routes> 
      <Route path="/register" element={<Register />} />
      <Route path="/login" element={<Login />} />
      <Route element ={<Layout />}>
        <Route path="/" element = {<Dashboard /> } />
        
      </Route>
    </Routes>
  )
}
export default App;