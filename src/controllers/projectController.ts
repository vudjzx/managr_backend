import Project from '../models/Project';
import {Request, Response} from 'express';
import mongoose from 'mongoose';
import User from '../models/User';

const getProjects = async (req: Request, res: Response) => {
  if (req.user) {
    try {
      const projects = await Project.find({
        $or: [{owner: req.user.id}, {collaborators: req.user.id}],
      });
      res.status(200).json({msg: 'Projects retrieved', projects});
    } catch (error) {
      res.status(400).send(error);
    }
  } else {
    res.status(401).json({msg: 'Unauthorized'});
  }
};

const newProject = async (req: Request, res: Response) => {
  const project = new Project(req.body);
  if (req.user) {
    project.owner = req.user.id;
    try {
      const storedProject = await project.save();
      res.status(201).json({msg: 'Project created', storedProject});
    } catch (error) {
      res.status(400).send(error);
    }
  } else {
    res.status(401).json({msg: 'Unauthorized'});
  }
};

const getProject = async (req: Request, res: Response) => {
  if (req.user) {
    try {
      if (!mongoose.Types.ObjectId.isValid(req.params.id))
        return res.status(400).json({msg: 'Project not found'});
      const project = await Project.findById(req.params.id)
        .populate({path: 'tasks', populate: {path: 'completedBy', select: 'name'}})
        .populate('collaborators', 'name email');
      if (!project) return res.status(404).json({msg: 'Project not found'});
      if (
        project.owner.toString() === req.user.id ||
        project.collaborators.some(e => e._id.toString() === req.user.id.toString())
      ) {
        res.status(200).json({msg: 'Project retrieved', project});
      } else {
        res.status(404).json({msg: 'Cant see that project'});
      }
    } catch (error) {
      res.status(400).json({msg: 'Project not found'});
    }
  } else {
    res.status(401).json({msg: 'Unauthorized'});
  }
};

const editProject = async (req: Request, res: Response) => {
  if (req.user) {
    try {
      if (!mongoose.Types.ObjectId.isValid(req.params.id))
        return res.status(400).json({msg: 'Project not found'});
      const project = await Project.findById(req.params.id);
      if (project && project.owner.toString() === req.user.id) {
        const updatedProject = await Project.findByIdAndUpdate(req.params.id, req.body, {
          new: true,
        });
        res.status(200).json({msg: 'Project updated', updatedProject});
      } else {
        res.status(404).json({msg: 'Cant see that project'});
      }
    } catch (error) {
      res.status(400).json({msg: 'Project not found'});
    }
  } else {
    res.status(401).json({msg: 'Unauthorized'});
  }
};

const deleteProject = async (req: Request, res: Response) => {
  if (req.user) {
    try {
      if (!mongoose.Types.ObjectId.isValid(req.params.id))
        return res.status(400).json({msg: 'Project not found'});
      const project = await Project.findById(req.params.id);
      if (project && project.owner.toString() === req.user.id) {
        await Project.findByIdAndDelete(req.params.id);
        res.status(200).json({msg: 'Project deleted'});
      } else {
        res.status(404).json({msg: 'Project not found'});
      }
    } catch (error) {
      res.status(400).json({msg: 'Project not found'});
    }
  } else {
    res.status(401).json({msg: 'Unauthorized'});
  }
};

const searchCollaborator = async (req: Request, res: Response) => {
  if (req.user) {
    try {
      const {email} = req.body;
      const user = await User.findOne({email}).select(
        '-password -tasks -token -createdAt -updatedAt -__v -confirmed',
      );
      if (user) {
        res.status(200).json({msg: 'User found', user});
      } else {
        res.status(404).json({msg: 'User not found'});
      }
    } catch (error) {
      res.status(404).json({msg: 'User not found'});
    }
  } else {
    res.status(401).json({msg: 'Unauthorized'});
  }
};

const addCollaborator = async (req: Request, res: Response) => {
  if (req.user) {
    try {
      const {id} = req.body;
      const user = await User.findOne({id});
      if (!user) return res.status(404).json({msg: 'User not found'});

      const project = await Project.findById(req.params.id);
      if (!project) return res.status(404).json({msg: 'Project not found'});

      if (project.collaborators.includes(id))
        return res.status(400).json({msg: 'Collaborator already added'});
      if (project.owner.toString() === id)
        return res.status(400).json({msg: 'You can not add yourself as collaborator'});
      if (project.owner.toString() !== req.user.id)
        return res.status(401).json({msg: 'Unauthorized'});

      project.collaborators.push(id);
      await project.save();
      res.status(200).json({msg: 'Collaborator added', project});
    } catch (error) {
      res.status(400).send(error);
    }
  } else {
    res.status(401).json({msg: 'Unauthorized'});
  }
};
const deleteCollaborator = async (req: Request, res: Response) => {
  if (req.user) {
    try {
      const project = await Project.findById(req.params.id);
      if (!project) return res.status(404).json({msg: 'Project not found'});
      if (project.owner.toString() !== req.user.id)
        return res.status(401).json({msg: 'Unauthorized'});
      const {id} = req.body;
      const user = await User.findOne({id});
      if (!user) return res.status(404).json({msg: 'User not found'});
      if (!project.collaborators.includes(id))
        return res.status(400).json({msg: 'Collaborator not found'});
      project.collaborators = project.collaborators.filter(
        collaborator => collaborator.toString() !== id,
      );
      await project.save();
      res.status(200).json({msg: 'Collaborator deleted', project});
    } catch (error) {
      res.status(400).send(error);
    }
  } else {
    res.status(401).json({msg: 'Unauthorized'});
  }
};

export {
  getProjects,
  getProject,
  newProject,
  editProject,
  deleteProject,
  addCollaborator,
  deleteCollaborator,
  searchCollaborator,
};
