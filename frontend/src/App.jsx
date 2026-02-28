import { BrowserRouter, Routes, Route } from 'react-router-dom';

import Home from './pages/Home/Home.jsx';
import Login from './pages/Login/Login.jsx';
import Register from './pages/Register/Register.jsx';
import Layout from './components/Layout/Layout.jsx';
import PostDetails from './pages/PostDetails/PostDetails.jsx';
import CreatePost from './pages/Create/CreatePost.jsx';
import EditPost from './pages/EditPost/EditPost.jsx';

function App() {
  return (
    <BrowserRouter>
      <Layout>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/posts/:postId" element={<PostDetails />} />
          <Route path="/create" element={<CreatePost />} />
          <Route path="/edit/:postId" element={<EditPost />} />
        </Routes>
      </Layout>
    </BrowserRouter>
  );
}

export default App;

