import express from 'express';
import * as dotenv from 'dotenv';
import connectDataBase from './config/db';
import userRouter from './routes/userRoutes';
import projectRouter from './routes/projectRoutes';
import taskRouter from './routes/taskRoutes';
import cors from 'cors';
import {Server} from 'socket.io';

const app = express();
app.use(express.json());
dotenv.config();
connectDataBase();

// CORS
const whiteList = [process.env.FRONTEND_URL];

const corsOptions: cors.CorsOptions = {
  origin: (origin, callback) => {
    if (whiteList.includes(origin ?? '')) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
};
app.use(cors(corsOptions));

// import routes
app.use('/api/v1/users', userRouter);
app.use('/api/v1/projects', projectRouter);
app.use('/api/v1/tasks', taskRouter);

const PORT = process.env.PORT || 3000;
const server = app.listen(PORT, () => {
  console.log(`Server started on port http://localhost:${PORT}`);
});

const io = new Server(server, {
  cors: {
    origin: process.env.FRONTEND_URL,
  },
});

io.on('connection', socket => {
  socket.on('open project', project => {
    socket.join(project);
  });

  socket.on('addedTask', task => {
    socket.to(task.project).emit('addedTask', task);
  });

  socket.on('deletedTask', task => {
    socket.to(task.project).emit('deletedTask', task);
  });

  socket.on('updatedTask', task => {
    socket.to(task.project._id).emit('updatedTask', task);
  });

  socket.on('completedTask', task => {
    socket.to(task.project._id).emit('completedTask', task);
  });
});
