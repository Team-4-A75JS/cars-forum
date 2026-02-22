import { BrowserRouter, Routes, Route } from 'react-router-dom';

import Home from './pages/home/Home.jsx';
import Login from './pages/login/login.jsx';
import Register from './pages/register/register.jsx';
import Layout from './components/Layout/layout.jsx';
import PostDetails from './pages/postDetails/postDetails.jsx';
import CreatePost from './pages/create/CreatePost.jsx';

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
        </Routes>
      </Layout>
    </BrowserRouter>
  );
}

export default App;

