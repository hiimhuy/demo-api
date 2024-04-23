const express = require("express");
const cors = require("cors");
const crypto = require("crypto");
const cookieParse = require("cookie-parser");
const { base64url } = require("./helper");
const jwt = require("jsonwebtoken");

const app = express();
const port = 3001;
const jwtSecret =
  "9232a817f7fef0d0fdadd31464291eb298da1e9f90271d00642cef283caacead";

app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
  })
);
app.use(cookieParse());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const sessions = {};

const db = {
  users: [
    {
      id: 1,
      email: "hoangconghuy@gmail.com",
      password: "1",
      name: "Hoang Cong Huy",
    },
    {
      id: 2,
      email: "huyhihi@gmail.com",
      password: "1",
      name: "Huyhihi",
    },

  ],
  posts: [
    {
      id: 1,
      title: "Title 1",
      description: "Description 1",
    },
    {
      id: 2,
      title: "Title 2",
      description: "Description 2",
    },
    {
      id: 3,
      title: "Title 3",
      description: "Description 3",
    },
  ],
};

app.use("/api/auth/login", (req, res) => {
  const { email, password } = req.body;
  const user = db.users.find(
    (user) => user.email === email && user.password === password
  );
  if (!user) {
    return res.status(401).json({ message: "Invalid email or password" });
  }
  const accessToken = jwt.sign(
    { email: user.email, name: user.name, id: user.id },
    jwtSecret,
    {
      expiresIn: "5m",
    }
  );

  const refreshToken = jwt.sign({ email: user.email, name: user.name, id: user.id }, jwtSecret, {
    expiresIn: "1d",
  });

  sessions[email] = refreshToken;

  res.json({ accessToken, refreshToken });
});

app.use("/api/auth/me", (req, res) => {
  const accessToken = req.headers.authorization?.slice(7);
  // console.log(accessToken)
  if (!accessToken) {
    return res.status(401).json({
      message: "unauthorized",
    });
  }
  try {
    const user = jwt.verify(accessToken, jwtSecret);

    if (!user) {
      return res.status(401).json({
        message: "unauthorized",
      });
    }
    res.json(user);
  } catch (error) {
    return res.status(401).json({
      message: "unauthorized",
    });
  }
  // console.log(user)

  // res.json(user);
});

app.use("/api/auth/refresh", (req, res) => {
  const refreshToken = req.body.refreshToken;

  // console.log('re',refreshToken);

  const accessToken = jwt.verify(refreshToken, jwtSecret, (err, user) => {
    if (err) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    console.log(user)

    const newAccessToken = jwt.sign({ user }, jwtSecret, {
      expiresIn: "10m",
    });
    //  return res.json({ newAccessToken });
    return newAccessToken;
  });
  // accessToken()
  console.log(accessToken);
  res.json({ accessToken });
});

app.listen(port, () => {
  console.log(`Demo app is running on port ${port}`);
});
