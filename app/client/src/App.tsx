import { RouterProvider } from 'react-router-dom'
import { router } from "./routes"
import { Toaster } from "./components/Toaster"
import './styles/index.css'


function App() {
  return (
    <>
      <RouterProvider router={router} />
      <Toaster />
    </>
  )
}

export default App