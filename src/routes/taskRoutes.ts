import express from 'express';
import {
  addTask,
  getTask,
  updateTask,
  deleteTask,
  completeTask,
} from '../controllers/taskController';
import checkAuth from '../middlware/checkAuth';

const taskRouter = express.Router();

taskRouter.post('/', checkAuth, addTask);
taskRouter
  .route('/:id')
  .get(checkAuth, getTask)
  .put(checkAuth, updateTask)
  .delete(checkAuth, deleteTask);
taskRouter.route('/:id/complete').post(checkAuth, completeTask);

export default taskRouter;
