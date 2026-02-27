import { BrowserRouter, Routes, Route } from 'react-router-dom';

import Home from './pages/home/home.jsx';
import Login from './pages/login/login.jsx';
import Register from './pages/register/register.jsx';
import Layout from './components/Layout/layout.jsx';
import PostDetails from './pages/postDetails/postDetails.jsx';
import CreatePost from './pages/create/CreatePost.jsx';
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

