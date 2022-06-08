import {Request, Response} from 'express';
import mongoose from 'mongoose';
import Project from '../models/Project';
import Task from '../models/Task';

const addTask = async (req: Request, res: Response) => {
  if (!req.user) return res.status(401).json({msg: 'Unauthorized'});

  const {project} = req.body;
  if (!mongoose.Types.ObjectId.isValid(project))
    return res.status(400).json({msg: 'Project not found'});
  const foundProject = await Project.findById(project);

  if (!foundProject) return res.status(404).json({msg: 'Project not found'});
  if (foundProject.owner.toString() !== req.user._id.toString())
    return res.status(401).json({msg: 'Not authorized'});
  const task = new Task(req.body);
  try {
    const storedTask = await task.save();
    foundProject.tasks.push(storedTask);
    await foundProject.save();
    res.status(201).json({msg: 'Task created', storedTask});
  } catch (error) {
    res.status(400).send(error);
  }
};

const getTask = async (req: Request, res: Response) => {
  const {id} = req.params;
  if (!mongoose.Types.ObjectId.isValid(id)) return res.status(400).json({msg: 'Task not found'});
  if (!req.user) return res.status(401).json({msg: 'Unauthorized'});

  const task = await Task.findById(id).populate('project');
  if (!task) return res.status(404).json({msg: 'Task not found'});
  if (task.project.owner.toString() === req.user._id.toString()) return res.status(200).json(task);

  return res.status(404).json({msg: 'Not authorized'});
};

const updateTask = async (req: Request, res: Response) => {
  const {id} = req.params;
  if (!mongoose.Types.ObjectId.isValid(id)) return res.status(400).json({msg: 'Task not found'});
  if (!req.user) return res.status(401).json({msg: 'Unauthorized'});

  const task = await Task.findById(id).populate('project');
  if (!task) return res.status(404).json({msg: 'Task not found'});
  if (task.project.owner.toString() !== req.user._id.toString())
    return res.status(404).json({msg: 'Not authorized'});

  task.name = req.body.name || task.name;
  task.description = req.body.description || task.description;
  task.priority = req.body.priority || task.priority;
  task.deadline = req.body.deadline || task.deadline;

  try {
    const updatedTask = await task.save();
    res.status(200).json(updatedTask);
  } catch (error) {
    res.status(400).send(error);
  }
};

const deleteTask = async (req: Request, res: Response) => {
  const {id} = req.params;
  if (!mongoose.Types.ObjectId.isValid(id)) return res.status(400).json({msg: 'Task not found'});
  if (!req.user) return res.status(401).json({msg: 'Unauthorized'});

  const task = await Task.findById(id).populate('project');
  if (!task) return res.status(404).json({msg: 'Task not found'});
  if (task.project.owner.toString() !== req.user._id.toString())
    return res.status(404).json({msg: 'Not authorized'});
  const project = await Project.findById(task.project);
  if (project) {
    project.tasks = project.tasks.filter(task => task._id.toString() !== id);
    await project.save();
  }
  const deletedTask = await Task.findByIdAndDelete(id);
  if (deletedTask) return res.status(200).json({msg: 'Task deleted'});
};

const completeTask = async (req: Request, res: Response) => {
  if (!req.user) return res.status(401).json({msg: 'Unauthorized'});
  const {id} = req.params;
  const task = await Task.findById(id).populate('project');
  if (!task) return res.status(404).json({msg: 'Task not found'});
  if (
    task.project.owner.toString() !== req.user._id.toString() &&
    !task.project.collaborators.includes(req.user._id)
  ) {
    return res.status(404).json({msg: 'Not authorized'});
  }
  task.completed = !task.completed;
  task.completedBy = req.user._id;
  try {
    await task.save();
    const updatedTask = await Task.findById(id).populate('project').populate('completedBy');
    res.status(200).json(updatedTask);
  } catch (error) {
    res.status(400).send(error);
  }
};

export {addTask, getTask, updateTask, deleteTask, completeTask};
